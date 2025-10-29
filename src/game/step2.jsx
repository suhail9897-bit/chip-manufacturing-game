import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import Step3 from "./step3"; // <-- import for Step 3 screen

export default function Step2({ onBack }) {
  // canvas ref for waveform drawing
  const canvasRef = useRef(null);

  // phase is kept in React state so we preserve previous structure
  const [phase, setPhase] = useState(0);

  // are we animating right now?
  const [isRunning, setIsRunning] = useState(false);

  // whether we're showing Step 3 instead of the waveform view
  const [showStep3, setShowStep3] = useState(false);

  // mutable refs used inside RAF loop
  const phaseRef = useRef(0);
  const runningRef = useRef(false);

  // requestAnimationFrame handle so we can clean up on unmount
  const rafRef = useRef(null);

  // draw a sinusoidal waveform on the canvas
  const drawWave = useCallback((currentPhase) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;

    // clear
    ctx.clearRect(0, 0, width, height);

    // background fill (subtle transparent dark panel look)
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, width, height);

    // grid lines (very faint)
    ctx.strokeStyle = "rgba(16,185,129,0.08)"; // emerald-500-ish @ low alpha
    ctx.lineWidth = 1;

    const gridSize = 40;
    ctx.beginPath();
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
    }
    ctx.stroke();

    // axes
    ctx.strokeStyle = "rgba(16,185,129,0.4)"; // emerald-ish, brighter
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // horizontal mid line
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    // vertical mid line
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // helper to draw one sine
    const drawSingleWave = (color, ampScale = 1, freq = 2) => {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;

      const amplitude = (height / 4) * ampScale;
      const midY = height / 2;
      const twoPi = Math.PI * 2;

      for (let x = 0; x <= width; x++) {
        const t = (x / width) * twoPi * freq + currentPhase;
        const y = midY + Math.sin(t) * amplitude;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    // cyan-ish wave
    drawSingleWave("rgba(56,189,248,0.9)", 1, 2.0); // sky-400 like
    // emerald-ish wave, slightly different frequency
    drawSingleWave("rgba(16,185,129,0.9)", 0.7, 3.2); // emerald-500 like
  }, []);

  // toggle run / stop for animation
  const handleRunToggle = () => {
    const newRun = !isRunning;
    setIsRunning(newRun);
    runningRef.current = newRun;
  };

  // RAF animation loop:
  // - always redraw (so you still see the waveform)
  // - only advance phase if running
  useEffect(() => {
    const animate = () => {
      if (runningRef.current) {
        // advance phase slowly to create motion
        phaseRef.current += 0.02;
        setPhase(phaseRef.current); // keep React state in sync
      }
      drawWave(phaseRef.current);

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawWave]);

  // First paint (ensures canvas isn't empty before any animation)
  useLayoutEffect(() => {
    phaseRef.current = phase;
    runningRef.current = isRunning; // initial running state (false by default)
    drawWave(phaseRef.current);
  }, [phase, isRunning, drawWave]);

  // If we've moved to Step 3, render that screen instead of the waveform UI.
  // Step 3 will get a back button that flips this flag off again.
  if (showStep3) {
    return (
      <Step3
        onBackToStep2={() => {
          setShowStep3(false);
        }}
      />
    );
  }

  // Normal STEP 2 screen. Only layout change vs previous version:
  // - "Run / Stop" stays in the panel bottom-right.
  // - "Move to Step 3" is now fixed bottom-right of the viewport,
  //   matching how Step 1 shows "Move to Step 2".
  return (
    <section className="relative w-full px-4 sm:px-6 md:px-8 text-white">
      {/* back button pinned top-left (unchanged) */}
      <div className="absolute left-4 top-4 z-10">
        <button
          onClick={onBack}
          className="
            inline-flex
            items-center
            justify-center
            px-4
            py-2
            rounded-md
            text-[12px]
            sm:text-[13px]
            font-bold
            border
            text-white
            bg-gradient-to-r
            from-emerald-600
            to-sky-600
            border-emerald-400/40
            hover:brightness-110
            shadow-[0_8px_25px_rgba(0,255,170,0.25)]
            active:scale-[0.98]
          "
        >
          Back to Step 1
        </button>
      </div>

      {/* header / label (same visuals / placement) */}
      <div className="w-full flex flex-col items-center justify-center mb-16 pt-6">
        <div className="text-lg font-bold uppercase tracking-wide text-emerald-400 mb-2 text-center">
          STEP 2 · <span className="text-sky-400">Draw Waveform</span>
        </div>
      </div>

      {/* waveform panel (layout / styling unchanged) */}
      <div
        className="
          relative
          mx-auto
          flex
          flex-col
          items-center
          justify-center
          rounded-md
          border
          border-emerald-400/40
          bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.12)_0%,rgba(0,0,0,0)_70%)]
          shadow-[0_0_60px_rgba(0,255,170,0.25)]
          p-6
          w-[90%]
          max-w-[1200px]
          min-h-[380px]
        "
      >
        {/* canvas (same size/position) */}
        <canvas
          ref={canvasRef}
          width={1200}
          height={240}
          className="
            w-full
            max-w-[1200px]
            h-[240px]
            rounded
            border
            border-emerald-400/30
            bg-slate-900/30
            shadow-[0_0_40px_rgba(0,255,170,0.1)]
          "
        />

        {/* bottom-right control area INSIDE panel:
            now ONLY the Run / Stop toggle lives here */}
        <div className="w-full flex justify-end mt-6">
          <button
            onClick={handleRunToggle}
            className="
              inline-flex
              items-center
              justify-center
              px-4
              py-2
              rounded-md
              text-[12px]
              sm:text-[13px]
              font-bold
              border
              text-white
              bg-gradient-to-r
              from-emerald-600
              to-sky-600
              border-emerald-400/40
              hover:brightness-110
              shadow-[0_8px_25px_rgba(0,255,170,0.25)]
              active:scale-[0.98]
            "
          >
            {isRunning ? "Stop" : "Run"}
          </button>
        </div>
      </div>

      {/* fixed bottom-right button: Move to Step 3
          mirrors Step 1's bottom-right CTA style/position */}
      <div className="fixed right-24 bottom-24 z-10">
        <button
          onClick={() => {
            setShowStep3(true);
          }}
          className="
            inline-flex
            items-center
            justify-center
            px-4
            py-2
            rounded-md
            text-[12px]
            sm:text-[13px]
            font-bold
            border
            text-white
            bg-gradient-to-r
            from-emerald-600
            to-sky-600
            border-emerald-400/40
            hover:brightness-110
            shadow-[0_8px_25px_rgba(0,255,170,0.25)]
            active:scale-[0.98]
          "
        >
          Move to Step 3
        </button>
      </div>
    </section>
  );
}
