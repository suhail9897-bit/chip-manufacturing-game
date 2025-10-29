import React, { useState } from "react";
import Header from "./components/Header.jsx";
import MainFirst from "./components/mainfirst.jsx";
import Steps from "./game/step1.jsx";

export default function App() {
  // false = show original select-chip screen
  // true  = show 4-steps game screen
  const [showSteps, setShowSteps] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-chip-bg text-white">
      <Header />

      {/* main interactive area below the header */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto py-8 sm:py-12">
        {showSteps ? (
          <Steps />
        ) : (
          <MainFirst startSteps={() => setShowSteps(true)} />
        )}
      </main>
    </div>
  );
}
