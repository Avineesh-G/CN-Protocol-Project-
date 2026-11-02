import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Send, Trash2, CornerDownLeft, Play } from 'lucide-react';

export default function SocketTerminal({ logs, onExecuteCommand, onClearLogs }) {
  const [inputVal, setInputVal] = useState('');
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onExecuteCommand(inputVal.trim());
    setInputVal('');
  };

  const quickCommands = [
    'sock_open STREAM',
    'sock_bind 0.0.0.0 7',
    'sock_listen 5',
    'sock_connect 192.0.2.2 7',
    'sock_send "Hello Prof!"',
    'sock_close'
  ];

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Terminal Title Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TerminalIcon size={16} color="#10b981" />
          <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
            MicroPS Socket API & Runtime Event Terminal
          </h3>
        </div>

        <button 
          className="btn-ghost" 
          style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--text-muted)' }}
          onClick={onClearLogs}
          title="Clear console logs"
        >
          <Trash2 size={12} />
          <span>Clear</span>
        </button>
      </div>

      {/* Quick Command Chips */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
        {quickCommands.map((cmd, idx) => (
          <button
            key={idx}
            style={{
              padding: '3px 8px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#38bdf8',
              borderRadius: '4px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            onClick={() => onExecuteCommand(cmd)}
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Output Window */}
      <div style={{
        flex: 1,
        background: '#040711',
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '12px',
        overflowY: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        lineHeight: '1.5'
      }}>
        {logs.map((log, idx) => {
          let color = '#94a3b8';
          if (log.type === 'I') color = '#38bdf8'; // Info
          else if (log.type === 'D') color = '#a855f7'; // Debug
          else if (log.type === 'W') color = '#f59e0b'; // Warn
          else if (log.type === 'E') color = '#f43f5e'; // Error
          else if (log.type === 'S') color = '#10b981'; // Socket / Success
          else if (log.type === 'C') color = '#facc15'; // Command

          return (
            <div key={idx} style={{ color, marginBottom: '2px', wordBreak: 'break-all' }}>
              <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>[{log.time}]</span>
              <strong style={{ marginRight: '6px' }}>[{log.type}]</strong>
              <span>{log.text}</span>
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>

      {/* Interactive Command Input */}
      <form onSubmit={handleSubmit} style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(7, 11, 20, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '6px',
          padding: '0 10px'
        }}>
          <span style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: '13px', marginRight: '6px' }}>
            microps&gt;
          </span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="e.g. sock_send 'Hello Professor' or sock_close"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              padding: '8px 0'
            }}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: '0 14px' }}>
          <CornerDownLeft size={14} />
          <span>Exec</span>
        </button>
      </form>

    </div>
  );
}
