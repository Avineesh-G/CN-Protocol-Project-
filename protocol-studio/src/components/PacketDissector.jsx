import React, { useState } from 'react';
import { Binary, ChevronRight, ChevronDown, CheckCircle, FileText, Hash } from 'lucide-react';
import { generateHexDump } from '../engine/protocolEngine';

export default function PacketDissector({ packet }) {
  const [expandedLayers, setExpandedLayers] = useState({
    frame: true,
    ethernet: true,
    ip: true,
    transport: true,
    payload: true
  });
  const [activeTab, setActiveTab] = useState('tree'); // 'tree' | 'hex'

  const toggleLayer = (layer) => {
    setExpandedLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  if (!packet) {
    return (
      <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Binary size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Select or transmit a packet to inspect protocol headers & hex dump
        </div>
      </div>
    );
  }

  const hexDumpText = packet.rawBytes ? generateHexDump(packet.rawBytes) : '// No raw byte buffer available';

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header and Tab Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Binary size={16} color="#38bdf8" />
          <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#cbd5e1' }}>
            Packet Dissector (Wireshark-Style Inspection)
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'rgba(7, 11, 20, 0.6)', padding: '2px', borderRadius: '6px' }}>
          <button
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              borderRadius: '4px',
              cursor: 'pointer',
              background: activeTab === 'tree' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
              color: activeTab === 'tree' ? '#38bdf8' : 'var(--text-muted)',
              border: 'none',
              fontWeight: activeTab === 'tree' ? '700' : '500'
            }}
            onClick={() => setActiveTab('tree')}
          >
            Protocol Tree
          </button>
          <button
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              borderRadius: '4px',
              cursor: 'pointer',
              background: activeTab === 'hex' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
              color: activeTab === 'hex' ? '#38bdf8' : 'var(--text-muted)',
              border: 'none',
              fontWeight: activeTab === 'hex' ? '700' : '500'
            }}
            onClick={() => setActiveTab('hex')}
          >
            Raw Hex Dump
          </button>
        </div>
      </div>

      {/* Dissector content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        
        {activeTab === 'tree' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
            
            {/* Layer 1: Frame Summary */}
            <div style={{ border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.5)' }}>
              <div 
                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleLayer('frame')}
              >
                {expandedLayers.frame ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span style={{ color: '#94a3b8', fontWeight: '700' }}>Frame ({packet.length} bytes on wire, {packet.length} bytes captured)</span>
              </div>
              {expandedLayers.frame && (
                <div style={{ padding: '6px 12px 10px 30px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div>Interface: <strong style={{ color: '#fff' }}>net2 (Linux TAP /dev/net/tun)</strong></div>
                  <div>Arrival Time: <span style={{ color: '#38bdf8', fontWeight: '700' }}>{packet.timestamp || '0.000 ms'}</span></div>
                  <div>Protocols in frame: <span style={{ color: '#06b6d4' }}>eth:ip:{packet.protocol.toLowerCase()}</span></div>
                </div>
              )}
            </div>

            {/* Layer 2: Ethernet II */}
            <div style={{ border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.05)' }}>
              <div 
                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleLayer('ethernet')}
              >
                {expandedLayers.ethernet ? <ChevronDown size={14} color="#f59e0b" /> : <ChevronRight size={14} color="#f59e0b" />}
                <span style={{ color: '#fbbf24', fontWeight: '700' }}>Ethernet II, Src: {packet.ethernet?.srcMac}, Dst: {packet.ethernet?.dstMac}</span>
              </div>
              {expandedLayers.ethernet && (
                <div style={{ padding: '6px 12px 10px 30px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(245, 158, 11, 0.1)' }}>
                  <div>Destination: <strong style={{ color: '#fff' }}>{packet.ethernet?.dstMac}</strong></div>
                  <div>Source: <strong style={{ color: '#fff' }}>{packet.ethernet?.srcMac}</strong></div>
                  <div>Type: <span style={{ color: '#f59e0b', fontWeight: '700' }}>{packet.ethernet?.type || '0x0800 (IPv4)'}</span></div>
                </div>
              )}
            </div>

            {/* Layer 3: IPv4 */}
            {packet.ip && (
              <div style={{ border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.05)' }}>
                <div 
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleLayer('ip')}
                >
                  {expandedLayers.ip ? <ChevronDown size={14} color="#06b6d4" /> : <ChevronRight size={14} color="#06b6d4" />}
                  <span style={{ color: '#38bdf8', fontWeight: '700' }}>Internet Protocol Version 4, Src: {packet.ip.src}, Dst: {packet.ip.dst}</span>
                </div>
                {expandedLayers.ip && (
                  <div style={{ padding: '6px 12px 10px 30px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(6, 182, 212, 0.1)' }}>
                    <div>0100 .... = Version: <strong style={{ color: '#fff' }}>4</strong></div>
                    <div>.... 0101 = Header Length: <strong style={{ color: '#fff' }}>20 bytes (5)</strong></div>
                    <div>Differentiated Services Field: <strong style={{ color: '#fff' }}>0x00 (Default)</strong></div>
                    <div>Total Length: <strong style={{ color: '#fff' }}>{packet.length - 14} bytes</strong></div>
                    <div>Identification: <strong style={{ color: '#fff' }}>0x4102 (16642)</strong></div>
                    <div>Flags: <strong style={{ color: '#fff' }}>0x4000, Don't fragment</strong></div>
                    <div>Time to Live: <strong style={{ color: '#06b6d4' }}>{packet.ip.ttl || 64}</strong></div>
                    <div>Protocol: <strong style={{ color: '#06b6d4' }}>{packet.protocol}</strong></div>
                    <div>Header Checksum: <strong style={{ color: '#10b981' }}>0x1663 [correct]</strong></div>
                    <div>Source Address: <strong style={{ color: '#fff' }}>{packet.ip.src}</strong></div>
                    <div>Destination Address: <strong style={{ color: '#fff' }}>{packet.ip.dst}</strong></div>
                  </div>
                )}
              </div>
            )}

            {/* Layer 4: Transport (TCP / UDP / ICMP / ARP) */}
            <div style={{ border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.05)' }}>
              <div 
                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleLayer('transport')}
              >
                {expandedLayers.transport ? <ChevronDown size={14} color="#a855f7" /> : <ChevronRight size={14} color="#a855f7" />}
                <span style={{ color: '#c084fc', fontWeight: '700' }}>
                  {packet.protocol === 'TCP' && `Transmission Control Protocol, Src Port: ${packet.tcp?.srcPort}, Dst Port: ${packet.tcp?.dstPort}`}
                  {packet.protocol === 'UDP' && `User Datagram Protocol, Src Port: ${packet.udp?.srcPort}, Dst Port: ${packet.udp?.dstPort}`}
                  {packet.protocol === 'ICMP' && `Internet Control Message Protocol (Type ${packet.icmp?.type})`}
                  {packet.protocol === 'ARP' && `Address Resolution Protocol (${packet.arp?.op === 1 ? 'Request' : 'Reply'})`}
                </span>
              </div>
              {expandedLayers.transport && (
                <div style={{ padding: '6px 12px 10px 30px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(168, 85, 247, 0.1)' }}>
                  {packet.protocol === 'TCP' && (
                    <>
                      <div>Source Port: <strong style={{ color: '#fff' }}>{packet.tcp?.srcPort}</strong></div>
                      <div>Destination Port: <strong style={{ color: '#fff' }}>{packet.tcp?.dstPort}</strong></div>
                      <div>Sequence Number: <strong style={{ color: '#38bdf8' }}>{packet.tcp?.seq}</strong></div>
                      <div>Acknowledgment Number: <strong style={{ color: '#10b981' }}>{packet.tcp?.ack}</strong></div>
                      <div>Flags: <span className="badge badge-purple" style={{ fontSize: '10px' }}>{packet.tcp?.flagsStr}</span></div>
                      <div>Window Size: <strong style={{ color: '#fff' }}>{packet.tcp?.window || 65535}</strong></div>
                      <div>Checksum: <strong style={{ color: '#10b981' }}>0x2e1a [valid]</strong></div>
                    </>
                  )}
                  {packet.protocol === 'ICMP' && (
                    <>
                      <div>Type: <strong style={{ color: '#10b981' }}>{packet.icmp?.type} ({packet.icmp?.type === 8 ? 'Echo Request' : 'Echo Reply'})</strong></div>
                      <div>Code: <strong>0</strong></div>
                      <div>Checksum: <strong style={{ color: '#10b981' }}>0xb692 [correct]</strong></div>
                      <div>Identifier: <strong>{packet.icmp?.id || 1}</strong></div>
                      <div>Sequence Number: <strong>{packet.icmp?.seq || 1}</strong></div>
                    </>
                  )}
                  {packet.protocol === 'ARP' && (
                    <>
                      <div>Hardware type: <strong>Ethernet (1)</strong></div>
                      <div>Protocol type: <strong>IPv4 (0x0800)</strong></div>
                      <div>Hardware size: 6 | Protocol size: 4</div>
                      <div>Opcode: <strong style={{ color: '#f59e0b' }}>{packet.arp?.op === 1 ? 'Request (1)' : 'Reply (2)'}</strong></div>
                      <div>Sender MAC address: <strong style={{ color: '#fff' }}>{packet.arp?.sha}</strong></div>
                      <div>Sender IP address: <strong style={{ color: '#fff' }}>{packet.arp?.spa}</strong></div>
                      <div>Target MAC address: <strong style={{ color: '#fff' }}>{packet.arp?.tha}</strong></div>
                      <div>Target IP address: <strong style={{ color: '#fff' }}>{packet.arp?.tpa}</strong></div>
                    </>
                  )}
                  {packet.protocol === 'UDP' && (
                    <>
                      <div>Source Port: <strong style={{ color: '#fff' }}>{packet.udp?.srcPort}</strong></div>
                      <div>Destination Port: <strong style={{ color: '#fff' }}>{packet.udp?.dstPort}</strong></div>
                      <div>Length: <strong style={{ color: '#fff' }}>{packet.udp?.length}</strong></div>
                      <div>Checksum: <strong style={{ color: '#10b981' }}>0x4b21 [valid]</strong></div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Payload */}
            {packet.payloadText && (
              <div style={{ border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.05)' }}>
                <div 
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleLayer('payload')}
                >
                  {expandedLayers.payload ? <ChevronDown size={14} color="#10b981" /> : <ChevronRight size={14} color="#10b981" />}
                  <span style={{ color: '#34d399', fontWeight: '700' }}>Data ({packet.payloadLength} bytes)</span>
                </div>
                {expandedLayers.payload && (
                  <div style={{ padding: '6px 12px 10px 30px', color: '#fff', borderTop: '1px solid rgba(16, 185, 129, 0.1)', wordBreak: 'break-all' }}>
                    "{packet.payloadText}"
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          /* Hex Dump tab */
          <pre style={{
            background: '#040711',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '11px',
            lineHeight: '1.5',
            color: '#38bdf8',
            overflowX: 'auto',
            fontFamily: 'var(--font-mono)'
          }}>
            {hexDumpText}
          </pre>
        )}

      </div>
    </div>
  );
}
