import React from 'react';
import { Laptop, Server, Network, Activity, ArrowRightLeft, Sliders, ShieldCheck, Zap, GitBranch } from 'lucide-react';
import { HOST_DEVICE, SERVER_DEVICE, GATEWAY_DEVICE } from '../engine/protocolEngine';

export default function TopologyBar({ stats, activePacket, currentProtocol, currentWindow, devicesCount = 3 }) {
  return (
    <div className="glass-panel" style={{ padding: '16px 20px', margin: '14px 16px 0 16px' }}>
      
      {/* Top status bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Network size={16} color="#38bdf8" />
          <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Network Topology & Virtual Device Bus
          </span>
          <span className="badge badge-emerald" style={{ fontSize: '10px' }}>
            {devicesCount} Virtual Adapters (net0, net1, net2)
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="badge badge-purple" style={{ textTransform: 'none' }}>
              Active: {currentProtocol || 'TCP Connection-Oriented'}
            </span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={14} color="#06b6d4" />
            Window (snd_wnd): <strong style={{ color: '#06b6d4' }}>{currentWindow || 65535} B</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} color="#38bdf8" />
            Total Traffic: <strong style={{ color: '#fff' }}>{stats.txPackets + stats.rxPackets}</strong> frames
          </span>
        </div>
      </div>

      {/* 3-Node Topology Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(240px, 1.2fr) auto minmax(180px, 0.9fr) auto minmax(260px, 1.3fr)',
        gap: '12px',
        alignItems: 'center'
      }}>
        
        {/* Node 1: Virtual Host A */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '10px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Laptop size={20} color="#38bdf8" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '12px', color: '#fff' }}>Host A (Client Node)</strong>
              <span className="badge badge-blue" style={{ fontSize: '9px' }}>vhost0</span>
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '3px' }}>
              IP: <span style={{ color: '#38bdf8' }}>{HOST_DEVICE.ip}</span> | Port: <span style={{ color: '#f59e0b' }}>{HOST_DEVICE.port}</span>
            </div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px' }}>
              MAC: {HOST_DEVICE.mac}
            </div>
          </div>
        </div>

        {/* Link 1 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowRightLeft size={16} color="var(--border-glow)" />
        </div>

        {/* Node 2: Virtual Switch & Gateway */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <GitBranch size={18} color="#94a3b8" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '12px', color: '#fff' }}>Virtual Switch</strong>
              <span className="badge badge-purple" style={{ fontSize: '9px' }}>br0</span>
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '3px' }}>
              GW: <span style={{ color: '#94a3b8' }}>{GATEWAY_DEVICE.ip}</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              L2 Hub & Forwarding
            </div>
          </div>
        </div>

        {/* Link 2 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowRightLeft size={16} color="var(--border-glow)" />
        </div>

        {/* Node 3: MicroPS Host B */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '10px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Server size={20} color="#10b981" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '12px', color: '#fff' }}>MicroPS Host B (C Stack)</strong>
              <span className="badge badge-emerald" style={{ fontSize: '9px' }}>net2 TAP</span>
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '3px' }}>
              IP: <span style={{ color: '#10b981' }}>{SERVER_DEVICE.ip}</span> | Ports: <span style={{ color: '#06b6d4' }}>80 (HTTP)</span>, <span style={{ color: '#f59e0b' }}>7 (Echo)</span>
            </div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px' }}>
              MAC: {SERVER_DEVICE.mac} (User-Space)
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
