import test from "node:test";
import assert from "node:assert/strict";
import {
  cameraFrames,
  chapterAt,
  chapterOpacity,
  projectAt,
  sampleCamera,
} from "../src/lib/journey.mjs";

test("every chapter has a fully readable stop and every project is reachable", () => {
  [0, 0.285, 0.47, 0.795, 1].forEach((p, index) => {
    assert.equal(chapterAt(p), index);
    assert.equal(chapterOpacity(p, index), 1);
    for (let other = 0; other < 5; other++)
      if (other !== index) assert.equal(chapterOpacity(p, other), 0);
  });
  [0.47, 0.565, 0.655].forEach((p, index) => assert.equal(projectAt(p), index));
});

test("desktop and mobile cameras remain finite and travel continuously forward", () => {
  for (const mobile of [false, true]) {
    let previous = sampleCamera(0, mobile);
    for (let i = 1; i <= 1000; i++) {
      const current = sampleCamera(i / 1000, mobile);
      assert.ok(current.eye.every(Number.isFinite));
      assert.ok(current.target.every(Number.isFinite));
      assert.ok(
        current.eye[2] <= previous.eye[2],
        "camera never jumps backward",
      );
      assert.ok(
        Math.hypot(...current.eye.map((n, k) => n - previous.eye[k])) < 0.4,
        "camera has no hard cuts",
      );
      previous = current;
    }
  }
});

test("reverse scrolling exactly retraces the same deterministic path", () => {
  const points = Array.from({ length: 101 }, (_, i) => i / 100);
  const forward = points.map((p) => sampleCamera(p));
  const backward = points
    .toReversed()
    .map((p) => sampleCamera(p))
    .reverse();
  assert.deepEqual(forward, backward);
});

test("camera is continuous at each keyframe, including the end", () => {
  for (const mobile of [false, true])
    for (const frame of cameraFrames) {
      const before = sampleCamera(Math.max(0, frame.p - 1e-7), mobile).eye;
      const after = sampleCamera(Math.min(1, frame.p + 1e-7), mobile).eye;
      assert.ok(Math.hypot(...before.map((n, i) => n - after[i])) < 0.001);
    }
});
