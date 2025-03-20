import React, { forwardRef } from 'react';

const Receipt = forwardRef(({ data, isPrinting }, ref) => {
  if (!data) return null;

  return (
    <div
      ref={ref}
      className="receipt"
      style={{
        width: '80mm',
        padding: '5mm',
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: '1.5'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h2 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>PARKING RECEIPT</h2>
        <div>================================</div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <div>Ticket #: {data.ticketNumber}</div>
        <div>Date: {data.date}</div>
        <div>Time: {data.entryTime}</div>
        <div>Plate Number: {data.plateNumber}</div>
        <div>Vehicle Type: {data.vehicleType}</div>
        <div>Parking Slot: {data.parkingSlot}</div>
        <div>Driver: {data.driverName}</div>
        <div>Contact: {data.contactNumber}</div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div>================================</div>
        <div style={{ fontWeight: 'bold' }}>Thank you for parking with us!</div>
        <div>================================</div>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';

export default Receipt; 