import React, { useState } from 'react';
import ParkingLot from './components/ParkingLot';
import StatusPanel from './components/StatusPanel';
import './App.css';

function App() {
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0
  });

  const handleStatusUpdate = newStats => {
    setStats(newStats);
  };

  return (
    <div className="App">
      <h1>Smart Parking System</h1>
      <StatusPanel {...stats} />
      <ParkingLot onStatusUpdate={handleStatusUpdate} />
    </div>
  );
}

export default App;
