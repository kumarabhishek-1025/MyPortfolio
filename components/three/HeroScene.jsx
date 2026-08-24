"use client";
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Icosahedron, Sparkles, Html, Float } from '@react-three/drei';
import { useRef, useState, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { isWebGLAvailable } from '@/lib/webgl';

function NeuralCore() {
  const meshRef = useRef();
  const wireRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
    }
    if (wireRef.current) {
      wireRef.current.rotation.x -= delta * 0.1;
      wireRef.current.rotation.y -= delta * 0.12;
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
      wireRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <Icosahedron ref={meshRef} args={[1.2, 1]}>
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.8}
          transparent
          opacity={0.15}
        />
      </Icosahedron>
      <Icosahedron ref={wireRef} args={[1.4, 2]}>
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.55} />
      </Icosahedron>
      <Icosahedron args={[1.9, 1]}>
        <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.2} />
      </Icosahedron>
    </group>
  );
}

const ORBITS = [
  {
    radius: 2.75,
    tilt: 0.4,
    speed: 0.4,
    items: [
      { label: 'Machine Learning', color: '#22d3ee' },
      { label: 'Generative AI', color: '#a855f7' },
      { label: 'Computer Vision', color: '#22d3ee' },
      { label: 'NLP', color: '#a855f7' },
    ],
  },
  {
    radius: 3.3,
    tilt: 0.8,
    speed: 0.3,
    items: [
      { label: 'Full-Stack Dev', color: '#a855f7' },
      { label: 'React', color: '#22d3ee' },
      { label: 'Next.js', color: '#a855f7' },
      { label: 'Python', color: '#22d3ee' },
      { label: 'C++', color: '#a855f7' },
    ],
  },
  {
    radius: 3.85,
    tilt: 1.15,
    speed: 0.22,
    items: [
      { label: 'API Design', color: '#22d3ee' },
      { label: 'LeetCode · 1100+', color: '#a855f7' },
      { label: 'Research Intern', color: '#22d3ee' },
      { label: 'IIT Bombay Certified', color: '#a855f7' },
      { label: 'Robotics', color: '#22d3ee' },
    ],
  },
];

function Satellite({ radius, tilt, phase, label, color = '#22d3ee', speed = 1 }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed + phase;
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = Math.sin(t * 0.5) * tilt;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <Html distanceFactor={8} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
        <div className="px-2 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider whitespace-nowrap glass border" style={{ color, borderColor: color + '55' }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

export default function HeroScene() {
  const sceneOffset = 2.4;
  
  // Check if WebGL is available
  if (typeof window !== 'undefined' && !isWebGLAvailable()) {
    return (
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-muted-foreground text-sm">
          WebGL not available - 3D content disabled
        </div>
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [-1.2, 0.15, 6.2], fov: 52 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(window.devicePixelRatio);
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#22d3ee" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />

        <group position={[sceneOffset, 0, 0]}>
          <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
            <NeuralCore />
          </Float>

          {ORBITS.map((orbit, oi) =>
            orbit.items.map(({ label, color }, ii) => (
              <Satellite
                key={label}
                radius={orbit.radius}
                tilt={orbit.tilt}
                speed={orbit.speed}
                phase={(ii / orbit.items.length) * Math.PI * 2}
                label={label}
                color={color}
              />
            ))
          )}

          <Sparkles count={80} scale={12} size={2} speed={0.3} color="#22d3ee" opacity={0.6} />
        </group>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          target={[sceneOffset - 0.9, 0, 0]}
        />
      </Suspense>
    </Canvas>
  );
}
