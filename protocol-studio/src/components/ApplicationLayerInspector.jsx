import React, { useState } from 'react';
import { Globe, FileText, Send, CheckCircle2, Shield, Layout, Radio } from 'lucide-react';
import { HOST_DEVICE, SERVER_DEVICE } from '../engine/protocolEngine';

export default function ApplicationLayerInspector({ 
  lastHttpRequest, 
  lastHttpResponse, 
  onSendHttp, 
  onSendUdp,
  sessionInfo 
}) {
  const [activeTab, setActiveTab] = useState('http'); // 'http' | 'session' | 'udp'

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Title & Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={16} color="#10b981" />
          <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
            Module 6: Application Layer Protocols (HTTP & Client-Server)
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'rgba(7, 11, 20, 0.6)', padding: '2px', borderRadius: '6px' }}>
          <button
            className={`btn-ghost ${activeTab === 'http' ? 'active' : ''}`}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              borderRadius: '4px',
              cursor: 'pointer',
              background: activeTab === 'http' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activeTab === 'http' ? '#10b981' : 'var(--text-muted)',
              border: 'none'
            }}
            onClick={() => setActiveTab('http')}
          >
            HTTP / Web
          </button>
          <button
            className={`btn-ghost ${activeTab === 'session' ? 'active' : ''}`}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              borderRadius: '4px',
              cursor: 'pointer',
              background: activeTab === 'session' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activeTab === 'session' ? '#10b981' : 'var(--text-muted)',
              border: 'none'
            }}
            onClick={() => setActiveTab('session')}
          >
            Session Management
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {activeTab === 'http' && (
          <>
            {/* Quick HTTP Trigger */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                className="btn btn-emerald" 
                style={{ padding: '6px 12px', fontSize: '11px' }}
                onClick={() => onSendHttp('GET', '/index.html')}
              >
                <Send size={12} />
                <span>Send HTTP GET /index.html</span>
              </button>

              <button 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '11px' }}
                onClick={() => onSendHttp('POST', '/api/data')}
              >
                <span>HTTP POST /api/data</span>
              </button>
            </div>

            {/* HTTP Request & Response split view */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1 }}>
              
              {/* Request */}
              <div style={{
                background: 'rgba(7, 11, 20, 0.6)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '8px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={13} />
                  <span>HTTP Client Request (Port {SERVER_DEVICE.httpPort})</span>
                </div>
                <pre style={{
                  flex: 1,
                  background: '#040711',
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#e2e8f0',
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'pre-wrap',
                  overflowY: 'auto'
                }}>
                  {lastHttpRequest || `GET /index.html HTTP/1.1\r\nHost: 192.0.2.2\r\nUser-Agent: MicroPS-Client/1.0\r\nAccept: text/html\r\nConnection: keep-alive`}
                </pre>
              </div>

              {/* Response */}
              <div style={{
                background: 'rgba(7, 11, 20, 0.6)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} />
                  <span>HTTP Server Response (200 OK)</span>
                </div>
                <pre style={{
                  flex: 1,
                  background: '#040711',
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#10b981',
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'pre-wrap',
                  overflowY: 'auto'
                }}>
                  {lastHttpResponse || `HTTP/1.1 200 OK\r\nServer: MicroPS-Server/1.0\r\nContent-Type: text/html\r\nContent-Length: 68\r\n\r\n<h1>MicroPS Web Server</h1><p>Module 6: HTTP Active</p>`}
                </pre>
              </div>

            </div>
          </>
        )}

        {activeTab === 'session' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            
            <div style={{
              background: 'rgba(7, 11, 20, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <h4 style={{ fontSize: '12px', color: '#fff', fontWeight: '700', marginBottom: '8px' }}>
                Syllabus Topic: Session Management & Client-Server Socket Lifecycle
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Session ID:</span> <span style={{ color: '#38bdf8' }}>{sessionInfo?.id || 'SES-882419'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Socket Descriptor:</span> <span style={{ color: '#fff' }}>sock_id={sessionInfo?.sockId || 3}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Transport Protocol:</span> <span style={{ color: '#a855f7' }}>Module 5 TCP Stream (Proto 6)</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Session State:</span> <span style={{ color: '#10b981' }}>{sessionInfo?.state || 'ACTIVE (Keep-Alive)'}</span>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <strong style={{ color: '#10b981', fontSize: '12px' }}>How Session Management Works in Sockets:</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: '1.5', marginTop: '4px' }}>
                When an application calls <code>sock_open()</code> and <code>sock_connect()</code>, the stack assigns a unique session binding client endpoint <code>{HOST_DEVICE.ip}:{HOST_DEVICE.port}</code> to server endpoint <code>{SERVER_DEVICE.ip}:{SERVER_DEVICE.httpPort}</code>. State and flow control buffers remain persistent until <code>sock_close()</code> is called.
              </p>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
