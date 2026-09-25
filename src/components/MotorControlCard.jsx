import React from 'react';
import './MotorControlCard.css';

function ToggleSwitch({ checked, onChange, label }) {
  return <div className="toggle-row"><span className="toggle-label">{label}</span><div className={`toggle-switch ${checked ? 'on' : 'off'}`} onClick={onChange} role="switch" aria-checked={checked}><div className="toggle-track" /><div className="toggle-thumb" /></div></div>;
}

export default function MotorControlCard({ state, onStart, onStop, onToggleAuto, onResetFault, t }) {
  const { motorOn, autoMode, mode, timerProgress, faultActive, phases } = state;
  const allOk = phases.R && phases.Y && phases.B;
  const motorStateClass = motorOn ? 'on' : faultActive ? 'fault' : 'off';
  const statusLabel = faultActive ? t.fault : motorOn ? t.motorOn : t.motorOff;
  const statusSub = faultActive ? state.faultMsg : `${t.mode}: ${mode} · ${t.relay} D2: ${motorOn ? 'HIGH' : 'LOW'}`;
  return <div className="card motor-card">
    <div className="card-title">{t.motorControl}</div>
    <div className={`motor-status motor-status--${motorStateClass}`}><div className={`motor-icon motor-icon--${motorStateClass}`}><span className={motorOn ? 'spin-icon' : ''} style={{ display: 'inline-block' }}>⚙</span></div><div className="motor-info"><h2 className="motor-label">{statusLabel}</h2><p className="motor-sub">{statusSub}</p></div>{motorOn && <div className="motor-on-pulse" />}</div>
    {autoMode && allOk && !motorOn && timerProgress > 0 && mode !== 'FAULT' && <div className="timer-section"><div className="timer-header"><span>{t.autoStart}</span><span className="timer-val">{5 - Math.round((timerProgress / 100) * 5)}s</span></div><div className="timer-bar-bg"><div className="timer-bar-fill" style={{ width: `${timerProgress}%` }} /></div></div>}
    {faultActive && <button className="btn btn-reset" onClick={onResetFault}>↺ {t.resetFault}</button>}
    <div className="controls-row"><button className="btn btn-start" onClick={onStart} disabled={motorOn || !allOk || autoMode || faultActive} title={autoMode ? 'Disable Auto Mode to use manual start' : !allOk ? 'All 3 phases must be present' : ''}>▶ {t.start}</button><button className="btn btn-stop" onClick={onStop} disabled={!motorOn && !faultActive}>■ {t.stop}</button></div>
    <ToggleSwitch checked={autoMode} onChange={onToggleAuto} label={t.autoMode} />
    <p className={`auto-hint ${autoMode ? '' : 'manual-hint'}`}>{autoMode ? t.autoHint : t.manualHint}</p>
  </div>;
}
