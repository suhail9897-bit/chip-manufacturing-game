import React, { useState } from "react";
import ChipPopup from "./pop-up.jsx"; // popup component

// add hasChip so we know which ones are actually correct
const ITEMS = [
  { name: "Phone", icon: "📱", hasChip: true },
  { name: "Laptop", icon: "💻", hasChip: true },
  { name: "Smartwatch", icon: "⌚", hasChip: true },
  { name: "Game console", icon: "🎮", hasChip: true },
  { name: "Robot toy", icon: "🤖", hasChip: true },
  { name: "Satellite", icon: "🛰️", hasChip: true },
  { name: "Smart car", icon: "🚗", hasChip: true },
  { name: "Drone", icon: "🚁", hasChip: true },
  { name: "Smart speaker", icon: "🔊", hasChip: true },
  { name: "Camera", icon: "📷", hasChip: true },
  { name: "Microwave", icon: "🍽️", hasChip: true },
  { name: "Washer", icon: "🧺", hasChip: true },
  { name: "TV", icon: "📺", hasChip: true },
  { name: "Traffic light", icon: "🚦", hasChip: true },
  { name: "Credit card", icon: "💳", hasChip: true },
  { name: "Calculator", icon: "🧮", hasChip: true },
  { name: "Remote", icon: "🎛️", hasChip: true },
  { name: "E-scooter", icon: "🛴", hasChip: true },
  { name: "Teddy bear", icon: "🧸", hasChip: false },
  { name: "Football", icon: "⚽", hasChip: false },
];

export default function MainFirst({ startSteps }) {
  // which items the kid has tapped
  const [selected, setSelected] = useState(() =>
    Array(ITEMS.length).fill(false)
  );

  // after "Check" gets pressed
  const [showResult, setShowResult] = useState(false);

  // popup open/close
  const [showPopup, setShowPopup] = useState(false);

  // toggle selection on tap
  function toggle(idx) {
    setSelected((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  }

  // total marked
  const foundCount = selected.filter(Boolean).length;

  // build result data (only used after Check)
  const correctMarkedNames = ITEMS.filter(
    (item, idx) => selected[idx] && item.hasChip
  ).map((item) => item.name);

  const wrongMarkedNames = ITEMS.filter(
    (item, idx) => selected[idx] && !item.hasChip
  ).map((item) => item.name);

  // styles for the top-right MARKED box (kept same vibe, no shadow)
  const markedBoxClass =
    "rounded-md bg-slate-900/70 border border-emerald-400/40 px-2.5 py-2 text-center";

  return (
    <>
      {/* MAIN AREA (70vh game zone) */}
      <section
        className="
          w-full
          px-4 sm:px-6 md:px-8
          pt-4
          h-[70vh]           /* stays in upper half */
          flex flex-col
          text-white
          overflow-hidden
        "
      >
        {/* heading row (left) + counter box on far right */}
        <div className="flex items-start justify-between w-full mb-[14px]">
          {/* heading text on the far left */}
          <div className="text-[25px] font-extrabold text-white leading-none">
            Select the objects in which chip is used
          </div>

          {/* Marked box on the far right */}
          <div className="ml-auto">
            <div className={markedBoxClass}>
              <div className="text-[10px] sm:text-[11px] uppercase font-bold text-emerald-400 leading-none">
                MARKED
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-white tabular-nums leading-none">
                {foundCount}
                <span className="text-slate-500 text-[9px] sm:text-[10px] font-bold">
                  /{ITEMS.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* GRID + CHECK BUTTON + RESULT WRAPPER */}
        <div
          className="
            flex-1
            flex flex-col
            overflow-y-auto
            pr-1
          "
        >
          {/* GRID AREA */}
          <div
            className="
              grid
              gap-2 sm:gap-3 md:gap-3
              grid-cols-4
              sm:grid-cols-5
              md:grid-cols-6
              lg:grid-cols-8
              xl:grid-cols-10
            "
          >
            {ITEMS.map((item, idx) => {
              const isOn = selected[idx]; // user marked it
              const isWrong =
                showResult && isOn && !item.hasChip; // wrong pick only AFTER check

              // bubble visuals
              const bubbleBg = isWrong
                ? "bg-red-400 text-red-900 shadow-[0_10px_25px_rgba(255,0,0,0.5)]"
                : "bg-emerald-400 text-emerald-900 shadow-[0_10px_25px_rgba(0,255,170,0.5)]";

              const bubbleText = isWrong ? "❌" : "✅";

              // ring color on the little icon square
              const ringClass = isOn
                ? isWrong
                  ? "ring-red-500 ring-offset-[2px] ring-offset-slate-900"
                  : "ring-emerald-400 ring-offset-[2px] ring-offset-slate-900"
                : "ring-slate-600/40 group-hover:ring-sky-400/60";

              return (
                <button
                  key={idx}
                  onClick={() => toggle(idx)}
                  className={`
                    max-w-[6rem] w-full
                    relative flex flex-col items-center justify-start
                    px-1.5 py-1 sm:px-2 sm:py-1
                    text-center
                    transition-all
                    ${
                      isOn
                        ? isWrong
                          ? "shadow-[0_5px_0px_rgba(255,0,0,0.4)]"
                          : "shadow-[0_5px_0px_rgba(0,255,170,0.4)]"
                        : "hover:shadow-[0_5px_0px_rgba(56,189,248,0.25)]"
                    }
                  `}
                >
                  {/* tick / cross bubble (only if marked) */}
                  {isOn && (
                    <div
                      className={`absolute top-1 right-1 text-[9px] font-bold rounded-full px-[4px] py-[1px] ${bubbleBg}`}
                    >
                      {bubbleText}
                    </div>
                  )}

                  {/* single inner icon square */}
                  <div
                    className={`
                      w-10 h-10 sm:w-12 sm:h-12
                      flex items-center justify-center
                      text-xl sm:text-4xl font-bold leading-none
                      rounded-md
                      bg-white/5
                      ring-[1.5px]
                      shadow-[0_12px_24px_rgba(0,0,0,0.8)]
                      ${ringClass}
                    `}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                  </div>

                  {/* labels */}
                  <div className="mt-1 text-center leading-tight">
                    <div className="text-[10px] sm:text-[11px] font-extrabold text-white">
                      {item.name}
                    </div>
                    <div className="text-[8px] sm:text-[9px] text-slate-500 font-medium">
                      {isOn ? "Marked ✔" : "Tap to mark"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* CHECK BUTTON + RESULT (left bottom under grid) */}
          <div className="mt-6 flex flex-col items-start">
            <button
              className="
                inline-flex items-center
                px-3 py-1.5
                rounded-md
                text-[11px] font-bold
                text-white
                bg-gradient-to-r from-emerald-600 to-sky-600
                border border-emerald-400/40
                shadow-[0_8px_25px_rgba(0,255,170,0.25)]
                hover:brightness-110
                active:scale-[0.98]
              "
              onClick={() => setShowResult(true)}
            >
              Check
            </button>

            {showResult && (
              <div className="mt-3 text-[15px] sm:text-[15px] leading-snug text-slate-200 font-medium max-w-xs">
                <div className="mb-1">
                  <span className="font-bold text-emerald-400">Correct:</span>{" "}
                  {correctMarkedNames.length > 0
                    ? correctMarkedNames.join(", ")
                    : "None"}
                </div>
                <div>
                  <span className="font-bold text-red-500">Wrong:</span>{" "}
                  {wrongMarkedNames.length > 0
                    ? wrongMarkedNames.join(", ")
                    : "None"}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA BUTTON (independent from the game logic) */}
      <section
        className="
          w-full
          px-4 sm:px-6 md:px-8
          py-6
          text-white
        "
      >
        <div className="w-full flex justify-center">
          <button
            className="
              inline-flex items-center
              px-4 py-2
              rounded-md
              text-[11px] sm:text-sm font-bold
              text-white text-left
              bg-gradient-to-r from-indigo-600 to-purple-600
              border border-indigo-400/40
              shadow-[0_8px_25px_rgba(99,102,241,0.4)]
              hover:brightness-110
              active:scale-[0.98]
            "
            onClick={() => setShowPopup(true)}
          >
            Do you want to make a chip for any object?
          </button>
        </div>
      </section>

      {/* POPUP (object picker) */}
      <ChipPopup
        open={showPopup}
        onClose={() => setShowPopup(false)}
        items={ITEMS}
        onSelect={(item, idx) => {
          // right now we just log which object they highlighted
          console.log("Selected for chip:", item, idx);
        }}
        onNext={() => {
          // close popup and jump to steps mode
          setShowPopup(false);
          if (startSteps) startSteps();
        }}
      />
    </>
  );
}
