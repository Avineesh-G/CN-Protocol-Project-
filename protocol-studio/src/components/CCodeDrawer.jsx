import React, { useState, useEffect } from 'react';
import { X, FileCode, Check, Copy, ExternalLink, Code2 } from 'lucide-react';
import { C_SNIPPETS } from '../data/cCodeSnippets';

export default function CCodeDrawer({ isOpen, onClose, initialKey = 'tcp_fsm' }) {
  const [selectedKey, setSelectedKey] = useState(initialKey);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialKey && C_SNIPPETS[initialKey]) {
      setSelectedKey(initialKey);
    }
  }, [initialKey, isOpen]);

  if (!isOpen) return null;

  const currentSnippet = C_SNIPPETS[selectedKey] || C_SNIPPETS.tcp_fsm;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(6px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        width: 'min(820px, 92vw)',
        height: '100%',
        background: '#0a0f1d',
        borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.8)'
      }}>
        
        {/* Drawer Header */}
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
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Code2 size={20} color="#38bdf8" />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>
                MicroPS C Codebase Inspector
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Real user-space protocol implementations from <strong style={{ color: '#38bdf8' }}>microps-master</strong>
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

        {/* Tab selection */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '10px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          overflowX: 'auto',
          background: 'rgba(7, 11, 20, 0.6)'
        }}>
          {Object.entries(C_SNIPPETS).map(([key, item]) => (
            <button
              key={key}
              className={`tab-btn ${selectedKey === key ? 'active' : ''}`}
              style={{ fontSize: '11px', padding: '6px 12px', whiteSpace: 'nowrap' }}
              onClick={() => setSelectedKey(key)}
            >
              <FileCode size={12} />
              <span>{item.filename}</span>
            </button>
          ))}
        </div>

        {/* Content body */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-purple">{currentSnippet.filename}</span>
                <span className="badge badge-blue">{currentSnippet.layer}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Lines {currentSnippet.lines}
                </span>
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '4px 10px', fontSize: '11px' }}
                onClick={handleCopy}
              >
                {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy C Code'}</span>
              </button>
            </div>

            <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '6px', fontWeight: '700' }}>
              {currentSnippet.title}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {currentSnippet.description}
            </p>
          </div>

          {/* C Code Box */}
          <pre style={{
            background: '#040711',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: '1.6',
            color: '#e2e8f0',
            overflowX: 'auto',
            boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.6)'
          }}>
            <code>{currentSnippet.code}</code>
          </pre>

          {/* Academic explanation card */}
          <div style={{
            marginTop: '16px',
            padding: '14px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)'
          }}>
            <h4 style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
              Implementation Insights in MicroPS:
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              This module operates entirely in user space. Rather than executing within the Linux kernel, it interfaces directly with network queues via the TUN/TAP device driver, enabling deterministic packet processing, zero kernel-space crash risks, and direct inspection of RFC protocols.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
