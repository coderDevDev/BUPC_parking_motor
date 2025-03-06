import React, { useEffect, useState, useRef } from 'react';
import './ParkingLot.css';

const SOCKET_URL = 'http://localhost:5000';
const POLLING_INTERVAL = 50; // 50ms polling interval

const ParkingLot = ({ onStatusUpdate }) => {
  const [spaces, setSpaces] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const pollingRef = useRef(null);

  const startPolling = async () => {
    try {
      // Start detection
      await fetch(`${SOCKET_URL}/api/start-detection`);
      console.log('Detection started');
      setLoading(false);

      // Start polling for frames
      const pollFrame = async () => {
        try {
          const response = await fetch(`${SOCKET_URL}/api/frame`);
          if (!response.ok) throw new Error('Frame fetch failed');

          const data = await response.json();

          if (videoRef.current && data.frame) {
            videoRef.current.src = `data:image/jpeg;base64,${data.frame}`;
          }

          setSpaces(data.spaces || {});
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
          pollingRef.current = setTimeout(pollFrame, 1000); // Retry after 1s on error
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
      // Cleanup
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
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
      </div>
      <div className="parking-grid">
        {Object.entries(spaces).map(([id, space]) => (
          <div key={id} className={`parking-space ${space.status}`}>
            <span className="space-id">Space {id}</span>
            <span className="space-status">{space.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParkingLot;
