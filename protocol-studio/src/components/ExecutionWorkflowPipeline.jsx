import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  ArrowRight, 
  Zap, 
  Layers, 
  Activity, 
  Radio, 
  Globe, 
  Sliders, 
  ShieldCheck, 
  Terminal,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Trash2,
  Check,
  Binary,
  Server,
  BookOpen,
  Info,
  HelpCircle,
  Code2,
  Sparkles,
  ArrowDown
} from 'lucide-react';
import { WORKFLOWS } from '../data/workflowsData';

export default function ExecutionWorkflowPipeline({ 
  initialWorkflowId = 'tcp_handshake',
  onOpenCodeSnippet 
}) {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(initialWorkflowId);
  const [activeStepIndex, setActiveStepIndex] = useState(-1); // -1 = idle, 0..N-1 = current step, N = finished
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(800); // Step delay in ms
  const [stepTimings, setStepTimings] = useState({});
  const [terminalLogs, setTerminalLogs] = useState([]);
  const terminalEndRef = useRef(null);
  const timerRef = useRef(null);

  const currentWorkflow = WORKFLOWS[selectedWorkflowId] || WORKFLOWS.tcp_handshake;
  const totalNodes = currentWorkflow.nodes.length;
  const isFinished = activeStepIndex >= totalNodes;

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Terminal log pusher
  const pushLog = (tag, text, type = 'SYS') => {
    const now = new Date();
    const timeStr = `${now.toTimeString().split(' ')[0]}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    setTerminalLogs(prev => [...prev, { time: timeStr, tag, text, type }]);
  };

  // Change workflow
  const handleSelectWorkflow = (wfId) => {
    stopPlayback();
    setSelectedWorkflowId(wfId);
    setActiveStepIndex(-1);
    setSelectedNodeIndex(0);
    setStepTimings({});
    const targetWf = WORKFLOWS[wfId];
    setTerminalLogs([
      { time: '00:00:00.000', tag: 'SYS', text: `Loaded topic: ${targetWf.topic}. Stack ready.`, type: 'SYS' },
      { time: '00:00:00.005', tag: 'INFO', text: `Theory: ${targetWf.theorySummary}`, type: 'INFO' }
    ]);
  };

  // Stop playback timer
  const stopPlayback = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Reset workflow
  const handleReset = () => {
    stopPlayback();
    setActiveStepIndex(-1);
    setSelectedNodeIndex(0);
    setStepTimings({});
    setTerminalLogs([
      { time: '00:00:00.000', tag: 'SYS', text: `Pipeline reset for ${currentWorkflow.title}. Ready to execute.`, type: 'SYS' }
    ]);
  };

  // Emit log for a specific node execution
  const emitNodeLog = (node, index) => {
    const timeOffset = `+${index * 38 + Math.floor(Math.random() * 20)}ms`;
    setStepTimings(prev => ({ ...prev, [index]: timeOffset }));

    let tag = node.layer || 'L4';
    let type = 'SYS';
    if (tag === 'L2') type = 'L2';
    else if (tag === 'L3') type = 'L3';
    else if (tag === 'L4') type = 'L4';
    else if (tag === 'SOCK') type = 'SOCK';
    else if (tag === 'APP') type = 'APP';

    pushLog(tag, `[STEP ${index + 1}/${totalNodes}] ${node.cFunc}: ${node.egress}`, type);

    if (index === totalNodes - 1) {
      pushLog('SUCCESS', `=== EXECUTION COMPLETE: ${currentWorkflow.title} [SUCCESS] ===`, 'SUCCESS');
      pushLog('INFO', `Verified Output locked in. Topic concepts validated against RFC standards.`, 'INFO');
    }
  };

  // Step Forward
  const handleStepForward = () => {
    if (activeStepIndex >= totalNodes) {
      // Restart from step 0
      setActiveStepIndex(0);
      setSelectedNodeIndex(0);
      setTerminalLogs([]);
      emitNodeLog(currentWorkflow.nodes[0], 0);
      return;
    }

    const nextIndex = activeStepIndex === -1 ? 0 : activeStepIndex + 1;
    setActiveStepIndex(nextIndex);
    if (nextIndex < totalNodes) {
      setSelectedNodeIndex(nextIndex);
      emitNodeLog(currentWorkflow.nodes[nextIndex], nextIndex);
    }
  };

  // Play / Pause
  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      setIsPlaying(true);
      if (activeStepIndex >= totalNodes || activeStepIndex === -1) {
        setActiveStepIndex(0);
        setSelectedNodeIndex(0);
        setTerminalLogs([
          { time: '00:00:00.000', tag: 'START', text: `▶ Executing pipeline for topic: ${currentWorkflow.topic}...`, type: 'SYS' }
        ]);
        emitNodeLog(currentWorkflow.nodes[0], 0);
      }
    }
  };

  // Auto-run loop
  useEffect(() => {
    if (isPlaying) {
      if (activeStepIndex < totalNodes - 1) {
        timerRef.current = setTimeout(() => {
          const nextIndex = activeStepIndex + 1;
          setActiveStepIndex(nextIndex);
          setSelectedNodeIndex(nextIndex);
          emitNodeLog(currentWorkflow.nodes[nextIndex], nextIndex);
        }, speedMs);
      } else {
        // Finished
        setActiveStepIndex(totalNodes);
        setIsPlaying(false);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, activeStepIndex, totalNodes, speedMs]);

  // Initial welcome log
  useEffect(() => {
    setTerminalLogs([
      { time: '00:00:00.000', tag: 'SYS', text: `MicroPS C Stack initialized on Linux TAP adapter (dev=net2).`, type: 'SYS' },
      { time: '00:00:00.002', tag: 'TOPIC', text: `Active Topic: ${currentWorkflow.topic} (${currentWorkflow.protocol})`, type: 'INFO' },
      { time: '00:00:00.005', tag: 'GUIDE', text: `Follow the steps beside this terminal to execute and inspect output.`, type: 'SYS' }
    ]);
  }, [selectedWorkflowId]);

  const selectedNode = currentWorkflow.nodes[selectedNodeIndex] || currentWorkflow.nodes[0];

  // Protocol-Specific Result Cards
  const renderWorkflowResult = () => {
    if (selectedWorkflowId === 'arp_resolution') {
      return (
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="badge badge-amber">ARP RESOLUTION COMPLETE (RFC 826)</span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#b45309', fontWeight: '700' }}>RTT: 0.080 ms</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#92400e', marginBottom: '6px' }}>
            192.0.2.2 &rarr; 00:00:5e:00:53:01 (MicroPS Host B on net2)
          </div>
          <p style={{ fontSize: '12px', color: '#78350f', lineHeight: '1.5' }}>
            Dynamic ARP Cache entry populated: Logical IP <strong>192.0.2.2</strong> successfully bound to Hardware MAC <strong>00:00:5e:00:53:01</strong> with 30s expiration TTL. Broadcast query responded with verified Unicast reply.
          </p>
        </div>
      );
    } else if (selectedWorkflowId === 'icmp_ping') {
      return (
        <div style={{ background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="badge badge-blue">ICMP ECHO PING SUCCESS (RFC 792)</span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#0369a1', fontWeight: '700' }}>RTT: 0.380 ms</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#075985', marginBottom: '6px' }}>
            64 bytes from 192.0.2.2: icmp_seq=1 ttl=64 time=0.380 ms
          </div>
          <p style={{ fontSize: '12px', color: '#0c4a6e', lineHeight: '1.5' }}>
            Direct routing link matched: <strong>192.0.2.0/24 on dev=net2</strong>. RFC 1071 16-bit one's complement checksum verified (<code>0x1663</code>). 1 packet transmitted, 1 received, <strong>0% packet loss</strong>.
          </p>
        </div>
      );
    } else if (selectedWorkflowId === 'tcp_handshake') {
      return (
        <div style={{ background: '#ede9fe', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="badge badge-purple">RFC 793 STATE: ESTABLISHED</span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#6d28d9', fontWeight: '700' }}>Full Duplex Synchronized</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#5b21b6', marginBottom: '6px' }}>
            Client 192.0.2.1:52140 &harr; Server 192.0.2.2:80 [ESTABLISHED]
          </div>
          <p style={{ fontSize: '12px', color: '#4c1d95', lineHeight: '1.5' }}>
            3-Way Handshake completed: <strong>SYN</strong> (ISN=1000) &rarr; <strong>SYN-ACK</strong> (ISN=2000, ACK=1001) &rarr; <strong>ACK</strong> (SEQ=1001, ACK=2001). Advertised window: <strong>65,535 bytes</strong>. TCB allocated and stream ready.
          </p>
        </div>
      );
    } else if (selectedWorkflowId === 'http_request') {
      return (
        <div style={{ background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="badge badge-emerald">HTTP/1.1 200 OK (RFC 2616)</span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#047857', fontWeight: '700' }}>76 Bytes HTML Payload</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#065f46', marginBottom: '6px' }}>
            Web Server Response Served Completely from User-Space C Stack
          </div>
          <div style={{ fontSize: '12px', color: '#064e3b', lineHeight: '1.5' }}>
            <code>HTTP/1.1 200 OK</code> | <code>Content-Type: text/html</code> | <code>Server: MicroPS/1.0-C</code><br />
            Payload: &lt;h1&gt;MicroPS Web Server&lt;/h1&gt;&lt;p&gt;Delivered in user space via BSD sock_send()!&lt;/p&gt;
          </div>
        </div>
      );
    } else if (selectedWorkflowId === 'udp_service') {
      return (
        <div style={{ background: '#ede9fe', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="badge badge-purple">UDP DATAGRAM DELIVERED (RFC 768)</span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#6d28d9', fontWeight: '700' }}>0ms Handshake Latency</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#5b21b6', marginBottom: '6px' }}>
            Port 52140 &rarr; Port 53 (DNS Query: example.com)
          </div>
          <p style={{ fontSize: '12px', color: '#4c1d95', lineHeight: '1.5' }}>
            Connectionless datagram service: Payload pushed directly into destination port queue via <code>udp_input()</code> with zero round-trip negotiation delay.
          </p>
        </div>
      );
    } else if (selectedWorkflowId === 'flow_control') {
      return (
        <div style={{ background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="badge badge-blue">SLIDING WINDOW PACED (RFC 793)</span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#0369a1', fontWeight: '700' }}>Window: 16,384 Bytes</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#075985', marginBottom: '6px' }}>
            Receiver Advertised Window Throttled to 16KB
          </div>
          <p style={{ fontSize: '12px', color: '#0c4a6e', lineHeight: '1.5' }}>
            Flight window calculated via <code>tcp_window_available()</code>. Transmission burst capped to prevent receiver buffer overflow. <strong>0 packets dropped</strong>.
          </p>
        </div>
      );
    } else {
      return (
        <div style={{ background: '#ffe4e6', border: '1px solid #fecdd3', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="badge badge-rose">TCP CONNECTION TERMINATED (RFC 793)</span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#be123c', fontWeight: '700' }}>State: CLOSED</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#9f1239', marginBottom: '6px' }}>
            Graceful 4-Way Teardown (FIN &rarr; ACK &rarr; FIN &rarr; ACK)
          </div>
          <p style={{ fontSize: '12px', color: '#881337', lineHeight: '1.5' }}>
            Graceful connection closure complete. Both client and server endpoints passed through TIME_WAIT, released TCB memory, and recycled socket descriptors.
          </p>
        </div>
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', margin: '16px 16px 32px 16px' }}>
      
      {/* 1. Academic Topic & Concept Banner (Prominently displays what is being covered) */}
      <div className="glass-panel" style={{ padding: '18px 22px', borderLeft: `5px solid ${currentWorkflow.color}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">
                🎓 Computer Networks Syllabus
              </span>
              <span className="badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
                {currentWorkflow.topicCategory}
              </span>
              <span className="badge badge-purple">
                RFC Standard: {currentWorkflow.rfc}
              </span>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
              {currentWorkflow.topic}
            </h2>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '10px' }}>
              {currentWorkflow.theorySummary}
            </p>

            {/* Key Concepts Covered Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Key Concepts Covered:
              </span>
              {currentWorkflow.keyConcepts.map((concept, idx) => (
                <span 
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}
                >
                  ✓ {concept}
                </span>
              ))}
            </div>
          </div>

          {/* MicroPS C Module Link Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              C Implementation in MicroPS:
            </div>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => onOpenCodeSnippet(
                selectedWorkflowId.includes('arp') ? 'arp_protocol' : 
                (selectedWorkflowId.includes('icmp') ? 'icmp_ping' : 
                (selectedWorkflowId.includes('http') ? 'app_server' : 'tcp_fsm'))
              )}
            >
              <Cpu size={14} color={currentWorkflow.color} />
              <span>Inspect <code>{currentWorkflow.cModule}</code></span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Protocol Scenario Selector Pills */}
      <div className="glass-panel" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Select Protocol Scenario to Execute:
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Each scenario executes a distinct computer networking protocol pipeline
          </span>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {Object.values(WORKFLOWS).map(wf => {
            const isSelected = selectedWorkflowId === wf.id;
            return (
              <button
                key={wf.id}
                onClick={() => handleSelectWorkflow(wf.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: isSelected ? '700' : '600',
                  background: isSelected ? '#ffffff' : '#f8fafc',
                  border: `2px solid ${isSelected ? wf.color : '#e2e8f0'}`,
                  color: isSelected ? wf.color : '#475569',
                  boxShadow: isSelected ? `0 2px 8px ${wf.color}25` : 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: wf.color }} />
                <span>{wf.protocol}</span>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  ({wf.nodes.length} nodes)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Interactive Visual Workflow Canvas */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        
        {/* Canvas Toolbar & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {currentWorkflow.title}
              </h3>
              <span className="badge" style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
                {totalNodes} Execution Nodes
              </span>
              {isFinished && (
                <span className="badge badge-emerald">
                  ✓ Pipeline Complete
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Click any node card to inspect its C function parameters, or run the workflow below.
            </p>
          </div>

          {/* Primary Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className={`btn ${isPlaying ? 'btn-amber' : 'btn-primary'}`}
              style={{ fontSize: '12px', padding: '7px 16px' }}
              onClick={handleTogglePlay}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Pause' : (isFinished ? 'Re-run Pipeline' : 'Run Pipeline')}</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '7px 14px' }}
              onClick={handleStepForward}
              disabled={isPlaying}
              title="Execute next single node"
            >
              <SkipForward size={14} />
              <span>Step Forward</span>
            </button>

            <button
              className="btn btn-ghost"
              style={{ fontSize: '12px', padding: '7px 10px' }}
              onClick={handleReset}
              title="Reset workflow to idle state"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            <div style={{ width: '1px', height: '22px', background: '#e2e8f0', margin: '0 4px' }} />

            {/* Speed Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '3px 6px', borderRadius: '6px' }}>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', marginRight: '4px' }}>SPEED:</span>
              {[
                { label: 'Fast (0.5s)', ms: 500 },
                { label: 'Normal (0.8s)', ms: 800 },
                { label: 'Slow (1.5s)', ms: 1500 }
              ].map(s => (
                <button
                  key={s.ms}
                  onClick={() => setSpeedMs(s.ms)}
                  style={{
                    background: speedMs === s.ms ? '#ffffff' : 'transparent',
                    border: speedMs === s.ms ? '1px solid #cbd5e1' : 'none',
                    color: speedMs === s.ms ? '#0284c7' : '#64748b',
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: speedMs === s.ms ? '700' : '500'
                  }}
                >
                  {s.label.split(' ')[0]}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Node Pipeline Canvas */}
        <div 
          className="workflow-canvas" 
          style={{
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            padding: '20px',
            overflowX: 'auto',
            position: 'relative',
            minHeight: '220px',
            boxShadow: 'inset 0 1px 4px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: 'max-content',
            paddingBottom: '8px'
          }}>
            {currentWorkflow.nodes.map((node, idx) => {
              const isCurrent = activeStepIndex === idx;
              const isCompleted = activeStepIndex > idx || isFinished;
              const isPending = activeStepIndex < idx && !isFinished;
              const isSelected = selectedNodeIndex === idx;

              let nodeBorderColor = '#e2e8f0';
              let nodeBg = '#ffffff';

              if (isCurrent) {
                nodeBorderColor = '#0284c7';
                nodeBg = '#f0f9ff';
              } else if (isCompleted) {
                nodeBorderColor = '#a7f3d0';
                nodeBg = '#f0fdf4';
              }

              return (
                <React.Fragment key={node.id}>
                  {/* Node Card */}
                  <div
                    onClick={() => setSelectedNodeIndex(idx)}
                    style={{
                      width: '230px',
                      background: nodeBg,
                      border: `2px solid ${isSelected ? node.color : nodeBorderColor}`,
                      borderLeft: `5px solid ${node.color}`,
                      borderRadius: '10px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: isCurrent 
                        ? '0 0 0 3px rgba(2, 132, 199, 0.25), 0 4px 12px rgba(2, 132, 199, 0.15)' 
                        : (isSelected ? '0 4px 12px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.05)'),
                      position: 'relative'
                    }}
                  >
                    {/* Top Row: Node Number & Layer Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: isCompleted ? '#059669' : (isCurrent ? '#0284c7' : '#e2e8f0'),
                          color: (isCompleted || isCurrent) ? '#ffffff' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: '800'
                        }}>
                          {isCompleted ? '✓' : idx + 1}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Step {idx + 1}
                        </span>
                      </div>

                      <span 
                        className="badge" 
                        style={{ 
                          background: `${node.color}15`, 
                          color: node.color, 
                          border: `1px solid ${node.color}35`,
                          fontSize: '9px',
                          padding: '1px 6px'
                        }}
                      >
                        {node.layer} Layer
                      </span>
                    </div>

                    {/* Node Title */}
                    <h4 style={{ 
                      fontSize: '12px', 
                      fontWeight: '700', 
                      color: isCurrent ? '#0284c7' : 'var(--text-primary)', 
                      lineHeight: '1.3',
                      marginBottom: '4px'
                    }}>
                      {node.title}
                    </h4>

                    {/* Sub-label */}
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {node.sub}
                    </div>

                    {/* C Function Monospace Tag */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      padding: '4px 6px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      <span style={{ color: node.color, fontWeight: '700' }}>fn: </span>
                      {node.cFunc.split(' ')[0]}
                    </div>

                    {/* Active Pulse Animation Badge */}
                    {isCurrent && (
                      <div style={{
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '10px',
                        fontWeight: '700',
                        color: '#0284c7'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7', animation: 'node-active-pulse 1s infinite' }} />
                        EXECUTING NOW...
                      </div>
                    )}
                  </div>

                  {/* Connector Arrow */}
                  {idx < totalNodes - 1 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: idx < activeStepIndex || isFinished ? '#059669' : '#cbd5e1',
                      transition: 'color 0.2s ease'
                    }}>
                      <ArrowRight size={18} strokeWidth={idx < activeStepIndex || isFinished ? 2.5 : 1.5} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. SIDE-BY-SIDE: Steps to Proceed (Left) & Integrated Terminal (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(400px, 1.25fr)',
        gap: '18px',
        alignItems: 'stretch'
      }}>
        
        {/* Left Column: STEPS TO PROCEED & HOW TO GET OUTPUT */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle2 size={16} color="#0284c7" />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  How to Proceed (Execution Steps)
                </h3>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Step-by-step instructions to get verified output
                </div>
              </div>
            </div>

            <span className="badge badge-blue">
              Guided Lab
            </span>
          </div>

          {/* Procedure Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentWorkflow.procedureSteps.map((stepText, sIdx) => {
              const isCurrentStep = sIdx === (activeStepIndex === -1 ? 0 : (activeStepIndex >= totalNodes ? 4 : Math.min(sIdx, 3)));
              return (
                <div 
                  key={sIdx}
                  style={{
                    background: isCurrentStep ? '#f0f9ff' : '#f8fafc',
                    border: `1px solid ${isCurrentStep ? '#bae6fd' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: isCurrentStep ? '#0284c7' : '#e2e8f0',
                    color: isCurrentStep ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '800',
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    {sIdx + 1}
                  </div>
                  <div style={{ fontSize: '12px', color: isCurrentStep ? '#0369a1' : 'var(--text-secondary)', lineHeight: '1.45', fontWeight: isCurrentStep ? '600' : '400' }}>
                    {stepText}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct Quick Action Buttons inside Steps Panel */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '12px',
            marginTop: 'auto'
          }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Instant Action Controls:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className={`btn ${isPlaying ? 'btn-amber' : 'btn-primary'}`}
                style={{ fontSize: '12px', flex: '1 1 auto', padding: '8px 12px' }}
                onClick={handleTogglePlay}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause' : (isFinished ? 'Re-run Workflow' : '▶ Run to Get Output')}</span>
              </button>

              <button
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '8px 12px' }}
                onClick={handleStepForward}
                disabled={isPlaying}
              >
                <SkipForward size={14} />
                <span>Next Step</span>
              </button>
            </div>
          </div>

          {/* Selected Node Details Box */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: selectedNode.color, textTransform: 'uppercase' }}>
                Selected: Node {selectedNodeIndex + 1} ({selectedNode.title})
              </span>
              <button
                className="btn-ghost"
                style={{ fontSize: '10px', padding: '2px 6px', color: '#0284c7' }}
                onClick={() => onOpenCodeSnippet(
                  selectedWorkflowId.includes('arp') ? 'arp_protocol' : 
                  (selectedWorkflowId.includes('icmp') ? 'icmp_ping' : 
                  (selectedWorkflowId.includes('http') ? 'app_server' : 'tcp_fsm'))
                )}
              >
                View C File &rarr;
              </button>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '6px' }}>
              {selectedNode.desc}
            </p>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#475569' }}>
              <strong>State Transition:</strong> {selectedNode.egress}
            </div>
          </div>

        </div>

        {/* Right Column: INTEGRATED TERMINAL & VERIFIED OUTPUT */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-between' }}>
          
          <div>
            {/* Terminal Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={16} color="#059669" />
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  MicroPS Live Terminal Output
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-emerald" style={{ fontSize: '9px' }}>
                  dev=net2 (TAP Link)
                </span>
                <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '9px', border: '1px solid #cbd5e1' }}>
                  {activeStepIndex === -1 ? 'IDLE' : (isFinished ? 'COMPLETED' : `STEP ${activeStepIndex + 1}/${totalNodes}`)}
                </span>
                <button
                  className="btn-ghost"
                  style={{ padding: '2px 6px', fontSize: '11px' }}
                  onClick={() => setTerminalLogs([])}
                  title="Clear terminal log entries"
                >
                  <Trash2 size={12} /> Clear
                </button>
              </div>
            </div>

            {/* High-Contrast Modern Terminal Window */}
            <div style={{
              background: '#0b1120',
              borderRadius: '8px',
              padding: '12px 14px',
              minHeight: '220px',
              maxHeight: '260px',
              overflowY: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              lineHeight: '1.5',
              border: '1px solid #1e293b',
              boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {terminalLogs.map((log, index) => {
                let tagColor = '#94a3b8';
                let tagBg = 'rgba(148, 163, 184, 0.15)';
                if (log.type === 'L2') { tagColor = '#f59e0b'; tagBg = 'rgba(245, 158, 11, 0.2)'; }
                else if (log.type === 'L3') { tagColor = '#06b6d4'; tagBg = 'rgba(6, 182, 212, 0.2)'; }
                else if (log.type === 'L4') { tagColor = '#a855f7'; tagBg = 'rgba(168, 85, 247, 0.2)'; }
                else if (log.type === 'SOCK') { tagColor = '#38bdf8'; tagBg = 'rgba(56, 189, 248, 0.2)'; }
                else if (log.type === 'APP') { tagColor = '#10b981'; tagBg = 'rgba(16, 185, 129, 0.2)'; }
                else if (log.type === 'SUCCESS') { tagColor = '#34d399'; tagBg = 'rgba(52, 211, 153, 0.25)'; }
                else if (log.type === 'INFO') { tagColor = '#38bdf8'; tagBg = 'rgba(56, 189, 248, 0.15)'; }

                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ color: '#475569', flexShrink: 0 }}>[{log.time}]</span>
                    <span style={{
                      color: tagColor,
                      background: tagBg,
                      fontWeight: '700',
                      padding: '0 4px',
                      borderRadius: '3px',
                      flexShrink: 0
                    }}>
                      {log.tag}
                    </span>
                    <span style={{ color: log.type === 'SUCCESS' ? '#34d399' : '#e2e8f0', wordBreak: 'break-all' }}>
                      {log.text}
                    </span>
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>
          </div>

          {/* Verified Output Card (Directly Below Terminal) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Verified Execution Output:
              </span>
              {isFinished && (
                <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>
                  ✓ Output Confirmed
                </span>
              )}
            </div>

            {isFinished ? (
              renderWorkflowResult()
            ) : (
              <div style={{
                background: '#f8fafc',
                border: '2px dashed #cbd5e1',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '12px'
              }}>
                {activeStepIndex === -1 ? (
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Output will appear here once executed.
                    </div>
                    <div>
                      Click <strong>"Run to Get Output"</strong> in the steps guide beside to fire the pipeline and generate the final output.
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#0284c7', fontWeight: '600' }}>
                    ⚡ Executing step {activeStepIndex + 1} of {totalNodes}... Output is locking in.
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
