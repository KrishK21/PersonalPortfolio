import * as THREE from "three";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

// Locally drawn project illustrations keep screen assets small, legible, and honest.
export function createScreenTexture(kind: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 800;
  const c = canvas.getContext("2d")!;
  const text = (
    content: string,
    x: number,
    y: number,
    size = 20,
    color = "#2e2f32",
    weight = 400,
  ) => {
    c.fillStyle = color;
    c.font = `${weight} ${size}px Arial, sans-serif`;
    c.fillText(content, x, y);
  };
  const line = (x: number, y: number, width: number, color = "#dfe0e2") =>
    roundRect(c, x, y, width, 8, 4, color);
  c.fillStyle = kind === "studio" ? "#28282a" : "#f6f6f7";
  c.fillRect(0, 0, 1200, 800);

  if (kind === "studio") {
    text("KK / SELECTED WORK", 80, 85, 20, "#afb1b4");
    text("ideas into", 80, 337, 100, "#f0f1f2", 400);
    text("impact.", 80, 465, 142, "#dcdee3", 500);
    c.strokeStyle = "#bcbec2";
    c.lineWidth = 1;
    c.beginPath();
    c.arc(1050, 400, 210, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(1050, 400, 170, 0, Math.PI * 2);
    c.stroke();
    text("AI  /  CLOUD  /  FULL STACK", 80, 720, 18, "#afb1b4");
    text("ENTER →", 985, 720, 18, "#dcdee3");
  } else {
    roundRect(c, 0, 0, 1200, 68, 0, "#eaebec");
    ["#abacaf", "#c0c1c4", "#d3d4d7"].forEach((color, i) => {
      c.fillStyle = color;
      c.beginPath();
      c.arc(35 + i * 25, 34, 6, 0, Math.PI * 2);
      c.fill();
    });
    text(
      kind === "resume"
        ? "tailor / workspace"
        : kind === "linkedout"
          ? "linkedout / opportunities"
          : kind === "wealth"
            ? "wealthpilot / your goals"
            : "azure / pipeline",
      450,
      43,
      17,
      "#7e8084",
    );
    if (kind === "resume") {
      roundRect(c, 0, 69, 220, 731, 0, "#ecedef");
      text("t.", 46, 170, 66, "#565960", 600);
      text("Workspace", 40, 285, 21, "#4e5157", 600);
      text("My experience", 40, 345, 20, "#919397");
      text("Applications", 40, 405, 20, "#919397");
      text("YOUR EXPERIENCE, REFRAMED", 275, 160, 18, "#898b90");
      text("Make the connection.", 275, 235, 52, "#3d3f44", 500);
      roundRect(c, 275, 290, 390, 330, 14, "#ffffff");
      roundRect(c, 700, 290, 430, 330, 14, "#ffffff");
      text("JOB DESCRIPTION", 300, 335, 15, "#909296");
      text("Software engineer", 300, 390, 29, "#404247", 500);
      line(300, 425, 280);
      line(300, 453, 230);
      line(300, 481, 290);
      roundRect(c, 300, 526, 120, 38, 6, "#e7e8eb");
      text("Python", 320, 551, 17, "#757981");
      roundRect(c, 435, 526, 190, 38, 6, "#e7e8eb");
      text("Machine learning", 450, 551, 17, "#757981");
      text("YOUR RESUME", 725, 335, 15, "#909296");
      text("Relevant by design.", 725, 390, 28, "#404247", 500);
      text("Trained PyTorch models for", 725, 445, 21, "#7c7e82");
      text("thermal object detection", 725, 480, 21, "#7c7e82");
      text("on drone imagery.", 725, 515, 21, "#7c7e82");
      text("✓ Grounded in your experience", 725, 582, 18, "#828792");
      text(
        "No invented experience. Just a better connection.",
        275,
        698,
        20,
        "#8d8f93",
      );
    } else if (kind === "linkedout") {
      text("LinkedOut ↗", 70, 162, 60, "#3d3f44", 600);
      text("Find your next thing.", 780, 162, 24, "#8f9195");
      roundRect(c, 70, 210, 1060, 74, 12, "#e7e8ea");
      text("Search opportunities", 96, 257, 22, "#82848a");
      text("⌕", 1070, 259, 30, "#6a6d73");
      text("All opportunities", 70, 338, 20, "#666b73", 600);
      text("Engineering", 320, 338, 20, "#9fa1a4");
      text("Recently posted", 550, 338, 20, "#9fa1a4");
      ["Software engineer", "Backend developer", "ML engineer"].forEach(
        (title, i) => {
          const y = 385 + i * 114;
          roundRect(c, 70, y, 1060, 98, 10, "#ffffff");
          roundRect(c, 90, y + 18, 60, 60, 12, "#ecedef");
          text(["↗", "◇", "⌘"][i], 103, y + 59, 30, "#83868d");
          text(title, 185, y + 42, 26, "#414449", 500);
          text(
            "Illustrative listing · Engineering",
            185,
            y + 74,
            17,
            "#a0a2a5",
          );
          roundRect(c, 1000, y + 34, 100, 32, 8, "#ecedef");
          text("Active", 1020, y + 57, 18, "#8c8f97");
        },
      );
    } else if (kind === "cloud") {
      text("RESTRICTION RECONCILIATION", 70, 160, 19, "#94969a");
      text("Good data. Sound decisions.", 70, 240, 59, "#3e4045", 500);
      ["Source files", "Blob Storage", "SQL extract", "Reconcile"].forEach(
        (label, i) => {
          const x = 70 + i * 276;
          roundRect(c, x, 340, 233, 175, 15, "#e8e9eb");
          text(`0${i + 1}`, x + 26, 386, 20, "#9c9ea3");
          text(label, x + 26, 460, 26, "#55585f", 500);
          if (i < 3) text("→", x + 244, 440, 24, "#a8aab0");
        },
      );
      text("+ Add new", 95, 625, 24, "#858a94");
      text("= Skip unchanged", 430, 625, 24, "#858a94");
      text("− Remove lifted", 840, 625, 24, "#858a94");
    } else if (kind === "wealth") {
      text("WealthPilot", 70, 158, 53, "#464a50", 500);
      text("Small moves. Real progress.", 70, 219, 28, "#8f9297");
      roundRect(c, 70, 270, 655, 400, 22, "#e8e9eb");
      text("YOUR NEXT MILESTONE", 105, 320, 17, "#94979c");
      text("Make room for", 105, 397, 52, "#4e525b");
      text("what matters.", 105, 462, 52, "#4e525b");
      line(105, 533, 540, "#ccced2");
      line(105, 533, 330, "#a1a5ad");
      text("Set a goal →", 105, 607, 24, "#676c74");
      ["Find your perks", "Build a streak", "Grow together"].forEach((t, i) => {
        roundRect(c, 760, 270 + i * 140, 370, 120, 16, "#ffffff");
        text(`0${i + 1}`, 785, 307 + i * 140, 16, "#a4a6ac");
        text(t, 785, 352 + i * 140, 29, "#636770");
      });
    }
    text("INTERFACE ILLUSTRATION", 900, 767, 13, "#909296");
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
