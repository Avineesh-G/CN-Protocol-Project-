import React from 'react';
import { Layers, ArrowRight, ArrowLeft, ShieldCheck, Box, Send, Activity } from 'lucide-react';

export default function PacketJourneyAnimator({ packet }) {
  if (!packet) {
    return (
      <div className="glass-panel" style={{ padding: '24px', margin: '14px 16px 0 16px', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Box size={18} />
          <span>No packet currently in transit. Click a demo above or execute a socket command to start.</span>
        </div>
      </div>
    );
  }

  const isOutbound = packet.direction === 'outbound'; // Host A -> MicroPS
  const isArp = packet.protocol === 'ARP';
  const isIcmp = packet.protocol === 'ICMP';
  const isTcp = packet.protocol === 'TCP';
  const isUdp = packet.protocol === 'UDP';
  const isHttp = packet.protocol === 'HTTP';

  let layerColor = '#38bdf8';
  if (isArp) layerColor = '#f59e0b';
  else if (isIcmp) layerColor = '#06b6d4';
  else if (isTcp) layerColor = '#a855f7';
  else if (isUdp) layerColor = '#8b5cf6';
  else if (isHttp) layerColor = '#10b981';

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', margin: '14px 16px 0 16px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Top packet status bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge" style={{ background: `${layerColor}22`, color: layerColor, border: `1px solid ${layerColor}55`, fontWeight: '700' }}>
            {packet.protocol}
          </span>
          <strong style={{ fontSize: '14px', color: '#fff' }}>{packet.summary}</strong>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ({packet.length} bytes on wire)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: '600' }}>
            <ShieldCheck size={14} /> 1's Complement Checksum OK
          </span>
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Delay: {packet.timestamp || '0.000 ms'}
          </span>
        </div>
      </div>

      {/* Packet Encapsulation Visual Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        background: 'rgba(7, 11, 20, 0.6)',
        borderRadius: '8px',
        padding: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        
        {/* Layer 2: Ethernet Header */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '6px',
          padding: '10px'
        }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#f59e0b', fontWeight: '700', marginBottom: '4px' }}>
            Layer 2 • Ethernet II (14B)
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            Dst: <span style={{ color: '#fff' }}>{packet.ethernet?.dstMac || '00:00:5e:00:53:01'}</span><br/>
            Src: <span style={{ color: '#fff' }}>{packet.ethernet?.srcMac || '0e:4e:af:bc:64:c6'}</span><br/>
            Type: <span style={{ color: '#f59e0b' }}>{packet.ethernet?.type || (isArp ? '0x0806 (ARP)' : '0x0800 (IPv4)')}</span>
          </div>
        </div>

        {/* Layer 3: Network Layer (IPv4 or ARP Body) */}
        {isArp ? (
          <div style={{
            background: 'rgba(217, 119, 6, 0.08)',
            border: '1px solid rgba(217, 119, 6, 0.25)',
            borderRadius: '6px',
            padding: '10px'
          }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#d97706', fontWeight: '700', marginBottom: '4px' }}>
              Layer 2/3 • ARP Message (28B)
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              Opcode: <strong style={{ color: '#f59e0b' }}>{packet.arp?.op === 1 ? '1 (ARP Request)' : '2 (ARP Reply)'}</strong><br/>
              Target: <span style={{ color: '#fff' }}>{packet.arp?.tpa || '192.0.2.2'}</span><br/>
              Sender: <span style={{ color: '#38bdf8' }}>{packet.arp?.spa || '192.0.2.1'}</span>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '6px',
            padding: '10px'
          }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#06b6d4', fontWeight: '700', marginBottom: '4px' }}>
              Layer 3 • IPv4 Header (20B)
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              Src: <span style={{ color: '#fff' }}>{packet.ip?.src || '192.0.2.1'}</span><br/>
              Dst: <span style={{ color: '#fff' }}>{packet.ip?.dst || '192.0.2.2'}</span><br/>
              TTL: <span style={{ color: '#06b6d4' }}>{packet.ip?.ttl || 64}</span> | Proto: <span style={{ color: '#06b6d4' }}>{packet.protocol}</span>
            </div>
          </div>
        )}

        {/* Layer 4: Transport / ICMP Control */}
        <div style={{
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: '6px',
          padding: '10px'
        }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#a855f7', fontWeight: '700', marginBottom: '4px' }}>
            Layer 4 • {isIcmp ? 'ICMP Header' : (isArp ? 'ARP Payload' : `${packet.protocol} Segment`)}
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            {(isTcp || isHttp) && (
              <>
                Flags: <strong style={{ color: '#c084fc' }}>{packet.tcp?.flagsStr || 'ACK'}</strong><br/>
                SEQ: <span style={{ color: '#fff' }}>{packet.tcp?.seq}</span> | ACK: <span style={{ color: '#fff' }}>{packet.tcp?.ack}</span><br/>
                Win: <span style={{ color: '#06b6d4' }}>{packet.tcp?.window || 65535} B</span>
              </>
            )}
            {isIcmp && (
              <>
                Type: <strong style={{ color: '#06b6d4' }}>{packet.icmp?.type === 8 ? '8 (Echo Request)' : '0 (Echo Reply)'}</strong><br/>
                Code: 0 | Id: {packet.icmp?.id || 1}<br/>
                Seq: {packet.icmp?.seq || 1} (RTT: 0.38ms)
              </>
            )}
            {isArp && (
              <>
                Hardware: Ethernet (1)<br/>
                Proto: IPv4 (0x0800)<br/>
                Cache: Auto-Inserted
              </>
            )}
            {isUdp && (
              <>
                Src Port: {packet.udp?.srcPort} &rarr; Dst Port: {packet.udp?.dstPort}<br/>
                Len: {packet.udp?.length} bytes (No Handshake)
              </>
            )}
          </div>
        </div>

        {/* Layer 5: Application Payload */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '6px',
          padding: '10px'
        }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#10b981', fontWeight: '700', marginBottom: '4px' }}>
            Application Payload
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#fff', wordBreak: 'break-all' }}>
            {packet.payloadText ? `"${packet.payloadText.slice(0, 45)}${packet.payloadText.length > 45 ? '...' : ''}"` : <span style={{ color: 'var(--text-muted)' }}>(Header-only / No payload)</span>}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Length: {packet.payloadLength || 0} bytes
          </div>
        </div>

      </div>

    </div>
  );
}
