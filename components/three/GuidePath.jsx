"use client";
import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState, Suspense } from 'react';
import * as THREE from 'three';
import { isWebGLAvailable } from '@/lib/webgl';


function PathTube({ scrollProgress }) {
  const tubeRef = useRef();
  const pulseRef = useRef();

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2, 5, 0),
    new THREE.Vector3(2, 3, -1),
    new THREE.Vector3(-1.5, 1, 0.5),
    new THREE.Vector3(1.8, -1, -0.5),
    new THREE.Vector3(-2, -3, 0.5),
    new THREE.Vector3(1.5, -5, 0),
    new THREE.Vector3(-1, -7, -0.5),
    new THREE.Vector3(0, -9, 0),
  ]);
  const geometry = new THREE.TubeGeometry(curve, 200, 0.03, 8, false);

  useFrame(() => {
    if (pulseRef.current) {
      const p = Math.max(0, Math.min(1, scrollProgress.current));
      const pt = curve.getPointAt(p);
      pulseRef.current.position.copy(pt);
    }
  });

  return (
    <group>
      <mesh ref={tubeRef} geometry={geometry}>
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.35} />
      </mesh>
      <group ref={pulseRef}>
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#67e8f9" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.35} />
        </mesh>
      </group>
    </group>
  );
}

export default function GuidePath() {
  const scrollRef = useRef(0);
  
  // Check if WebGL is available
  if (typeof window !== 'undefined' && !isWebGLAvailable()) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(window.devicePixelRatio);
        }}
      >
        <Suspense fallback={null}>
          <PathTube scrollProgress={scrollRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
