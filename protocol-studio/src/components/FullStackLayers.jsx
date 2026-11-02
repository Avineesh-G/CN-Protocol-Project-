import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Network, 
  Share2, 
  Radio, 
  Server, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown, 
  Play, 
  Trash2, 
  Sliders, 
  Globe,
  Database,
  ArrowRight
} from 'lucide-react';

export default function FullStackLayers({
  activeLayer,
  onSelectLayer,
  devices,
  arpCache,
  onClearArp,
  onResolveArp,
  routes,
  serverState,
  clientState,
  tcb,
  currentWindow,
  socketTable,
  onTriggerAction,
  onOpenCode
}) {
  const [expandedLayer, setExpandedLayer] = useState(activeLayer || 'L4');

  const layers = [
    {
      id: 'L1',
      num: 'Layer 1 & Driver',
      name: 'Physical & Interface Abstraction',
      module: 'net.c & driver/ether_tap_linux.c',
      color: '#6366f1', // Indigo
      badge: 'Hardware Abstraction',
      rfc: 'Linux TUN/TAP IFF_TAP',
      tagline: 'Multi-device registration, background worker thread (net_thread), and packet input queues.',
      stats: '3 Devices Up • Thread Active'
    },
    {
      id: 'L2',
      num: 'Layer 2',
      name: 'Data Link Layer (Ethernet & ARP)',
      module: 'ether.c & arp.c',
      color: '#f59e0b', // Amber
      badge: 'RFC 826 & RFC 894',
      rfc: 'Ethernet II 14B • ARP Cache',
      tagline: '14-byte MAC framing, EtherType demux (0x0800 IPv4, 0x0806 ARP), and dynamic ARP resolution table.',
      stats: `${arpCache.length} ARP Entries • Unicast/Broadcast`
    },
    {
      id: 'L3',
      num: 'Layer 3',
      name: 'Network Layer (IPv4 & ICMP)',
      module: 'ip.c & icmp.c',
      color: '#06b6d4', // Cyan
      badge: 'RFC 791 & RFC 792',
      rfc: 'IPv4 20B Header • ICMP Echo Ping',
      tagline: 'Longest-prefix route lookup, 16-bit 1\'s complement checksum, and ICMP Ping echo processing.',
      stats: `${routes.length} Active Routes • Ping Engine Ready`
    },
    {
      id: 'L4',
      num: 'Layer 4',
      name: 'Transport Layer (TCP & UDP)',
      module: 'tcp.c & udp.c',
      color: '#a855f7', // Purple
      badge: 'RFC 793 & RFC 768',
      rfc: '11-State TCP FSM • Sliding Window',
      tagline: 'Connection-oriented 3-way handshake, sequence/ACK arithmetic, sliding window flow control, and connectionless UDP.',
      stats: `TCP: ${serverState} • Win: ${currentWindow} B`
    },
    {
      id: 'L_SOCK',
      num: 'Socket API',
      name: 'BSD User-Space Socket Interface',
      module: 'sock.c & sock.h',
      color: '#38bdf8', // Sky Blue
      badge: 'BSD Socket API',
      rfc: 'sock_open / sock_bind / sock_listen',
      tagline: 'User-space socket descriptors mapping application calls directly to underlying TCP/UDP protocol control blocks.',
      stats: `${socketTable.length} Descriptors Allocated`
    },
    {
      id: 'L_APP',
      num: 'Layer 5 / App',
      name: 'Application Layer Services',
      module: 'app/tcps.c & app/udps.c',
      color: '#10b981', // Emerald
      badge: 'HTTP/1.1 & Echo',
      rfc: 'Port 80 (HTTP) • Port 7 (Echo) • Port 53 (DNS)',
      tagline: 'Full-duplex application clients and servers communicating over our custom user-space networking stack.',
      stats: 'HTTP Web Server Active'
    }
  ];

  const handleToggle = (id) => {
    setExpandedLayer(expandedLayer === id ? null : id);
    if (onSelectLayer) onSelectLayer(id);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', margin: '14px 16px 0 16px' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Layers size={18} color="#fff" />
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', letterSpacing: '-0.01em' }}>
              Redesigned Full-Stack Architecture Visualizer
            </h2>
            <span className="badge badge-purple" style={{ fontSize: '10px' }}>
              Full L1-L5 OSI / TCP-IP User-Space Stack
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Explore every layer implemented in <strong style={{ color: '#38bdf8' }}>microps-master</strong>. Click any layer card to inspect active runtime tables, data structures, and execute layer-specific tests.
          </p>
        </div>

        {/* Global Stack Summary Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            style={{ fontSize: '11px', padding: '6px 12px' }}
            onClick={() => onOpenCode('net_core')}
          >
            <Cpu size={13} color="#6366f1" />
            <span>Inspect C Headers</span>
          </button>
        </div>
      </div>

      {/* Layer Stack Accordion / Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {layers.map(layer => {
          const isExpanded = expandedLayer === layer.id;
          return (
            <div 
              key={layer.id} 
              style={{
                background: isExpanded ? 'rgba(15, 23, 42, 0.85)' : 'rgba(15, 23, 42, 0.5)',
                border: `1px solid ${isExpanded ? layer.color : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '10px',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                boxShadow: isExpanded ? `0 0 16px ${layer.color}22` : 'none'
              }}
            >
              {/* Header Bar */}
              <div 
                onClick={() => handleToggle(layer.id)}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                  background: isExpanded ? `linear-gradient(90deg, ${layer.color}15 0%, transparent 100%)` : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: `${layer.color}22`,
                    border: `1px solid ${layer.color}66`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '11px',
                    color: layer.color
                  }}>
                    {layer.id.replace('L_', '')}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#fff' }}>{layer.num}: {layer.name}</strong>
                      <span className="badge" style={{ background: `${layer.color}22`, color: layer.color, border: `1px solid ${layer.color}44`, fontSize: '10px' }}>
                        {layer.module}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {layer.tagline}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right', display: 'none', sm: 'block' }}>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: layer.color, fontWeight: '600' }}>
                      {layer.stats}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {layer.rfc}
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown size={18} color={layer.color} /> : <ChevronRight size={18} color="var(--text-muted)" />}
                </div>
              </div>

              {/* Expanded Content View */}
              {isExpanded && (
                <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(7, 11, 20, 0.4)' }}>
                  
                  {/* Layer 1 / Driver Content */}
                  {layer.id === 'L1' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                          Registered Net Devices (<code style={{ color: '#6366f1' }}>struct net_device</code>) in net.c
                        </span>
                        <button 
                          className="btn btn-ghost" 
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                          onClick={() => onOpenCode('net_core')}
                        >
                          <Cpu size={12} /> View net.c Source
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                        {devices.map(dev => (
                          <div key={dev.name} style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <strong style={{ color: '#fff', fontSize: '13px' }}>{dev.name} ({dev.type})</strong>
                              <span className="badge badge-emerald" style={{ fontSize: '9px' }}>{dev.state}</span>
                            </div>
                            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '6px' }}>
                              Driver: <span style={{ color: '#6366f1' }}>{dev.driver}</span><br />
                              IP: <span style={{ color: '#38bdf8' }}>{dev.ip}</span> | MTU: <span style={{ color: '#fff' }}>{dev.mtu} B</span><br />
                              MAC: <span style={{ color: '#f59e0b' }}>{dev.mac}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Layer 2 Content: Dynamic ARP Cache */}
                  {layer.id === 'L2' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                            Dynamic ARP Cache Table (<code style={{ color: '#f59e0b' }}>struct arp_cache</code> in arp.c)
                          </span>
                          <span className="badge badge-amber">{arpCache.length} Entries</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-amber" 
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                            onClick={onResolveArp}
                          >
                            <Play size={12} /> Broadcast ARP Request (ff:ff:ff:ff:ff:ff)
                          </button>
                          <button 
                            className="btn btn-ghost" 
                            style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--accent-rose)' }}
                            onClick={onClearArp}
                          >
                            <Trash2 size={12} /> Flush Cache
                          </button>
                          <button 
                            className="btn btn-ghost" 
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                            onClick={() => onOpenCode('arp_protocol')}
                          >
                            <Cpu size={12} /> arp.c Code
                          </button>
                        </div>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', textAlign: 'left' }}>
                              <th style={{ padding: '6px 8px' }}>IP Address (pa)</th>
                              <th style={{ padding: '6px 8px' }}>Hardware MAC (ha)</th>
                              <th style={{ padding: '6px 8px' }}>Device</th>
                              <th style={{ padding: '6px 8px' }}>State</th>
                              <th style={{ padding: '6px 8px' }}>TTL Decay</th>
                            </tr>
                          </thead>
                          <tbody>
                            {arpCache.map((entry, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                <td style={{ padding: '8px', color: '#38bdf8' }}>{entry.ip}</td>
                                <td style={{ padding: '8px', color: '#fff' }}>{entry.mac}</td>
                                <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{entry.dev}</td>
                                <td style={{ padding: '8px' }}>
                                  <span className="badge badge-emerald" style={{ fontSize: '9px' }}>{entry.state}</span>
                                </td>
                                <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{entry.ttl}s</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Layer 3 Content: IPv4 Routing Table & ICMP Ping */}
                  {layer.id === 'L3' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                          IPv4 Routing Table (<code style={{ color: '#06b6d4' }}>struct ip_route</code> in ip.c) & ICMP Ping
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-cyan" 
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                            onClick={() => onTriggerAction('icmp_ping')}
                          >
                            <Play size={12} /> Send ICMP Ping (Echo Type 8)
                          </button>
                          <button 
                            className="btn btn-ghost" 
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                            onClick={() => onOpenCode('ip_routing')}
                          >
                            <Cpu size={12} /> ip.c Code
                          </button>
                          <button 
                            className="btn btn-ghost" 
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                            onClick={() => onOpenCode('icmp_ping')}
                          >
                            <Cpu size={12} /> icmp.c Code
                          </button>
                        </div>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', textAlign: 'left' }}>
                              <th style={{ padding: '6px 8px' }}>Destination Subnet</th>
                              <th style={{ padding: '6px 8px' }}>Subnet Mask</th>
                              <th style={{ padding: '6px 8px' }}>Next Hop</th>
                              <th style={{ padding: '6px 8px' }}>Interface IP</th>
                              <th style={{ padding: '6px 8px' }}>Device</th>
                              <th style={{ padding: '6px 8px' }}>Route Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {routes.map((r, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                <td style={{ padding: '8px', color: '#10b981' }}>{r.network}</td>
                                <td style={{ padding: '8px', color: '#94a3b8' }}>{r.netmask}</td>
                                <td style={{ padding: '8px', color: r.nexthop === '0.0.0.0' ? 'var(--text-muted)' : '#38bdf8' }}>
                                  {r.nexthop === '0.0.0.0' ? 'Direct (On-link)' : r.nexthop}
                                </td>
                                <td style={{ padding: '8px', color: '#fff' }}>{r.iface}</td>
                                <td style={{ padding: '8px', color: '#06b6d4' }}>{r.dev}</td>
                                <td style={{ padding: '8px' }}>
                                  <span className="badge badge-blue" style={{ fontSize: '9px' }}>{r.type}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Layer 4 Content: TCP FSM & Flow Control & UDP */}
                  {layer.id === 'L4' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                          Transmission Control Block (<code style={{ color: '#a855f7' }}>struct tcp_cb</code> in tcp.c) & Sliding Window
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-purple" 
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                            onClick={() => onTriggerAction('tcp_handshake')}
                          >
                            <Play size={12} /> 3-Way Handshake
                          </button>
                          <button 
                            className="btn btn-ghost" 
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                            onClick={() => onTriggerAction('udp_service')}
                          >
                            <Radio size={12} color="#06b6d4" /> UDP Datagram
                          </button>
                          <button 
                            className="btn btn-ghost" 
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                            onClick={() => onOpenCode('tcp_fsm')}
                          >
                            <Cpu size={12} /> tcp.c FSM Code
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '8px' }}>
                        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Server TCP State</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#c084fc', marginTop: '2px' }}>{serverState}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Port 80 (HTTP) Listening</div>
                        </div>

                        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Client TCP State</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#38bdf8', marginTop: '2px' }}>{clientState}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Port 52140 Ephemeral</div>
                        </div>

                        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Advertised Window (snd_wnd)</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#10b981', marginTop: '2px' }}>{currentWindow} Bytes</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Flow Control Buffer</div>
                        </div>

                        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TCB Sequence / Ack</div>
                          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#fff', marginTop: '2px' }}>
                            SND.NXT: <span style={{ color: '#f59e0b' }}>{tcb.snd_nxt}</span> | RCV.NXT: <span style={{ color: '#38bdf8' }}>{tcb.rcv_nxt}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MSS: {tcb.mss} Bytes</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Socket Layer Content */}
                  {layer.id === 'L_SOCK' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                          Active BSD Socket Descriptor Table (<code style={{ color: '#38bdf8' }}>struct sock</code> in sock.c)
                        </span>
                        <button 
                          className="btn btn-ghost" 
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                          onClick={() => onOpenCode('sock_layer')}
                        >
                          <Cpu size={12} /> sock.c Code
                        </button>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', textAlign: 'left' }}>
                              <th style={{ padding: '6px 8px' }}>Descriptor (FD)</th>
                              <th style={{ padding: '6px 8px' }}>Domain</th>
                              <th style={{ padding: '6px 8px' }}>Type</th>
                              <th style={{ padding: '6px 8px' }}>Protocol</th>
                              <th style={{ padding: '6px 8px' }}>Local Endpoint</th>
                              <th style={{ padding: '6px 8px' }}>State</th>
                              <th style={{ padding: '6px 8px' }}>Application Binding</th>
                            </tr>
                          </thead>
                          <tbody>
                            {socketTable.map(s => (
                              <tr key={s.fd} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                <td style={{ padding: '8px', color: '#f59e0b', fontWeight: '700' }}>#{s.fd}</td>
                                <td style={{ padding: '8px', color: '#fff' }}>{s.family}</td>
                                <td style={{ padding: '8px', color: '#38bdf8' }}>{s.type}</td>
                                <td style={{ padding: '8px', color: '#a855f7' }}>{s.proto}</td>
                                <td style={{ padding: '8px', color: '#10b981' }}>{s.local}</td>
                                <td style={{ padding: '8px' }}>
                                  <span className="badge badge-emerald" style={{ fontSize: '9px' }}>{s.state}</span>
                                </td>
                                <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{s.app}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Application Layer Content */}
                  {layer.id === 'L_APP' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                          Application Layer Services & HTTP Engine (<code style={{ color: '#10b981' }}>app/tcps.c</code>)
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-emerald" 
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                            onClick={() => onTriggerAction('http_request')}
                          >
                            <Globe size={12} /> Send HTTP GET /index.html
                          </button>
                          <button 
                            className="btn btn-ghost" 
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                            onClick={() => onOpenCode('app_server')}
                          >
                            <Cpu size={12} /> app/tcps.c Code
                          </button>
                        </div>
                      </div>

                      <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Globe size={20} color="#10b981" />
                          <div>
                            <strong style={{ fontSize: '13px', color: '#fff' }}>MicroPS User-Space HTTP/1.1 Web Server</strong>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              Runs in user-space C on Port 80, reading requests via <code style={{ color: '#38bdf8' }}>sock_recv()</code> and sending responses via <code style={{ color: '#38bdf8' }}>sock_send()</code>.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
