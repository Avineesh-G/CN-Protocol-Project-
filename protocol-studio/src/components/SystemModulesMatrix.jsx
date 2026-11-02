import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  FileCode, 
  CheckCircle2, 
  ExternalLink, 
  Code2, 
  Network, 
  Terminal, 
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  Box
} from 'lucide-react';

export default function SystemModulesMatrix({ onOpenCodeSnippet }) {
  const [filterLayer, setFilterLayer] = useState('ALL');

  const modules = [
    {
      id: 'net_core',
      file: 'net.c & net.h',
      layer: 'Layer 1 & Driver Subsystem',
      layerGroup: 'L1',
      rfc: 'Hardware Abstraction',
      lines: '397 lines',
      color: '#6366f1',
      summary: 'Device registration, event-driven POSIX worker thread (net_thread), and protocol input queues.',
      structs: ['struct net_device', 'struct net_device_ops', 'struct net_protocol', 'struct net_timer'],
      functions: ['net_device_register()', 'net_protocol_register()', 'net_input_handler()', 'net_thread()', 'net_run()'],
      academicMerit: 'Decouples networking protocols from underlying physical hardware adapters, providing a unified driver interface.'
    },
    {
      id: 'ether_tap_driver',
      file: 'driver/ether_tap_linux.c',
      layer: 'Driver Layer (Linux Virtual Tap)',
      layerGroup: 'L1',
      rfc: 'Linux TUN/TAP Driver',
      lines: '210 lines',
      color: '#4f46e5',
      summary: 'Interacts with /dev/net/tun to transmit raw Ethernet II frames directly between host OS and user space.',
      structs: ['struct ether_tap', 'struct ifreq (TUNSETIFF)'],
      functions: ['ether_tap_init()', 'ether_tap_open()', 'ether_tap_transmit()', 'ether_tap_poll()'],
      academicMerit: 'Allows the user-space stack to communicate with real network interfaces without requiring kernel driver modifications.'
    },
    {
      id: 'ether_layer',
      file: 'ether.c & ether.h',
      layer: 'Layer 2 (Data Link)',
      layerGroup: 'L2',
      rfc: 'RFC 894 (Ethernet II)',
      lines: '175 lines',
      color: '#f59e0b',
      summary: '14-byte Ethernet framing, hardware MAC filtering (unicast vs broadcast ff:ff:ff:ff:ff:ff), and EtherType switching.',
      structs: ['struct ether_hdr', 'uint8_t ether_addr[6]'],
      functions: ['ether_input()', 'ether_output()', 'ether_poll_helper()', 'ether_addr_ntop()'],
      academicMerit: 'Encapsulates network payloads into standard physical frames and demultiplexes incoming frames to ARP or IP.'
    },
    {
      id: 'arp_protocol',
      file: 'arp.c & arp.h',
      layer: 'Layer 2/3 (Resolution)',
      layerGroup: 'L2',
      rfc: 'RFC 826 (ARP Protocol)',
      lines: '341 lines',
      color: '#d97706',
      summary: 'Dynamic IP-to-MAC address translation, broadcast ARP Requests, unicast ARP Replies, and ARP cache with TTL.',
      structs: ['struct arp_hdr', 'struct arp_ether', 'struct arp_cache [32]'],
      functions: ['arp_input()', 'arp_request()', 'arp_reply()', 'arp_resolve()', 'arp_cache_insert()', 'arp_timer()'],
      academicMerit: 'Eliminates manual MAC configuration by dynamically discovering network neighbors and caching addresses.'
    },
    {
      id: 'ip_routing',
      file: 'ip.c & ip.h',
      layer: 'Layer 3 (Network Layer)',
      layerGroup: 'L3',
      rfc: 'RFC 791 (IPv4)',
      lines: '497 lines',
      color: '#06b6d4',
      summary: '20-byte IPv4 packet validation, 16-bit 1\'s complement checksum, longest-prefix routing lookup, and fragmentation.',
      structs: ['struct ip_hdr', 'struct ip_route', 'struct ip_iface', 'struct ip_protocol'],
      functions: ['ip_input()', 'ip_output()', 'ip_route_add()', 'ip_route_lookup()', 'ip_calculate_checksum()'],
      academicMerit: 'Determines the next-hop interface and gateway for packets, enforcing TTL decrements and packet integrity.'
    },
    {
      id: 'icmp_ping',
      file: 'icmp.c & icmp.h',
      layer: 'Layer 3 (Diagnostics)',
      layerGroup: 'L3',
      rfc: 'RFC 792 (ICMP)',
      lines: '154 lines',
      color: '#0891b2',
      summary: 'Handles diagnostic Ping requests (Type 8 Echo Request) and responds with Type 0 Echo Replies for round-trip latency timing.',
      structs: ['struct icmp_hdr', 'struct icmp_echo'],
      functions: ['icmp_input()', 'icmp_output()', 'icmp_send_reply()'],
      academicMerit: 'Provides layer 3 fault diagnosis, path reachability verification, and network latency measurement.'
    },
    {
      id: 'tcp_fsm',
      file: 'tcp.c & tcp.h',
      layer: 'Layer 4 (Transport Layer)',
      layerGroup: 'L4',
      rfc: 'RFC 793 (TCP FSM)',
      lines: '1,248 lines',
      color: '#a855f7',
      summary: 'Full 11-State RFC 793 Finite State Machine, 3-Way Handshake, Sequence/ACK numbers, Sliding Window Flow Control, and Retransmission.',
      structs: ['struct tcp_hdr', 'struct tcp_cb (TCB)', 'struct tcp_segment', 'struct tcp_queue'],
      functions: ['tcp_open()', 'tcp_bind()', 'tcp_listen()', 'tcp_connect()', 'tcp_input_state()', 'tcp_output()', 'tcp_window_available()'],
      academicMerit: 'Transforms an unreliable, packet-based network into a reliable, in-order, flow-controlled, full-duplex byte stream.'
    },
    {
      id: 'udp_protocol',
      file: 'udp.c & udp.h',
      layer: 'Layer 4 (Transport Layer)',
      layerGroup: 'L4',
      rfc: 'RFC 768 (UDP)',
      lines: '298 lines',
      color: '#8b5cf6',
      summary: 'Lightweight, connectionless datagram delivery with port multiplexing and zero handshaking overhead.',
      structs: ['struct udp_hdr', 'struct udp_pcb'],
      functions: ['udp_open()', 'udp_bind()', 'udp_sendto()', 'udp_recvfrom()', 'udp_input()', 'udp_output()'],
      academicMerit: 'Enables high-performance, low-latency transmission for queries (DNS) and time-sensitive media.'
    },
    {
      id: 'sock_layer',
      file: 'sock.c & sock.h',
      layer: 'Socket API Subsystem',
      layerGroup: 'SOCK',
      rfc: 'BSD Socket API',
      lines: '214 lines',
      color: '#38bdf8',
      summary: 'Translates BSD-style socket system calls (sock_open, sock_bind, sock_listen, sock_accept, sock_send) to user-space TCP/UDP PCBs.',
      structs: ['struct sock', 'struct sockaddr_in', 'sock_table[128]'],
      functions: ['sock_open()', 'sock_close()', 'sock_bind()', 'sock_listen()', 'sock_accept()', 'sock_connect()', 'sock_send()', 'sock_recv()'],
      academicMerit: 'Exposes an industry-standard POSIX API interface so standard applications can seamlessly run on top of our custom stack.'
    },
    {
      id: 'app_server',
      file: 'app/tcps.c & app/udps.c',
      layer: 'Application Layer',
      layerGroup: 'APP',
      rfc: 'HTTP/1.1 & Echo',
      lines: '185 lines',
      color: '#10b981',
      summary: 'Complete web server application running on Port 80, parsing HTTP/1.1 requests and transmitting HTML responses.',
      structs: ['HTTP Request/Response Buffers', 'TCP Echo Socket Pair'],
      functions: ['main()', 'http_handle_request()', 'echo_worker()'],
      academicMerit: 'Validates real-world software compatibility by serving web pages completely over the custom user-space networking stack.'
    }
  ];

  const filtered = filterLayer === 'ALL' 
    ? modules 
    : modules.filter(m => m.layerGroup === filterLayer);

  return (
    <div className="glass-panel" style={{ padding: '20px', margin: '14px 16px 0 16px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Code2 size={18} color="#fff" />
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', letterSpacing: '-0.01em' }}>
              System & Modules Implementation Showcase
            </h2>
            <span className="badge badge-emerald" style={{ fontSize: '10px' }}>
              microps-master C Subsystems
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Comprehensive breakdown of the custom C networking modules implemented in the project. Click any card to inspect its exact C implementation and RFC standards.
          </p>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['ALL', 'L1', 'L2', 'L3', 'L4', 'SOCK', 'APP'].map(key => (
            <button
              key={key}
              onClick={() => setFilterLayer(key)}
              style={{
                background: filterLayer === key ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.4)',
                border: `1px solid ${filterLayer === key ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                color: filterLayer === key ? '#38bdf8' : 'var(--text-muted)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {key === 'ALL' ? 'All Modules (10)' : key}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Modules */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '14px'
      }}>
        {filtered.map(mod => (
          <div
            key={mod.id}
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            className="module-card-hover"
          >
            <div>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge" style={{ background: `${mod.color}22`, color: mod.color, border: `1px solid ${mod.color}55`, fontSize: '10px' }}>
                  {mod.layer}
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {mod.lines}
                </span>
              </div>

              {/* Title & File */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <FileCode size={16} color={mod.color} />
                <strong style={{ fontSize: '14px', color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {mod.file}
                </strong>
              </div>

              {/* RFC Badge */}
              <div style={{ fontSize: '11px', color: mod.color, fontWeight: '600', marginBottom: '8px' }}>
                {mod.rfc}
              </div>

              {/* Summary */}
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '12px' }}>
                {mod.summary}
              </p>

              {/* Core Structs */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>
                  Key Data Structures:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {mod.structs.map((s, idx) => (
                    <span 
                      key={idx}
                      style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: '#94a3b8'
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Functions */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>
                  Core Implemented Functions:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {mod.functions.map((f, idx) => (
                    <span 
                      key={idx}
                      style={{
                        background: `${mod.color}15`,
                        border: `1px solid ${mod.color}33`,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: mod.color
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Academic Merit */}
              <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '8px 10px', borderRadius: '6px', borderLeft: `3px solid ${mod.color}`, marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Academic & Systems Role:
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {mod.academicMerit}
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '12px', padding: '7px 12px', justifyContent: 'space-between' }}
              onClick={() => onOpenCodeSnippet(mod.id)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={13} color={mod.color} />
                <span>View Implemented C Code</span>
              </span>
              <ArrowRight size={13} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
