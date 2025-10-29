import React from "react";

export default function Header() {
  return (
    <header className="w-full bg-[#0a0f1a] border-b-[1.5px] border-sky-500/80">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-3 text-white font-semibold tracking-tight relative">
        {/* centered brand */}
        <div className="text-[0.8rem] sm:text-base flex items-baseline gap-1 font-semibold select-none">
          {/* we keep color accents but tighten the word so it reads as one unit */}
           <h1 className="text-xl font-extrabold tracking-wide text-slate-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">
          X<span className="text-sky-500">C</span>
          <span className="text-pink-500">E</span>
          VO&nbsp;Academy
        </h1>
        </div>
        </div>
    </header>
  );
}
