import React, { useState } from 'react';
import { Table, Compass, RefreshCw, Trash2, ArrowRight } from 'lucide-react';
import { INITIAL_ROUTES } from '../engine/protocolEngine';

export default function ArpAndRoutingTable({ arpCache, onClearArp }) {
  const [activeTab, setActiveTab] = useState('arp'); // 'arp' | 'routes'

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Tab bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`tab-btn ${activeTab === 'arp' ? 'active' : ''}`}
            onClick={() => setActiveTab('arp')}
          >
            <Table size={14} />
            <span>ARP Cache ({arpCache.length})</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
            onClick={() => setActiveTab('routes')}
          >
            <Compass size={14} />
            <span>IPv4 Routing Table</span>
          </button>
        </div>

        {activeTab === 'arp' && (
          <button 
            className="btn btn-ghost" 
            style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--accent-rose)' }}
            onClick={onClearArp}
            title="Flush ARP Cache"
          >
            <Trash2 size={12} />
            <span>Flush Cache</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'arp' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px' }}>Protocol IP</th>
                <th style={{ padding: '6px 8px' }}>Hardware MAC</th>
                <th style={{ padding: '6px 8px' }}>Device</th>
                <th style={{ padding: '6px 8px' }}>State</th>
                <th style={{ padding: '6px 8px' }}>TTL</th>
              </tr>
            </thead>
            <tbody>
              {arpCache.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    ARP Cache is empty. Click "ARP Resolve" to broadcast and populate.
                  </td>
                </tr>
              ) : (
                arpCache.map((entry, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                    <td style={{ padding: '8px', color: '#38bdf8' }}>{entry.ip}</td>
                    <td style={{ padding: '8px', color: '#fff' }}>{entry.mac}</td>
                    <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{entry.dev || 'net2'}</td>
                    <td style={{ padding: '8px' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '9px' }}>
                        {entry.state || 'RESOLVED'}
                      </span>
                    </td>
                    <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{entry.ttl}s</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px' }}>Destination Network</th>
                <th style={{ padding: '6px 8px' }}>Netmask</th>
                <th style={{ padding: '6px 8px' }}>Next Hop</th>
                <th style={{ padding: '6px 8px' }}>Interface</th>
                <th style={{ padding: '6px 8px' }}>Device</th>
              </tr>
            </thead>
            <tbody>
              {INITIAL_ROUTES.map((route, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '8px', color: '#10b981' }}>{route.network}</td>
                  <td style={{ padding: '8px', color: '#94a3b8' }}>{route.netmask}</td>
                  <td style={{ padding: '8px', color: route.nexthop === '0.0.0.0' ? 'var(--text-muted)' : '#38bdf8' }}>
                    {route.nexthop === '0.0.0.0' ? 'Direct (Link)' : route.nexthop}
                  </td>
                  <td style={{ padding: '8px', color: '#fff' }}>{route.iface}</td>
                  <td style={{ padding: '8px', color: '#f59e0b' }}>{route.dev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
