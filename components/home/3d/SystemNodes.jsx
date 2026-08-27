'use client';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function SystemNodes({ scrollProgress }) {
  const groupRef = useRef();
  const linesRef = useRef();
  const { mouse } = useThree();
  const nodeCount = 50;

  const nodes = useMemo(() => {
    return Array.from({ length: nodeCount }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      )
    }));
  }, []);

  const lineGeometry = useMemo(() => new THREE.BufferGeometry(), []);

  useFrame(() => {
    if (!groupRef.current) return;
    
    groupRef.current.rotation.y += 0.002;
    groupRef.current.rotation.x += 0.001;

    // Update nodes
    const positions = new Float32Array(nodeCount * nodeCount * 3);
    let lineIdx = 0;

    nodes.forEach((node, i) => {
      // Basic movement
      node.position.add(node.velocity);
      if (node.position.length() > 6) node.velocity.multiplyScalar(-1);

      // Connect nodes if close enough and scroll progress is high
      nodes.forEach((otherNode, j) => {
        if (i < j) {
          const dist = node.position.distanceTo(otherNode.position);
          // Scroll progress tightens the connection threshold (forms the system)
          const threshold = 2 + (scrollProgress * 4); 
          if (dist < threshold) {
            positions[lineIdx++] = node.position.x;
            positions[lineIdx++] = node.position.y;
            positions[lineIdx++] = node.position.z;
            positions[lineIdx++] = otherNode.position.x;
            positions[lineIdx++] = otherNode.position.y;
            positions[lineIdx++] = otherNode.position.z;
          }
        }
      });
    });

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions.slice(0, lineIdx), 3));
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nodeCount}
            array={new Float32Array(nodes.flatMap(n => [n.position.x, n.position.y, n.position.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.1} color="#C2496B" />
      </points>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#C8A464" transparent opacity={0.15} />
      </lineSegments>
    </group>
  );
}
