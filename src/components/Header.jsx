// src/components/Header.jsx
import React from 'react';
import './Header.css';

export default function Header({ state }) {
  const { connected, connecting } = state;

  const statusClass = connected ? 'connected' : connecting ? 'connecting' : 'disconnected';
  const statusLabel = connected    ? `Online · ${state.uptime > 0 ? 'ESP32' : 'Connected'}`
                    : connecting   ? 'Searching for Device…'
                    :                'Offline · Waiting for Device';

  return (
    <header className="dashboard-header">
      <div className="header-brand">
        <div className="header-logo">⚡</div>
        <div>
          <h1 className="header-title">Motor Control Dashboard</h1>
          <p className="header-sub">ESP32-WROOM · 3-Phase Monitor · IoT Remote Control</p>
        </div>
      </div>

      <div className="header-actions">
        <div
          className={`status-badge status-badge--${statusClass}`}
          title={connected ? 'Device is online' : 'Waiting for device to come online...'}
        >
          <span className={`status-dot ${connecting || !connected ? 'pulse' : ''}`} />
          {statusLabel}
        </div>

      </div>
    </header>
  );
}
