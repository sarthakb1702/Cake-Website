"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Float, Environment } from "@react-three/drei";
import * as THREE from "three";

// 3D Cake Mesh Loader
function CakeModel({ isMobile }: { isMobile: boolean }) {
  // Make sure your 3d file is placed at public/models/cake.glb
  const { scene } = useGLTF("/models/cake.glb");
  const cakeRef = useRef<THREE.Group>(null);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame(() => {
    if (cakeRef.current) {
      // Rotate cake horizontally (Y-axis) based on scroll position
      cakeRef.current.rotation.y = scrollYRef.current * 0.0025;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <primitive
        ref={cakeRef}
        object={scene}
        scale={isMobile ? 1.2 : 2.2}
        position={isMobile ? [0, -0.2, 0] : [0, -0.5, 0]}
      />
    </Float>
  );
}

// Fixed 3D Canvas Background
export default function ThreeDBackgroundCake() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-25 md:opacity-30 overflow-hidden w-full h-full">
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} />
        <pointLight position={[-5, -2, -2]} intensity={0.5} />
        <CakeModel isMobile={isMobile} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

// Preload the 3D asset for faster initial rendering
useGLTF.preload("/models/cake.glb");