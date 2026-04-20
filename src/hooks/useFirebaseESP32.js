// src/hooks/useFirebaseESP32.js
// ============================================================
// Firebase Realtime DB hook for ESP32 data sync (REAL DATA ONLY)
// ESP32 publishes to /esp32/{deviceId}, dashboard listens/sends commands
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';

const INITIAL_STATE = {
  connected:     false,
  connecting:    true,
  phases:        { R: false, Y: false, B: false },
  motorOn:       false,
  autoMode:      true,
  mode:          'IDLE',
  uptime:        0,
  voltage:       { R: 0, Y: 0, B: 0 },
  current:       0,
  timerProgress: 0,
  faultActive:   false,
  faultMsg:      '',
  rssi:          -72,
  tempC:         32,
};

let logIdCounter = 0;
function makeLog(msg, type = 'info') {
  return {
    id: ++logIdCounter,
    time: new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }),
    msg,
    type,
  };
}

export default function useFirebaseESP32(firebaseConfig, deviceId) {
  const [state, setState]     = useState(INITIAL_STATE);
  const [logs, setLogs]       = useState([makeLog('Configure Firebase + Device ID to connect', 'info')]);
  const dbRef                = useRef(null);
  const statusRef            = useRef(null);
  const commandRef           = useRef(null);
  const heartbeatTimerRef    = useRef(null);

  const addLog = useCallback((msg, type = 'info') => {
    setLogs(prev => [makeLog(msg, type), ...prev].slice(0, 100));
  }, []);

  // ----------------------------------------------------------
  // Initialize Firebase + listeners
  // ----------------------------------------------------------
  useEffect(() => {
    if (!firebaseConfig?.databaseURL || !deviceId) {
      addLog('Missing Firebase config or deviceId', 'error');
      return;
    }

    try {
      const app = initializeApp(firebaseConfig);
      const db = getDatabase(app);

      const path = `esp32/${deviceId}`;
      dbRef.current = ref(db, path);
      statusRef.current = ref(db, `${path}/status`);
      commandRef.current = ref(db, `${path}/commands`);

      addLog(`Listening Firebase RTDB: ${path}`, 'info');

      // Listen for ESP32 status updates
      const unsubscribeStatus = onValue(statusRef.current, (snapshot) => {
        const data = snapshot.val();
        if (data && data !== null) {
          setState(prev => ({ ...prev, connected: true, connecting: false, ...data }));
          addLog('← ESP32 status update', 'data');

          // Reset heartbeat timer on each new update
          if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
          heartbeatTimerRef.current = setTimeout(() => {
            setState(prev => ({ ...prev, connected: false, connecting: false }));
            addLog('ESP32 offline (no data for 15s)', 'warn');
          }, 15000); // 15 seconds timeout
        }
      }, (error) => {
        addLog('Firebase status listen error: ' + error.message, 'error');
        setState(prev => ({ ...prev, connected: false, connecting: false }));
      });

      // Listen for logs/events from ESP32
      const unsubscribeLogs = onValue(ref(db, `${path}/logs`), (snapshot) => {
        const data = snapshot.val();
        if (data) {
          Object.values(data).slice(-1).forEach(log => {
            if (log.msg) addLog(log.msg, log.type || 'info');
          });
        }
      });

      return () => {
        unsubscribeStatus();
        unsubscribeLogs();
        if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
      };
    } catch (error) {
      addLog('Firebase init error: ' + error.message, 'error');
    }
  }, [firebaseConfig, deviceId, addLog]);

  const connect = useCallback(() => {
    addLog('Firebase listener active — waiting for device...', 'info');
  }, [addLog]);

  // ----------------------------------------------------------
  // Send command to ESP32 via Firebase
  // ----------------------------------------------------------
  const sendCmd = useCallback((cmd, payload = {}) => {
    if (!commandRef.current) {
      addLog(`❌ ${cmd} failed: Firebase not ready`, 'error');
      return false;
    }

    const command = { cmd, payload, timestamp: Date.now() };
    push(commandRef.current, command)
      .then(() => {
        addLog(`→ Firebase: ${cmd} ${JSON.stringify(payload)}`, 'cmd');
      })
      .catch((error) => {
        addLog('Send command error: ' + error.message, 'error');
      });
    return true;
  }, [addLog]);

  const clearCommands = useCallback(() => {
    if (commandRef.current) {
      set(commandRef.current, null);
      addLog('Cleared command queue', 'info');
    }
  }, []);

  return { state, logs, sendCmd, clearCommands, connect };
}

