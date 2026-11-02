import React from 'react';
import { 
  Network, 
  Cpu, 
  BookOpen, 
  RefreshCw, 
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';

export default function Header({ 
  onReset, 
  onOpenCodeDrawer, 
  onOpenVivaModal,
  isProcessing 
}) {
  return (
    <header className="glass-panel" style={{ padding: '16px 22px', margin: '16px 16px 0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Logo and System Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(79, 70, 229, 0.45)'
          }}>
            <Network size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '19px', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
                MicroPS <span style={{ color: '#38bdf8' }}>Protocol Studio</span>
              </h1>
              <span className="badge badge-purple">User-Space TCP/IP in C</span>
              <span className="badge badge-emerald">RFC-Compliant</span>
              <span className="badge badge-blue">Linux TAP Virtual Ethernet</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
              Computer Networks Lab: Mindmap Branching Station • Real-World Project Applications • Live Terminal Output
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onReset}
            disabled={isProcessing}
            title="Reset Protocol State & Sockets"
          >
            <RefreshCw size={14} />
            <span>Reset Stack</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={() => onOpenCodeDrawer('tcp_fsm')}
            title="Inspect user-space C implementations in microps-master"
          >
            <Cpu size={14} color="#38bdf8" />
            <span>C Source Inspector</span>
          </button>

          <button 
            className="btn btn-primary" 
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
            onClick={onOpenVivaModal}
            title="Professor presentation walkthrough, questions & architecture defense"
          >
            <BookOpen size={14} />
            <span>Viva / Defense Guide</span>
          </button>
        </div>

      </div>
    </header>
  );
}
