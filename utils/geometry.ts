import { Point3D, ShapeType } from '../types';
import * as THREE from 'three';

const PARTICLE_COUNT = 4000;

// Helper to get random point on sphere
function randomOnSphere(radius: number): Point3D {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.sin(phi) * Math.sin(theta),
    z: radius * Math.cos(phi)
  };
}

export const generateParticles = (shape: ShapeType): Float32Array => {
  const positions = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let p: Point3D = { x: 0, y: 0, z: 0 };
    const idx = i * 3;

    switch (shape) {
      case ShapeType.HEART:
        // Parametric Heart
        const t = Math.random() * Math.PI * 2;
        const h_u = Math.random(); 
        // Spread points inside volume slightly
        const scaleH = 15 * (0.8 + 0.2 * Math.random());
        // Heart formula
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        p = { x: x * 0.2, y: y * 0.2, z: (Math.random() - 0.5) * 2 };
        break;

      case ShapeType.FLOWER:
        // Rose/Flower parametric
        const f_t = Math.random() * Math.PI * 2;
        const f_r = 3 * Math.cos(4 * f_t); // 4 petals
        const f_z = (Math.random() - 0.5) * 2;
        p = { 
          x: f_r * Math.cos(f_t) * 1.5, 
          y: f_r * Math.sin(f_t) * 1.5, 
          z: f_z + Math.sin(f_r * 2) * 0.5 
        };
        break;

      case ShapeType.SATURN:
        const isRing = Math.random() > 0.4; // 60% ring, 40% planet
        if (isRing) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 3.5 + Math.random() * 2.5;
          p = { x: Math.cos(angle) * dist, y: (Math.random() - 0.5) * 0.2, z: Math.sin(angle) * dist };
          // Tilt
          const tilt = Math.PI / 6;
          const yOld = p.y;
          p.y = p.y * Math.cos(tilt) - p.x * Math.sin(tilt);
          p.x = p.x * Math.cos(tilt) + yOld * Math.sin(tilt);
        } else {
          p = randomOnSphere(2);
        }
        break;

      case ShapeType.BUDDHA:
        // Approximate meditating silhouette using stacked ellipsoids
        const b_rand = Math.random();
        if (b_rand < 0.3) {
          // Head
          p = randomOnSphere(1.2);
          p.y += 2.5;
        } else if (b_rand < 0.7) {
          // Body
          const bodyP = randomOnSphere(2.0);
          p = { x: bodyP.x * 1.2, y: bodyP.y, z: bodyP.z * 0.8 };
        } else {
          // Legs/Base
          const baseAngle = Math.random() * Math.PI * 2;
          const baseR = 2.5 + Math.random();
          p = { x: Math.cos(baseAngle) * baseR, y: -1.5 + (Math.random() * 0.5), z: Math.sin(baseAngle) * baseR * 0.8 };
        }
        break;

      case ShapeType.FIREWORKS:
        // Explosion from center, randomized
        const fw_r = Math.random() * 6;
        const fw_theta = Math.random() * Math.PI * 2;
        const fw_phi = Math.acos(2 * Math.random() - 1);
        p = {
          x: fw_r * Math.sin(fw_phi) * Math.cos(fw_theta),
          y: fw_r * Math.sin(fw_phi) * Math.sin(fw_theta),
          z: fw_r * Math.cos(fw_phi)
        };
        break;

      case ShapeType.SPHERE:
      default:
        p = randomOnSphere(3);
        break;
    }

    positions[idx] = p.x;
    positions[idx + 1] = p.y;
    positions[idx + 2] = p.z;
  }

  return positions;
};
