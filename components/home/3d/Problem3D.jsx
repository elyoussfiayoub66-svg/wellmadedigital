'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Problem3D({ scrollYProgress }) {
  const groupRef = useRef();
  
  // Create disconnected pieces of an icosahedron
  const pieces = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2, 0);
    const pos = geo.attributes.position;
    const arr = [];
    for(let i=0; i<pos.count; i+=3) {
      arr.push({
        p1: new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)),
        p2: new THREE.Vector3(pos.getX(i+1), pos.getY(i+1), pos.getZ(i+1)),
        p3: new THREE.Vector3(pos.getX(i+2), pos.getY(i+2), pos.getZ(i+2)),
        dir: new THREE.Vector3(
          (pos.getX(i) + pos.getX(i+1) + pos.getX(i+2))/3,
          (pos.getY(i) + pos.getY(i+1) + pos.getY(i+2))/3,
          (pos.getZ(i) + pos.getZ(i+1) + pos.getZ(i+2))/3
        ).normalize(),
        drift: Math.random() * 2
      });
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = scrollYProgress.get ? scrollYProgress.get() : 0;
    
    // Slow rotation
    groupRef.current.rotation.y += 0.002;
    groupRef.current.rotation.x += 0.001;
    
    // Break apart based on scroll
    groupRef.current.children.forEach((mesh, i) => {
      const piece = pieces[i];
      const distance = p * piece.drift * 3; 
      mesh.position.copy(piece.dir).multiplyScalar(distance);
      mesh.rotation.x = distance * 0.5;
      mesh.rotation.y = distance * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} color="#C2496B" intensity={1} />
      {pieces.map((piece, i) => {
        const geo = new THREE.BufferGeometry();
        const vertices = new Float32Array([
          piece.p1.x, piece.p1.y, piece.p1.z,
          piece.p2.x, piece.p2.y, piece.p2.z,
          piece.p3.x, piece.p3.y, piece.p3.z,
        ]);
        geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geo.computeVertexNormals();
        return (
          <mesh key={i} geometry={geo}>
            <meshStandardMaterial color="#0E0E0F" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} wireframe={i%3===0} />
          </mesh>
        );
      })}
    </group>
  );
}
