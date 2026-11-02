import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BranchingTreeWorkflowStation from './components/BranchingTreeWorkflowStation';
import PacketDissector from './components/PacketDissector';
import CCodeDrawer from './components/CCodeDrawer';
import ProfessorGuideModal from './components/ProfessorGuideModal';

import {
  HOST_DEVICE,
  SERVER_DEVICE,
  buildEthernetFrame,
  buildIpPacket,
  buildTcpSegment
} from './engine/protocolEngine';

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPacketDissector, setShowPacketDissector] = useState(false);

  // Guarantee that on refresh or initial load, the website always starts at the top showing the header
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    }
  }, []);

  // Modals & Code Inspector
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(false);
  const [activeCodeKey, setActiveCodeKey] = useState('tcp_fsm');
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);

  // Default active packet on wire for optional dissector
  const [activePacket, setActivePacket] = useState(() => {
    const initialSyn = buildTcpSegment(HOST_DEVICE.port, SERVER_DEVICE.httpPort, 1000, 0, 0x02, 65535);
    const initialIp = buildIpPacket(HOST_DEVICE.ip, SERVER_DEVICE.ip, 6, initialSyn);
    const initialFrame = buildEthernetFrame(SERVER_DEVICE.mac, HOST_DEVICE.mac, 0x0800, initialIp);
    return {
      protocol: 'TCP',
      summary: 'TCP [SYN] Port 52140 -> Port 80 (HTTP) on net2 TAP Adapter',
      length: initialFrame.length,
      direction: 'outbound',
      timestamp: '0.000 ms',
      rawBytes: initialFrame,
      ethernet: { srcMac: HOST_DEVICE.mac, dstMac: SERVER_DEVICE.mac, type: '0x0800 (IPv4)' },
      ip: { src: HOST_DEVICE.ip, dst: SERVER_DEVICE.ip, ttl: 64 },
      tcp: { srcPort: HOST_DEVICE.port, dstPort: SERVER_DEVICE.httpPort, seq: 1000, ack: 0, flagsStr: 'SYN (0x02)', window: 65535 },
      payloadText: '',
      payloadLength: 0
    };
  });

  // Open C Code drawer with specific key
  const handleOpenCode = (key = 'tcp_fsm') => {
    setActiveCodeKey(key);
    setIsCodeDrawerOpen(true);
  };

  // Reset Stack
  const handleReset = () => {
    setIsProcessing(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      
      {/* 1. Dark Theme Top Header */}
      <Header
        onReset={handleReset}
        onOpenCodeDrawer={(key) => handleOpenCode(key || 'tcp_fsm')}
        onOpenVivaModal={() => setIsVivaModalOpen(true)}
        isProcessing={isProcessing}
      />

      {/* 2. Primary Showcase: Branching Mindmap Tree Workflow Station (Matching User Reference Image) */}
      <main style={{ flex: '1 0 auto' }}>
        <BranchingTreeWorkflowStation
          onOpenCodeSnippet={handleOpenCode}
        />

        {/* Optional Secondary Drawer: Raw Packet Hex Dissector */}
        <div style={{ margin: '0 16px 24px 16px' }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-blue">Wireshark Dissector</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                Inspect Raw On-The-Wire Hex & Decoded Packet Headers
              </span>
            </div>

            <button
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '5px 12px' }}
              onClick={() => setShowPacketDissector(prev => !prev)}
            >
              {showPacketDissector ? 'Hide Dissector' : 'Show Packet Dissector'}
            </button>
          </div>

          {showPacketDissector && (
            <div style={{ marginTop: '12px' }}>
              <PacketDissector packet={activePacket} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(7, 11, 20, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        <div>
          <strong style={{ color: '#fff' }}>MicroPS Protocol Studio</strong> — User-Space TCP/IP Protocol Stack implemented in C with Linux TAP Virtual Ethernet.
        </div>
        <div style={{ display: 'flex', gap: '14px' }}>
          <span style={{ color: '#f59e0b' }}>RFC 826 (ARP)</span>
          <span style={{ color: '#06b6d4' }}>RFC 792 (ICMP)</span>
          <span style={{ color: '#a855f7' }}>RFC 793 (TCP)</span>
          <span style={{ color: '#818cf8' }}>RFC 768 (UDP)</span>
          <span style={{ color: '#10b981' }}>RFC 2616 (HTTP)</span>
        </div>
      </footer>

      {/* C Source Code Drawer */}
      <CCodeDrawer
        isOpen={isCodeDrawerOpen}
        onClose={() => setIsCodeDrawerOpen(false)}
        initialKey={activeCodeKey}
      />

      {/* Viva Exam Guide Modal */}
      <ProfessorGuideModal
        isOpen={isVivaModalOpen}
        onClose={() => setIsVivaModalOpen(false)}
      />

    </div>
  );
}
