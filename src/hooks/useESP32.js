// src/hooks/useESP32.js
// ============================================================
// WebSocket hook — connects to ESP32 WebSocket server on port 81 (REAL DATA ONLY)
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';

const INITIAL_STATE = {
  connected:     false,
  connecting:    false,
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

export default function useESP32(config) {
  const [state, setState]     = useState(INITIAL_STATE);
  const [logs, setLogs]       = useState([makeLog('Configure ESP32 IP in Settings to connect', 'info')]);

  const wsRef         = useRef(null);
  const reconnectRef  = useRef(null);
  const connectRef    = useRef();

  // ----------------------------------------------------------
  // Logging helper
  // ----------------------------------------------------------
  const addLog = useCallback((msg, type = 'info') => {
    setLogs(prev => [makeLog(msg, type), ...prev].slice(0, 100));
  }, []);

  // ----------------------------------------------------------
  // Connect callback (stable ref for deps/reconnect)
  // ----------------------------------------------------------
  const connectCb = useCallback(() => {
    if (!config.ip) { 
      addLog('No ESP32 IP configured — open Settings', 'error'); 
      return; 
    }
    if (wsRef.current) { wsRef.current.close(); }

    setState(s => ({ ...s, connecting: true }));
    addLog(`Connecting → ws://${config.ip}:${config.port || 81} …`, 'cmd');

    const ws = new WebSocket(`ws://${config.ip}:${config.port || 81}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setState(s => ({ ...s, connected: true, connecting: false }));
      clearTimeout(reconnectRef.current);
      addLog(`✅ Connected to ESP32 @ ${config.ip}`, 'success');
      ws.send(JSON.stringify({ cmd: 'GET_STATUS' }));
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setState(s => ({ ...s, ...data }));
        if (data.event) addLog(data.event, data.eventType || 'info');
      } catch {
        addLog('Bad JSON from ESP32: ' + e.data, 'warn');
      }
    };

    ws.onerror = () => {
      setState(s => ({ ...s, connected: false, connecting: false }));
      addLog('WebSocket connection failed — check ESP32 IP/port/network', 'error');
    };

    ws.onclose = (e) => {
      setState(s => ({ ...s, connected: false, connecting: config.autoReconnect !== false }));
      addLog(`Disconnected (code ${e.code}) — check ESP32 connection`, 'warn');
      // Auto-reconnect after 5s if enabled
      if (config.autoReconnect !== false) {
        reconnectRef.current = setTimeout(connectCb, 5000);
        addLog('Auto-reconnect in 5s...', 'info');
      }
    };
  }, [config, addLog]);

  // Update ref in effect (not render)
  useEffect(() => {
    connectRef.current = connectCb;
  }, [connectCb]);

  const connect = useCallback(() => connectRef.current?.(), []);
  const disconnect = useCallback(() => {
    clearTimeout(reconnectRef.current);
    if (wsRef.current) wsRef.current.close();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(reconnectRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // ----------------------------------------------------------
  // Send a command to ESP32 (REAL WS ONLY)
  // ----------------------------------------------------------
  const sendCmd = useCallback((cmd, payload = {}) => {
    const packet = JSON.stringify({ cmd, ...payload });

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(packet);
      addLog(`→ ${cmd}${Object.keys(payload).length ? ' ' + JSON.stringify(payload) : ''}`, 'cmd');
      return true;
    } else {
      addLog(`❌ ${cmd} failed: Not connected to ESP32`, 'error');
      return false;
    }
  }, [addLog]);

  return { state, logs, connect, disconnect, sendCmd };
}
