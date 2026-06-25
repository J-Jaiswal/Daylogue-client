import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   Three.js WebGL background — abstract floating orb field
   - ~80 soft glowing spheres at varying depths, sizes, speeds
   - Three colour clusters matching the app pillars:
       Purple  (#7F77DD)  → Sleep
       Teal    (#1D9E75)  → Nutrition
       Amber   (#EF9F27)  → Exercise
   - Each sphere pulses in opacity and drifts very slowly
   - Mouse parallax tilts the entire field slightly
   ───────────────────────────────────────────────────────────── */

const THEME_COLORS = {
  dark: [
    { h: 0.69, s: 0.55, l: 0.62 }, // purple
    { h: 0.69, s: 0.55, l: 0.62 },
    { h: 0.69, s: 0.55, l: 0.62 },
    { h: 0.45, s: 0.60, l: 0.40 }, // teal
    { h: 0.45, s: 0.60, l: 0.40 },
    { h: 0.10, s: 0.85, l: 0.55 }, // amber
  ],
  light: [
    { h: 0.69, s: 0.50, l: 0.65 },
    { h: 0.69, s: 0.50, l: 0.65 },
    { h: 0.69, s: 0.50, l: 0.65 },
    { h: 0.45, s: 0.55, l: 0.45 },
    { h: 0.45, s: 0.55, l: 0.45 },
    { h: 0.10, s: 0.80, l: 0.55 },
  ],
};

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer ────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // ── Scene & camera ───────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      el.clientWidth / el.clientHeight,
      0.1,
      200
    );
    camera.position.z = 30;

    // ── Shared glow shader material ──────────────────────
    // Soft additive spheres using a custom vertex+fragment shader
    const glowVert = `
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `;

    const glowFrag = `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        float rim = 1.0 - max(dot(normalize(vViewPos), vNormal), 0.0);
        rim = pow(rim, 2.5);
        gl_FragColor = vec4(uColor, rim * uOpacity);
      }
    `;

    // ── Build orb field ──────────────────────────────────
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const palette = isLight ? THEME_COLORS.light : THEME_COLORS.dark;

    const ORB_COUNT = 70;
    const orbs = [];

    const geo = new THREE.SphereGeometry(1, 16, 16);

    for (let i = 0; i < ORB_COUNT; i++) {
      const pick = randomFrom(palette);
      const color = new THREE.Color().setHSL(pick.h, pick.s, pick.l);

      const mat = new THREE.ShaderMaterial({
        vertexShader: glowVert,
        fragmentShader: glowFrag,
        uniforms: {
          uColor: { value: color },
          uOpacity: { value: 0.0 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide,
      });

      const mesh = new THREE.Mesh(geo, mat);

      const radius = 2 + Math.random() * 4; // orb size
      mesh.scale.setScalar(radius);

      // Spread across a wide volume
      mesh.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40 - 10
      );

      // Per-orb motion params
      const orbData = {
        mesh,
        mat,
        baseY: mesh.position.y,
        baseX: mesh.position.x,
        driftSpeedX: (Math.random() - 0.5) * 0.0015,
        driftSpeedY: (Math.random() - 0.5) * 0.001 + 0.0005,
        pulseSpeed: 0.3 + Math.random() * 0.5,
        pulseOffset: Math.random() * Math.PI * 2,
        baseOpacity: 0.15 + Math.random() * 0.35,
        rotX: (Math.random() - 0.5) * 0.001,
        rotZ: (Math.random() - 0.5) * 0.001,
      };

      scene.add(mesh);
      orbs.push(orbData);
    }

    // ── Mouse parallax ───────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ── Resize handler ───────────────────────────────────
    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ───────────────────────────────────
    let frameId;
    let t = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.016;

      // Smooth parallax
      targetRotY += (mouseX * 0.08 - targetRotY) * 0.04;
      targetRotX += (-mouseY * 0.05 - targetRotX) * 0.04;
      scene.rotation.y = targetRotY;
      scene.rotation.x = targetRotX;

      orbs.forEach((o) => {
        // Pulse opacity
        o.mat.uniforms.uOpacity.value =
          o.baseOpacity * (0.6 + 0.4 * Math.sin(t * o.pulseSpeed + o.pulseOffset));

        // Slow drift
        o.mesh.position.y = o.baseY + Math.sin(t * 0.2 + o.pulseOffset) * 3;
        o.mesh.position.x = o.baseX + Math.cos(t * 0.15 + o.pulseOffset) * 2;

        // Slow self-rotation for visual interest
        o.mesh.rotation.x += o.rotX;
        o.mesh.rotation.z += o.rotZ;
      });

      renderer.render(scene, camera);
    };

    animate();

    // ── Cleanup ──────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      orbs.forEach((o) => {
        o.mat.dispose();
      });
      geo.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
