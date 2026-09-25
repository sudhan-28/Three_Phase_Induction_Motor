import React from 'react';
import './Header.css';

export default function Header({ state, t, language, onLanguageToggle }) {
  const { connected, connecting } = state;
  const statusClass = connected ? 'connected' : connecting ? 'connecting' : 'disconnected';
  const statusLabel = connected ? `${t.online} · ${state.uptime > 0 ? 'ESP32' : t.connected}` : connecting ? t.searching : t.offline;

  return (
    <header className="dashboard-header">
      <div className="header-brand">
        <div className="header-logo">⚡</div>
        <div><h1 className="header-title">{t.dashboard}</h1><p className="header-sub">{t.subtitle}</p></div>
      </div>
      <div className="header-actions">
        <div className={`status-badge status-badge--${statusClass}`} title={connected ? t.deviceOnline : t.waitingDevice}>
          <span className={`status-dot ${connecting || !connected ? 'pulse' : ''}`} />{statusLabel}
        </div>
        <button className="language-toggle" onClick={onLanguageToggle} aria-label={`Switch language to ${language === 'ta' ? 'English' : 'Tamil'}`}>{t.language}</button>
      </div>
    </header>
  );
}
