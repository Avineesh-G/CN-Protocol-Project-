import React from 'react';
import { GitCommit, Sliders, Shield, Zap, ArrowRight } from 'lucide-react';
import { TCP_STATES } from '../engine/protocolEngine';

export default function TcpFsmDiagram({ serverState, clientState, tcb, currentWindow }) {
  const states = [
    { key: TCP_STATES.CLOSED, label: 'CLOSED', desc: 'No connection active / initial' },
    { key: TCP_STATES.LISTEN, label: 'LISTEN', desc: 'Server waiting for incoming connection' },
    { key: TCP_STATES.SYN_SENT, label: 'SYN_SENT', desc: 'Client sent SYN, awaiting SYN-ACK' },
    { key: TCP_STATES.SYN_RECEIVED, label: 'SYN_RECEIVED', desc: 'Server sent SYN-ACK, awaiting ACK' },
    { key: TCP_STATES.ESTABLISHED, label: 'ESTABLISHED', desc: 'Full-duplex reliable data transmission' },
    { key: TCP_STATES.FIN_WAIT_1, label: 'FIN_WAIT_1', desc: 'Active close: sent FIN, awaiting ACK' },
    { key: TCP_STATES.FIN_WAIT_2, label: 'FIN_WAIT_2', desc: 'Received ACK of FIN, awaiting remote FIN' },
    { key: TCP_STATES.CLOSE_WAIT, label: 'CLOSE_WAIT', desc: 'Passive close: received FIN, preparing FIN' },
    { key: TCP_STATES.CLOSING, label: 'CLOSING', desc: 'Simultaneous close: sent FIN, received FIN' },
    { key: TCP_STATES.LAST_ACK, label: 'LAST_ACK', desc: 'Passive close: sent FIN, awaiting final ACK' },
    { key: TCP_STATES.TIME_WAIT, label: 'TIME_WAIT', desc: 'Waiting 2*MSL to ensure final ACK received' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitCommit size={16} color="#8b5cf6" />
          <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
            Module 5: Connection-Oriented Service (TCP State Machine)
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
            Server: <strong style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>{serverState}</strong>
          </span>
          <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', display: 'inline-block', boxShadow: '0 0 6px #38bdf8' }} />
            Client: <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{clientState}</strong>
          </span>
        </div>
      </div>

      {/* Module 5: Flow Control (Sliding Window & Metrics) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        marginBottom: '12px',
        background: 'rgba(7, 11, 20, 0.6)',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)'
      }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>SND.NXT (Seq):</span> <strong style={{ color: '#fff' }}>{tcb?.snd_nxt || 1000}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>RCV.NXT (Ack):</span> <strong style={{ color: '#fff' }}>{tcb?.rcv_nxt || 2000}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Flow Control Win:</span> <strong style={{ color: '#06b6d4' }}>{currentWindow || 65535} B</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Max Segment Size:</span> <strong style={{ color: '#10b981' }}>{tcb?.mss || 1460} B</strong>
        </div>
      </div>

      {/* State nodes grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px',
        overflowY: 'auto',
        flex: 1
      }}>
        {states.map((st) => {
          const isServerCurrent = serverState === st.key;
          const isClientCurrent = clientState === st.key;
          const isEstablished = st.key === TCP_STATES.ESTABLISHED;

          let borderStyle = '1px solid rgba(255, 255, 255, 0.06)';
          let bgStyle = 'rgba(15, 23, 42, 0.5)';
          let glowBox = 'none';

          if (isServerCurrent && isClientCurrent) {
            borderStyle = '1px solid #a855f7';
            bgStyle = 'rgba(168, 85, 247, 0.15)';
            glowBox = '0 0 14px rgba(168, 85, 247, 0.4)';
          } else if (isServerCurrent) {
            borderStyle = '1px solid #10b981';
            bgStyle = 'rgba(168, 85, 247, 0.12)';
            glowBox = '0 0 14px rgba(16, 185, 129, 0.35)';
          } else if (isClientCurrent) {
            borderStyle = '1px solid #38bdf8';
            bgStyle = 'rgba(56, 189, 248, 0.12)';
            glowBox = '0 0 14px rgba(56, 189, 248, 0.35)';
          } else if (isEstablished) {
            borderStyle = '1px dashed rgba(16, 185, 129, 0.4)';
          }

          return (
            <div
              key={st.key}
              style={{
                borderRadius: '8px',
                padding: '10px',
                border: borderStyle,
                background: bgStyle,
                boxShadow: glowBox,
                transition: 'all 0.25s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  fontFamily: 'var(--font-mono)',
                  color: isServerCurrent || isClientCurrent ? '#fff' : 'var(--text-secondary)'
                }}>
                  {st.label}
                </span>

                <div style={{ display: 'flex', gap: '3px' }}>
                  {isServerCurrent && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} title="Server in this state" />
                  )}
                  {isClientCurrent && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} title="Client in this state" />
                  )}
                </div>
              </div>

              <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                {st.desc}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
