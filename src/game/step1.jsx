// step1.jsx AFTER refactor
// - All the layout / progress / buttons / fireworks / step switching stay here
// - The heavy canvas drawing + zoom logic lives in SchematicCanvas.jsx now
// - We still don't remove or break any features

import React, { useState } from "react";
import TypingGif from "../assets/Typing.gif";
import FireworksGif from "../assets/happy-diwali-fireworks.gif";
import Step2 from "./step2";
import SchematicCanvas from "../components/SchematicCanvas.jsx";

export default function Steps() {
  // ======== GAME PROGRESSION / VIEW STATE ========
  const FINAL_STAGE = 10; // last reveal step
  const [stage, setStage] = useState(0); // 0 => blank canvas -> ... -> FINAL_STAGE
  const [showStep2, setShowStep2] = useState(false);

  // When we leave for Step 2 and then come back,
  // we want a fresh canvas (zoom reset to 1, etc.).
  // Easiest: nudge a key prop on <SchematicCanvas />.
  const [canvasResetKey, setCanvasResetKey] = useState(0);

  const progressPct = Math.round((stage / FINAL_STAGE) * 100);
  const isLastStage = stage >= FINAL_STAGE;
  const canMoveToStep2 = isLastStage;

  // show fireworks gif + congratulations message once we're done
  const showFireworks = progressPct >= 100;

  // ======== BUTTON LOGIC ========
  function handleNext() {
    if (isLastStage) return;
    // each click reveals another chunk of the schematic
    setStage((s) => Math.min(s + 1, FINAL_STAGE));
  }

  // ======== STEP2 TOGGLE ========
  if (showStep2) {
    return (
      <Step2
        onBack={() => {
          // going "Back to Step 1" should restore a fresh Step 1 view
          setStage(0);
          setCanvasResetKey((k) => k + 1); // force remount of canvas => zoom resets, etc.
          setShowStep2(false);
        }}
      />
    );
  }

  // ======== STEP 1 UI LAYOUT ========
  return (
    <section className="relative w-full px-4 sm:px-6 md:px-8 text-white">
      {/* LEFT GIF of the person working at desk */}
      <div
        className="
          absolute
          left-0
          top-[50px]
          w-[500px]
          h-[300px]
          border-none
          rounded-[4px]
          bg-transparent
          overflow-hidden
          pointer-events-none
        "
      >
        <img
          src={TypingGif}
          alt="Building chip animation"
          className="w-full h-full object-contain"
        />
      </div>

      {/* progressive 'Click to draw Schematic' button */}
      <div
        className="
          absolute
          left-12
          top-[410px]
          z-10
        "
      >
        <button
          onClick={handleNext}
          disabled={isLastStage}
          className={`inline-flex items-center justify-center px-8 py-2 rounded-md text-[12px] sm:text-[23px] font-bold border shadow-[0_8px_25px_rgba(0,255,170,0.25)] active:scale-[0.98] ${
            isLastStage
              ? "bg-white/5 border-white/10 text-slate-500 cursor-not-allowed opacity-40 shadow-none"
              : "text-white bg-gradient-to-r from-emerald-600 to-sky-600 border-emerald-400/40 hover:brightness-110"
          }`}
        >
          Click to draw Schematic
        </button>
      </div>

      {/* RIGHT-SIDE INFO:
          - Before 100% => shows 'STEP 1 · DRAW SCHEMATIC'
          - After 100%  => shows fireworks + congratulation text
          Layout is absolutely positioned so nothing else shifts.
      */}
      <div
        className="
          absolute
          right-24
          top-[200px]
          pointer-events-none
          select-none
          flex
          flex-col
          items-center
          justify-start
          w-[300px]
        "
      >
        {!showFireworks ? (
          <div
            className="
              text-[12px]
              sm:text-[24px]
              font-semibold
              tracking-[0.15em]
              uppercase
              bg-gradient-to-r
              from-emerald-400
              to-sky-400
              text-transparent
              bg-clip-text
              text-center
            "
          >
            Step&nbsp;1&nbsp;·&nbsp;Draw&nbsp;Schematic
          </div>
        ) : (
          <>
            {/* celebratory GIF */}
            <div className="w-[280px] h-[250px] flex items-center justify-center">
              <img
                src={FireworksGif}
                alt="Celebration"
                className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]"
              />
            </div>

            {/* Congratulations message under the GIF */}
            <div
              className="
                mt-4
                max-w-[260px]
                text-center
                text-[11px]
                sm:text-[23px]
                leading-snug
                font-semibold
                tracking-[0.15em]
                uppercase
                bg-gradient-to-r
                from-emerald-400
                to-sky-400
                text-transparent
                bg-clip-text
              "
            >
              Congratulations! You’ve finished your schematic design.
            </div>
          </>
        )}
      </div>

      {/* Move to Step 2 button (unlocked at final stage) */}
      <div className="absolute right-10 bottom-8 z-10">
        <button
          disabled={!canMoveToStep2}
          onClick={() => {
            if (canMoveToStep2) {
              setShowStep2(true);
            }
          }}
          className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-[12px] sm:text-[13px] font-bold border shadow-[0_8px_25px_rgba(0,255,170,0.25)] active:scale-[0.98] ${
            canMoveToStep2
              ? "text-white bg-gradient-to-r from-emerald-600 to-sky-600 border-emerald-400/40 hover:brightness-110"
              : "bg-white/5 border-white/10 text-slate-500 cursor-not-allowed opacity-40 shadow-none"
          }`}
        >
          Move to Step 2
        </button>
      </div>

      {/* PROGRESS BAR with % text centered in the bar */}
      <div className="w-full flex flex-col items-center justify-center mb-6 pb-6">
        <div
          className="
            relative
            w-full
            h-[40px]
            bg-white/5
            rounded-full
            border border-slate-600/40
            overflow-hidden
            shadow-[0_0_20px_rgba(0,0,0,0.9)]
            max-w-[50rem]
          "
        >
          {/* green fill */}
          <div
            className="
              h-full
              bg-green-500
              transition-[width] duration-500 ease-out
              shadow-[0_0_20px_rgba(16,185,129,0.6)]
            "
            style={{ width: `${progressPct}%` }}
          />

          {/* centered percentage text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[11px] sm:text-[38px] font-semibold text-slate-100 tabular-nums text-center drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]">
              {progressPct}%
            </span>
          </div>
        </div>
      </div>

      {/* CHIP CANVAS AREA */}
      <div className="relative max-w-full mx-auto flex items-center justify-center pb-16">
        <SchematicCanvas stage={stage} key={canvasResetKey} />
      </div>
    </section>
  );
}
