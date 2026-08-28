'use client';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function TiltCard({ title, image }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full aspect-[4/5] rounded-xl overflow-hidden cursor-pointer group"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
        style={{ backgroundImage: `url(${image})` }}
      />
      {/* Deep dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0F] via-[#0E0E0F]/40 to-transparent" />
      
      <div 
        style={{ transform: "translateZ(50px)" }}
        className="absolute bottom-8 left-8 right-8"
      >
        <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-[#F7F5F0] mb-2">{title}</h3>
        <div className="w-0 h-[1px] bg-[#C2496B] group-hover:w-12 transition-all duration-500 ease-out"></div>
      </div>
    </motion.div>
  );
}
