import React, { useRef, useEffect, useState, useCallback } from "react";

export default function SchematicCanvas({ stage }) {
  // ======== INTERNAL CANVAS STATE (zoom/pan etc.) ========
  const [zoom, setZoom] = useState(1);
  const [offset] = useState({ x: 0, y: 0 }); // keeping offset logic for completeness

  // canvas ref
  const canvasRef = useRef(null);

  // ======== CHIP / CANVAS CONSTANTS ========
  const CHIP_WIDTH = 800;
  const CHIP_HEIGHT = 500;
  const CHIP_RADIUS = 16;

  const canvasWidth = CHIP_WIDTH;
  const canvasHeight = CHIP_HEIGHT;



  function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ======== GATE DRAWER ========
  // variant: 0=AND-ish emerald, 1=NOT-ish sky, 2=IC-ish emerald
  // scalePx lets us bump size
  function drawGate(ctx, px, py, variant, scalePx = 1) {
    ctx.save();
    ctx.translate(px, py);
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    if (variant === 0) {
      // AND-ish emerald
      ctx.strokeStyle = "#10b981";

      // inputs
      ctx.beginPath();
      ctx.moveTo(-10 * scalePx, -6 * scalePx);
      ctx.lineTo(-4 * scalePx, -6 * scalePx);
      ctx.moveTo(-10 * scalePx, 6 * scalePx);
      ctx.lineTo(-4 * scalePx, 6 * scalePx);
      ctx.stroke();

      // curved body
      ctx.beginPath();
      ctx.moveTo(-4 * scalePx, -10 * scalePx);
      ctx.lineTo(-4 * scalePx, 10 * scalePx);
      ctx.quadraticCurveTo(8 * scalePx, 10 * scalePx, 8 * scalePx, 0);
      ctx.quadraticCurveTo(
        8 * scalePx,
        -10 * scalePx,
        -4 * scalePx,
        -10 * scalePx
      );
      ctx.stroke();

      // output bubble
      ctx.beginPath();
      ctx.moveTo(8 * scalePx, 0);
      ctx.lineTo(12 * scalePx, 0);
      ctx.arc(14 * scalePx, 0, 2 * scalePx, 0, Math.PI * 2);
      ctx.stroke();
    } else if (variant === 1) {
      // NOT-ish sky
      ctx.strokeStyle = "#38bdf8";

      // input
      ctx.beginPath();
      ctx.moveTo(-10 * scalePx, 0);
      ctx.lineTo(-2 * scalePx, 0);
      ctx.stroke();

      // triangle
      ctx.beginPath();
      ctx.moveTo(-2 * scalePx, -8 * scalePx);
      ctx.lineTo(-2 * scalePx, 8 * scalePx);
      ctx.lineTo(8 * scalePx, 0);
      ctx.closePath();
      ctx.stroke();

      // bubble + output
      ctx.beginPath();
      ctx.arc(10 * scalePx, 0, 2 * scalePx, 0, Math.PI * 2);
      ctx.moveTo(12 * scalePx, 0);
      ctx.lineTo(16 * scalePx, 0);
      ctx.stroke();
    } else {
      // IC-ish emerald block
      ctx.strokeStyle = "#10b981";

      ctx.strokeRect(-8 * scalePx, -8 * scalePx, 16 * scalePx, 16 * scalePx);

      ctx.beginPath();
      ctx.arc(0, 0, 3 * scalePx, 0, Math.PI * 2);
      ctx.stroke();

      // pins
      ctx.beginPath();
      ctx.moveTo(-10 * scalePx, -4 * scalePx);
      ctx.lineTo(-8 * scalePx, -4 * scalePx);
      ctx.moveTo(-10 * scalePx, 4 * scalePx);
      ctx.lineTo(-8 * scalePx, 4 * scalePx);

      ctx.moveTo(8 * scalePx, -4 * scalePx);
      ctx.lineTo(10 * scalePx, -4 * scalePx);
      ctx.moveTo(8 * scalePx, 4 * scalePx);
      ctx.lineTo(10 * scalePx, 4 * scalePx);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ======== LABEL BOX DRAWER ========
  function drawLabelBox(ctx, x, y, text, color = "#10b981") {
    ctx.save();
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const padX = 12;
    const padY = 6;
    const metrics = ctx.measureText(text);
    const w = metrics.width + padX * 2;
    const h = 20;
    const left = x - w / 2;
    const top = y - h / 2;
    const r = 4;

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = color;
    ctx.fillStyle = "rgba(0,0,0,0.35)";

    ctx.beginPath();
    ctx.moveTo(left + r, top);
    ctx.lineTo(left + w - r, top);
    ctx.quadraticCurveTo(left + w, top, left + w, top + r);
    ctx.lineTo(left + w, top + h - r);
    ctx.quadraticCurveTo(left + w, top + h, left + w - r, top + h);
    ctx.lineTo(left + r, top + h);
    ctx.quadraticCurveTo(left, top + h, left, top + h - r);
    ctx.lineTo(left, top + r);
    ctx.quadraticCurveTo(left, top, left + r, top);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.fillText(text, x, y + 0.5);

    ctx.restore();
  }

  // ======== ORTHOGONAL WIRE DRAWER ========
  function drawWirePolyline(ctx, ptsPx, color = "#38bdf8") {
    if (!ptsPx.length) return;
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.moveTo(ptsPx[0].x, ptsPx[0].y);
    for (let i = 1; i < ptsPx.length; i++) {
      ctx.lineTo(ptsPx[i].x, ptsPx[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ======== MAIN DRAW LOOP (same schematic logic, uses `stage`) ========
  const drawFrame = useCallback(
    (ctx) => {
      const { width, height } = ctx.canvas;

      // clear
      ctx.clearRect(0, 0, width, height);

      // zoom / pan transform
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2 + offset.x, -height / 2 + offset.y);

      const cx = width / 2;
      const cy = height / 2;
      const chipLeft = cx - CHIP_WIDTH / 2;
      const chipTop = cy - CHIP_HEIGHT / 2;

      // soft green glow under the chip
      const glowGrad = ctx.createRadialGradient(
        cx,
        cy,
        Math.min(CHIP_WIDTH, CHIP_HEIGHT) * 0.2,
        cx,
        cy,
        Math.max(CHIP_WIDTH, CHIP_HEIGHT) * 0.8
      );
      glowGrad.addColorStop(0, "rgba(16,185,129,0.28)");
      glowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(CHIP_WIDTH, CHIP_HEIGHT) * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // chip body
      ctx.save();
      drawRoundedRect(ctx, chipLeft, chipTop, CHIP_WIDTH, CHIP_HEIGHT, CHIP_RADIUS);
      ctx.fillStyle = "rgba(10,15,26,0.4)";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#10b981";
      ctx.stroke();
      ctx.restore();

      // helper for normalized [-1..1] coords -> px in chip interior
      function chipToCanvas(normX, normY) {
        const padX = CHIP_WIDTH * 0.1;
        const padY = CHIP_HEIGHT * 0.1;
        const innerW = CHIP_WIDTH - padX * 2;
        const innerH = CHIP_HEIGHT - padY * 2;

        const px = chipLeft + padX + ((normX + 1) / 2) * innerW;
        const py = chipTop + padY + ((normY + 1) / 2) * innerH;
        return { x: px, y: py };
      }

      // =========================
      // SCHEMATIC CONTENT
      // =========================

      // --- gates ---
      const schematicGates = [
        { variant: 0, x: -0.45, y: -0.45, minStage: 1 },  // G1
        { variant: 1, x: -0.15, y: -0.45, minStage: 3 },  // G2
        { variant: 0, x:  0.20, y: -0.20, minStage: 5 },  // G3
        { variant: 0, x: -0.35, y:  0.10, minStage: 4 },  // G4
        { variant: 1, x:  0.00, y:  0.25, minStage: 6 },  // G5
        { variant: 1, x:  0.35, y:  0.05, minStage: 7 },  // G6
        { variant: 0, x:  0.55, y:  0.40, minStage: 8 },  // G7
        { variant: 1, x:  0.20, y:  0.55, minStage: 9 },  // G8
        { variant: 0, x: -0.15, y:  0.40, minStage: 10 }, // G9

        // top-mid cluster
        { variant: 0, x:  0.09, y: -0.70, minStage: 8 },  // T1
        { variant: 1, x:  0.62, y: -0.70, minStage: 9 },  // T2
        { variant: 0, x: -0.15, y: -0.70, minStage: 10 }, // T3

        // lower-left cluster
        { variant: 1, x: -0.55, y:  0.55, minStage: 9 },  // B1
        { variant: 0, x: -0.45, y:  0.30, minStage: 10 }, // B2
        { variant: 1, x: -0.31, y: -0.75, minStage: 10 }, // B3
        { variant: 1, x: -0.60, y:  -0.87, minStage: 9 },
        { variant: 0, x: -0.55, y:  -0.17, minStage: 9 },
        { variant: 1, x: 0.15, y:  0.90, minStage: 9 },
      ];

      // --- label boxes ---
      const labelBoxes = [
        { text: "IN1",      x: -0.97, y: -0.45, color: "#38bdf8", minStage: 1 },
        { text: "IN2",      x: -0.97, y:  0.10, color: "#10b981", minStage: 3 },
        { text: "OUT1",     x:  0.79, y: -0.20, color: "#38bdf8", minStage: 7 },
        { text: "OUT2 LED", x:  0.83, y:  0.25, color: "#10b981", minStage: 9 },
        { text: "OUT3",     x:  0.79, y:  0.55, color: "#38bdf8", minStage: 10 },

        // extras
        { text: "VDD",      x:  0.79, y: -0.70, color: "#38bdf8", minStage: 10 },
        { text: "VSS",      x: -0.55, y:  0.87, color: "#10b981", minStage: 10 },
      ];

      // --- wires ---
      const wires = [
        // IN1 -> G1
        {
          minStage: 1,
          color: "#38bdf8",
          pts: [
            [-0.9, -0.45],
            [-0.45, -0.45],
          ],
        },
        // G1 -> G2
        {
          minStage: 2,
          color: "#10b981",
          pts: [
            [-0.38, -0.45],
            [-0.15, -0.45],
          ],
        },
        // IN2 -> G4
        {
          minStage: 3,
          color: "#10b981",
          pts: [
            [-0.9, 0.10],
            [-0.35, 0.10],
          ],
        },
        // G4 -> G5
        {
          minStage: 4,
          color: "#10b981",
          pts: [
            [-0.26, 0.10],
            [-0.26, 0.25],
            [0.0, 0.25],
          ],
        },
        // G2 -> G3
        {
          minStage: 5,
          color: "#38bdf8",
          pts: [
            [-0.05, -0.45],
            [-0.05, -0.20],
            [0.20, -0.20],
          ],
        },
        // G5 -> G3
        {
          minStage: 6,
          color: "#10b981",
          pts: [
            [0.10, 0.25],
            [0.10, -0.20],
            [0.20, -0.20],
          ],
        },
        // G3 -> G6 -> OUT1
         {
          minStage: 7,
          color: "#38bdf8",
          pts: [
            [0.29, -0.20],
            [0.29, 0.05],
          
          
          ],
        },
        {
          minStage: 7,
          color: "#38bdf8",
          pts: [
            
            [0.44, 0.05],
            [0.55, -0.20],
            [0.70, -0.20],
          ],
        },
        // G6 -> G7
        {
          minStage: 8,
          color: "#38bdf8",
          pts: [
            [0.29, 0.05],
            [0.29, 0.40],
            [0.55, 0.40],
          ],
        },
        // G7 -> G8
        {
          minStage: 9,
          color: "#10b981",
          pts: [
            [0.55, 0.40],
            [0.55, 0.55],
            [0.20, 0.55],
          ],
        },
        // G9 -> G8
        {
          minStage: 10,
          color: "#38bdf8",
          pts: [
            [-0.15, 0.40],
            [-0.15, 0.55],
            [0.20, 0.55],
          ],
        },
        // G8 -> OUT3
        {
          minStage: 10,
          color: "#38bdf8",
          pts: [
            [0.20, 0.55],
            [0.70, 0.55],
          ],
        },
        // OUT2 LED path
        {
          minStage: 9,
          color: "#10b981",
          pts: [
            [0.10, 0.25],
            [0.55, 0.25],
            [0.70, 0.25],
          ],
        },

        // --- extra top-mid cluster wires ---
        {
          minStage: 8,
          color: "#38bdf8",
          pts: [
            [-0.05, -0.45],
            [-0.05, -0.70],
            [0.05, -0.70],
          ],
        },
        {
          minStage: 9,
          color: "#10b981",
          pts: [
            [0.18, -0.70],
            [0.60, -0.70],
            [0.63, -0.70],
          ],
        },
        {
          minStage: 10,
          color: "#38bdf8",
          pts: [
            [0.09, -0.70],
            [-0.05, -0.70],
          ],
        },

        // --- lower-left cluster wires ---
        {
          minStage: 9,
          color: "#10b981",
          pts: [
            [-0.9, 0.10],
            [-0.75, 0.10],
            [-0.75, 0.55],
            [-0.55, 0.55],
            [-0.55, 0.82],
          ],
        },
        {
          minStage: 10,
          color: "#38bdf8",
          pts: [
            [-0.45, 0.55],
            [-0.45, 0.31],
          ],
        },
        {
          minStage: 10,
          color: "#10b981",
          pts: [
            [-0.37, 0.30],
            [-0.37, 0.41],
            [-0.15, 0.41],
          ],
        },
        {
          minStage: 10,
          color: "#38bdf8",
          pts: [
            [-0.37, -0.75],
            [-0.37, -0.45],
          ],
        },
          {
          minStage: 10,
          color: "#38bdf8",
          pts: [
            [-0.24, -0.75],
            [-0.20, -0.75],
          ],
        },
          {
          minStage: 9,
          color: "#10b981",
          pts: [
            [-0.15, 0.55],
            [-0.15, 0.90],
            [0.15, 0.90],
          ],
        },
         {
          minStage: 9,
          color: "#10b981",
          pts: [
            [0.24, 0.90],
            [0.45, 0.90],
            [0.45, 0.55],
            
          ],
        },
        {
          minStage: 3,
          color: "#10b981",
          pts: [
            [-0.75, -0.45],
            [-0.75, -0.17],
            [-0.54, -0.17],
          ],
        },
         {
          minStage: 5,
          color: "#10b981",
          pts: [
            [-0.75, -0.45],
            [-0.75, -0.87],
            [-0.65, -0.87],
          ],
        },
         {
          minStage: 3,
          color: "#10b981",
          pts: [
            [-0.55, -0.87],
            [-0.37, -0.87],
            [-0.37, -0.76],
          ],
        },

      ];

      // 1. wires first
      for (let w of wires) {
        if (stage >= w.minStage) {
          const pxPts = w.pts.map(([nx, ny]) => chipToCanvas(nx, ny));
          drawWirePolyline(ctx, pxPts, w.color);
        }
      }

      // 2. gates
      for (let g of schematicGates) {
        if (stage >= g.minStage) {
          const { x, y } = chipToCanvas(g.x, g.y);
          drawGate(ctx, x, y, g.variant, 1.8);
        }
      }

      // 3. labels
      ctx.save();
      ctx.font = "11px sans-serif";
      for (let lb of labelBoxes) {
        if (stage >= lb.minStage) {
          const { x, y } = chipToCanvas(lb.x, lb.y);
          drawLabelBox(ctx, x, y, lb.text, lb.color);
        }
      }
      ctx.restore();

      ctx.restore(); // zoom/pan restore
    },
    [stage, zoom, offset]
  );

  // ======== RESIZE + RAF LOOP ========
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = canvasWidth + "px";
      canvas.style.height = canvasHeight + "px";

      const ctx2 = canvas.getContext("2d");
      ctx2.resetTransform?.();
      ctx2.scale(dpr, dpr);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const ctx = canvas.getContext("2d");
    let frameId;
    function loop() {
      drawFrame(ctx);
      frameId = requestAnimationFrame(loop);
    }
    frameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(frameId);
    };
  }, [canvasWidth, canvasHeight, drawFrame]);

  // ======== WHEEL / ZOOM HANDLER (kept same behavior) ========
  function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((z) => {
      let nz = z + delta;
      if (nz < 0.5) nz = 0.5;
      if (nz > 3) nz = 3;
      return nz;
    });
  }

  return (
    <canvas
      ref={canvasRef}
      onWheel={handleWheel}
      className="
        block
        shadow-[0_0_20px_rgba(16,185,129,0.6)]
        bg-transparent
        cursor-crosshair
      "
      style={{
        maxWidth: "90vw",
        height: "auto",
      }}
    />
  );
}
