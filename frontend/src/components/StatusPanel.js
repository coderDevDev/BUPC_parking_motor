import React from 'react';
import './StatusPanel.css';

const StatusPanel = ({ total, available, occupied }) => {
  return (
    <div className="status-panel">
      <div className="stat-item total">
        <h3>Total Spaces</h3>
        <span className="stat-value">{total || 0}</span>
      </div>
      <div className="stat-item available">
        <h3>Available</h3>
        <span className="stat-value">{available || 0}</span>
      </div>
      <div className="stat-item occupied">
        <h3>Occupied</h3>
        <span className="stat-value">{occupied || 0}</span>
      </div>
    </div>
  );
};

export default StatusPanel;
