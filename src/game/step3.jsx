import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function Step3({ onBackToStep2 }) {
  const mountRef = useRef(null);

  // staged build (6 clicks max)
  const TOTAL_STAGES = 6;
  const [stage, setStage] = useState(0);

  // keep Three objects across renders
  const threeRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    boardGroup: null,  // board + grid
    blocksGroup: null, // all chip “blocks”
    size: { w: 0, h: 0 },
    anims: new Set(),
    raf: 0,
  });

  // ---- board logical size (world units) ----
  const BOARD_W = 28; // X
  const BOARD_D = 18; // Z
  const BOARD_T = 0.25; // thickness (Y)

  // 6 stage specs (percent coords -> world units)
  // x,z,w,d are in % of BOARD_W/BOARD_D
  const STAGES = [
    [
      { x: 3, z: 6, w: 16, d: 5, h: 1.2, color: 0x22d3ee, label: "Core 1" },
      { x: 21, z: 6, w: 16, d: 5, h: 1.2, color: 0x10b981, label: "Core 2" },
    ],
    [
      { x: 8, z: 23, w: 22, d: 6, h: 1.4, color: 0x3b82f6, label: "Core 3" },
      { x: 36, z: 22, w: 20, d: 6, h: 1.0, color: 0x14b8a6, label: "Core 4" },
    ],
    [
      { x: 30, z: 40, w: 30, d: 9, h: 1.6, color: 0x6366f1, label: "Core 5" },
    ],
    [
      { x: 7,  z: 42, w: 18, d: 7, h: 1.0, color: 0x22c55e, label: "Core 6" },
      { x: 64, z: 44, w: 20, d: 7, h: 1.2, color: 0x06b6d4, label: "Core 7" },
    ],
    [
      { x: 12, z: 62, w: 18, d: 7, h: 1.2, color: 0x3b82f6, label: "Core 8" },
      { x: 57, z: 60, w: 16, d: 7, h: 1.2, color: 0x818cf8, label: "Core 9" },
    ],
    [
      { x: 28, z: 72, w: 14, d: 6, h: 1.0, color: 0x10b981, label: "Core 10" },
      { x: 46, z: 74, w: 14, d: 6, h: 1.0, color: 0x22d3ee, label: "Core 11" },
      { x: 63, z: 73, w: 10, d: 5, h: 0.9, color: 0x6366f1, label: "Core 12" },
    ],
  ];

  // ---------- helpers ----------
  const pctX = (p) => (p / 100) * BOARD_W - BOARD_W / 2;
  const pctZ = (p) => (p / 100) * BOARD_D - BOARD_D / 2;
  const pctW = (p) => (p / 100) * BOARD_W;
  const pctD = (p) => (p / 100) * BOARD_D;

  const animate = () => {
    const t = threeRef.current;
    t.controls?.update();

    // run staged spawn animations
    const now = performance.now();
    for (const a of t.anims) {
      const k = Math.min(1, (now - a.t0) / a.dur);
      // ease
      const e = 1 - Math.pow(1 - k, 3);
      a.mesh.scale.y = THREE.MathUtils.lerp(0.01, 1, e);
      a.mesh.position.y = THREE.MathUtils.lerp(0.01, a.yTarget, e);
      if (k >= 1) t.anims.delete(a);
    }

    t.renderer?.render(t.scene, t.camera);
    t.raf = requestAnimationFrame(animate);
  };

  const resize = useCallback(() => {
    const t = threeRef.current;
    if (!t.renderer || !mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    t.size.w = rect.width;
    t.size.h = Math.max(380, Math.min(window.innerHeight * 0.7, rect.width * 0.55));
    t.renderer.setSize(t.size.w, t.size.h, false);
    t.camera.aspect = t.size.w / t.size.h;
    t.camera.updateProjectionMatrix();
  }, []);

  // ---------- init Three ----------
  useEffect(() => {
    const t = threeRef.current;

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // scene
    const scene = new THREE.Scene();

    // camera
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 1000);
    camera.position.set(24, 23, 32);

    // controls (orbit/pan/zoom)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 14;
    controls.maxDistance = 70;
    controls.maxPolarAngle = Math.PI * 0.49; // keep “above the board”
    controls.enablePan = true;

    // lights
    scene.add(new THREE.AmbientLight(0x88eedd, 0.35));
    const dir = new THREE.DirectionalLight(0x86f0ff, 0.9);
    dir.position.set(20, 30, 20);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    scene.add(dir);

    // board group (board + grid)
    const boardGroup = new THREE.Group();
    scene.add(boardGroup);

    // board body
    const boardGeo = new THREE.BoxGeometry(BOARD_W, BOARD_T, BOARD_D);
    const boardMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0b1220"), // deep slate
      roughness: 0.6,
      metalness: 0.1,
      clearcoat: 0.15,
      clearcoatRoughness: 0.7,
      emissive: new THREE.Color("#00ffb3").multiplyScalar(0.06),
    });
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    boardMesh.receiveShadow = true;
    boardGroup.add(boardMesh);

    // subtle edge glow plane
    const glowGeo = new THREE.PlaneGeometry(BOARD_W * 1.2, BOARD_D * 1.2);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#00ffb3"),
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -BOARD_T / 2 - 0.01;
    glow.scale.set(1, 1, 1);
    boardGroup.add(glow);

    // grid helper (thin)
    const grid = new THREE.GridHelper(BOARD_W * 0.98, 28, 0x12ffb3, 0x12ffb3);
    grid.material.opacity = 0.22;
    grid.material.transparent = true;
    grid.position.y = BOARD_T / 2 + 0.001;
    grid.scale.z = BOARD_D / BOARD_W; // keep squares roughly square
    boardGroup.add(grid);

    // blocks group
    const blocksGroup = new THREE.Group();
    blocksGroup.position.y = BOARD_T / 2; // sit on top of board
    scene.add(blocksGroup);

    // save refs
    t.renderer = renderer;
    t.scene = scene;
    t.camera = camera;
    t.controls = controls;
    t.boardGroup = boardGroup;
    t.blocksGroup = blocksGroup;

    // initial size
    resize();
    window.addEventListener("resize", resize);

    // start loop
    t.raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(t.raf);

      // cleanup
      controls.dispose();
      renderer.dispose();

      // dispose geometries/materials
      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose?.();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.());
          else obj.material?.dispose?.();
        }
      });

      mountRef.current?.removeChild(renderer.domElement);
      threeRef.current = {
        renderer: null,
        scene: null,
        camera: null,
        controls: null,
        boardGroup: null,
        blocksGroup: null,
        size: { w: 0, h: 0 },
        anims: new Set(),
        raf: 0,
      };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- ADD BLOCK(S) when stage increases --------
  const spawnBlock = useCallback((spec) => {
    const t = threeRef.current;
    if (!t.blocksGroup) return;

    const w = pctW(spec.w);
    const d = pctD(spec.d);
    const h = spec.h;

    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color: spec.color,
      roughness: 0.35,
      metalness: 0.15,
      emissive: new THREE.Color(spec.color).multiplyScalar(0.12),
      envMapIntensity: 0.3,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.position.set(
      pctX(spec.x + spec.w / 2),
      0.01, // will animate to h/2
      pctZ(spec.z + spec.d / 2)
    );
    mesh.scale.y = 0.01;
    t.blocksGroup.add(mesh);

    // soft label (sprite)
    const label = makeLabelSprite(spec.label);
    label.position.set(0, h / 2 + 0.02, 0);
    mesh.add(label);

    // spawn animation
    t.anims.add({ mesh, t0: performance.now(), dur: 650, yTarget: h / 2 });
  }, []);

  // simple label sprite
  const makeLabelSprite = (text) => {
    const font = 64;
    const pad = 16;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = `${font}px Inter, system-ui, -apple-system, Segoe UI, Roboto`;
    const tw = ctx.measureText(text).width;
    canvas.width = tw + pad * 2;
    canvas.height = font + pad * 2;

    // bg + text
    ctx.fillStyle = "rgba(0, 255, 180, 0.18)";
    ctx.strokeStyle = "rgba(0, 255, 180, 0.5)";
    ctx.lineWidth = 3;
    roundRect(ctx, 0.5, 0.5, canvas.width - 1, canvas.height - 1, 14);
    ctx.stroke();
    ctx.fill();

    ctx.fillStyle = "#0d1b2a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${font * 0.48}px Inter, system-ui, -apple-system, Segoe UI, Roboto`;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;

    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    const scale = 0.08; // world scale
    sprite.scale.set(canvas.width * scale / 512, canvas.height * scale / 512, 1);
    return sprite;
  };

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  const handleDraw = () => {
    if (stage >= TOTAL_STAGES) return;
    const next = stage + 1;
    setStage(next);

    // add that stage’s blocks
    const specs = STAGES[next - 1];
    for (const s of specs) spawnBlock(s);
  };

  const drawDone = stage >= TOTAL_STAGES;

  return (
    <section className="relative w-full text-white">
      {/* Back button */}
      <div className="absolute left-4 top-4 z-20">
        <button
          onClick={onBackToStep2}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md text-[12px] sm:text-[13px] font-bold border text-white bg-gradient-to-r from-emerald-600 to-sky-600 border-emerald-400/40 hover:brightness-110 shadow-[0_8px_25px_rgba(0,255,170,0.25)] active:scale-[0.98]"
        >
          Back to Step 2
        </button>
      </div>

      {/* Header */}
      <div className="w-full flex flex-col items-center justify-center pt-5">
        <div className="text-lg font-bold uppercase tracking-wide text-emerald-400 mb-2 text-center">
          STEP 3 · <span className="text-sky-400">Draw Layout (3D)</span>
        </div>
        
      </div>

      {/* FULL-WIDTH canvas wrapper */}
      <div className="w-[95vw] max-w-[1600px] mx-auto mt-6">
        <div
          ref={mountRef}
          className="w-full rounded-[14px] border border-emerald-400/30"
          style={{
            // height set dynamically in resize(); renderer matches this node
            background:
              "radial-gradient(1000px 300px at 50% 0%, rgba(16,185,129,0.18), rgba(2,6,23,0) 70%)",
            boxShadow:
              "0 0 120px rgba(16,185,129,0.25), inset 0 0 80px rgba(2,6,23,0.9)",
          }}
        />
      </div>

      {/* Controls */}
      <div className="w-[95vw] max-w-[1600px] mx-auto flex items-center gap-4 mt-5 px-2 sm:px-0">
        <button
          onClick={handleDraw}
          disabled={drawDone}
          className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-[12px] sm:text-[13px] font-bold border shadow-[0_8px_25px_rgba(0,255,170,0.25)] active:scale-[0.98] ${
            drawDone
              ? "opacity-40 cursor-not-allowed bg-slate-700 text-slate-300 border-slate-500/40"
              : "text-white bg-gradient-to-r from-emerald-600 to-sky-600 border-emerald-400/40 hover:brightness-110"
          }`}
        >
          {drawDone ? "Complete" : "Draw"}
        </button>

        <div className="text-[11px] sm:text-[12px] text-slate-400">
          Stage {stage}/{TOTAL_STAGES}
        </div>
      </div>
    </section>
  );
}
