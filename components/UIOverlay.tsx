import React from 'react';
import { ShapeType } from '../types';
import { Maximize, Minimize, Camera } from 'lucide-react';

interface UIOverlayProps {
  currentShape: ShapeType;
  setShape: (s: ShapeType) => void;
  color: string;
  setColor: (c: string) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  isHandsDetected: boolean;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
  currentShape,
  setShape,
  color,
  setColor,
  isFullscreen,
  toggleFullscreen,
  isHandsDetected
}) => {
  return (
    <div className="fixed top-0 right-0 h-full w-80 p-6 pointer-events-none flex flex-col justify-center z-40">
      <div className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl text-white transition-all duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            ZenParticles
          </h1>
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>

        {/* Shape Selector */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
            Morph Target
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(ShapeType).map((shape) => (
              <button
                key={shape}
                onClick={() => setShape(shape)}
                className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 border ${
                  currentShape === shape
                    ? 'bg-white/20 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div className="mb-6">
           <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
            Particle Color
          </label>
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-lg border border-white/10">
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
            />
            <span className="text-sm font-mono text-gray-300">{color.toUpperCase()}</span>
          </div>
        </div>

        {/* Status */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full animate-pulse ${isHandsDetected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
             <span className="text-xs text-gray-400">
                {isHandsDetected ? 'Hands Detected: Controlling' : 'Waiting for hands...'}
             </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
            Use <strong className="text-gray-300">two hands</strong> to control the universe. 
            Move hands apart to expand, together to contract.
          </p>
        </div>

      </div>
    </div>
  );
};

export default UIOverlay;
