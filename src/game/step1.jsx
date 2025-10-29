import React, { useState } from "react";
import TypingGif from "../assets/Typing.gif";
import ChipPng from "../assets/chip.png";
import FireworksGif from "../assets/fireworks.gif";
import SquareBoxImg from "../assets/square_box.png";
import StartGif from "../assets/start.gif";
import BackArrowGif from "../assets/back_arrow.gif";


import Screen2 from "./screen2.jsx"; // NEW: instead of going directly to Step2
import SchematicCanvas from "../components/SchematicCanvas.jsx";

export default function Steps({onBackToMain}) {
  // =========================
  // LAYOUT CONFIG (TUNE ALL THESE NUMBERS YOURSELF)
  // =========================
  const layoutConfig = {
    // progress bar height
    progressBarHeightPx: 45,

      backArrow: {
    x: 30,      // left se distance (px)
    y: 80,      // header ke niche top offset (px)
    width: 120, // size
    height: 120
  },

    // typing-boy GIF block (shown BEFORE 100%)
    gif: {
      x: 200, // px from left edge
      y: 80, // px from top
      width: 500,
      height: 300,
      borderRadiusPx: 40,
    },

    // chip image (click target to reveal schematic) (shown BEFORE 100%)
    chipImg: {
      x: 260,
      y: 420,
      width: 300,
      height: 180,
      borderRadiusPx: 16,
    },

    // arrow below chip (animated bounce) (shown BEFORE 100%)
    arrow: {
      x: 390,
      y: 560,
      width: 80,
      height: 120,
      rotateDeg: -20,
      strokeWidth: 6,

      // animation controls
      floatDistancePx: 10, // how many px it moves up/down
      floatDurationSec: 1.5, // how fast the bobbing loop is
    },

    // text "Click here to Develop Schematic Design" (shown BEFORE 100%)
    label: {
      x: 150,
      y: 680,
      fontSizePx: 32,
      maxWidthPx: 600,
      color: "#FFFFFF",
    },

    // ===== AFTER 100% completion UI =====
    complete: {
      // tiny fireworks gif / sparkles
      fireworks: {
        x: 220,
        y: 100,
        width: 300,
        height: 300,
      },

      // block that shows "Well Done" and "Schematic Design is complete"
      doneBlock: {
        x: 200,
        y: 300,
        maxWidthPx: 320,
      },

      // bottom message "Let's build the city..."
      cityText: {
        x: 120,
        y: 600,
        fontSizePx: 36,
        maxWidthPx: 600,
        color: "#FFFFFF",
      },

      // square_box.png (little people pushing colorful blocks)
      squareBox: {
        x: 1100,
        y: 620,
        width: 200,
        height: 200,
      },

      // start.gif (START HERE bubble/button)
      startGif: {
        x: 1650,
        y: 650,
        width: 140,
        height: 140,
      },
    },

    // right-side schematic canvas block (always rendered on the right in flow)
    canvas: {
      marginTopPx: 20,
      marginRightPx: 80,
      bottomPaddingPx: 64,
    },
  };

  // =========================
  // GAME / STAGE STATE
  // =========================
  const FINAL_STAGE = 10;
  const [stage, setStage] = useState(0);

  // after 100% + clicking "START HERE" we go to Screen2
  const [showStep2, setShowStep2] = useState(false);

  // force-remount key for schematic canvas (resets zoom when we "go back")
  const [canvasResetKey, setCanvasResetKey] = useState(0);

  const progressPct = Math.round((stage / FINAL_STAGE) * 100);
  const isLastStage = stage >= FINAL_STAGE;
  const canMoveToStep2 = isLastStage; // we’ll use this for START HERE

  function handleBackToMain() {
  if (onBackToMain) onBackToMain();
}


  // reveal next part of schematic (chip click does this)
  function handleNext() {
    if (isLastStage) return; // if already 100% don't go further
    setStage((s) => Math.min(s + 1, FINAL_STAGE));
  }

  // go to Screen2 (the new "city / challenge / teacher" screen)
  function handleGoStep2() {
    if (!canMoveToStep2) return;
    setShowStep2(true);
  }



  // =========================
  // SHOW SCREEN2 INSTEAD OF MAIN STEP1 UI
  // (This used to directly show Step2. Now it shows our new intro screen.)
  // =========================
  if (showStep2) {
    return (
      <Screen2
        onBack={() => {
          // if we ever add a "go back" in Screen2, it can call this.
          // reset schematic view to stage 0 when coming back
          setStage(0);
          setCanvasResetKey((k) => k + 1);
          setShowStep2(false);
        }}
      />
    );
  }

  // =========================
  // ARROW ANIMATION KEYFRAMES
  // (for the green arrow BEFORE 100%)
  // =========================
  const arrowKeyframes = `
    @keyframes floatUpDown {
      0%   { transform: translateY(0px); }
      50%  { transform: translateY(-${layoutConfig.arrow.floatDistancePx}px); }
      100% { transform: translateY(0px); }
    }
  `;

  // =========================
  // MAIN STEP1 RENDER
  // =========================
  return (
    // parent is relative so all the positioned blocks can sit absolutely
    <section className="w-full px-4 sm:px-6 md:px-8 text-white relative">

      {/* ALWAYS-VISIBLE BACK ARROW */}
<div
  className="absolute flex items-center justify-center"
  style={{
    left: layoutConfig.backArrow.x + "px",
    top: layoutConfig.backArrow.y + "px",
    width: layoutConfig.backArrow.width + "px",
    height: layoutConfig.backArrow.height + "px",
    cursor: "pointer",
    zIndex: 100,  // sab se upar
  }}
  onClick={handleBackToMain}
>
  <img
    src={BackArrowGif}
    alt="Go back"
    style={{ width: "100%", height: "100%", objectFit: "contain", userSelect: "none" }}
  />
</div>

      {/* Inject arrow bounce CSS */}
      <style>{arrowKeyframes}</style>

      {/* ===== PROGRESS BAR TOP ===== */}
      <div className="w-full flex flex-col items-center justify-center mb-6 pb-6">
        <div
          className="
            relative
            w-full
            bg-white/5
            rounded-full
            border border-slate-600/40
            overflow-hidden
            shadow-[0_0_20px_rgba(0,0,0,0.9)]
            max-w-[100%]
          "
          style={{
            height: layoutConfig.progressBarHeightPx + "px",
          }}
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

          {/* centered % text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[11px] sm:text-[38px] font-semibold text-slate-100 tabular-nums text-center drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]">
              {progressPct}%
            </span>
          </div>
        </div>
      </div>

      {/* ===== RIGHT-SIDE SCHEMATIC CANVAS AREA =====
         stays rendered in the normal flex flow on the right */}
      <div
        className="w-full flex justify-end"
        style={{
          marginTop: layoutConfig.canvas.marginTopPx + "px",
          paddingRight: layoutConfig.canvas.marginRightPx + "px",
          paddingBottom: layoutConfig.canvas.bottomPaddingPx + "px",
        }}
      >
        <div className="relative max-w-full flex items-center justify-center">
          <SchematicCanvas stage={stage} key={canvasResetKey} />
        </div>
      </div>

      {/* ====================================================== */}
      {/* ============ PRE-100% (BUILDING SCHEMATIC) UI ========= */}
      {/* ====================================================== */}

      {!isLastStage && (
        <>
          {/* typing boy - decorative only */}
          <div
            className="pointer-events-none bg-transparent absolute"
            style={{
              left: layoutConfig.gif.x + "px",
              top: layoutConfig.gif.y + "px",
              width: layoutConfig.gif.width + "px",
              height: layoutConfig.gif.height + "px",
              borderRadius: layoutConfig.gif.borderRadiusPx + "px",
              overflow: "hidden",
              zIndex: 20,
            }}
          >
            <img
              src={TypingGif}
              alt="Designing on computer"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: layoutConfig.gif.borderRadiusPx + "px",
              }}
            />
          </div>

          {/* chip image - CLICK TARGET to advance stage */}
          <div
            className="absolute bg-transparent flex items-center justify-center"
            onClick={handleNext}
            style={{
              left: layoutConfig.chipImg.x + "px",
              top: layoutConfig.chipImg.y + "px",
              width: layoutConfig.chipImg.width + "px",
              height: layoutConfig.chipImg.height + "px",
              borderRadius: layoutConfig.chipImg.borderRadiusPx + "px",
              overflow: "hidden",
              zIndex: 30,
              cursor: "pointer",
              opacity: 1,
            }}
          >
            <img
              src={ChipPng}
              alt="Chip illustration"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: layoutConfig.chipImg.borderRadiusPx + "px",
              }}
            />
          </div>

          {/* arrow (bouncing) pointing to chip */}
          <div
            className="absolute"
            style={{
              left: layoutConfig.arrow.x + "px",
              top: layoutConfig.arrow.y + "px",
              width: layoutConfig.arrow.width + "px",
              height: layoutConfig.arrow.height + "px",
              transform: `rotate(${layoutConfig.arrow.rotateDeg}deg)`,
              transformOrigin: "center center",
              zIndex: 25,
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 60 100"
              fill="none"
              style={{
                display: "block",
                animation: `floatUpDown ${layoutConfig.arrow.floatDurationSec}s ease-in-out infinite`,
              }}
            >
              {/* arrow shaft */}
              <path
                d="M30 100 C20 70, 20 50, 28 30 C32 20, 35 10, 35 0"
                stroke="#00ff4c"
                strokeWidth={layoutConfig.arrow.strokeWidth}
                strokeLinecap="round"
                fill="none"
              />
              {/* arrow head */}
              <path
                d="M25 15 L35 0 L40 18"
                stroke="#00ff4c"
                strokeWidth={layoutConfig.arrow.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          {/* "Click here to Develop Schematic Design" text */}
          <div
            className="absolute text-center"
            style={{
              left: layoutConfig.label.x + "px",
              top: layoutConfig.label.y + "px",
              width: layoutConfig.label.maxWidthPx + "px",
              color: layoutConfig.label.color,
              fontSize: layoutConfig.label.fontSizePx + "px",
              fontFamily:
                '"Comic Sans MS", "Comic Sans", "Marker Felt", "Segoe UI", system-ui, sans-serif',
              lineHeight: 1.3,
              fontWeight: 500,
              textShadow: "0 2px 4px rgba(0,0,0,0.8)",
              zIndex: 26,
              userSelect: "none",
            }}
          >
            Click here to Develop Schematic Design
          </div>
        </>
      )}

      {/* ====================================================== */}
      {/* ================== POST-100% UI ====================== */}
      {/* ====================================================== */}

      {isLastStage && (
        <>
          {/* sparkles / fireworks gif */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: layoutConfig.complete.fireworks.x + "px",
              top: layoutConfig.complete.fireworks.y + "px",
              width: layoutConfig.complete.fireworks.width + "px",
              height: layoutConfig.complete.fireworks.height + "px",
              zIndex: 40,
            }}
          >
            <img
              src={FireworksGif}
              alt="Celebration"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          {/* "Well Done / Schematic Design is complete" block */}
          <div
            className="absolute text-center select-none"
            style={{
              left: layoutConfig.complete.doneBlock.x + "px",
              top: layoutConfig.complete.doneBlock.y + "px",
              width: layoutConfig.complete.doneBlock.maxWidthPx + "px",
              zIndex: 41,
            }}
          >
            {/* Well Done header */}
            <div
              style={{
                fontSize: "48px",
                fontWeight: 700,
                lineHeight: 1.1,
                color: "#1E90FF",
                fontFamily:
                  '"Comic Sans MS", "Comic Sans", "Marker Felt", "Segoe UI", system-ui, sans-serif',
                textShadow:
                  "-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, 0 0 8px rgba(255,255,0,0.8)",
              }}
            >
              Well
              <br />
              Done
            </div>

            {/* Gold/yellow supporting text */}
            <div
              style={{
                marginTop: "12px",
                fontSize: "28px",
                lineHeight: 1.3,
                fontWeight: 500,
                color: "#ffe680",
                textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                fontFamily:
                  '"Comic Sans MS", "Comic Sans", "Marker Felt", "Segoe UI", system-ui, sans-serif',
              }}
            >
              Schematic Design
              <br />
              is complete
            </div>
          </div>

          {/* Big bottom message: "Let's build the city..." */}
          <div
            className="absolute text-center select-none"
            style={{
              left: layoutConfig.complete.cityText.x + "px",
              top: layoutConfig.complete.cityText.y + "px",
              width: layoutConfig.complete.cityText.maxWidthPx + "px",
              fontSize: layoutConfig.complete.cityText.fontSizePx + "px",
              lineHeight: 1.3,
              fontWeight: 500,
              color: layoutConfig.complete.cityText.color,
              textShadow: "0 2px 4px rgba(0,0,0,0.8)",
              fontFamily:
                '"Comic Sans MS", "Comic Sans", "Marker Felt", "Segoe UI", system-ui, sans-serif',
              zIndex: 42,
            }}
          >
            Let’s build the city for
            <br />
            Zoros and unos now
          </div>

          {/* square_box.png */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: layoutConfig.complete.squareBox.x + "px",
              top: layoutConfig.complete.squareBox.y + "px",
              width: layoutConfig.complete.squareBox.width + "px",
              height: layoutConfig.complete.squareBox.height + "px",
              zIndex: 43,
            }}
          >
            <img
              src={SquareBoxImg}
              alt="Building the city"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          {/* start.gif ("START HERE" button) */}
          <div
            className="absolute flex items-center justify-center"
            onClick={handleGoStep2}
            style={{
              left: layoutConfig.complete.startGif.x + "px",
              top: layoutConfig.complete.startGif.y + "px",
              width: layoutConfig.complete.startGif.width + "px",
              height: layoutConfig.complete.startGif.height + "px",
              zIndex: 44,
              cursor: canMoveToStep2 ? "pointer" : "default",
              opacity: canMoveToStep2 ? 1 : 0.5,
              userSelect: "none",
            }}
          >
            <img
              src={StartGif}
              alt="Start here"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </>
      )}
    </section>
  );
}
