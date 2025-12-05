import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ShapeType } from '../types';
import { generateParticles } from '../utils/geometry';

interface ParticlesProps {
  shape: ShapeType;
  color: string;
  handInfluence: number; // 1.0 is default, higher is expanded
  isHandsDetected: boolean;
}

const Particles: React.FC<ParticlesProps> = ({ shape, color, handInfluence, isHandsDetected }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  // Target positions for the selected shape
  const targetPositions = useMemo(() => generateParticles(shape), [shape]);
  
  // Current positions buffer (mutable)
  const currentPositions = useMemo(() => new Float32Array(targetPositions.length), [targetPositions.length]);

  // Initialize current positions randomly on mount
  useEffect(() => {
    for (let i = 0; i < currentPositions.length; i++) {
        currentPositions[i] = (Math.random() - 0.5) * 10;
    }
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const positionsAttribute = meshRef.current.geometry.attributes.position;
    const array = positionsAttribute.array as Float32Array;
    
    // Smooth factor (responsiveness)
    const lerpFactor = 3.0 * delta; // Adjust speed of morphing
    
    // Hand interaction smoothing
    // We store a smoothed influence to avoid jitter
    const targetScale = isHandsDetected ? handInfluence : 1.0 + Math.sin(state.clock.elapsedTime) * 0.1; // Idle breathing if no hands
    
    for (let i = 0; i < targetPositions.length; i += 3) {
      const tx = targetPositions[i];
      const ty = targetPositions[i+1];
      const tz = targetPositions[i+2];

      // Apply Scale/Expansion based on hands
      const scale = targetScale; 
      
      // Calculate target with scale applied
      const destX = tx * scale;
      const destY = ty * scale;
      const destZ = tz * scale;

      // Current pos
      const cx = array[i];
      const cy = array[i+1];
      const cz = array[i+2];

      // Interpolate
      array[i] += (destX - cx) * lerpFactor;
      array[i+1] += (destY - cy) * lerpFactor;
      array[i+2] += (destZ - cz) * lerpFactor;
    }

    positionsAttribute.needsUpdate = true;
    
    // Rotate entire system slowly for better 3D effect
    meshRef.current.rotation.y += delta * 0.1;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={currentPositions.length / 3}
          array={currentPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
};

export default Particles;
