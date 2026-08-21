'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState, Suspense } from 'react';
import * as THREE from 'three';

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
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#67e8f9" />
      </mesh>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function GuidePath() {
  const scrollRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = h > 0 ? window.scrollY / h : 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-70">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <PathTube scrollProgress={scrollRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
