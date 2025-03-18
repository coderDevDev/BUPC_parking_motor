import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const ParkingLot = ({ onStatusUpdate }) => {
  // ... existing state and refs ...

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 text-gray-600">{error || 'Starting detection...'}</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text">Parking Lot 1</h2>
          <p className="text-sm text-gray-500">Live Camera Feed</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">6/10</span>
          <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">LIVE</span>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        <img
          ref={videoRef}
          alt="Parking lot feed"
          className="w-full h-full object-contain"
          onError={e => {
            console.error('Image load error');
            e.target.style.display = 'none';
            setTimeout(() => {
              e.target.style.display = 'block';
            }, 1000);
          }}
        />
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent flex justify-between items-center">
          <div className="px-3 py-1.5 rounded-full bg-black/30 text-white text-sm backdrop-blur-sm">
            Available: {stats.available} / {stats.total}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-black/30 text-white text-sm backdrop-blur-sm">
            {fpsRef.current} FPS
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ParkingLot; 