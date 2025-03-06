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
  const pollingRef = useRef(null);
  const frameQueueRef = useRef([]);
  const renderTimeRef = useRef(0);
  const fpsRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());

  const renderNextFrame = () => {
    if (frameQueueRef.current.length > 0 && videoRef.current) {
      const currentTime = performance.now();
      const elapsed = currentTime - renderTimeRef.current;

      if (elapsed >= 1000 / 30) {
        // Limit to 30 FPS
        const frame = frameQueueRef.current.shift();
        videoRef.current.src = frame;
        renderTimeRef.current = currentTime;

        // Calculate actual FPS
        const frameTime = currentTime - lastFrameTimeRef.current;
        fpsRef.current = Math.round(1000 / frameTime);
        lastFrameTimeRef.current = currentTime;
      }

      requestAnimationFrame(renderNextFrame);
    }
  };

  const startPolling = async () => {
    try {
      await fetch(`${SOCKET_URL}/api/start-detection`);
      console.log('Detection started');
      setLoading(false);

      const pollFrame = async () => {
        try {
          const response = await fetch(`${SOCKET_URL}/api/frame`);
          if (!response.ok) throw new Error('Frame fetch failed');

          const data = await response.json();

          if (data.frame) {
            frameQueueRef.current.push(`data:image/jpeg;base64,${data.frame}`);
            if (frameQueueRef.current.length === 1) {
              requestAnimationFrame(renderNextFrame);
            }
            // Limit queue size
            if (frameQueueRef.current.length > 3) {
              frameQueueRef.current = frameQueueRef.current.slice(-3);
            }
          }

          setSpaces(data.spaces || {});
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
      frameQueueRef.current = [];
      fetch(`${SOCKET_URL}/api/stop-detection`).catch(console.error);
    };
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div>{error || 'Starting detection...'}</div>
      </div>
    );
  }

  return (
    <div className="parking-lot">
      <h2>Parking Lot View</h2>
      <div className="video-container">
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
        <div className="status-overlay">
          <div className="status-text">
            Available: {stats.available} / {stats.total}
          </div>
          <div className="fps-counter">{fpsRef.current} FPS</div>
        </div>
      </div>
    </div>
  );
};

export default ParkingLot;
