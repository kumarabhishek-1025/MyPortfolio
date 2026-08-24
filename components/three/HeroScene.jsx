"use client";
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Icosahedron, Sparkles, Html, Float, Stars } from '@react-three/drei';
import { useRef, useMemo, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { isWebGLAvailable } from '@/lib/webgl';

const ACCENT = '#22d3ee';
const VIOLET = '#a855f7';
const C_ACCENT = new THREE.Color(ACCENT);
const C_VIOLET = new THREE.Color(VIOLET);

function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(140,225,255,0.55)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const FRESNEL_VERT = `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRESNEL_FRAG = `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - abs(dot(vNormal, vView)), uPower);
    gl_FragColor = vec4(uColor * f * uIntensity, f);
  }
`;

function NeuralCore() {
  const followRef = useRef();
  const meshRef = useRef();
  const wireRef = useRef();
  const outerRef = useRef();
  const nucleusMatRef = useRef();
  const fresnelMatRef = useRef();

  const fresnelUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(ACCENT) },
      uPower: { value: 2.4 },
      uIntensity: { value: 1.15 },
    }),
    []
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const { x: px, y: py } = state.pointer;

    // MOUSE-DRIVEN GLOBE: core tilts toward the cursor
    if (followRef.current) {
      followRef.current.rotation.y = THREE.MathUtils.damp(followRef.current.rotation.y, px * 0.85, 3.2, delta);
      followRef.current.rotation.x = THREE.MathUtils.damp(followRef.current.rotation.x, -py * 0.55, 3.2, delta);
    }

    // proximity: how close the cursor is to the globe (0..1)
    const near = Math.max(0, 1 - Math.hypot(px, py) / 1.1);

    if (meshRef.current) {
      meshRef.current.rotation.x += delta * (0.15 + near * 0.5);
      meshRef.current.rotation.y += delta * (0.2 + near * 0.65);
    }
    if (wireRef.current) {
      wireRef.current.rotation.x -= delta * 0.1;
      wireRef.current.rotation.y -= delta * 0.12;
      wireRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.03 + near * 0.02);
    }
    if (outerRef.current) {
      outerRef.current.rotation.y += delta * 0.06;
      outerRef.current.rotation.z -= delta * 0.04;
    }
    if (nucleusMatRef.current) {
      nucleusMatRef.current.emissiveIntensity = 1.6 + Math.sin(t * 1.8) * 0.25 + near * 1.4;
    }

    // fresnel: hue drifts cyan -> violet, flares up when cursor approaches
    if (fresnelMatRef.current) {
      const hueMix = (Math.sin(t * 0.45) + 1) * 0.18;
      fresnelUniforms.uColor.value.copy(C_ACCENT).lerp(C_VIOLET, hueMix);
      fresnelMatRef.current.uniforms.uIntensity.value =
        1.0 + Math.sin(t * 1.2) * 0.22 + near * 0.9;
    }
  });

  return (
    <group ref={followRef}>
      {/* glowing nucleus */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          ref={nucleusMatRef}
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={1.6}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* inner rotating body */}
      <Icosahedron ref={meshRef} args={[1.2, 1]}>
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.35}
          roughness={0.25}
          metalness={0.85}
          transparent
          opacity={0.16}
        />
      </Icosahedron>

      {/* wireframe shell */}
      <Icosahedron ref={wireRef} args={[1.4, 2]}>
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.5} />
      </Icosahedron>

      {/* outer violet cage */}
      <Icosahedron ref={outerRef} args={[1.95, 1]}>
        <meshBasicMaterial color={VIOLET} wireframe transparent opacity={0.16} />
      </Icosahedron>

      {/* fresnel energy shield */}
      <mesh>
        <icosahedronGeometry args={[1.78, 4]} />
        <shaderMaterial
          ref={fresnelMatRef}
          vertexShader={FRESNEL_VERT}
          fragmentShader={FRESNEL_FRAG}
          uniforms={fresnelUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* soft halo */}
      <mesh scale={1.55}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color={ACCENT}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

const ORBITS = [
  {
    radius: 2.45,
    tilt: 0.4,
    speed: 0.4,
    ringOpacity: 0.26,
    linkOpacity: 0.22,
    items: [
      { label: 'Machine Learning', color: ACCENT },
      { label: 'Generative AI', color: VIOLET },
      { label: 'Computer Vision', color: ACCENT },
      { label: 'NLP', color: VIOLET },
    ],
  },
  {
    radius: 2.95,
    tilt: 0.8,
    speed: 0.3,
    ringOpacity: 0.2,
    linkOpacity: 0.18,
    items: [
      { label: 'Full-Stack Dev', color: VIOLET },
      { label: 'React', color: ACCENT },
      { label: 'Next.js', color: VIOLET },
      { label: 'Python', color: ACCENT },
      { label: 'C++', color: VIOLET },
    ],
  },
  {
    radius: 3.4,
    tilt: 1.15,
    speed: 0.22,
    ringOpacity: 0.16,
    linkOpacity: 0.14,
    items: [
      { label: 'API Design', color: ACCENT },
      { label: 'LeetCode · 1100+', color: VIOLET },
      { label: 'Research Intern', color: ACCENT },
      { label: 'IIT Bombay Certified', color: VIOLET },
      { label: 'Robotics', color: ACCENT },
    ],
  },
];

function Satellite({ item, env }) {
  const glowTex = useMemo(makeGlowTexture, []);
  const labelRef = useRef();

  useFrame(() => {
    if (labelRef.current) {
      labelRef.current.style.opacity = String(env.scrollFade);
    }
  });

  return (
    <group>
      <sprite scale={[0.85, 0.85, 1]}>
        <spriteMaterial
          map={glowTex}
          color={item.color}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <mesh>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={item.color} emissive={item.color} emissiveIntensity={2} />
      </mesh>
      <Html distanceFactor={8} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
        <div
          ref={labelRef}
          className="px-2 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider whitespace-nowrap glass border"
          style={{ color: item.color, borderColor: item.color + '55', opacity: env.scrollFade }}
        >
          {item.label}
        </div>
      </Html>
    </group>
  );
}

function OrbitSystem({ orbit, ringColor, oi, env }) {
  const N = orbit.items.length;
  const satsRef = useRef([]);
  const lineRef = useRef();

  const lineArray = useMemo(() => new Float32Array(N * 2 * 3), [N]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pts = [];
    for (let i = 0; i < N; i++) {
      const tt = t * orbit.speed + (i / N) * Math.PI * 2;
      const x = Math.cos(tt) * orbit.radius;
      const y = Math.sin(tt * 2) * 0.06;
      const z = Math.sin(tt) * orbit.radius;
      const g = satsRef.current[i];
      if (g) g.position.set(x, y, z);
      pts.push(x, y, z);
    }
    if (lineRef.current) {
      const arr = lineArray;
      for (let i = 0; i < N; i++) {
        const a = i * 3;
        const b = ((i + 1) % N) * 3;
        const o = i * 6;
        arr[o] = pts[a];
        arr[o + 1] = pts[a + 1];
        arr[o + 2] = pts[a + 2];
        arr[o + 3] = pts[b];
        arr[o + 4] = pts[b + 1];
        arr[o + 5] = pts[b + 2];
      }
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group rotation={[orbit.tilt * 0.55, oi * 0.9, orbit.tilt * 0.35]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[orbit.radius, 0.007, 8, 200]} />
        <meshBasicMaterial color={ringColor} transparent opacity={orbit.ringOpacity} />
      </mesh>

      <lineSegments ref={lineRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lineArray, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={ringColor}
          transparent
          opacity={orbit.linkOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {orbit.items.map((item, ii) => (
        <group key={item.label} ref={(el) => (satsRef.current[ii] = el)}>
          <Satellite item={item} env={env} />
        </group>
      ))}
    </group>
  );
}

/* Expanding sonar-style pulse rings radiating out of the core */
function PulseRings({ env }) {
  const RINGS = 3;
  const CYCLE = 4.2;
  const refs = useRef([]);
  const matsRef = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < RINGS; i++) {
      const mesh = refs.current[i];
      const mat = matsRef.current[i];
      if (!mesh || !mat) continue;
      const p = (t / CYCLE + i / RINGS) % 1;
      mesh.scale.setScalar(2.0 + p * 4.2);
      mat.opacity = (1 - p) * (1 - p) * 0.3 * env.scrollFade;
    }
  });

  return (
    <group>
      {Array.from({ length: RINGS }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          rotation={[Math.PI / 2.35, i * 0.55, 0]}
          userData={{ keepOpaque: true }}
        >
          <torusGeometry args={[1, 0.01, 8, 160]} />
          <meshBasicMaterial
            ref={(el) => (matsRef.current[i] = el)}
            color={i % 2 === 0 ? ACCENT : VIOLET}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* Large slow-precessing aurora halo behind the whole system */
function AuroraRing() {
  const a = useRef();
  const b = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (a.current) {
      a.current.rotation.z = t * 0.12;
      a.current.rotation.x = Math.PI / 2.6 + Math.sin(t * 0.18) * 0.12;
    }
    if (b.current) {
      b.current.rotation.z = -t * 0.09;
      b.current.rotation.x = Math.PI / 2.1 + Math.cos(t * 0.14) * 0.1;
    }
  });
  return (
    <group>
      <mesh ref={a} rotation={[Math.PI / 2.6, 0, 0]}>
        <torusGeometry args={[4.6, 0.03, 8, 220]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={b} rotation={[Math.PI / 2.1, 0.6, 0]}>
        <torusGeometry args={[5.2, 0.02, 8, 220]} />
        <meshBasicMaterial color={VIOLET} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Comet({ color = ACCENT, cycle = 11, activeDur = 4.6, offset = 0, dir = 1, env }) {
  const TRAIL = 42;
  const glowTex = useMemo(makeGlowTexture, []);
  const headRef = useRef();
  const trail = useRef(Array.from({ length: TRAIL }, () => new THREE.Vector3(0, 0, -20)));

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [color]
  );
  const lineObj = useMemo(() => {
    const l = new THREE.Line(geom, mat);
    l.frustumCulled = false;
    l.userData.keepOpaque = true;
    return l;
  }, [geom, mat]);

  useFrame((state) => {
    const t = (state.clock.elapsedTime + offset) % cycle;
    const active = t <= activeDur;
    const p = active ? t / activeDur : 0;
    const ease = p * p * (3 - 2 * p);
    const envelope = Math.sin(Math.min(1, p) * Math.PI);

    const x0 = dir === 1 ? -13 : 13;
    const x1 = dir === 1 ? 13 : -13;
    const pos = new THREE.Vector3(
      THREE.MathUtils.lerp(x0, x1, ease),
      THREE.MathUtils.lerp(-2.4, 3.0, ease),
      THREE.MathUtils.lerp(-11, -7, ease)
    );

    lineObj.visible = active;
    mat.opacity = 0.4 * envelope * env.scrollFade;

    if (headRef.current) {
      headRef.current.visible = active;
      headRef.current.position.copy(pos);
      headRef.current.material.opacity = envelope * env.scrollFade;
    }

    if (active) {
      const arr = trail.current;
      arr.pop();
      arr.unshift(pos.clone());
      const ta = geom.attributes.position.array;
      for (let i = 0; i < TRAIL; i++) {
        ta[i * 3] = arr[i].x;
        ta[i * 3 + 1] = arr[i].y;
        ta[i * 3 + 2] = arr[i].z;
      }
      geom.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      <primitive object={lineObj} />
      <sprite ref={headRef} scale={[1.1, 1.1, 1]} userData={{ keepOpaque: true }}>
        <spriteMaterial
          map={glowTex}
          color={color}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </>
  );
}

function ParallaxRig({ children, env }) {
  const ref = useRef();
  const { size } = useThree();
  const wide = size.width >= 1024;
  const scrollY = useRef(0);
  const prevPointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => {
      scrollY.current = window.scrollY;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const baseX = wide ? 3.05 : 0;
    const baseScale = wide ? 1 : 0.68;

    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const p = Math.min(1, scrollY.current / (vh * 0.85));
    const eased = p * p * (3 - 2 * p);
    const scrollLift = eased * 2.6;
    env.scrollFade = 1 - eased;

    const { x: px, y: py } = state.pointer;

    // pointer velocity -> inertial "swing" whip
    const vx = px - prevPointer.current.x;
    const vy = py - prevPointer.current.y;
    prevPointer.current = { x: px, y: py };
    const whipX = THREE.MathUtils.clamp(vx * 4, -0.55, 0.55);
    const whipY = THREE.MathUtils.clamp(vy * 3, -0.4, 0.4);

    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, baseX + px * 0.42, 2.5, delta);
    ref.current.position.y = THREE.MathUtils.damp(
      ref.current.position.y,
      py * 0.26 + scrollLift,
      2.5,
      delta
    );
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, px * 0.3 + whipX, 2.5, delta);
    ref.current.rotation.x = THREE.MathUtils.damp(
      ref.current.rotation.x,
      -py * 0.2 - eased * 0.35 + whipY,
      2.5,
      delta
    );
    ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x, baseScale, 2.5, delta));

    ref.current.traverse((obj) => {
      if (obj.material && 'opacity' in obj.material && !obj.userData.keepOpaque) {
        if (!obj.userData.baseOpacitySet) {
          obj.userData.baseOpacity = obj.material.opacity;
          obj.userData.baseOpacitySet = true;
        }
        obj.material.opacity = obj.userData.baseOpacity * env.scrollFade;
      }
    });
  });

  return <group ref={ref}>{children}</group>;
}

export default function HeroScene() {
  const env = useMemo(() => ({ scrollFade: 1 }), []);

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
      camera={{ position: [0, 0.2, 7.6], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(window.devicePixelRatio);
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color={ACCENT} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color={VIOLET} />

        <Stars radius={70} depth={45} count={1400} factor={3.2} saturation={0.35} fade speed={0.5} />

        <Comet color={ACCENT} cycle={11} activeDur={4.6} offset={0} dir={1} env={env} />
        <Comet color={VIOLET} cycle={17} activeDur={5.4} offset={6} dir={-1} env={env} />

        <ParallaxRig env={env}>
          <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.35}>
            <NeuralCore />
          </Float>

          <PulseRings env={env} />

          {ORBITS.map((orbit, oi) => (
            <OrbitSystem key={oi} orbit={orbit} ringColor={oi % 2 === 0 ? ACCENT : VIOLET} oi={oi} env={env} />
          ))}

          <Sparkles count={90} scale={10} size={2} speed={0.28} color={ACCENT} opacity={0.55} />
          <Sparkles count={50} scale={12} size={3.5} speed={0.2} color={VIOLET} opacity={0.4} />
        </ParallaxRig>

        <AuroraRing />
      </Suspense>
    </Canvas>
  );
}
