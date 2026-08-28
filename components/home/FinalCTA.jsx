'use client';
import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Final3D from './3d/Final3D';

export default function FinalCTA() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative py-40 bg-[#0E0E0F] text-[#F7F5F0] min-h-[100vh] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Subtle abstract W line */}
      <div className="absolute inset-0 pointer-events-none opacity-50 z-0">
        {mounted && (
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10] }}>
            <Suspense fallback={null}>
              <Final3D />
            </Suspense>
          </Canvas>
        )}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-6xl md:text-[8rem] font-medium tracking-tighter leading-[1.0] mb-8">
          LET'S MAKE <br/> SOMETHING <br/> WELL MADE.
        </h2>
        <p className="text-xl md:text-2xl text-[#F7F5F0]/60 max-w-2xl mx-auto font-light mb-16">
          Have a project in mind? Let's talk about what you're building.
        </p>
        <a href="/book" className="inline-block border border-[#C2496B] text-[#F7F5F0] px-12 py-6 text-sm uppercase tracking-widest font-bold hover:bg-[#C2496B] transition-colors">
          Start a Project &rarr;
        </a>
      </div>
    </section>
  );
}
