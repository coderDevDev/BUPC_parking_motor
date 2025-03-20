import React, { useEffect, useState, useRef } from 'react';
import './ParkingLot.css';

const SOCKET_URL = 'http://localhost:5000';
const POLLING_INTERVAL = 33; // ~30 FPS

const ParkingLot = ({ onStatusUpdate }) => {
  const [spaces, setSpaces] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ available: 0, total: 0 });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pollingRef = useRef(null);
  const fpsRef = useRef(0);

  const drawParkingSpaces = (data) => {
    if (!videoRef.current || !canvasRef.current || !data.dimensions) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;

    // Get the original dimensions used when marking parking spaces
    const originalWidth = data.dimensions.width;
    const originalHeight = data.dimensions.height;
    const originalAspectRatio = originalWidth / originalHeight;

    // Calculate container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate dimensions that maintain the original aspect ratio
    let displayWidth = containerWidth;
    let displayHeight = containerWidth / originalAspectRatio;

    if (displayHeight > containerHeight) {
      displayHeight = containerHeight;
      displayWidth = containerHeight * originalAspectRatio;
    }

    // Set canvas size to match these dimensions
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Center the canvas
    const offsetX = (containerWidth - displayWidth) / 2;
    const offsetY = (containerHeight - displayHeight) / 2;
    canvas.style.left = `${offsetX}px`;
    canvas.style.top = `${offsetY}px`;

    // Calculate scale factors
    const scaleX = displayWidth / originalWidth;
    const scaleY = displayHeight / originalHeight;

    // Draw parking spaces using the original coordinate system
    data.coordinates_data?.forEach((spot, index) => {
      const coordinates = spot.coordinates;
      if (!coordinates) return;

      // Scale coordinates from original dimensions
      const scaledCoords = coordinates.map(([x, y]) => [
        x * scaleX,
        y * scaleY
      ]);

      // Draw parking space
      ctx.beginPath();
      ctx.moveTo(scaledCoords[0][0], scaledCoords[0][1]);
      for (let i = 1; i < scaledCoords.length; i++) {
        ctx.lineTo(scaledCoords[i][0], scaledCoords[i][1]);
      }
      ctx.closePath();

      // Style based on status
      ctx.strokeStyle = data.statuses?.[index] ? '#00ff00' : '#ff0000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add space number
      const centerX = scaledCoords.reduce((sum, [x]) => sum + x, 0) / scaledCoords.length;
      const centerY = scaledCoords.reduce((sum, [_, y]) => sum + y, 0) / scaledCoords.length;

      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(spot.id.toString(), centerX, centerY);
    });
  };

  const startPolling = async () => {
    try {
      await fetch(`${SOCKET_URL}/api/start-detection`);
      setLoading(false);

      const pollFrame = async () => {
        try {
          const response = await fetch(`${SOCKET_URL}/api/frame`);
          if (!response.ok) throw new Error('Frame fetch failed');

          const data = await response.json();

          if (data.frame) {
            videoRef.current.src = `data:image/jpeg;base64,${data.frame}`;
            drawParkingSpaces(data);
          }

          setStats({
            available: data.available_spaces || 0,
            total: data.total_spaces || 0
          });

          if (onStatusUpdate) {
            onStatusUpdate({
              total: data.total_spaces,
              available: data.available_spaces,
              occupied: data.occupied_spaces
            });
          }

          pollingRef.current = setTimeout(pollFrame, POLLING_INTERVAL);
        } catch (error) {
          console.error('Polling error:', error);
          setError('Connection error. Retrying...');
          pollingRef.current = setTimeout(pollFrame, 1000);
        }
      };

      pollFrame();
    } catch (error) {
      console.error('Failed to start detection:', error);
      setError('Failed to start detection. Retrying...');
      setTimeout(startPolling, 2000);
    }
  };

  useEffect(() => {
    startPolling();
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
      fetch(`${SOCKET_URL}/api/stop-detection`).catch(console.error);
    };
  }, []);

  // Add resize observer to handle window resizing
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (videoRef.current && canvasRef.current) {
        canvasRef.current.width = videoRef.current.clientWidth;
        canvasRef.current.height = videoRef.current.clientHeight;
        // Redraw parking spaces when container is resized
        const data = JSON.parse(canvasRef.current.dataset.lastData || '{}');
        if (Object.keys(data).length > 0) {
          drawParkingSpaces(data);
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 text-gray-600">{error || 'Starting detection...'}</div>
      </div>
    );
  }

  return (
    <div className="parking-lot">
      <h2>Parking Lot View</h2>
      <div className="video-container" ref={containerRef}>
        <img
          ref={videoRef}
          alt="Parking lot feed"
          className="video-feed"
          onError={e => {
            console.error('Image load error');
            e.target.style.display = 'none';
            setTimeout(() => {
              e.target.style.display = 'block';
            }, 1000);
          }}
        />
        <canvas
          ref={canvasRef}
          className="parking-overlay"
        />
        <div className="status-overlay">
          <div className="status-text">
            Available: {stats.available} / {stats.total}
          </div>
          <div className="vehicle-info">
            Motorcycles Parked: {stats.occupied}
          </div>
          <div className="fps-counter">{fpsRef.current} FPS</div>
        </div>
      </div>
    </div>
  );
};

export default ParkingLot; 