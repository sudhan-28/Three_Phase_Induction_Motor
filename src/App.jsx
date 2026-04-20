// src/App.jsx
// ============================================================
// Root component — wires all panels together (WS or Firebase)
// ============================================================
import React, { useCallback, useEffect } from 'react';
import './App.css';

import useFirebaseESP32 from './hooks/useFirebaseESP32';
import Header           from './components/Header';
import PhaseCard        from './components/PhaseCard';
import MotorControlCard from './components/MotorControlCard';
import GpioCard         from './components/GpioCard';
import SystemInfoCard   from './components/SystemInfoCard';
import EventLog         from './components/EventLog';

export default function App() {
  const firebaseConfig = {
    databaseURL: 'https://motordashboard-default-rtdb.asia-southeast1.firebasedatabase.app'
  };
  const deviceId = 'motor-001';

  // Firebase hook
  const { state, logs, sendCmd, connect } = useFirebaseESP32(firebaseConfig, deviceId);

  // Auto-connect on mount
  useEffect(() => {
    connect?.();
  }, [connect]);

  // ---- Commands ------------------------------------------------
  const handleStart = useCallback(() => {
    sendCmd('MOTOR_ON');
  }, [sendCmd]);

  const handleStop = useCallback(() => {
    sendCmd('MOTOR_OFF');
  }, [sendCmd]);

  const handleToggleAuto = useCallback(() => {
    sendCmd('SET_AUTO', { value: !state.autoMode });
  }, [sendCmd, state.autoMode]);

  const handleResetFault = useCallback(() => {
    sendCmd('RESET_FAULT');
  }, [sendCmd]);

  return (
    <div className="app">
      {/* Fault alert banner */}
      {state.faultActive && (
        <div className="fault-banner" role="alert">
          ⚠ {state.faultMsg || 'Phase fault — motor stopped for protection'}
        </div>
      )}

      {/* Header */}
      <Header state={state} />

      {/* Main 2-column grid */}
      <div className="grid-main">
        <PhaseCard phases={state.phases} voltage={state.voltage} autoMode={state.autoMode} />
        <MotorControlCard
          state={state}
          onStart={handleStart}
          onStop={handleStop}
          onToggleAuto={handleToggleAuto}
          onResetFault={handleResetFault}
        />
      </div>

      {/* Bottom 3-column grid */}
      <div className="grid-bottom">
        <GpioCard phases={state.phases} motorOn={state.motorOn} />
        <SystemInfoCard state={state} />
        <EventLog logs={logs} />
      </div>
    </div>
  );
}

