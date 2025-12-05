import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Particles from './components/Particles';
import HandTracker from './components/HandTracker';
import UIOverlay from './components/UIOverlay';
import { ShapeType } from './types';

function App() {
  const [currentShape, setCurrentShape] = useState<ShapeType>(ShapeType.HEART);
  const [particleColor, setParticleColor] = useState<string>('#ff00aa');
  const [handInfluence, setHandInfluence] = useState<number>(1.0);
  const [isHandsDetected, setIsHandsDetected] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Callback from HandTracker
  const handleHandsUpdate = useCallback((scale: number, isDetected: boolean) => {
    setIsHandsDetected(isDetected);
    setHandInfluence(scale);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#050505]">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.5} />
          
          <Particles 
            shape={currentShape} 
            color={particleColor} 
            handInfluence={handInfluence}
            isHandsDetected={isHandsDetected}
          />
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate={!isHandsDetected} // Auto rotate when idle
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* Hand Tracking Input (Hidden/Miniature) */}
      <HandTracker onHandsUpdate={handleHandsUpdate} />

      {/* UI Layer */}
      <UIOverlay
        currentShape={currentShape}
        setShape={setCurrentShape}
        color={particleColor}
        setColor={setParticleColor}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        isHandsDetected={isHandsDetected}
      />
    </div>
  );
}

export default App;
