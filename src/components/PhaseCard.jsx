import React from 'react';
import './PhaseCard.css';

function Waveform({ color, active }) {
  const W = 120, H = 28, amp = active ? 10 : 2;
  const pts = Array.from({ length: 61 }, (_, i) => `${((i / 60) * W).toFixed(1)},${(H - amp * Math.sin((i / 60) * Math.PI * 4)).toFixed(1)}`).join(' ');
  return <svg className="phase-waveform" viewBox={`0 0 ${W} ${H * 2}`} preserveAspectRatio="none"><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={active ? .85 : .25} /></svg>;
}

const PHASE_COLORS = { R: '#e74c3c', Y: '#f39c12', B: '#3498db' };

export default function PhaseCard({ phases, voltage, autoMode, t }) {
  const allOk = phases.R && phases.Y && phases.B;
  return <div className="card phase-card">
    <div className="card-title">{t.phaseStatus}</div>
    <div className="phases-row">{['R', 'Y', 'B'].map(p => <div key={p} className={`phase-item ${phases[p] ? 'active' : 'inactive'}`}><div className={`phase-orb phase-orb--${p} ${phases[p] ? 'active' : ''}`}>{p}</div><Waveform color={PHASE_COLORS[p]} active={phases[p]} /><span className="phase-voltage">{phases[p] ? `${voltage[p]}V` : '—'}</span><span className={`phase-badge ${phases[p] ? 'ok' : 'fail'}`}>{phases[p] ? '● OK' : `✕ ${t.fault}`}</span></div>)}</div>
    {autoMode && !allOk && <div className="phase-warning">⚠ {t.waitingPhases}</div>}
    <div className="phase-summary"><span>{Object.values(phases).filter(Boolean).length}/3 {t.phasesActive}</span><span className={`phase-summary-status ${allOk ? 'ok' : 'fail'}`}>{allOk ? t.healthy : t.fault}</span></div>
  </div>;
}
