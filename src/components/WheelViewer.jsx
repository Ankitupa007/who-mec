'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function WheelViewer() {
  const [rotation, setRotation] = useState(0); // Top layer rotation
  const [bottomRotation, setBottomRotation] = useState(0); // Bottom layer rotation
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const wheelRef = useRef(null);
  const lastAngleRef = useRef(0);

  // Calculate angle from center of wheel
  const calculateAngle = (clientX, clientY) => {
    if (!wheelRef.current) return 0;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  };

  // Mouse/Touch drag handlers
  const handleDragStart = (clientX, clientY) => {
    setIsDragging(true);
    lastAngleRef.current = calculateAngle(clientX, clientY);
  };

  const handleDragMove = (clientX, clientY) => {
    if (!isDragging) return;
    
    const currentAngle = calculateAngle(clientX, clientY);
    const angleDiff = currentAngle - lastAngleRef.current;
    
    setBottomRotation((prev) => prev + angleDiff);
    
    lastAngleRef.current = currentAngle;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setBottomRotation((prev) => prev - 5);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setBottomRotation((prev) => prev + 5);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Mouse wheel handler
  const handleWheel = (e) => {
    // Prevent default scroll behavior
    // Note: React's synthetic event might not support preventDefault for wheel in passive mode
    // We'll handle visual rotation here
    
    const delta = e.deltaY;
    const rotationAmount = delta > 0 ? 5 : -5;
    
    setBottomRotation((prev) => prev + rotationAmount);
  };

  // Add non-passive wheel listener for prevention
  useEffect(() => {
    const wheelElement = wheelRef.current;
    if (wheelElement) {
      const preventScroll = (e) => {
        e.preventDefault();
        const delta = e.deltaY;
        const rotationAmount = delta > 0 ? 5 : -5;
        setBottomRotation((prev) => prev + rotationAmount);
      };
      
      wheelElement.addEventListener('wheel', preventScroll, { passive: false });
      return () => {
        wheelElement.removeEventListener('wheel', preventScroll);
      };
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      {/* Mobile Sliders - Show at top on mobile */}
      <div className="lg:hidden w-full max-w-md mx-auto mb-6 space-y-3">


        {/* Bottom Layer Rotation Slider */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rotate Wheel: {Math.round(bottomRotation)}°
          </label>
          <input
            type="range"
            min="-360"
            max="360"
            value={bottomRotation}
            onChange={(e) => setBottomRotation(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-emerald-600"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 flex-1 mt-8 lg:mt-0">
      {/* Wheel Container */}
      <div className="flex items-center justify-center">
        {/* Wrapper for overflow clipping */}
        <div className="relative w-[300px] h-[300px] md:w-[800px] md:h-[800px] overflow-hidden rounded-full">
          <div
            ref={wheelRef}
            className={`w-full h-full relative transition-transform duration-500 ease-out ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
             style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
          {/* Front View - Layered Wheel */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Bottom Layer (Now Rotatable) */}
            <div 
              className="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out"
              style={{
                transform: `rotate(${bottomRotation}deg)`,
              }}
            >
              <Image
                src="/bottom.png"
                alt="WHO Wheel Bottom Layer"
                width={700}
                height={700}
                className="w-full h-full object-contain select-none pointer-events-none rounded-full"
                priority
                draggable={false}
              />
            </div>

            {/* Top Layer (Rotatable) */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out"
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
            >
              <Image
                src="/top.png"
                alt="WHO Wheel Top Layer"
                width={700}
                height={700}
                className="w-full h-full object-contain select-none pointer-events-none rounded-full"
                priority
                draggable={false}
              />
            </div>
          </div>

          {/* Back View */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <Image
              src="/Back.png"
              alt="WHO Wheel Back"
              width={700}
              height={700}
              className="w-full h-full object-contain select-none pointer-events-none rounded-full"
              draggable={false}
            />
          </div>
        </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-sm space-y-4">
        {/* Header */}
        <div className="text-center lg:text-left mb-6">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-white mb-3">
            WHO Medical Eligibility Criteria Wheel
          </h1>
          
          {/* Minimal Controls Guide */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm">
              <span>🖱️</span> Drag the wheel or use mouse scrollwheel to rotate
            </span>
            <span className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm">
              <span>⌨️</span> ← → to rotate
            </span>
            <span className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm">
              <span>Press</span> F to flip
            </span>
          </div>
        </div>

        {/* Rotation Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="grid grid-cols-1 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rotation</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(bottomRotation)}°
              </p>
            </div>
          </div>
        </div>



        {/* Bottom Layer Rotation Slider */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rotate wheel
          </label>
          <input
            type="range"
            min="-360"
            max="360"
            value={bottomRotation}
            onChange={(e) => setBottomRotation(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-emerald-600"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>-360°</span>
            <span>0°</span>
            <span>360°</span>
          </div>
        </div>

        {/* Flip Button */}
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          {isFlipped ? '↩ View Front' : '↪ View Back'}
        </button>

        {/* Reset Button */}
        <button
          onClick={() => {
            setRotation(0);
            setBottomRotation(0);
          }}
          className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-6 rounded-lg shadow transition-all duration-200"
        >
          Reset wheel
        </button>


        {/* Source & Download */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">
            Source: <a href="https://www.who.int/publications/i/item/9789241549257" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">WHO Medical Eligibility Criteria Wheel</a>
          </p>
          <a
            href="/WHO-MEC wheel.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            <span>⬇️</span> Download PDF
          </a>
        </div>
        </div>

      </div>
    </div>
  );
}
