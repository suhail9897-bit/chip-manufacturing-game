import React, { useRef, useState, useEffect, useCallback } from "react";
import SearchingImg from "../assets/searching.png";
import CheckingGuyGif from "../assets/checking_guy.gif";
import BackArrowGif from "../assets/back_arrow.gif";

export default function Screen3({ onBack, progress = 45 }) {
  // === SAME layout numbers (unchanged) ===
  const layoutConfig = {
    ctaArrow: { x: 550, y: 640, width: 220, height: 100, rotateDeg: 0 },
    progressBarHeightPx: 45,
   canvas: {
  marginTopPx: 20,
  marginRightPx: 20,
  bottomPaddingPx: 36,
  maxWidthPx: 880,
  heightPx: 480,          // 👈 you control this. e.g. 380 / 420 / 460
     // (ignored now; can keep or delete)
},

    backArrow: { x: 30, y: 80, width: 120, height: 120 },
    left: {
      searching: { x: 320, y: 450, width: 350, height: 350 },
      checker:   { x: 310, y: 100, width: 246, height: 212 },
      label: {
        x: 800, y: 650, maxWidthPx: 560,
        fontSizePx: 40, color: "#FFFFFF",
        fontFamily:
          '"Comic Sans MS","Comic Sans","Marker Felt","Segoe UI",system-ui,sans-serif',
      },
    },
  };

  const progressPct = Math.max(0, Math.min(100, Math.round(progress)));

  // ===== Waveform (same engine idea as Step2) =====
  // (Step2 reference: same sinusoid + run/stop pattern) :contentReference[oaicite:1]{index=1}
  const holderRef = useRef(null);   // measurable container
  const canvasRef = useRef(null);
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  const [panelH, setPanelH] = useState(0);
  const [running, setRunning] = useState(false);
  const phaseRef = useRef(0);

  const sizeUp = useCallback(() => {
    const holder = holderRef.current;
    const canvas = canvasRef.current;
    if (!holder || !canvas) return;

    // measurable width (holder has w-full + maxWidth)
    const width = Math.min(holder.clientWidth, layoutConfig.canvas.maxWidthPx);
    const height = layoutConfig.canvas.heightPx; // fixed height you set above
    setPanelH(height);

    // crisp canvas
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [dpr]);

  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const w = c.width / dpr;
    const h = c.height / dpr;

    ctx.clearRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = "rgba(16,185,129,0.08)";
    ctx.lineWidth = 1;
    const g = 40;
    ctx.beginPath();
    for (let x = 0; x <= w; x += g) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
    for (let y = 0; y <= h; y += g) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
    ctx.stroke();

    // axes
    ctx.strokeStyle = "rgba(16,185,129,0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.stroke();

    const wave = (color, ampScale, freq) => {
      const mid = h / 2, amp = (h / 4) * ampScale;
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      for (let x = 0; x <= w; x++) {
        const t = (x / w) * Math.PI * 2 * freq + phaseRef.current;
        const y = mid + Math.sin(t) * amp;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    };
    wave("rgba(56,189,248,0.9)", 1.0, 2.0);
    wave("rgba(16,185,129,0.9)", 0.7, 3.2);
  }, [dpr]);

  useEffect(() => {
    sizeUp();
    const onR = () => sizeUp();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, [sizeUp]);

  useEffect(() => {
    let raf;
    const loop = () => {
      if (running) phaseRef.current += 0.02;
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, draw]);

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 text-white relative">
      {/* back arrow */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: layoutConfig.backArrow.x,
          top: layoutConfig.backArrow.y,
          width: layoutConfig.backArrow.width,
          height: layoutConfig.backArrow.height,
          cursor: "pointer",
          zIndex: 100,
        }}
        onClick={() => onBack && onBack()}
      >
        <img src={BackArrowGif} alt="Go back" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>

      {/* progress bar (unchanged) */}
      <div className="w-full flex flex-col items-center justify-center mb-6 pb-6">
        <div
          className="relative w-full bg-white/5 rounded-full border border-slate-600/40 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.9)] max-w-[100%]"
          style={{ height: `${layoutConfig.progressBarHeightPx}px` }}
        >
          <div
            className="h-full bg-green-500 transition-[width] duration-500 ease-out shadow-[0_0_20px_rgba(16,185,129,0.6)]"
            style={{ width: `${progressPct}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[11px] sm:text-[38px] font-semibold text-slate-100 tabular-nums drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]">
              {progressPct}%
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: box (now guaranteed visible) */}
      <div
        className="w-full flex justify-end"
        style={{
          marginTop: `${layoutConfig.canvas.marginTopPx}px`,
          paddingRight: `${layoutConfig.canvas.marginRightPx}px`,
          paddingBottom: `${layoutConfig.canvas.bottomPaddingPx}px`,
        }}
      >
        {/* holder gets real width; we measure this */}
        <div className="relative w-full" style={{ maxWidth: `${layoutConfig.canvas.maxWidthPx}px` }}>
          {/* panel with explicit height from JS */}
          <div
            ref={holderRef}
            className="relative w-full rounded-[14px] border"
            style={{
              height: `${panelH || 360}px`,
              borderColor: "rgba(45,255,196,0.4)",
              background:
                "radial-gradient(ellipse at center, rgba(8,40,36,0.6), rgba(5,15,20,0.8))",
              boxShadow:
                "0 0 40px rgba(45,255,196,0.25), inset 0 0 80px rgba(0,255,174,0.06)",
              overflow: "hidden",
            }}
          >
            {/* waveform canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 block" />

            {/* Run/Stop control */}
            <div className="absolute right-4 bottom-4">
              <button
                onClick={() => setRunning(v => !v)}
                className="
                  inline-flex items-center justify-center
                  px-4 py-2 rounded-md text-[12px] sm:text-[13px] font-bold
                  border text-white bg-gradient-to-r from-emerald-600 to-sky-600
                  border-emerald-400/40 hover:brightness-110
                  shadow-[0_8px_25px_rgba(0,255,170,0.25)]
                  active:scale-[0.98]
                "
              >
                {running ? "Stop" : "Run"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LEFT visuals (untouched) */}
      <div
        className="absolute"
        style={{
          left: layoutConfig.left.searching.x,
          top: layoutConfig.left.searching.y,
          width: layoutConfig.left.searching.width,
          height: layoutConfig.left.searching.height,
          zIndex: 20,
        }}
      >
        <img src={SearchingImg} alt="Searching" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>

      <div
        className="absolute"
        style={{
          left: layoutConfig.left.checker.x,
          top: layoutConfig.left.checker.y,
          width: layoutConfig.left.checker.width,
          height: layoutConfig.left.checker.height,
          zIndex: 20,
        }}
      >
        <img src={CheckingGuyGif} alt="Checking schematic" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>

      <div
        className="absolute"
        style={{
          left: layoutConfig.ctaArrow.x,
          top: layoutConfig.ctaArrow.y,
          width: layoutConfig.ctaArrow.width,
          height: layoutConfig.ctaArrow.height,
          zIndex: 26,
          transform: `rotate(${layoutConfig.ctaArrow.rotateDeg}deg)`,
        }}
      >
        <img src={BackArrowGif} alt="arrow" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>

      <div
        className="absolute text-left select-none"
        style={{
          left: layoutConfig.left.label.x,
          top: layoutConfig.left.label.y,
          width: layoutConfig.left.label.maxWidthPx,
          color: layoutConfig.left.label.color,
          fontSize: layoutConfig.left.label.fontSizePx,
          lineHeight: 1.3,
          fontFamily: layoutConfig.left.label.fontFamily,
          textShadow: "0 2px 4px rgba(0,0,0,0.8)",
          zIndex: 25,
        }}
      >
        Click here to Check the
        <br />
        Schematic Design
      </div>
    </section>
  );
}
