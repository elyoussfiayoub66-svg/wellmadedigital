'use client';
import { useState, useEffect, Suspense } from 'react';
import { useScroll } from 'framer-motion';
import { Canvas } from '@react-three/fiber';

import Navbar from '@/components/home/Navbar';
import WellmadeMachine from '@/components/home/3d/WellmadeMachine';
import MasterTimeline from '@/components/home/MasterTimeline';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0]">
      
      {/* 
        THE MACHINE: Global Fixed WebGL Canvas 
        This is the single evolving digital ecosystem described in the brief.
      */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {mounted && (
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 20], fov: 45 }}>
            <Suspense fallback={null}>
              <WellmadeMachine scrollProgress={scrollYProgress} />
            </Suspense>
          </Canvas>
        )}
      </div>

      <Navbar />
      
      {/* 
        THE STORY: Cinematic scroll-linked timeline overlay
      */}
      <div className="relative z-10 pointer-events-none">
        <MasterTimeline />
      </div>

    </main>
  );
}
