import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Send, Trash2, CornerDownLeft, Play, Sparkles, HelpCircle } from 'lucide-react';

export default function ManualCommandTerminal({ logs, onExecuteCommand, onClearLogs }) {
  const [inputVal, setInputVal] = useState('');
  const [autoRun, setAutoRun] = useState(true);
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

  const handleChipClick = (cmd) => {
    if (autoRun) {
      onExecuteCommand(cmd);
      setInputVal('');
    } else {
      setInputVal(cmd);
    }
  };

  // Quick access commands across all layers
  const commandChips = [
    { label: 'arp-resolve (L2)', cmd: 'arp-resolve', desc: 'Broadcast ARP Request & populate cache' },
    { label: 'ping 192.0.2.2 (L3)', cmd: 'ping 192.0.2.2', desc: 'ICMP Echo Request/Reply' },
    { label: 'tcp-connect (L4)', cmd: 'tcp-connect 192.0.2.2:80', desc: 'RFC 793 3-Way Handshake' },
    { label: 'http-get / (App)', cmd: 'http-get /index.html', desc: 'HTTP Application Request-Response' },
    { label: 'udp-send (L4)', cmd: 'udp-send 192.0.2.2:53 "DNS Query"', desc: 'Connectionless UDP Datagram' },
    { label: 'flow-control 16K', cmd: 'flow-control 16384', desc: 'Adjust Flow Control Window Size' },
    { label: 'tcp-close', cmd: 'tcp-close', desc: '4-Way Connection Teardown' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Terminal Title Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TerminalIcon size={16} color="#10b981" />
          <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
            MicroPS Protocol Console & Event Log
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={autoRun} 
              onChange={(e) => setAutoRun(e.target.checked)} 
              style={{ accentColor: '#10b981' }}
            />
            <span>Auto-Run Chips</span>
          </label>
          <button 
            className="btn-ghost" 
            style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--text-muted)' }}
            onClick={onClearLogs}
            title="Clear console output"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Quick-Access Command Chips */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '6px',
        marginBottom: '8px',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#38bdf8', fontWeight: '700', whiteSpace: 'nowrap' }}>
          Quick CLI:
        </span>
        {commandChips.map((chip, idx) => (
          <button
            key={idx}
            style={{
              padding: '4px 9px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(30, 41, 59, 0.75)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: '#38bdf8',
              borderRadius: '5px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
            onClick={() => handleChipClick(chip.cmd)}
            title={chip.desc}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Log Output Display */}
      <div style={{
        flex: 1,
        background: '#040711',
        borderRadius: '6px',
        padding: '12px',
        overflowY: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        lineHeight: '1.5',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
            // MicroPS Event Logger initialized. Ready for protocol commands...
          </div>
        ) : (
          logs.map((log, index) => {
            let tagColor = '#94a3b8';
            if (log.type === 'L2' || log.tag?.includes('ARP')) tagColor = '#f59e0b';
            else if (log.type === 'L3' || log.tag?.includes('IP') || log.tag?.includes('ICMP')) tagColor = '#06b6d4';
            else if (log.type === 'L4' || log.tag?.includes('TCP')) tagColor = '#a855f7';
            else if (log.type === 'UDP' || log.tag?.includes('UDP')) tagColor = '#8b5cf6';
            else if (log.type === 'APP' || log.tag?.includes('HTTP')) tagColor = '#10b981';
            else if (log.type === 'CMD') tagColor = '#38bdf8';
            else if (log.type === 'ERR') tagColor = '#f43f5e';

            return (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#475569', userSelect: 'none', flexShrink: 0 }}>
                  [{log.time}]
                </span>
                <span style={{
                  color: tagColor,
                  fontWeight: '600',
                  padding: '0 4px',
                  borderRadius: '3px',
                  background: `${tagColor}15`,
                  flexShrink: 0
                }}>
                  {log.tag}
                </span>
                <span style={{ color: log.type === 'ERR' ? '#f43f5e' : (log.type === 'CMD' ? '#38bdf8' : '#e2e8f0'), wordBreak: 'break-all' }}>
                  {log.text}
                </span>
              </div>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>

      {/* Terminal Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
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
            placeholder="Type command: arp-resolve, ping 192.0.2.2, tcp-connect, http-get, udp-send, help..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              padding: '8px 0'
            }}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ padding: '0 14px', borderRadius: '6px' }}
        >
          <Send size={13} />
          <span>Execute</span>
        </button>
      </form>

    </div>
  );
}
