import RNFastOpenCV from 'react-native-fast-opencv';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ProcessResult {
  diffs: Rect[];
}

export async function processImagesWithOpenCV(
  image1Uri: string,
  image2Uri: string,
  selection: Rect,
  sensitivity: number
): Promise<ProcessResult> {
  try {
    // 1. Load images
    // RNFastOpenCV.imread might not directly support URI.
    // We might need to convert URI to base64 or a local path first.
    // For now, let's assume RNFastOpenCV.imread can handle URIs.
    const img1 = await RNFastOpenCV.imread(image1Uri);
    const img2 = await RNFastOpenCV.imread(image2Uri);

    // 2. Convert to grayscale for feature detection
    const gray1 = await RNFastOpenCV.cvtColor(img1, RNFastOpenCV.COLOR_RGBA2GRAY);
    const gray2 = await RNFastOpenCV.cvtColor(img2, RNFastOpenCV.COLOR_RGBA2GRAY);

    // 3. ORB Feature Detection and Description
    const orb = await RNFastOpenCV.ORB_create();
    const keypoints1 = await orb.detect(gray1);
    const descriptors1 = await orb.compute(gray1, keypoints1);
    const keypoints2 = await orb.detect(gray2);
    const descriptors2 = await orb.compute(gray2, keypoints2);

    // 4. Feature Matching
    const matcher = await RNFastOpenCV.BFMatcher_create(RNFastOpenCV.NORM_HAMMING, false);
    const matches = await matcher.match(descriptors1, descriptors2);

    // 5. Filter good matches (e.g., using Lowe's ratio test or just sorting)
    // For simplicity, let's just sort and take top N matches for now
    matches.sort((a: any, b: any) => a.distance - b.distance);
    const numGoodMatches = Math.min(matches.length, 50); // Take top 50 matches
    const goodMatches = matches.slice(0, numGoodMatches);

    // 6. Find Homography
    const points1 = goodMatches.map((match: any) => keypoints1[match.queryIdx].pt);
    const points2 = goodMatches.map((match: any) => keypoints2[match.trainIdx].pt);

    const h = await RNFastOpenCV.findHomography(points2, points1, RNFastOpenCV.RANSAC, 5.0);

    // 7. Warp image2 to align with image1
    const alignedImg2 = await RNFastOpenCV.warpPerspective(img2, h, img1.cols, img1.rows);

    // 8. Calculate Absolute Difference
    const diff = await RNFastOpenCV.absdiff(img1, alignedImg2);

    // 9. Convert diff to grayscale for thresholding
    const grayDiff = await RNFastOpenCV.cvtColor(diff, RNFastOpenCV.COLOR_RGBA2GRAY);

    // 10. Thresholding based on sensitivity
    // Sensitivity 0-100. Higher sensitivity means lower threshold.
    // Let's map sensitivity 0-100 to threshold 255-0.
    const thresholdValue = 255 - (sensitivity * 2.55);
    const thresholdedDiff = await RNFastOpenCV.threshold(grayDiff, thresholdValue, 255, RNFastOpenCV.THRESH_BINARY);

    // 11. Morphological Operations (Noise Reduction)
    const kernel = await RNFastOpenCV.getStructuringElement(RNFastOpenCV.MORPH_RECT, 3, 3);
    const opened = await RNFastOpenCV.morphologyEx(thresholdedDiff, RNFastOpenCV.MORPH_OPEN, kernel);
    const closed = await RNFastOpenCV.morphologyEx(opened, RNFastOpenCV.MORPH_CLOSE, kernel);

    // 12. Find Contours
    const contours = await RNFastOpenCV.findContours(closed, RNFastOpenCV.RETR_EXTERNAL, RNFastOpenCV.CHAIN_APPROX_SIMPLE);

    const diffs: Rect[] = [];
    for (let i = 0; i < contours.length; i++) {
      const rect = await RNFastOpenCV.boundingRect(contours[i]);
      // Filter small contours (noise)
      if (rect.width > 10 && rect.height > 10) { // Example threshold
        diffs.push(rect);
      }
    }

    // Release Mats to prevent memory leaks
    img1.release();
    img2.release();
    gray1.release();
    gray2.release();
    descriptors1.release();
    descriptors2.release();
    alignedImg2.release();
    diff.release();
    grayDiff.release();
    thresholdedDiff.release();
    kernel.release();
    opened.release();
    closed.release();

    return { diffs };

  } catch (error) {
    console.error("OpenCV processing error:", error);
    throw error;
  }
}
