import React, { useState } from "react";

/**
 * ChipPopup
 *
 * Props:
 *  - open (boolean): true => popup visible, false => hidden
 *  - onClose (function): called when user clicks close or backdrop
 *  - items (array): [{ name: "Phone", icon: "📱", hasChip: true }, ...]
 *  - onSelect (function): called (item, index) when user picks one
 *  - onNext (function): called when user clicks Next (only if something picked)
 *
 * Internal:
 *  - pickedIdx (number|null): which object is currently selected
 */

export default function ChipPopup({
  open,
  onClose,
  items = [],
  onSelect,
  onNext,
}) {
  const [pickedIdx, setPickedIdx] = useState(null);

  if (!open) return null;

  // only keep items where chip actually makes sense (remove Teddy bear, Football etc.)
  const chipCapableItems = items.filter(
    (it) => it.hasChip !== false // explicit false gets removed
  );

  function handlePick(idx) {
    setPickedIdx(idx);
    if (onSelect) onSelect(chipCapableItems[idx], idx);
  }

  function handleNext() {
    if (pickedIdx === null) return;
    if (onNext) onNext(chipCapableItems[pickedIdx], pickedIdx);
  }

  const isNextDisabled = pickedIdx === null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* modal panel */}
      <div
        className="
          relative
          w-full max-w-[820px]
          rounded-2xl
          bg-[#0a0f1a]/95
          border border-sky-500/40
          shadow-[0_30px_120px_rgba(0,0,0,0.9)]
          text-white
          px-5 py-6 sm:px-8 sm:py-7
        "
      >
        {/* close button */}
        <button
          onClick={onClose}
          className="
            absolute right-4 top-4
            text-slate-400 hover:text-white
            text-xs font-bold leading-none
            px-2 py-1
            bg-white/5
            rounded-md
            border border-white/10
            shadow-[0_10px_30px_rgba(0,0,0,0.8)]
            active:scale-[0.96]
          "
        >
          ✕
        </button>

        {/* heading */}
        <div className="text-[17px] sm:text-[18px] font-extrabold text-white pr-12 leading-tight mb-6">
          Which object do you want to make a chip for?
        </div>

        {/* icons grid */}
        <div
          className="
            grid
            grid-cols-4
            md:grid-cols-5
            gap-4 md:gap-5
          "
        >
          {chipCapableItems.map((item, idx) => {
            const isPicked = pickedIdx === idx;

            const ringClass = isPicked
              ? "ring-emerald-400 ring-offset-[2px] ring-offset-slate-900"
              : "ring-slate-600/40 group-hover:ring-sky-400/60";

            return (
              <button
                key={idx}
                onClick={() => handlePick(idx)}
                className={`
                  relative
                  flex flex-col items-center
                  text-center
                  bg-white/0
                  rounded-md
                  p-2 sm:p-3
                  transition-all
                  ${
                    isPicked
                      ? "shadow-[0_5px_0px_rgba(0,255,170,0.4)]"
                      : "hover:shadow-[0_5px_0px_rgba(56,189,248,0.25)]"
                  }
                `}
              >
                {/* tick bubble on selected */}
                {isPicked && (
                  <div
                    className="
                      absolute -top-2 -right-2
                      text-[10px] font-bold
                      rounded-full
                      px-[5px] py-[2px]
                      bg-emerald-400 text-emerald-900
                      shadow-[0_10px_25px_rgba(0,255,170,0.5)]
                    "
                  >
                    ✅
                  </div>
                )}

                {/* icon square */}
                <div
                  className={`
                    w-14 h-14
                    sm:w-16 sm:h-16
                    flex items-center justify-center
                    text-2xl sm:text-3xl font-bold leading-none
                    rounded-md
                    bg-white/5
                    ring-[1.5px]
                    shadow-[0_12px_24px_rgba(0,0,0,0.8)]
                    ${ringClass}
                  `}
                >
                  <span aria-hidden="true">{item.icon}</span>
                </div>

                {/* label */}
                <div className="mt-2 leading-tight text-center">
                  <div className="text-[11px] sm:text-[12px] font-bold text-white">
                    {item.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* footer with Next button */}
        <div className="mt-8 w-full flex justify-end">
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`
              inline-flex items-center justify-center
              px-4 py-2
              rounded-md
              text-[12px] sm:text-[13px] font-bold
              border
              shadow-[0_8px_25px_rgba(0,255,170,0.25)]
              active:scale-[0.98]
              ${
                isNextDisabled
                  ? "bg-white/5 border-white/10 text-slate-500 cursor-not-allowed opacity-40 shadow-none"
                  : "text-white bg-gradient-to-r from-emerald-600 to-sky-600 border-emerald-400/40 hover:brightness-110"
              }
            `}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
