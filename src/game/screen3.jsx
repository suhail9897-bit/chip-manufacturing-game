import React, { useRef, useState, useEffect, useCallback } from "react";
import SearchingImg from "../assets/searching.png";
import CheckingGuyGif from "../assets/checking_guy.gif";
import BackArrowGif from "../assets/back_arrow.gif";
import Fire2 from "../assets/fire2.gif";
import WellDone from "../assets/well_done.png";
import CorrectGif from "../assets/correct.gif";
import SquareBoxImg from "../assets/square_box.png";
import StartGif from "../assets/start.gif";

export default function Screen3({ onBack }) {
  // === layout numbers (you can tune these freely) ===
  const layoutConfig = {
    // existing
    ctaArrow: { x: 550, y: 740, width: 220, height: 100, rotateDeg: 0 },
    progressBarHeightPx: 45,
    canvas: {
      marginTopPx: 20,
      marginRightPx: 20,
      bottomPaddingPx: 36,
      maxWidthPx: 880,
      heightPx: 480, // manual height control
    },
    backArrow: { x: 30, y: 80, width: 120, height: 120 },
    left: {
      searching: { x: 320, y: 450, width: 350, height: 350 },
      checker: { x: 310, y: 100, width: 246, height: 212 },
      wellDone: { offsetX: 0, offsetY: 90, scale: 1.0 },
      label: {
        x: 800, y: 650, maxWidthPx: 560,
        fontSizePx: 40, color: "#FFFFFF",
        fontFamily:
          '"Comic Sans MS","Comic Sans","Marker Felt","Segoe UI",system-ui,sans-serif',
      },
    },

    // NEW: completion UI positions (tweak as you like)
    doneText: {
      x: 200, y: 460, maxWidthPx: 520,
      fontSizePx: 48, color: "#55d66a",
      fontFamily:
        '"Comic Sans MS","Comic Sans","Marker Felt","Segoe UI",system-ui,sans-serif',
      lineHeight: 1.25,
    },
    buildText: {
      x: 200, y: 660, maxWidthPx: 760,
      fontSizePx: 52, color: "#ffffff",
      fontFamily:
        '"Comic Sans MS","Comic Sans","Marker Felt","Segoe UI",system-ui,sans-serif',
      lineHeight: 1.26,
    },
   // layoutConfig (near the top)
squareBox: { x: 1300, y: 620, width: 210, height: 210 },   // 🧱 square_box.png
startGif:  { x: 1650, y: 660, width: 160, height: 110, scale: 1.0 }, // ⭐ start.gif

  };

  // ---- progress + blur workflow ----
  const [progress, setProgress] = useState(0);   // start at 0%
  const [isBlurred, setIsBlurred] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const progressPct = Math.max(0, Math.min(100, Math.round(progress)));

  // ===== Waveform drawing =====
  const holderRef = useRef(null);
  const canvasRef = useRef(null);
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  const [panelH, setPanelH] = useState(0);
  const [running, setRunning] = useState(false); // will auto-run after 100%
  const phaseRef = useRef(0);

  const sizeUp = useCallback(() => {
    const holder = holderRef.current;
    const canvas = canvasRef.current;
    if (!holder || !canvas) return;

    const width = Math.min(holder.clientWidth, layoutConfig.canvas.maxWidthPx);
    const height = layoutConfig.canvas.heightPx;
    setPanelH(height);

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

  // click -> animate progress to 100, then unblur & run & show completion UI
  const handleSearchClick = useCallback(() => {
    if (animating || progress >= 100) return;
    setAnimating(true);
    const start = performance.now();
    const duration = 2000; // 2s
    const init = progress;

    const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeInOutQuad(t);
      const val = Math.round(init + (100 - init) * eased);
      setProgress(val);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        setIsBlurred(false);
        setRunning(true);
        setShowCongrats(true); // <-- completion mode
        setAnimating(false);
      }
    };
    requestAnimationFrame(step);
  }, [animating, progress]);

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 text-white relative">
      {/* back arrow — HIDE after completion */}
   <div
  className="absolute flex items-center justify-center"
  style={{
    left: layoutConfig.backArrow.x,
    top: layoutConfig.backArrow.y,       // under the progress bar
    width: layoutConfig.backArrow.width,
    height: layoutConfig.backArrow.height,
    cursor: "pointer",
    zIndex: 100,
  }}
  onClick={() => onBack && onBack()}
>
  <img src={BackArrowGif} alt="Go back" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
</div>


      {/* progress bar */}
      <div className="w-full flex flex-col items-center justify-center mb-6 pb-6">
        <div
          className="relative w-full bg-white/5 rounded-full border border-slate-600/40 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.9)] max-w-[100%]"
          style={{ height: `${layoutConfig.progressBarHeightPx}px` }}
        >
          <div
            className="h-full bg-green-500 transition-[width] duration-200 ease-linear shadow-[0_0_20px_rgba(16,185,129,0.6)]"
            style={{ width: `${progressPct}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[11px] sm:text-[38px] font-semibold text-slate-100 tabular-nums drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]">
              {progressPct}%
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: waveform panel */}
      <div
        className="w-full flex justify-end"
        style={{
          marginTop: `${layoutConfig.canvas.marginTopPx}px`,
          paddingRight: `${layoutConfig.canvas.marginRightPx}px`,
          paddingBottom: `${layoutConfig.canvas.bottomPaddingPx}px`,
        }}
      >
        <div className="relative w-full" style={{ maxWidth: `${layoutConfig.canvas.maxWidthPx}px` }}>
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
              filter: isBlurred ? "blur(6px) brightness(0.85)" : "none",
              transition: "filter 420ms ease",
            }}
          >
            <canvas ref={canvasRef} className="absolute inset-0 block" />
            {/* correct overlay when done */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ opacity: showCongrats ? 1 : 0, transition: "opacity 300ms ease" }}
            >
              <img
                src={CorrectGif}
                alt="Correct"
                style={{ maxWidth: "30%", maxHeight: "45%", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* LEFT visuals: search/teacher or congrats -------------------------------- */}
      {/* searching image — HIDE after completion */}
      {!showCongrats && (
        <div
          className="absolute"
          style={{
            left: layoutConfig.left.searching.x,
            top: layoutConfig.left.searching.y,
            width: layoutConfig.left.searching.width,
            height: layoutConfig.left.searching.height,
            zIndex: 20,
            cursor: "pointer",
          }}
          onClick={handleSearchClick}
          title="Start checking"
        >
          <img src={SearchingImg} alt="Searching" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
      )}

      {/* teacher/checker -> fireworks + well done */}
      <div
        className="absolute"
        style={{
          left: layoutConfig.left.checker.x,
          top: layoutConfig.left.checker.y,
          width: layoutConfig.left.checker.width,
          height: layoutConfig.left.checker.height,
          zIndex: 22,
        }}
      >
        {showCongrats ? (
          <div className="relative w-full h-full">
            <img
              src={Fire2}
              alt="Fireworks"
              className="absolute inset-0"
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.95 }}
            />
            <img
              src={WellDone}
              alt="Well done"
              className="absolute inset-0"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transform: `translate(${layoutConfig.left.wellDone.offsetX}px, ${layoutConfig.left.wellDone.offsetY}px) scale(${layoutConfig.left.wellDone.scale})`,
              }}
            />
          </div>
        ) : (
          <img
            src={CheckingGuyGif}
            alt="Checking schematic"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        )}
      </div>

      {/* CTA arrow (green) — HIDE after completion */}
      {!showCongrats && (
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
      )}

      {/* "Click here..." label — HIDE after completion */}
      {!showCongrats && (
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
      )}

      {/* ===================== COMPLETION UI ===================== */}
      {showCongrats && (
        <>
          {/* “Schematic Design testing is complete” */}
          <div
            className="absolute select-none"
            style={{
              left: layoutConfig.doneText.x,
              top: layoutConfig.doneText.y,
              width: layoutConfig.doneText.maxWidthPx,
              color: layoutConfig.doneText.color,
              fontSize: layoutConfig.doneText.fontSizePx,
              lineHeight: layoutConfig.doneText.lineHeight,
              fontFamily: layoutConfig.doneText.fontFamily,
              textShadow: "0 2px 4px rgba(0,0,0,0.85)",
              zIndex: 30,
            }}
          >
            Schematic Design
            <br />
            testing is complete
          </div>

          {/* “Let’s build the city for Zoros and unos now” */}
          <div
            className="absolute select-none"
            style={{
              left: layoutConfig.buildText.x,
              top: layoutConfig.buildText.y,
              width: layoutConfig.buildText.maxWidthPx,
              color: layoutConfig.buildText.color,
              fontSize: layoutConfig.buildText.fontSizePx,
              lineHeight: layoutConfig.buildText.lineHeight,
              fontFamily: layoutConfig.buildText.fontFamily,
              textShadow: "0 2px 4px rgba(0,0,0,0.85)",
              zIndex: 30,
            }}
          >
            Let’s build the city for
            <br />
            Zoros and unos now
          </div>

          {/* square box + start gif cluster */}
         {/* square_box.png */}
<div
  className="absolute"
  style={{
    left: layoutConfig.squareBox.x,
    top: layoutConfig.squareBox.y,
    width: layoutConfig.squareBox.width,
    height: layoutConfig.squareBox.height,
    zIndex: 34,
  }}
>
  <img
    src={SquareBoxImg}
    alt="square"
    className="absolute inset-0"
    style={{ width: "100%", height: "100%", objectFit: "contain" }}
  />
</div>

{/* start.gif */}
<div
  className="absolute"
  style={{
    left: layoutConfig.startGif.x,
    top: layoutConfig.startGif.y,
    width: layoutConfig.startGif.width,
    height: layoutConfig.startGif.height,
    zIndex: 35,
    transform: `scale(${layoutConfig.startGif.scale})`,
    transformOrigin: "center",
  }}
>
  <img
    src={StartGif}
    alt="start here"
    style={{ width: "100%", height: "100%", objectFit: "contain" }}
  />
</div>

          
        </>
      )}
    </section>
  );
}
