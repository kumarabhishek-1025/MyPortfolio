"use client";
import dynamic from 'next/dynamic';
const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false, loading: () => null });
const GuidePath = dynamic(() => import('./GuidePath'), { ssr: false, loading: () => null });
export default function ThreeWrapper() {
  return (
    <>
      <HeroScene />
      <GuidePath />
    </>
  );
}
