'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Icosahedron, Sparkles, Html, Float } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

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

function Satellite({ position, label, color = '#22d3ee', speed = 1 }) {
  const ref = useRef();
  const orbitRadius = position[0];
  const orbitTilt = position[1];
  const phase = position[2];

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed + phase;
      ref.current.position.x = Math.cos(t) * orbitRadius;
      ref.current.position.z = Math.sin(t) * orbitRadius;
      ref.current.position.y = Math.sin(t * 0.5) * orbitTilt;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <Html distanceFactor={8} center>
        <div className="px-2 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider whitespace-nowrap glass border" style={{ color, borderColor: color + '55' }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#22d3ee" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />

        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
          <NeuralCore />
        </Float>

        <Satellite position={[3.2, 0.6, 0]} label="AI / ML" color="#22d3ee" speed={0.35} />
        <Satellite position={[3.2, 0.6, 1.5]} label="Full-Stack" color="#a855f7" speed={0.35} />
        <Satellite position={[3.2, 0.6, 3]} label="Robotics" color="#22d3ee" speed={0.35} />
        <Satellite position={[3.2, 0.6, 4.5]} label="CP · 1050+" color="#a855f7" speed={0.35} />

        <Sparkles count={80} scale={12} size={2} speed={0.3} color="#22d3ee" opacity={0.6} />

        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
      </Suspense>
    </Canvas>
  );
}
