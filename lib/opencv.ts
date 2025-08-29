import { Platform } from 'react-native';

// Declare global cv for TypeScript
declare const cv: any;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ProcessResult {
  diffs: Rect[];
}

// Helper to load image for web
function loadImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = uri;
  });
}

export async function processImagesWithOpenCV(
  image1Uri: string,
  image2Uri: string,
  selection: Rect,
  sensitivity: number
): Promise<ProcessResult> {
  if (Platform.OS === 'web') {
    // OpenCV.js implementation for web
    if (typeof cv === 'undefined') {
      console.error("OpenCV.js is not loaded.");
      throw new Error("OpenCV.js is not loaded.");
    }

    try {
      const img1Element = await loadImage(image1Uri);
      const img2Element = await loadImage(image2Uri);

      const img1 = cv.imread(img1Element);
      const img2 = cv.imread(img2Element);

      // Convert to grayscale for feature detection
      const gray1 = new cv.Mat();
      const gray2 = new cv.Mat();
      cv.cvtColor(img1, gray1, cv.COLOR_RGBA2GRAY);
      cv.cvtColor(img2, gray2, cv.COLOR_RGBA2GRAY);

      // ORB Feature Detection and Description
      const orb = new cv.ORB();
      const keypoints1 = new cv.KeyPointVector();
      const descriptors1 = new cv.Mat();
      const keypoints2 = new cv.KeyPointVector();
      const descriptors2 = new cv.Mat();

      orb.detectAndCompute(gray1, new cv.Mat(), keypoints1, descriptors1);
      orb.detectAndCompute(gray2, new cv.Mat(), keypoints2, descriptors2);

      // Feature Matching
      const matcher = new cv.BFMatcher(cv.NORM_HAMMING, false);
      const matches = new cv.DMatchVector();
      matcher.match(descriptors1, descriptors2, matches);

      // Filter good matches
      const goodMatches = new cv.DMatchVector();
      const matchesVector = [];
      for (let i = 0; i < matches.size(); ++i) {
        matchesVector.push(matches.get(i));
      }
      matchesVector.sort((a: any, b: any) => a.distance - b.distance);
      const numGoodMatches = Math.min(matchesVector.length, 50);
      for (let i = 0; i < numGoodMatches; i++) {
        goodMatches.push_back(matchesVector[i]);
      }

      // Find Homography
      const points1 = [];
      const points2 = [];
      for (let i = 0; i < goodMatches.size(); i++) {
        points1.push(keypoints1.get(goodMatches.get(i).queryIdx).pt);
        points2.push(keypoints2.get(goodMatches.get(i).trainIdx).pt);
      }
      const matPoints1 = cv.matFromArray(points1.length, 1, cv.CV_32FC2, points1.flat());
      const matPoints2 = cv.matFromArray(points2.length, 1, cv.CV_32FC2, points2.flat());

      const h = cv.findHomography(matPoints2, matPoints1, cv.RANSAC, 5.0);

      // Warp image2 to align with image1
      const alignedImg2 = new cv.Mat();
      const dsize = new cv.Size(img1.cols, img1.rows);
      cv.warpPerspective(img2, alignedImg2, h, dsize);

      // Calculate Absolute Difference
      const diff = new cv.Mat();
      cv.absdiff(img1, alignedImg2, diff);

      // Convert diff to grayscale for thresholding
      const grayDiff = new cv.Mat();
      cv.cvtColor(diff, grayDiff, cv.COLOR_RGBA2GRAY);

      // Thresholding based on sensitivity
      const thresholdValue = 255 - (sensitivity * 2.55);
      const thresholdedDiff = new cv.Mat();
      cv.threshold(grayDiff, thresholdedDiff, thresholdValue, 255, cv.THRESH_BINARY);

      // Morphological Operations (Noise Reduction)
      const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
      const opened = new cv.Mat();
      cv.morphologyEx(thresholdedDiff, opened, cv.MORPH_OPEN, kernel);
      const closed = new cv.Mat();
      cv.morphologyEx(opened, closed, cv.MORPH_CLOSE, kernel);

      // Find Contours
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(closed, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      const diffs: Rect[] = [];
      for (let i = 0; i < contours.size(); i++) {
        const rect = cv.boundingRect(contours.get(i));
        if (rect.width > 10 && rect.height > 10) {
          diffs.push(rect);
        }
      }

      // Release Mats to prevent memory leaks
      img1.delete();
      img2.delete();
      gray1.delete();
      gray2.delete();
      keypoints1.delete();
      descriptors1.delete();
      keypoints2.delete();
      descriptors2.delete();
      matcher.delete();
      matches.delete();
      goodMatches.delete();
      matPoints1.delete();
      matPoints2.delete();
      h.delete();
      alignedImg2.delete();
      diff.delete();
      grayDiff.delete();
      thresholdedDiff.delete();
      kernel.delete();
      opened.delete();
      closed.delete();
      contours.delete();
      hierarchy.delete();

      return { diffs };

    } catch (error) {
      console.error("OpenCV.js processing error:", error);
      throw error;
    }

  } else {
    // RNFastOpenCV implementation for native
    const RNFastOpenCV = require('react-native-fast-opencv').default; // Dynamic import for native

    try {
      const img1 = await RNFastOpenCV.imread(image1Uri);
      const img2 = await RNFastOpenCV.imread(image2Uri);

      const gray1 = await RNFastOpenCV.cvtColor(img1, RNFastOpenCV.COLOR_RGBA2GRAY);
      const gray2 = await RNFastOpenCV.cvtColor(img2, RNFastOpenCV.COLOR_RGBA2GRAY);

      const orb = await RNFastOpenCV.ORB_create();
      const keypoints1 = await orb.detect(gray1);
      const descriptors1 = await orb.compute(gray1, keypoints1);
      const keypoints2 = await orb.detect(gray2);
      const descriptors2 = await orb.compute(gray2, keypoints2);

      const matcher = await RNFastOpenCV.BFMatcher_create(RNFastOpenCV.NORM_HAMMING, false);
      const matches = await matcher.match(descriptors1, descriptors2);

      matches.sort((a: any, b: any) => a.distance - b.distance);
      const numGoodMatches = Math.min(matches.length, 50);
      const goodMatches = matches.slice(0, numGoodMatches);

      const points1 = goodMatches.map((match: any) => keypoints1[match.queryIdx].pt);
      const points2 = goodMatches.map((match: any) => keypoints2[match.trainIdx].pt);

      const h = await RNFastOpenCV.findHomography(points2, points1, RNFastOpenCV.RANSAC, 5.0);

      const alignedImg2 = await RNFastOpenCV.warpPerspective(img2, h, img1.cols, img1.rows);

      const diff = await RNFastOpenCV.absdiff(img1, alignedImg2);

      const grayDiff = await RNFastOpenCV.cvtColor(diff, RNFastOpenCV.COLOR_RGBA2GRAY);

      const thresholdValue = 255 - (sensitivity * 2.55);
      const thresholdedDiff = await RNFastOpenCV.threshold(grayDiff, thresholdValue, 255, RNFastOpenCV.THRESH_BINARY);

      const kernel = await RNFastOpenCV.getStructuringElement(RNFastOpenCV.MORPH_RECT, 3, 3);
      const opened = await RNFastOpenCV.morphologyEx(thresholdedDiff, RNFastOpenCV.MORPH_OPEN, kernel);
      const closed = await RNFastOpenCV.morphologyEx(opened, RNFastOpenCV.MORPH_CLOSE, kernel);

      const contours = await RNFastOpenCV.findContours(closed, RNFastOpenCV.RETR_EXTERNAL, RNFastOpenCV.CHAIN_APPROX_SIMPLE);

      const diffs: Rect[] = [];
      for (let i = 0; i < contours.length; i++) {
        const rect = await RNFastOpenCV.boundingRect(contours[i]);
        if (rect.width > 10 && rect.height > 10) {
          diffs.push(rect);
        }
      }

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
      console.error("RNFastOpenCV processing error:", error);
      throw error;
    }
  }
}