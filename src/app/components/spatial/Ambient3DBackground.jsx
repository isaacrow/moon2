import React, { useState, useEffect, useRef } from 'react';
import { ARTIFACT_RECORDS } from './data/records';

export default function Ambient3DBackground() {
  const [bgIndex, setBgIndex] = useState(() => Math.floor(Math.random() * ARTIFACT_RECORDS.length));
  const viewerRef = useRef(null);
  const rafRef = useRef(null);
  const targetOrbitRef = useRef({ theta: 35, phi: 75 });
  const currentOrbitRef = useRef({ theta: 35, phi: 75 });

  // Rotate background model very slowly every 50 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % ARTIFACT_RECORDS.length);
    }, 50000);
    return () => clearInterval(timer);
  }, []);

  // Global mouse tracking: much slower, stately, majestic drift
  useEffect(() => {
    // Glacial LERP interpolation loop (0.008 factor = ultra slow).
    // The loop sleeps once the camera has settled so the GPU is idle when the mouse is still.
    const animate = () => {
      const cur = currentOrbitRef.current;
      const tgt = targetOrbitRef.current;
      const dTheta = tgt.theta - cur.theta;
      const dPhi = tgt.phi - cur.phi;
      cur.theta += dTheta * 0.008;
      cur.phi += dPhi * 0.008;

      if (viewerRef.current) {
        viewerRef.current.cameraOrbit = `${cur.theta.toFixed(2)}deg ${cur.phi.toFixed(2)}deg auto`;
      }

      if (Math.abs(dTheta) > 0.05 || Math.abs(dPhi) > 0.05) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
      }
    };

    const handleMouseMove = (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1

      // Subtle, very slow deviation
      targetOrbitRef.current = {
        theta: 35 + nx * 14,
        phi: Math.max(60, Math.min(90, 75 + ny * 8))
      };
      if (!rafRef.current) rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  const bgArtifact = ARTIFACT_RECORDS[bgIndex] || ARTIFACT_RECORDS[0];

  return (
    <div 
      className="fixed inset-y-0 left-0 w-full md:w-[60vw] pointer-events-none z-0 overflow-hidden select-none flex items-center justify-start"
      aria-hidden="true"
    >
      {/* Deep ambient dark glow */}
      <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-[700px] h-[900px] rounded-full bg-white/[0.015] blur-[180px] pointer-events-none" />

      {/* Dense, Subtle Ambient 3D Silhouette */}
      <div className="relative w-full h-[100vh] max-w-[950px] -left-12 sm:-left-16 opacity-[0.45] filter blur-[1px] brightness-110 contrast-115 scale-100 lg:scale-110 transition-opacity duration-1000">
        <model-viewer
          key={bgArtifact.id}
          ref={viewerRef}
          src={bgArtifact.model.glb}
          alt="Ambient Background 3D"
          camera-target="auto auto auto"
          bounds="tight"
          loading="eager"
          reveal="auto"
          draco-decoder-location="./draco/"
          exposure="1.2"
          shadow-intensity="1.2"
          interaction-prompt="none"
          auto-rotate
          rotation-per-second="1.5deg"
          camera-orbit="35deg 75deg auto"
          className="w-full h-full block" style={{ width: "100%", height: "100%", minHeight: "100vh", display: "block", direction: "ltr" }}
        >
          <div slot="progress-bar" style={{ display: 'none' }}></div>
        </model-viewer>
      </div>
    </div>
  );
}
