import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface HandTrackerProps {
  onHandsUpdate: (distance: number, isDetected: boolean) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandsUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastVideoTime = useRef(-1);
  const requestRef = useRef<number>();
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  // Initialize MediaPipe
  useEffect(() => {
    const initLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        setLoading(false);
      } catch (error) {
        console.error("Error loading hand landmarker:", error);
        setLoading(false);
      }
    };

    initLandmarker();

    return () => {
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
    };
  }, []);

  // Setup Camera
  useEffect(() => {
    const setupCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', () => {
             setPermissionGranted(true);
             predictWebcam();
          });
        }
      } catch (err) {
        console.error("Camera denied:", err);
      }
    };

    if (!loading) {
      setupCamera();
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const predictWebcam = () => {
    if (!handLandmarkerRef.current || !videoRef.current) return;

    const startTimeMs = performance.now();
    
    if (videoRef.current.currentTime !== lastVideoTime.current) {
      lastVideoTime.current = videoRef.current.currentTime;
      const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      if (results.landmarks && results.landmarks.length > 0) {
        // Logic: 
        // If 2 hands: Calculate distance between Wrist (index 0) of hand 1 and hand 2
        // If 1 hand: Use distance between thumb tip (4) and index tip (8) for pinch-to-zoom effect?
        // Prompt asks for "Hands open/close" (two hands).
        
        if (results.landmarks.length === 2) {
          const hand1 = results.landmarks[0][0]; // Wrist
          const hand2 = results.landmarks[1][0]; // Wrist
          
          // Simple euclidean distance in screen space (normalized 0-1)
          const dx = hand1.x - hand2.x;
          const dy = hand1.y - hand2.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          // Map distance 0.1->0.8 to Scale 0.5->2.5
          // Average comfortable range is roughly 0.2 to 0.7
          let scale = (dist - 0.1) * 4.0;
          if (scale < 0.2) scale = 0.2;
          if (scale > 3.0) scale = 3.0;

          onHandsUpdate(scale, true);
        } else {
            // Only 1 hand? Default to normal or maybe pulse?
            // Let's keep it steady if only 1 hand or reset to 1
             onHandsUpdate(1, true);
        }
      } else {
        onHandsUpdate(1, false);
      }
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 pointer-events-none opacity-80">
      <div className="relative rounded-lg overflow-hidden border border-white/20 shadow-lg bg-black/50 backdrop-blur-sm w-32 h-24">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
        />
        {!permissionGranted && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-center text-white/70 p-1">
            Camera Required
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-white/70">
            Loading AI...
          </div>
        )}
      </div>
      <div className="text-[10px] text-white/50 mt-1 text-center font-mono">
        HAND TRACKING ACTIVE
      </div>
    </div>
  );
};

export default HandTracker;
