export const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
export const smoothstep = (a, b, value) => {
  const t = clamp((value - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function chapterAt(progress) {
  if (progress < 0.195) return 0;
  if (progress < 0.4) return 1;
  if (progress < 0.71) return 2;
  if (progress < 0.9) return 3;
  return 4;
}

export function projectAt(progress) {
  return progress < 0.525 ? 0 : progress < 0.615 ? 1 : 2;
}

export function chapterOpacity(progress, index) {
  const ranges = [
    [0, 0, 0.11, 0.17],
    [0.195, 0.235, 0.36, 0.4],
    [0.4, 0.435, 0.675, 0.71],
    [0.71, 0.75, 0.86, 0.9],
    [0.9, 0.95, 1, 1.1],
  ];
  const [enter, full, leave, end] = ranges[index];
  const fadeIn = enter === full ? 1 : smoothstep(enter, full, progress);
  return fadeIn * (1 - smoothstep(leave, end, progress));
}

// Every keyframe is part of the same forward-traveling camera path.
// Mobile has its own composition, not a crop of the desktop camera.
export const cameraFrames = [
  {
    p: 0,
    eye: [7.8, 5.2, 12.4],
    target: [0, 1.8, 0],
    mobile: [5.8, 6.1, 15.6],
    mobileTarget: [1.1, 3.1, 0],
  },
  {
    p: 0.105,
    eye: [3.8, 3.6, 6],
    target: [1.6, 1.6, 0],
    mobile: [2.8, 4.2, 8],
    mobileTarget: [1.6, 2.7, 0],
  },
  {
    p: 0.175,
    eye: [1.6, 2.05, 1.2],
    target: [1.6, 1.9, -4],
    mobile: [1.6, 2.1, 1.6],
    mobileTarget: [1.6, 1.9, -4],
  },
  {
    p: 0.22,
    eye: [1.4, 2.1, -5.8],
    target: [0, 1.8, -16],
    mobile: [0.8, 2.8, -4.5],
    mobileTarget: [0, 3.1, -16],
  },
  {
    p: 0.32,
    eye: [-0.7, 2.4, -9.5],
    target: [1, 2.2, -21],
    mobile: [-0.4, 2.7, -9],
    mobileTarget: [0.5, 3.2, -21],
  },
  {
    p: 0.395,
    eye: [1.7, 2.6, -20],
    target: [0.5, 1.8, -34],
    mobile: [1, 2.5, -20],
    mobileTarget: [0, 3.4, -34],
  },
  {
    p: 0.47,
    eye: [0.2, 2.4, -27],
    target: [0.3, 2.6, -39],
    mobile: [0, 2.5, -27],
    mobileTarget: [0, 3.7, -39],
  },
  {
    p: 0.565,
    eye: [-1, 2, -36],
    target: [0.7, 2.7, -48],
    mobile: [-0.3, 2.6, -36],
    mobileTarget: [0, 4, -48],
  },
  {
    p: 0.655,
    eye: [0.8, 2.7, -46],
    target: [1, 2.5, -58],
    mobile: [0.3, 2.7, -46],
    mobileTarget: [0, 4, -58],
  },
  {
    p: 0.71,
    eye: [0, 2.6, -56],
    target: [1, 2, -72],
    mobile: [0, 2.6, -56],
    mobileTarget: [0, 3.5, -72],
  },
  {
    p: 0.795,
    eye: [-1.2, 2.5, -65],
    target: [1, 2.7, -80],
    mobile: [-0.4, 2.9, -65],
    mobileTarget: [0, 4, -80],
  },
  {
    p: 0.9,
    eye: [0, 3, -80],
    target: [0, 2.5, -94],
    mobile: [0, 3, -80],
    mobileTarget: [0, 3.5, -94],
  },
  {
    p: 1,
    eye: [0, 3.6, -89],
    target: [0, 3, -101],
    mobile: [0, 3.8, -88],
    mobileTarget: [0, 4, -101],
  },
];

export function sampleCamera(progress, mobile = false) {
  const p = clamp(progress);
  let index = cameraFrames.findIndex((frame) => frame.p > p) - 1;
  if (index < 0) index = p === 1 ? cameraFrames.length - 2 : 0;
  const a = cameraFrames[index];
  const b = cameraFrames[index + 1];
  const t = smoothstep(a.p, b.p, p);
  const interpolate = (key) =>
    a[key].map((value, i) => value + (b[key][i] - value) * t);
  return {
    eye: interpolate(mobile ? "mobile" : "eye"),
    target: interpolate(mobile ? "mobileTarget" : "target"),
  };
}
