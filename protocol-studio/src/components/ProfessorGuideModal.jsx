import React, { useState } from 'react';
import { X, BookOpen, Award, CheckCircle2, HelpCircle, MessageSquareQuote, Cpu, Layers } from 'lucide-react';

export default function ProfessorGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('script'); // 'script' | 'viva' | 'architecture'

  if (!isOpen) return null;

  const presentationSteps = [
    {
      step: '1. The Core Motivation & User-Space Architecture (2 mins)',
      quote: '"Most developers use socket libraries without knowing how the OS kernel processes network packets. In this project, we explored and demonstrated a custom user-space TCP/IP protocol stack called MicroPS written in C, coupled with an interactive protocol engine to inspect every layer."',
      demo: 'Show the Branching Tree Workflow Station: explain the Root Architecture, net0 (Null), net1 (Loopback 127.0.0.1), and net2 (Linux TAP virtual Ethernet adapter 192.0.2.2). Emphasize that all protocol state machines run entirely in user space without kernel networking overhead.'
    },
    {
      step: '2. Layer 2 & 3 — ARP Resolution & ICMP Ping (2 mins)',
      quote: '"Before Host A can send an IP packet to Host B (192.0.2.2), it has no MAC address. It must initiate an ARP broadcast (ff:ff:ff:ff:ff:ff). When MicroPS receives it, arp_cache_insert() records Host A, and arp_reply() transmits the unicast response."',
      demo: 'Select "ARP Dynamic Address Resolution" on the branch tree. Click "▶ Run Protocol Animation" and watch the live C kernel logs stream into the terminal beside. Then select "ICMP Diagnostic Echo Ping" to demonstrate IPv4 routing lookup (ip_route_lookup) and 16-bit one\'s complement checksum validation.'
    },
    {
      step: '3. Layer 4 — TCP 11-State FSM & Flow Control (3 mins)',
      quote: '"MicroPS implements a complete RFC 793 TCP finite state machine with Transmission Control Blocks (TCB). Let us trace a 3-way handshake from scratch: SYN -> SYN-ACK -> ACK."',
      demo: 'Select "TCP 3-Way Handshake & TCB State". Watch the state transition from CLOSED/LISTEN to SYN_SENT -> SYN_RECEIVED -> ESTABLISHED. Point to TCB variables (snd_nxt, rcv_nxt, snd_wnd). Demonstrate Sliding Window Flow Control by selecting "Sliding Window Flow Control Pacing" and showing how receiver advertised buffer limits sender transmission rate.'
    },
    {
      step: '4. BSD Socket Abstraction & Web Application (2 mins)',
      quote: '"To allow applications like tcps and udps to interact with our custom stack without kernel drivers, MicroPS provides a BSD-compatible user-space socket layer (sock.c). We can run a full HTTP web server directly on top of it."',
      demo: 'Select "HTTP/1.1 Web Server & BSD Sockets". Show how sock_accept() receives the connection, sock_recv() extracts GET /index.html, and sock_send() transmits HTTP/1.1 200 OK. Open the C Source Drawer to show the exact C lines in app/tcps.c and sock.c.'
    }
  ];

  const vivaQuestions = [
    {
      q: 'Why implement a TCP/IP stack in User Space instead of using the OS Kernel?',
      a: 'The OS kernel network stack is a black box that operates in privileged kernel mode (Ring 0). User-space stacks (like DPDK or MicroPS): 1) Eliminate expensive user-to-kernel context switches, 2) Prevent system-wide OS crashes if a network bug occurs, 3) Enable custom protocol optimization for high-frequency trading or embedded devices, and 4) Provide 100% observability into packet parsing and state machines.'
    },
    {
      q: 'How does MicroPS interact with physical or virtual network interfaces?',
      a: 'MicroPS uses the Linux TUN/TAP driver interface (driver/ether_tap_linux.c). By opening /dev/net/tun with the IFF_TAP flag, the Linux kernel passes raw Layer 2 Ethernet frames directly into our user-space process file descriptor, which net_thread polls and passes to ether_input().'
    },
    {
      q: 'Explain the RFC 793 TCP 3-Way Handshake and the Transmission Control Block (TCB).',
      a: '1) Client sends SYN with Initial Sequence Number (ISN=1000). State -> SYN_SENT.\n2) Server receives SYN, allocates TCB, records rcv.nxt = 1001, picks its own ISN=2000, and replies with SYN-ACK (Seq=2000, Ack=1001). State -> SYN_RECEIVED.\n3) Client acknowledges with ACK (Seq=1001, Ack=2001). Both transition to ESTABLISHED.\nThe TCB tracks snd_una, snd_nxt, snd_wnd, rcv_nxt, and MSS to ensure reliability and flow control.'
    },
    {
      q: 'What is Flow Control and how is it implemented in MicroPS (tcp.c)?',
      a: 'Flow Control prevents a fast sender from overflowing a slow receiver buffer. In MicroPS (tcp_window_available), the sender calculates usable window = (snd.una + snd.wnd) - snd.nxt. If bytes in flight equal the receiver advertised window (snd.wnd), transmission pauses until an ACK frees buffer space.'
    },
    {
      q: 'What is the role of ARP (RFC 826) and how does MicroPS manage the ARP cache?',
      a: 'IPv4 operates on logical IP addresses, but physical Ethernet networks require 48-bit MAC addresses. ARP sends a broadcast query (Opcode 1) asking "Who has IP X?". The owner replies unicast (Opcode 2). MicroPS (arp.c) stores resolved IP-to-MAC mappings in struct arp_cache entries with a 30-second TTL timer, decaying old entries automatically.'
    },
    {
      q: 'How does the BSD Socket Layer (sock.c) bridge applications to the stack?',
      a: 'Standard C network programs call socket functions like socket(), bind(), connect(). In MicroPS, sock.c implements sock_open(), sock_bind(), sock_connect(), etc. It maintains an array of struct sock descriptors, mapping standard file descriptor numbers (e.g. fd=3) to the corresponding TCP PCB or UDP PCB.'
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(8px)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: 'min(860px, 95vw)',
        maxHeight: '90vh',
        background: '#0d1527',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
        overflow: 'hidden'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.7)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={20} color="#f59e0b" />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#fff' }}>
                MicroPS Presentation & Viva Defense Guide
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Step-by-step presentation walkthrough, questions & architecture defense
              </p>
            </div>
          </div>
          
          <button 
            className="btn-ghost" 
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(7, 11, 20, 0.5)'
        }}>
          <button
            className={`tab-btn ${activeTab === 'script' ? 'active' : ''}`}
            onClick={() => setActiveTab('script')}
          >
            <BookOpen size={14} />
            <span>4-Step Presentation Walkthrough</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'viva' ? 'active' : ''}`}
            onClick={() => setActiveTab('viva')}
          >
            <HelpCircle size={14} />
            <span>Professor Viva Defense (Q&A)</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'architecture' ? 'active' : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            <Cpu size={14} />
            <span>User-Space Architecture Highlights</span>
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          
          {/* Tab 1: Script */}
          {activeTab === 'script' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.25)', fontSize: '12px', color: '#e2e8f0' }}>
                <strong style={{ color: '#38bdf8' }}>Presentation Tip:</strong> Follow this structured 4-step sequence during your demonstration. Run the corresponding branch animation on the station as you explain each concept.
              </div>

              {presentationSteps.map((step, idx) => (
                <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                    {step.step}
                  </h3>
                  <div style={{ background: 'rgba(7, 11, 20, 0.6)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #38bdf8', marginBottom: '10px' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#38bdf8', fontWeight: '700', marginBottom: '3px' }}>
                      What to say to the Professor:
                    </div>
                    <div style={{ fontSize: '12px', color: '#e2e8f0', fontStyle: 'italic', lineHeight: '1.5' }}>
                      {step.quote}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: '#10b981' }}>Live Action on Studio:</strong> {step.demo}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Viva Q&A */}
          {activeTab === 'viva' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {vivaQuestions.map((q, idx) => (
                <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge badge-purple" style={{ fontSize: '10px', flexShrink: 0 }}>Q{idx + 1}</span>
                    <strong style={{ fontSize: '13px', color: '#fff' }}>{q.q}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.55', whiteSpace: 'pre-line', paddingLeft: '28px' }}>
                    {q.a}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Architecture Highlights */}
          {activeTab === 'architecture' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>
                  User-Space vs Kernel-Space Networking Stack
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
                  Traditional operating systems (Linux, Windows) process networking entirely inside kernel space. While efficient for standard usage, kernel-space stacks are:
                </p>
                <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.6' }}>
                  <li><strong style={{ color: '#fff' }}>Opaque:</strong> Internal TCP states, packet queues, and ARP caches cannot be directly inspected or customized by user applications.</li>
                  <li><strong style={{ color: '#fff' }}>Context Switch Overhead:</strong> Every socket read/write triggers an expensive context switch between user and kernel space.</li>
                  <li><strong style={{ color: '#fff' }}>Crash Vulnerability:</strong> A bug in a kernel networking driver crashes the entire operating system (kernel panic / BSOD).</li>
                </ul>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>
                  How MicroPS Bridges to Physical Ethernet
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
                  MicroPS uses the Linux TUN/TAP driver interface. The kernel virtual network adapter (<code style={{ color: '#38bdf8' }}>net2</code> TAP) redirects Layer 2 Ethernet frames directly into user-space via a file descriptor. MicroPS runs a dedicated POSIX thread (<code style={{ color: '#38bdf8' }}>net_thread</code> in <code style={{ color: '#38bdf8' }}>net.c</code>) that polls the virtual device, demultiplexes frames via <code style={{ color: '#f59e0b' }}>ether.c</code>, and dispatches them up through <code style={{ color: '#06b6d4' }}>ip.c</code> and <code style={{ color: '#a855f7' }}>tcp.c</code>.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
