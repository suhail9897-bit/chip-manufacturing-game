import React, { useState } from "react";
import MaleTeacherGif from "../assets/male_teacher.gif"; // teacher
import ThoughtBubbleImg from "../assets/thought1.png";    // bubble
import StartGif from "../assets/start.gif";               // START HERE
import BackArrowGif from "../assets/back_arrow.gif";      // NEW back arrow
import Step2 from "./step2.jsx";
import Screen3 from "./screen3.jsx";

export default function Screen2({ onBack }) {
  // local state: jab START HERE (pink) pe click kare → actual Step2 open
  const [showScreen3, setShowScreen3] = useState(false);

 if (showScreen3) return <Screen3 onBack={() => setShowScreen3(false)} />;

  // sab positions yahan control hongi:
  const layoutConfig = {
    // 👇 back arrow (top-left)
    backArrow: {
      x: 30,          // px from left
      y: 20,          // px from top (below header line)
      width: 180,     // arrow size
      height: 120,
    },

    // teacher standing on left
    teacher: {
      x: 100,         // px from left
      y: 200,         // px from top
      width: 660,
      height: 620,
    },

    // speech bubble (thought1.png) + inner text
    bubble: {
      x: 560,         // bubble position from left
      y: 0,           // bubble position from top
      width: 520,     // bubble image render width
      height: 400,    // bubble image render height

      textX: 60,      // text offset inside bubble wrapper
      textY: 120,
      textMaxWidthPx: 400,
      fontSizePx: 30,
      lineHeight: 1.5,
      textColor: "#444444",
    },

    // "Are you ready ?" yellow text
    question: {
      x: 600,
      y: 500,
      maxWidthPx: 400,
      fontSizePx: 40,
      color: "#FFE680",
      lineHeight: 1.3,
      fontFamily:
        '"Comic Sans MS", "Comic Sans", "Marker Felt", "Segoe UI", system-ui, sans-serif',
    },

    // START HERE gif button (goes to Step2 sandbox)
    startGif: {
      x: 1550,
      y: 600,
      width: 160,
      height: 160,
    },
  };

  return (
    // parent relative so we can absolutely place elements on same dark bg
    <section className="w-full px-4 sm:px-6 md:px-8 text-white relative">
      {/* ===== BACK ARROW (click -> go back to step1) ===== */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: layoutConfig.backArrow.x + "px",
          top: layoutConfig.backArrow.y + "px",
          width: layoutConfig.backArrow.width + "px",
          height: layoutConfig.backArrow.height + "px",
          cursor: "pointer",
          zIndex: 60,
        }}
        onClick={() => {
          // parent (step1) ne jo onBack diya h usko call karenge
          if (onBack) onBack();
        }}
      >
        <img
          src={BackArrowGif}
          alt="Go back"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            userSelect: "none",
          }}
        />
      </div>

      {/* ===== TEACHER CHARACTER (male_teacher.gif) ===== */}
      <div
        className="absolute"
        style={{
          left: layoutConfig.teacher.x + "px",
          top: layoutConfig.teacher.y + "px",
          width: layoutConfig.teacher.width + "px",
          height: layoutConfig.teacher.height + "px",
          zIndex: 20,
        }}
      >
        <img
          src={MaleTeacherGif}
          alt="Teacher"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            userSelect: "none",
          }}
        />
      </div>

      {/* ===== SPEECH BUBBLE (white cloud img) + TEXT ===== */}
      <div
        className="absolute"
        style={{
          left: layoutConfig.bubble.x + "px",
          top: layoutConfig.bubble.y + "px",
          width: layoutConfig.bubble.width + "px",
          height: layoutConfig.bubble.height + "px",
          zIndex: 30,
        }}
      >
        {/* bubble image */}
        <img
          src={ThoughtBubbleImg}
          alt="Speech bubble"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />

        {/* text in bubble */}
        <div
          style={{
            position: "absolute",
            left: layoutConfig.bubble.textX + "px",
            top: layoutConfig.bubble.textY + "px",
            width: layoutConfig.bubble.textMaxWidthPx + "px",
            fontSize: layoutConfig.bubble.fontSizePx + "px",
            lineHeight: layoutConfig.bubble.lineHeight,
            color: layoutConfig.bubble.textColor,
            fontFamily:
              '"Comic Sans MS", "Comic Sans", "Marker Felt", "Segoe UI", system-ui, sans-serif',
            fontWeight: 500,
            textAlign: "center",
            whiteSpace: "pre-line",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            userSelect: "none",
          }}
        >
          {`You built your circuit!
Now let’s see if it works
correctly.`}
        </div>
      </div>

      {/* ===== YELLOW QUESTION TEXT ===== */}
      <div
        className="absolute text-center select-none"
        style={{
          left: layoutConfig.question.x + "px",
          top: layoutConfig.question.y + "px",
          width: layoutConfig.question.maxWidthPx + "px",
          color: layoutConfig.question.color,
          fontSize: layoutConfig.question.fontSizePx + "px",
          lineHeight: layoutConfig.question.lineHeight,
          textShadow: "0 2px 4px rgba(0,0,0,0.8)",
          fontFamily: layoutConfig.question.fontFamily,
          fontWeight: 500,
          zIndex: 40,
        }}
      >
        Are you ready ?
      </div>

      {/* ===== START HERE (click → Step2) ===== */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: layoutConfig.startGif.x + "px",
          top: layoutConfig.startGif.y + "px",
          width: layoutConfig.startGif.width + "px",
          height: layoutConfig.startGif.height + "px",
          cursor: "pointer",
          zIndex: 50,
        }}
        onClick={() => {
          setShowScreen3(true)
        }}
      >
        <img
          src={StartGif}
          alt="START HERE"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            userSelect: "none",
          }}
        />
      </div>
    </section>
  );
}
