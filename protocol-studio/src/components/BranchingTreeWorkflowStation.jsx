import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Cpu, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Activity, 
  Zap, 
  BookOpen, 
  Briefcase, 
  Code2, 
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  X,
  Move,
  ArrowDownCircle,
  Radio,
  Copy,
  Check,
  Folder,
  Globe,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { TREE_WORKFLOW_DATA, PROJECT_DIRECTORY_STRUCTURE } from '../data/treeWorkflowData';
import { C_SNIPPETS } from '../data/cCodeSnippets';

export default function BranchingTreeWorkflowStation({ onOpenCodeSnippet }) {
  const [selectedBranchId, setSelectedBranchId] = useState('arp_resolution');
  const [activeSubIndex, setActiveSubIndex] = useState(-1); // -1 = idle, 0..N-1 = current subnode, N = finished
  const [inspectedSubIndex, setInspectedSubIndex] = useState(0); // currently inspected sub-division step in Level 4
  const [continuationTab, setContinuationTab] = useState('pseudocode'); // 'pseudocode' | 'project_structure' | 'real_world'
  const [copiedPseudocode, setCopiedPseudocode] = useState(false);
  const [selectedCModuleKey, setSelectedCModuleKey] = useState('arp_protocol'); // Active C source module after terminal
  const [copiedCCode, setCopiedCCode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(800);
  const [simulateError, setSimulateError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullScreen, setIsFullScreen] = useState(false);
  // Default to enclosed sub-divisions; only enlarged when user requests
  const [isSubExpanded, setIsSubExpanded] = useState(false);
  
  const [terminalLogs, setTerminalLogs] = useState([]);
  const terminalBoxRef = useRef(null);
  const terminalSectionRef = useRef(null);
  const playTimerRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasContentRef = useRef(null);
  const rootHandleRef = useRef(null);
  const branchPillRefs = useRef({});
  const branchBtnRefs = useRef({});
  const subCardRefs = useRef({});
  const continuationCardRef = useRef(null);

  const [connectors, setConnectors] = useState({
    rootToBranches: [],
    branchToSubs: [],
    subToContinuation: null
  });

  const branches = TREE_WORKFLOW_DATA.branches;
  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[1];
  const subDivisions = currentBranch.subDivisions || [];
  const totalSubs = subDivisions.length;
  const isFinished = activeSubIndex >= totalSubs;

  // Mathematically precise connector calculation using real DOM positions & zoom compensation
  const recalculateConnectors = useCallback(() => {
    if (!canvasContentRef.current || !rootHandleRef.current) return;
    const container = canvasContentRef.current;
    const cRect = container.getBoundingClientRect();
    const rRect = rootHandleRef.current.getBoundingClientRect();

    // Actual scale factor rendered in DOM: screen width vs untransformed offsetWidth
    const scaleX = container.offsetWidth > 0 ? (cRect.width / container.offsetWidth) : 1;
    const scaleY = container.offsetHeight > 0 ? (cRect.height / container.offsetHeight) : 1;

    // Root origin point (exact center of the '<' circular handle)
    const rx = (rRect.left + rRect.width / 2 - cRect.left) / scaleX;
    const ry = (rRect.top + rRect.height / 2 - cRect.top) / scaleY;

    // Level 1 -> Level 2: Connect from Root '<' handle to each Branch Pill's left edge
    const rootToBranches = branches.map(b => {
      const el = branchPillRefs.current[b.id];
      if (!el) return null;
      const pRect = el.getBoundingClientRect();
      return {
        id: b.id,
        color: b.color,
        x1: rx,
        y1: ry,
        x2: (pRect.left - cRect.left) / scaleX,
        y2: (pRect.top + pRect.height / 2 - cRect.top) / scaleY,
        isSelected: selectedBranchId === b.id
      };
    }).filter(Boolean);

    // Level 2 -> Level 3: Connect from Selected Branch's right '>' button to each Sub-division card (only when enlarged!)
    let branchToSubs = [];
    if (isSubExpanded) {
      const btnEl = branchBtnRefs.current[selectedBranchId];
      if (btnEl) {
        const bRect = btnEl.getBoundingClientRect();
        const bx = (bRect.right - cRect.left) / scaleX;
        const by = (bRect.top + bRect.height / 2 - cRect.top) / scaleY;

        branchToSubs = subDivisions.map((sub, sIdx) => {
          const sEl = subCardRefs.current[sIdx];
          if (!sEl) return null;
          const sRect = sEl.getBoundingClientRect();
          return {
            id: `${selectedBranchId}-${sIdx}`,
            color: currentBranch.color,
            x1: bx,
            y1: by,
            x2: (sRect.left - cRect.left) / scaleX,
            y2: (sRect.top + sRect.height / 2 - cRect.top) / scaleY,
            isActive: activeSubIndex >= sIdx || isFinished
          };
        }).filter(Boolean);
      }
    }

    // Level 3 -> Level 4: Connect from inspected Sub-Division's right edge to Level 4 Continuation Card's left edge
    let subToContinuation = null;
    if (isSubExpanded && continuationCardRef.current) {
      const sEl = subCardRefs.current[inspectedSubIndex] || subCardRefs.current[0];
      const cEl = continuationCardRef.current;
      if (sEl && cEl) {
        const sRect = sEl.getBoundingClientRect();
        const cRectCont = cEl.getBoundingClientRect();

        const sx = (sRect.right - cRect.left) / scaleX;
        const sy = (sRect.top + sRect.height / 2 - cRect.top) / scaleY;
        const cx = (cRectCont.left - cRect.left) / scaleX;
        const cy = (cRectCont.top + 70 - cRect.top) / scaleY;

        subToContinuation = {
          id: `${selectedBranchId}-${inspectedSubIndex}`,
          color: currentBranch.color,
          x1: sx,
          y1: sy,
          x2: cx,
          y2: cy,
          isActive: true
        };
      }
    }

    setConnectors({ rootToBranches, branchToSubs, subToContinuation });
  }, [branches, selectedBranchId, subDivisions, currentBranch, activeSubIndex, inspectedSubIndex, isFinished, isSubExpanded]);

  // Recalculate whenever DOM layout changes or branches are enlarged/enclosed
  useLayoutEffect(() => {
    recalculateConnectors();
    const frameId = requestAnimationFrame(recalculateConnectors);
    return () => cancelAnimationFrame(frameId);
  }, [selectedBranchId, activeSubIndex, inspectedSubIndex, isFinished, isSubExpanded, zoomLevel, recalculateConnectors]);

  // Enlarge / Enclose layout observer delay
  useEffect(() => {
    const timer = setTimeout(recalculateConnectors, 60);
    return () => clearTimeout(timer);
  }, [isSubExpanded, recalculateConnectors]);

  // Handle window resize and layout observer
  useEffect(() => {
    recalculateConnectors();
    window.addEventListener('resize', recalculateConnectors);
    let ro;
    if (typeof ResizeObserver !== 'undefined' && canvasContentRef.current) {
      ro = new ResizeObserver(() => {
        recalculateConnectors();
      });
      ro.observe(canvasContentRef.current);
    }
    return () => {
      window.removeEventListener('resize', recalculateConnectors);
      if (ro) ro.disconnect();
    };
  }, [recalculateConnectors]);

  // Ensure window stays at top on mount and prevent automatic scrolling down
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    }
  }, []);

  // Internal terminal log scroll ONLY inside the terminal container (never scrolling the window)
  useEffect(() => {
    if (terminalBoxRef.current) {
      terminalBoxRef.current.scrollTop = terminalBoxRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Terminal log pusher
  const pushLog = (tag, text, type = 'SYS') => {
    const now = new Date();
    const timeStr = `${now.toTimeString().split(' ')[0]}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    setTerminalLogs(prev => [...prev, { time: timeStr, tag, text, type }]);
  };

  // Select branch
  const handleSelectBranch = (branchId) => {
    stopPlayback();
    setSelectedBranchId(branchId);
    setActiveSubIndex(-1);
    setInspectedSubIndex(0);
    const target = branches.find(b => b.id === branchId);
    if (target && target.cCodeDrawerKey && C_SNIPPETS[target.cCodeDrawerKey]) {
      setSelectedCModuleKey(target.cCodeDrawerKey);
    }
    setTerminalLogs([
      { time: '00:00:00.000', tag: 'STATION', text: `Selected Protocol: [${target.title}] (${target.protocol})`, type: 'SYS' },
      { time: '00:00:00.004', tag: 'EXPLAIN', text: `${target.explanation}`, type: 'INFO' },
      { time: '00:00:00.008', tag: 'PROJECT', text: `Project Application: ${target.projectUse}`, type: 'PROJECT' }
    ]);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
  };

  const handleReset = () => {
    stopPlayback();
    setActiveSubIndex(-1);
    setInspectedSubIndex(0);
    setTerminalLogs([
      { time: '00:00:00.000', tag: 'RESET', text: `Workflow reset for [${currentBranch.title}]. Ready to run animation.`, type: 'SYS' }
    ]);
  };

  // Step or Auto-Play execution
  const emitStepLog = (sub, index) => {
    setInspectedSubIndex(index);
    const isErr = simulateError && index === totalSubs - 1;
    const tag = currentBranch.id.includes('arp') ? 'L2' : 
                (currentBranch.id.includes('ip') || currentBranch.id.includes('icmp') ? 'L3' : 
                (currentBranch.id.includes('http') ? 'APP' : 'L4'));

    if (isErr) {
      pushLog(tag, `[STAGE ${index + 1}/${totalSubs}] ${sub.cFunc}: SIMULATED CORRUPTION / CHECKSUM MISMATCH!`, 'ERROR');
      pushLog('ERROR', `=== EXECUTION FAILED: ${currentBranch.title} [UNSUCCESSFUL] ===`, 'ERROR');
      pushLog('ERROR', `Packet dropped by stack validation handler: ip_calculate_checksum() != 0.`, 'ERROR');
    } else {
      pushLog(tag, `[STAGE ${index + 1}/${totalSubs}] ${sub.cFunc}: ${sub.explanation}`, tag);
      if (index === totalSubs - 1) {
        pushLog('SUCCESS', `=== EXECUTION SUCCESSFUL: ${currentBranch.title} [SUCCESS] ===`, 'SUCCESS');
        pushLog('SUCCESS', `Protocol state committed to memory. Output verified against RFC standards.`, 'SUCCESS');
      }
    }
  };

  // Toggle enlarge/enclose for sub-phases
  const handleToggleEnlargeSub = (branchId) => {
    if (selectedBranchId !== branchId) {
      handleSelectBranch(branchId);
      setIsSubExpanded(true);
    } else {
      setIsSubExpanded(prev => !prev);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      setIsSubExpanded(true); // Automatically enlarge when demonstrating
      setIsPlaying(true);
      if (activeSubIndex >= totalSubs || activeSubIndex === -1) {
        setActiveSubIndex(0);
        setTerminalLogs([
          { time: '00:00:00.000', tag: 'EXEC', text: `▶ Starting workflow demonstration for ${currentBranch.title}...`, type: 'SYS' }
        ]);
        emitStepLog(subDivisions[0], 0);
      }
    }
  };

  const handleStepForward = () => {
    setIsSubExpanded(true); // Automatically enlarge on stepping
    if (activeSubIndex >= totalSubs) {
      setActiveSubIndex(0);
      setTerminalLogs([]);
      emitStepLog(subDivisions[0], 0);
      return;
    }
    const nextIdx = activeSubIndex === -1 ? 0 : activeSubIndex + 1;
    setActiveSubIndex(nextIdx);
    if (nextIdx < totalSubs) {
      emitStepLog(subDivisions[nextIdx], nextIdx);
    }
  };

  // Playback timer loop: only after workflow demonstration completes, scroll down to the terminal
  useEffect(() => {
    if (isPlaying) {
      if (activeSubIndex < totalSubs - 1) {
        playTimerRef.current = setTimeout(() => {
          const nextIdx = activeSubIndex + 1;
          setActiveSubIndex(nextIdx);
          emitStepLog(subDivisions[nextIdx], nextIdx);
        }, speedMs);
      } else {
        setActiveSubIndex(totalSubs);
        setIsPlaying(false);

        // Smoothly scroll down to terminal output AFTER workflow demonstration finishes
        setTimeout(() => {
          terminalSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
      }
    }
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, activeSubIndex, totalSubs, speedMs, simulateError]);

  // Initial welcome message (without scrolling)
  useEffect(() => {
    setTerminalLogs([
      { time: '00:00:00.000', tag: 'STATION', text: `MicroPS Protocol Station online on Linux TAP adapter (dev=net2).`, type: 'SYS' },
      { time: '00:00:00.002', tag: 'READY', text: `Active Branch: ${currentBranch.title} (${currentBranch.protocol})`, type: 'INFO' },
      { time: '00:00:00.005', tag: 'GUIDE', text: `Select a protocol at the top and click "▶ Run Workflow Animation" to watch the demonstration.`, type: 'SYS' }
    ]);
  }, []);

  // Pan / Canvas Mouse Handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.interactive-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Smooth mouse wheel zoom (in fullscreen or when holding Ctrl)
  const handleWheel = (e) => {
    if (e.ctrlKey || isFullScreen) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoomLevel(z => Math.max(0.5, Math.min(2.0, parseFloat((z + delta).toFixed(2)))));
    }
  };

  // Escape key exits full screen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  // Handle Full Screen body scroll lock and recalculate layout
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const timer = setTimeout(() => {
      recalculateConnectors();
    }, 120);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [isFullScreen, recalculateConnectors]);

  // SVG Curved Connector generator (Bézier curve from x1,y1 to x2,y2)
  const renderBezierCurve = (x1, y1, x2, y2, color, isActive = false, key = '') => {
    const dx = Math.abs(x2 - x1);
    // Smooth horizontal S-curve control points
    const cpDist = Math.max(36, dx * 0.52);
    const pathD = `M ${x1} ${y1} C ${x1 + cpDist} ${y1}, ${x2 - cpDist} ${y2}, ${x2} ${y2}`;

    return (
      <g key={key || `${x1}-${y1}-${x2}-${y2}`}>
        {/* Glowing underlay on active paths */}
        {isActive && (
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeOpacity={0.28}
            strokeLinecap="round"
            style={{ filter: 'blur(3px)' }}
          />
        )}

        {/* Base connecting line */}
        <path
          d={pathD}
          fill="none"
          stroke={isActive ? color : 'rgba(148, 163, 184, 0.22)'}
          strokeWidth={isActive ? 2.5 : 1.5}
          strokeLinecap="round"
          style={{
            transition: 'stroke 0.25s ease, stroke-width 0.25s ease'
          }}
        />

        {/* Animated flow pulse when active */}
        {isActive && (
          <path
            d={pathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth={2}
            strokeDasharray="6 8"
            className="animated-bezier-path"
          />
        )}

        {/* Endpoint Anchor Dot right where the line meets the card */}
        <circle
          cx={x2}
          cy={y2}
          r={isActive ? 3.5 : 2}
          fill={isActive ? color : 'rgba(148, 163, 184, 0.4)'}
        />
      </g>
    );
  };

  // Result Box
  const renderResultBox = () => {
    if (activeSubIndex === -1) {
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px dashed rgba(255, 255, 255, 0.15)',
          borderRadius: '8px',
          padding: '14px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '12px'
        }}>
          Protocol station is idle. Click <strong>"▶ Run Workflow Animation"</strong> at the top to execute and view the verified output here.
        </div>
      );
    }

    if (!isFinished) {
      return (
        <div style={{
          background: 'rgba(14, 165, 233, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', animation: 'node-active-pulse 1s infinite' }} />
          <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '600' }}>
            Transmitting Stage {activeSubIndex + 1} of {totalSubs} through MicroPS C engine...
          </span>
        </div>
      );
    }

    if (simulateError) {
      return (
        <div style={{
          background: 'rgba(244, 63, 94, 0.14)',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          borderRadius: '8px',
          padding: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span className="badge badge-rose">EXECUTION UNSUCCESSFUL (DROP)</span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#fb7185' }}>Checksum Mismatch</span>
          </div>
          <strong style={{ fontSize: '13px', color: '#fff' }}>Packet Dropped by MicroPS Stack Validation</strong>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
            Simulated header corruption detected. <code>ip_calculate_checksum()</code> returned non-zero. Packet was safely discarded in user space without crashing the host OS.
          </p>
        </div>
      );
    }

    return (
      <div style={{
        background: 'rgba(16, 185, 129, 0.14)',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '8px',
        padding: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="badge badge-emerald">EXECUTION SUCCESSFUL (RFC VERIFIED)</span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#34d399' }}>Status: COMMIT</span>
        </div>

        {selectedBranchId === 'arp_resolution' && (
          <div>
            <strong style={{ fontSize: '13px', color: '#fff' }}>192.0.2.2 &rarr; 00:00:5e:00:53:01 (Host B MAC)</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
              Dynamic ARP Cache entry populated with 30s TTL. Unicast ARP Reply confirmed on device <code>net2</code>.
            </p>
          </div>
        )}

        {selectedBranchId === 'icmp_diagnostics' && (
          <div>
            <strong style={{ fontSize: '13px', color: '#fff' }}>64 bytes from 192.0.2.2: icmp_seq=1 ttl=64 time=0.380 ms</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
              Direct link match 192.0.2.0/24. 16-bit one's complement checksum <code>0x1663</code> verified. 0% packet loss.
            </p>
          </div>
        )}

        {selectedBranchId === 'tcp_handshake' && (
          <div>
            <strong style={{ fontSize: '13px', color: '#fff' }}>Client 192.0.2.1:52140 &harr; Server 192.0.2.2:80 [ESTABLISHED]</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
              SYN (ISN=1000) &rarr; SYN-ACK (ISN=2000, ACK=1001) &rarr; ACK (SEQ=1001, ACK=2001). Advertised window: 65,535 bytes.
            </p>
          </div>
        )}

        {selectedBranchId === 'tcp_flow' && (
          <div>
            <strong style={{ fontSize: '13px', color: '#fff' }}>Receiver Advertised Window Paced to 16,384 Bytes</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
              Flight window calculated via <code>tcp_window_available()</code>. Transmission paced with 0 buffer dropped packets.
            </p>
          </div>
        )}

        {selectedBranchId === 'http_app' && (
          <div>
            <strong style={{ fontSize: '13px', color: '#fff' }}>HTTP/1.1 200 OK — Web Server Delivered in User Space</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
              Client received 76-byte HTML document via BSD <code>sock_send()</code> on Port 80 without kernel driver overhead.
            </p>
          </div>
        )}

        {selectedBranchId === 'udp_service' && (
          <div>
            <strong style={{ fontSize: '13px', color: '#fff' }}>UDP Port 52140 &rarr; Port 53 (DNS Query Delivered)</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
              Connectionless low-latency delivery: Datagram queued into socket buffer via <code>udp_input()</code> in 0 ms.
            </p>
          </div>
        )}

        {selectedBranchId === 'tcp_teardown' && (
          <div>
            <strong style={{ fontSize: '13px', color: '#fff' }}>Graceful 4-Way Teardown (State: CLOSED)</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
              FIN &rarr; ACK &rarr; FIN &rarr; ACK. TIME_WAIT expired; TCB control block and file descriptors safely recycled.
            </p>
          </div>
        )}

        {selectedBranchId === 'net_basics' && (
          <div>
            <strong style={{ fontSize: '13px', color: '#fff' }}>Virtual TAP Link Active (net2 /dev/net/tun)</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
              Layer 2 Ethernet frames bridged directly into user-space net_thread queue with 0 context switches.
            </p>
          </div>
        )}

        {selectedBranchId === 'ip_routing' && (
          <div>
            <strong style={{ fontSize: '13px', color: '#fff' }}>Longest Prefix Match (LPM): 192.0.2.0/24 on dev=net2</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
              Hierarchical routing verified. IP header checksum validated and TTL decremented without error.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', margin: '16px 16px 32px 16px' }}>
      
      {/* 1. TOP PROTOCOL SELECTOR & RUN CONTROLS BAR (Right at the top of the website) */}
      <div className="glass-panel" style={{ padding: '16px 20px', borderTop: '3px solid #38bdf8' }}>
        
        {/* Top Control Bar Row 1: Protocol Scenario Selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={16} color="#38bdf8" />
            <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#cbd5e1' }}>
              1. Select Protocol to Demonstrate:
            </span>
          </div>

          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Selected: <strong style={{ color: currentBranch.color }}>{currentBranch.title}</strong> ({currentBranch.protocol})
          </span>
        </div>

        {/* Protocol Pills Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {branches.map(branch => {
            const isSelected = selectedBranchId === branch.id;
            return (
              <button
                key={branch.id}
                onClick={() => handleSelectBranch(branch.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: isSelected ? '700' : '500',
                  background: isSelected ? `${branch.color}25` : 'rgba(15, 23, 42, 0.7)',
                  border: `1px solid ${isSelected ? branch.color : 'rgba(255, 255, 255, 0.1)'}`,
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? `0 0 12px ${branch.color}44` : 'none',
                  transition: 'all 0.18s ease'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: branch.color }} />
                <span>{branch.title.split(' ')[0]} {branch.protocol.split(' ')[0]}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  ({branch.subDivisions?.length || 0})
                </span>
              </button>
            );
          })}
        </div>

        {/* Top Control Bar Row 2: Run Controls Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Main Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              2. Execute:
            </span>

            <button
              className={`btn ${isPlaying ? 'btn-amber' : 'btn-primary'}`}
              style={{ fontSize: '13px', padding: '8px 20px', fontWeight: '700' }}
              onClick={handleTogglePlay}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              <span>{isPlaying ? 'Pause Workflow' : (isFinished ? 'Re-run Workflow Animation' : '▶ Run Workflow Animation')}</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '8px 14px' }}
              onClick={handleStepForward}
              disabled={isPlaying}
              title="Step forward to next execution phase"
            >
              <ChevronRight size={14} />
              <span>Step Forward</span>
            </button>

            <button
              className="btn btn-ghost"
              style={{ fontSize: '12px', padding: '8px 10px' }}
              onClick={handleReset}
              title="Reset workflow station"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            {/* Quick jump down to terminal if user wants to see it immediately */}
            <button
              className="btn-ghost"
              style={{ fontSize: '11px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => terminalSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              title="Scroll down to inspect terminal logs & results"
            >
              <ArrowDownCircle size={13} />
              <span>Jump to Terminal</span>
            </button>
          </div>

          {/* Speed & Outcome Toggle Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            
            {/* Outcome simulation button */}
            <button
              onClick={() => setSimulateError(prev => !prev)}
              style={{
                background: simulateError ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${simulateError ? '#f43f5e' : 'rgba(255, 255, 255, 0.1)'}`,
                color: simulateError ? '#fb7185' : 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Simulate checksum error / drop packet outcome"
            >
              {simulateError ? <XCircle size={13} color="#f43f5e" /> : <CheckCircle2 size={13} color="#10b981" />}
              <span>{simulateError ? 'Outcome: Drop Error' : 'Outcome: Success'}</span>
            </button>

            {/* Speed Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(7, 11, 20, 0.6)', padding: '3px 6px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', marginRight: '4px' }}>SPEED:</span>
              {[
                { label: '0.5s', ms: 500 },
                { label: '0.8s', ms: 800 },
                { label: '1.4s', ms: 1400 }
              ].map(s => (
                <button
                  key={s.ms}
                  onClick={() => setSpeedMs(s.ms)}
                  style={{
                    background: speedMs === s.ms ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                    border: 'none',
                    color: speedMs === s.ms ? '#38bdf8' : 'var(--text-muted)',
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: speedMs === s.ms ? '700' : '400'
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Code Inspector shortcut */}
            <button
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '6px 10px' }}
              onClick={() => onOpenCodeSnippet(
                selectedBranchId.includes('arp') ? 'arp_protocol' : 
                (selectedBranchId.includes('icmp') ? 'icmp_ping' : 
                (selectedBranchId.includes('http') ? 'app_server' : 'tcp_fsm'))
              )}
            >
              <Cpu size={13} color={currentBranch.color} />
              <span>Inspect C Source</span>
            </button>

          </div>

        </div>

      </div>

      {/* 2. MAIN WORKFLOW TREE MINDMAP STATION CANVAS (Full Screen Pop-up & Magnifier Enabled) */}
      <div 
        className="tree-canvas-container"
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={isFullScreen ? {
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'radial-gradient(ellipse at 50% 20%, #0f172a 0%, #020617 100%)',
          width: '100vw',
          height: '100vh',
          borderRadius: 0,
          padding: '36px 28px',
          overflow: 'auto',
          cursor: isDragging ? 'grabbing' : 'grab',
          boxShadow: '0 0 100px rgba(0, 0, 0, 0.9)'
        } : {
          minHeight: '640px',
          padding: '24px',
          cursor: isDragging ? 'grabbing' : 'grab',
          overflow: 'auto',
          position: 'relative'
        }}
      >
        {/* Full Screen Pop-up Header Badge */}
        {isFullScreen && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '24px',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(15, 23, 42, 0.95)',
            padding: '10px 20px',
            borderRadius: '12px',
            border: `1.5px solid ${currentBranch.color}`,
            backdropFilter: 'blur(16px)',
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.7), 0 0 24px ${currentBranch.color}40`,
            userSelect: 'none'
          }}>
            <span style={{
              width: '11px',
              height: '11px',
              borderRadius: '50%',
              background: currentBranch.color,
              boxShadow: `0 0 12px ${currentBranch.color}`
            }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>
                Full Screen Station: {currentBranch.title}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                {currentBranch.protocol} &bull; Drag to navigate &bull; Press [Esc] to exit pop-up
              </div>
            </div>
          </div>
        )}

        {/* Enhanced High-Visibility Canvas Toolbar (Zoom & Full Screen Pop-up) */}
        <div style={{
          position: isFullScreen ? 'fixed' : 'absolute',
          top: isFullScreen ? '20px' : '16px',
          right: isFullScreen ? '24px' : '20px',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.95)',
          padding: '8px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(56, 189, 248, 0.15)',
          userSelect: 'none'
        }}>
          {/* Pan / Move Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <Move size={17} color="#38bdf8" />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>
              Drag to Pan
            </span>
          </div>

          {/* Magnifier Zoom Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => {
                setZoomLevel(z => Math.max(0.5, parseFloat((z - 0.1).toFixed(2))));
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
                padding: '6px 10px',
                borderRadius: '7px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.25)'; e.currentTarget.style.borderColor = '#38bdf8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }}
              title="Zoom Out (Ctrl -)"
            >
              <ZoomOut size={17} />
            </button>

            {/* Clickable Zoom Percentage Badge */}
            <button
              onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
              style={{
                background: 'rgba(56, 189, 248, 0.14)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#38bdf8',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                fontWeight: '800',
                padding: '6px 12px',
                borderRadius: '7px',
                cursor: 'pointer',
                minWidth: '60px',
                textAlign: 'center',
                transition: 'all 0.18s ease'
              }}
              title="Click to reset zoom to 100%"
            >
              {Math.round(zoomLevel * 100)}%
            </button>

            <button
              onClick={() => {
                setZoomLevel(z => Math.min(2.0, parseFloat((z + 0.1).toFixed(2))));
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
                padding: '6px 10px',
                borderRadius: '7px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.25)'; e.currentTarget.style.borderColor = '#38bdf8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }}
              title="Zoom In (Ctrl +)"
            >
              <ZoomIn size={17} />
            </button>

            {/* Reset View Button */}
            <button
              onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                padding: '6px 10px',
                borderRadius: '7px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.color = '#cbd5e1'; }}
              title="Reset View Position (100% & Center)"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div style={{ height: '22px', width: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />

          {/* Full Screen Pop-up Screen Button */}
          <button
            onClick={() => setIsFullScreen(prev => !prev)}
            style={{
              background: isFullScreen ? 'rgba(239, 68, 68, 0.22)' : 'rgba(56, 189, 248, 0.2)',
              border: `1.5px solid ${isFullScreen ? '#ef4444' : '#38bdf8'}`,
              color: isFullScreen ? '#fca5a5' : '#ffffff',
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: '700',
              boxShadow: isFullScreen ? '0 0 16px rgba(239, 68, 68, 0.35)' : '0 0 16px rgba(56, 189, 248, 0.3)',
              transition: 'all 0.2s ease'
            }}
            title={isFullScreen ? "Exit Full Screen Pop-up (Esc)" : "Open Full Screen Pop-up Screen"}
          >
            {isFullScreen ? (
              <>
                <Minimize2 size={17} />
                <span>Exit Full Screen</span>
              </>
            ) : (
              <>
                <Maximize2 size={17} />
                <span>Full Screen Pop-up</span>
              </>
            )}
          </button>
        </div>

        {/* Transformable Mindmap Tree Group */}
        <div 
          ref={canvasContentRef}
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'top left',
            minWidth: isSubExpanded ? '2050px' : '900px',
            display: 'flex',
            alignItems: 'center',
            gap: '80px',
            position: 'relative',
            padding: '40px 24px',
            userSelect: 'none',
            transition: isDragging ? 'none' : 'min-width 0.2s ease'
          }}
        >
          {/* UNIFIED EXACT SVG CONNECTOR OVERLAY */}
          <svg style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible',
            zIndex: 1
          }}>
            {/* Level 1 -> Level 2 Curves */}
            {connectors.rootToBranches.map(conn => 
              renderBezierCurve(conn.x1, conn.y1, conn.x2, conn.y2, conn.color, conn.isSelected, `r2b-${conn.id}`)
            )}

            {/* Level 2 -> Level 3 Curves (Drawn only when enlarged) */}
            {connectors.branchToSubs.map(conn => 
              renderBezierCurve(conn.x1, conn.y1, conn.x2, conn.y2, conn.color, conn.isActive, `b2s-${conn.id}`)
            )}

            {/* Level 3 -> Level 4 Curve (Inspected Sub-Division to Level 4 Continuation Layer) */}
            {connectors.subToContinuation && 
              renderBezierCurve(
                connectors.subToContinuation.x1,
                connectors.subToContinuation.y1,
                connectors.subToContinuation.x2,
                connectors.subToContinuation.y2,
                connectors.subToContinuation.color,
                true,
                `s2c-${connectors.subToContinuation.id}`
              )
            }
          </svg>

          {/* LEVEL 1: ROOT NODE (Soft purple capsule on the left) */}
          <div 
            className="interactive-node"
            style={{
              width: '280px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.28) 0%, rgba(129, 140, 248, 0.18) 100%)',
              border: '2px solid #818cf8',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 8px 30px rgba(99, 102, 241, 0.35)',
              position: 'relative',
              flexShrink: 0,
              zIndex: 10,
              alignSelf: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-purple" style={{ fontSize: '9px' }}>
                Architecture Root
              </span>
              <span style={{ fontSize: '10px', color: '#c7d2fe', fontFamily: 'var(--font-mono)' }}>
                MicroPS /dev/net/tun
              </span>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', lineHeight: '1.3', marginBottom: '6px' }}>
              {TREE_WORKFLOW_DATA.root.title}
            </h3>

            <p style={{ fontSize: '11px', color: '#e0e7ff', lineHeight: '1.45' }}>
              {TREE_WORKFLOW_DATA.root.summary}
            </p>

            {/* Connecting Expander Handle (matching user reference '<' handle) */}
            <div 
              ref={rootHandleRef}
              style={{
                position: 'absolute',
                right: '-16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#818cf8',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '13px',
                boxShadow: '0 0 12px #818cf8',
                border: '2px solid #070b14',
                zIndex: 20
              }}
            >
              &lt;
            </div>
          </div>

          {/* LEVEL 2: PRIMARY BRANCHES (Curved vertical fanning list with Enlarge / Enclose '>' button) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '320px',
            flexShrink: 0,
            zIndex: 10
          }}>
            {branches.map(branch => {
              const isSelected = selectedBranchId === branch.id;
              return (
                <div
                  key={branch.id}
                  ref={el => { if (el) branchPillRefs.current[branch.id] = el; }}
                  className={`tree-branch-pill interactive-node ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectBranch(branch.id)}
                  style={{
                    borderLeft: `4px solid ${branch.color}`,
                    background: isSelected ? 'rgba(30, 41, 59, 0.98)' : 'rgba(15, 23, 42, 0.85)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: branch.color,
                      boxShadow: isSelected ? `0 0 10px ${branch.color}` : 'none'
                    }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? '#fff' : '#cbd5e1' }}>
                        {branch.title}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {branch.category} • {branch.subDivisions?.length || 0} sub-phases
                      </div>
                    </div>
                  </div>

                  {/* Right Enlarge / Enclose Toggle Button */}
                  <div 
                    ref={el => { if (el) branchBtnRefs.current[branch.id] = el; }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleEnlargeSub(branch.id);
                    }}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: (isSubExpanded && isSelected) ? branch.color : 'rgba(255, 255, 255, 0.08)',
                      color: (isSubExpanded && isSelected) ? '#ffffff' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '800',
                      boxShadow: (isSubExpanded && isSelected) ? `0 0 12px ${branch.color}` : 'none',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    title={(isSubExpanded && isSelected) ? "Click to Enclose sub-phases" : "Click to Enlarge sub-phases"}
                  >
                    {(isSubExpanded && isSelected) ? '◀' : '▶'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* LEVEL 3: SUB-DIVISIONS (Rendered ONLY when enlarged) */}
          {isSubExpanded && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              width: '480px',
              flexShrink: 0,
              zIndex: 10,
              alignSelf: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: currentBranch.color, letterSpacing: '0.04em' }}>
                  {currentBranch.title} &rarr; Sub-Divisions ({subDivisions.length} Phases)
                </span>
              </div>

            {subDivisions.map((sub, sIdx) => {
              const isCurrent = activeSubIndex === sIdx;
              const isCompleted = activeSubIndex > sIdx || isFinished;
              const isInspected = inspectedSubIndex === sIdx;

              let cardBorder = 'rgba(255, 255, 255, 0.1)';
              let cardBg = 'rgba(15, 23, 42, 0.85)';

              if (isCurrent) {
                cardBorder = currentBranch.color;
                cardBg = 'rgba(15, 23, 42, 0.98)';
              } else if (isInspected) {
                cardBorder = `${currentBranch.color}cc`;
                cardBg = 'rgba(15, 23, 42, 0.95)';
              } else if (isCompleted) {
                cardBorder = 'rgba(16, 185, 129, 0.5)';
                cardBg = 'rgba(15, 23, 42, 0.9)';
              }

              return (
                <div
                  key={sub.id}
                  ref={el => { if (el) subCardRefs.current[sIdx] = el; }}
                  className="tree-subnode-card interactive-node"
                  onClick={() => setInspectedSubIndex(sIdx)}
                  style={{
                    border: `1px solid ${cardBorder}`,
                    borderLeft: `5px solid ${isCompleted ? '#10b981' : (isCurrent ? currentBranch.color : (isInspected ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)'))}`,
                    background: cardBg,
                    boxShadow: isCurrent ? `0 0 20px ${currentBranch.color}35` : (isInspected ? `0 0 16px ${currentBranch.color}25` : '0 4px 12px rgba(0, 0, 0, 0.3)'),
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Click to inspect this phase's Pseudocode & Architecture in Level 4"
                >
                  {/* Active Inspected Indicator Dot on Right Edge */}
                  {isInspected && (
                    <div style={{
                      position: 'absolute',
                      right: '-11px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: currentBranch.color,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '800',
                      boxShadow: `0 0 12px ${currentBranch.color}`,
                      border: '2px solid #070b14',
                      zIndex: 25
                    }}>
                      &gt;
                    </div>
                  )}

                  {/* Subnode Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: isCompleted ? '#10b981' : (isCurrent ? currentBranch.color : (isInspected ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)')),
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '800'
                      }}>
                        {isCompleted ? '✓' : sIdx + 1}
                      </span>
                      <strong style={{ fontSize: '13px', color: isCurrent ? '#38bdf8' : (isInspected ? '#7dd3fc' : '#ffffff') }}>
                        {sub.name}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', fontSize: '9px' }}>
                        {sub.cFunc.split(' ')[0]}
                      </span>
                      {isCurrent && (
                        <span className="badge badge-amber" style={{ fontSize: '9px', animation: 'node-active-pulse 1s infinite' }}>
                          EXECUTING...
                        </span>
                      )}
                      {isInspected && !isCurrent && (
                        <span className="badge badge-cyan" style={{ fontSize: '9px' }}>
                          INSPECTING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 1. PROTOCOL EXPLANATION */}
                  <div style={{
                    background: 'rgba(7, 11, 20, 0.6)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    marginBottom: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '3px' }}>
                      <BookOpen size={11} /> Protocol Mechanism:
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.45', margin: 0 }}>
                      {sub.explanation}
                    </p>
                  </div>

                  {/* 2. WHAT IS THE USE OF IT & HOW TO USE IN PROJECTS */}
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '700', color: '#34d399', textTransform: 'uppercase', marginBottom: '3px' }}>
                      <Briefcase size={11} /> Real-World Project Application:
                    </div>
                    <p style={{ fontSize: '11px', color: '#a7f3d0', lineHeight: '1.45', margin: 0 }}>
                      {sub.projectUse}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* LEVEL 4: CONTINUATION LAYER (Algorithmic Pseudocode, Project File Structure, and Real-World Systems) */}
        {isSubExpanded && (
          <div 
            ref={continuationCardRef}
            className="interactive-node"
            style={{
              width: '580px',
              flexShrink: 0,
              zIndex: 10,
              alignSelf: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: `2px solid ${currentBranch.color}88`,
              borderRadius: '16px',
              padding: '20px',
              boxShadow: `0 12px 40px rgba(0, 0, 0, 0.7), 0 0 25px ${currentBranch.color}25`,
              position: 'relative'
            }}
          >
            {/* Left Connection Target Handle */}
            <div style={{
              position: 'absolute',
              left: '-14px',
              top: '70px',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: currentBranch.color,
              border: '2px solid #0f172a',
              boxShadow: `0 0 14px ${currentBranch.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '800',
              color: '#fff',
              zIndex: 20
            }}>
              &gt;
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge" style={{ background: `${currentBranch.color}25`, color: currentBranch.color, fontSize: '10px', fontWeight: '800' }}>
                    LEVEL 4 CONTINUATION
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                    Phase {inspectedSubIndex + 1} of {totalSubs}
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                  {subDivisions[inspectedSubIndex]?.name || currentBranch.title}
                </h3>
              </div>

              {/* Button to open C Code Drawer */}
              <button
                onClick={() => onOpenCodeSnippet && onOpenCodeSnippet(currentBranch.cCodeDrawerKey || 'arp_protocol')}
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid #38bdf8',
                  color: '#38bdf8',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 0 12px rgba(56, 189, 248, 0.2)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#38bdf8'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'; e.currentTarget.style.color = '#38bdf8'; }}
                title="View Authentic C Engine Code in Drawer"
              >
                <Code2 size={13} />
                <span>Open C Code</span>
              </button>
            </div>

            {/* Navigation Tabs Bar */}
            <div style={{
              display: 'flex',
              gap: '6px',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <button
                onClick={() => setContinuationTab('pseudocode')}
                style={{
                  flex: 1,
                  padding: '7px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: continuationTab === 'pseudocode' ? currentBranch.color : 'transparent',
                  color: continuationTab === 'pseudocode' ? '#ffffff' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <FileCode size={13} />
                <span>Pseudocode</span>
              </button>

              <button
                onClick={() => setContinuationTab('project_structure')}
                style={{
                  flex: 1,
                  padding: '7px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: continuationTab === 'project_structure' ? currentBranch.color : 'transparent',
                  color: continuationTab === 'project_structure' ? '#ffffff' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Folder size={13} />
                <span>Project Structure</span>
              </button>

              <button
                onClick={() => setContinuationTab('real_world')}
                style={{
                  flex: 1,
                  padding: '7px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: continuationTab === 'real_world' ? currentBranch.color : 'transparent',
                  color: continuationTab === 'real_world' ? '#ffffff' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Globe size={13} />
                <span>Real-World Systems</span>
              </button>
            </div>

            {/* TAB 1: PSEUDOCODE */}
            {continuationTab === 'pseudocode' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Phase micro-snippet */}
                {subDivisions[inspectedSubIndex]?.stepPseudocode && (
                  <div style={{
                    background: 'rgba(7, 11, 20, 0.85)',
                    borderRadius: '8px',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    padding: '10px 12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Phase {inspectedSubIndex + 1} Step Logic: {subDivisions[inspectedSubIndex]?.cFunc}
                      </span>
                      <span className="badge badge-cyan" style={{ fontSize: '9px' }}>
                        Active Phase Snippet
                      </span>
                    </div>
                    <pre style={{
                      margin: 0,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: '#7dd3fc',
                      lineHeight: '1.45',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {subDivisions[inspectedSubIndex].stepPseudocode}
                    </pre>
                  </div>
                )}

                {/* Master Protocol Algorithmic Pseudocode Block */}
                <div style={{
                  background: '#070b14',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Code2 size={13} color={currentBranch.color} />
                      Full Algorithmic Pseudocode ({currentBranch.protocol})
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentBranch.pseudocode || '');
                        setCopiedPseudocode(true);
                        setTimeout(() => setCopiedPseudocode(false), 2000);
                      }}
                      style={{
                        background: copiedPseudocode ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                        border: 'none',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '5px',
                        fontSize: '10px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.18s ease'
                      }}
                    >
                      {copiedPseudocode ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedPseudocode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <div style={{
                    maxHeight: '230px',
                    overflowY: 'auto',
                    padding: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    lineHeight: '1.5',
                    color: '#cbd5e1',
                    background: '#070b14'
                  }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {currentBranch.pseudocode}
                    </pre>
                  </div>
                </div>

                {/* Key C Structs cloud */}
                {currentBranch.projectMapping?.keyStructures && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
                      Key Data Structures & Headers:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {currentBranch.projectMapping.keyStructures.map((s, idx) => (
                        <span key={idx} style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          color: '#e2e8f0'
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PROJECT ARCHITECTURE */}
            {continuationTab === 'project_structure' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Module Mapping Card */}
                <div style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileCode size={14} color="#38bdf8" />
                      <strong style={{ fontSize: '12px', color: '#ffffff' }}>
                        {currentBranch.projectMapping?.primaryFile}
                      </strong>
                    </div>
                    <span className="badge badge-cyan" style={{ fontSize: '9px' }}>
                      Header: {currentBranch.projectMapping?.headerFile}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#bae6fd', marginBottom: '8px' }}>
                    Role: <strong>{currentBranch.projectMapping?.layerRole}</strong>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {currentBranch.projectMapping?.exportedFunctions?.map((fn, fIdx) => (
                      <span key={fIdx} style={{
                        background: 'rgba(7, 11, 20, 0.7)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: '#38bdf8'
                      }}>
                        {fn}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Canonical Project File Tree */}
                <div style={{
                  background: '#070b14',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '12px',
                  maxHeight: '230px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      📁 {PROJECT_DIRECTORY_STRUCTURE.name}/
                    </span>
                    <span className="badge badge-emerald" style={{ fontSize: '9px' }}>
                      Production C Hierarchy
                    </span>
                  </div>

                  {PROJECT_DIRECTORY_STRUCTURE.sections.map((sec, secIdx) => (
                    <div key={secIdx} style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      border: '1px solid rgba(255, 255, 255, 0.04)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: sec.color, fontFamily: 'var(--font-mono)' }}>
                          📁 {sec.dir}
                        </span>
                        <span style={{ fontSize: '9px', color: '#94a3b8' }}>
                          {sec.badge}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingLeft: '12px' }}>
                        {sec.files.map((f, fIdx) => {
                          const isCurrentTarget = f.name === currentBranch.projectMapping?.primaryFile?.split('/')[1] ||
                                                 f.name === currentBranch.projectMapping?.primaryFile ||
                                                 f.name === currentBranch.projectMapping?.headerFile?.split('/')[1];
                          return (
                            <div key={fIdx} style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              justifyContent: 'space-between',
                              fontSize: '10.5px',
                              fontFamily: 'var(--font-mono)',
                              color: isCurrentTarget ? '#38bdf8' : '#94a3b8',
                              fontWeight: isCurrentTarget ? '700' : '400',
                              background: isCurrentTarget ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                              padding: isCurrentTarget ? '2px 6px' : '1px 0',
                              borderRadius: '4px'
                            }}>
                              <span>📄 {f.name}</span>
                              <span style={{ fontSize: '9.5px', color: isCurrentTarget ? '#bae6fd' : '#64748b', fontFamily: 'var(--font-sans)' }}>
                                {f.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: REAL-WORLD SYSTEMS */}
            {continuationTab === 'real_world' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Linux Kernel Card */}
                {currentBranch.realWorldSystems?.linuxKernel && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    padding: '10px 12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Cpu size={13} color="#ef4444" />
                        <strong style={{ fontSize: '11px', color: '#fca5a5' }}>
                          {currentBranch.realWorldSystems.linuxKernel.title}
                        </strong>
                      </div>
                      <span className="badge badge-red" style={{ fontSize: '9px' }}>
                        Kernel Ring 0
                      </span>
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                      Source: {currentBranch.realWorldSystems.linuxKernel.path}
                    </div>
                    <p style={{ fontSize: '11px', color: '#e2e8f0', margin: 0, lineHeight: '1.45' }}>
                      {currentBranch.realWorldSystems.linuxKernel.mechanism}
                    </p>
                  </div>
                )}

                {/* DPDK Card */}
                {currentBranch.realWorldSystems?.dpdk && (
                  <div style={{
                    background: 'rgba(129, 140, 248, 0.08)',
                    border: '1px solid rgba(129, 140, 248, 0.25)',
                    borderRadius: '8px',
                    padding: '10px 12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={13} color="#818cf8" />
                        <strong style={{ fontSize: '11px', color: '#c7d2fe' }}>
                          {currentBranch.realWorldSystems.dpdk.title}
                        </strong>
                      </div>
                      <span className="badge badge-purple" style={{ fontSize: '9px' }}>
                        DPDK User-Space Bypass
                      </span>
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                      Source: {currentBranch.realWorldSystems.dpdk.path}
                    </div>
                    <p style={{ fontSize: '11px', color: '#e2e8f0', margin: 0, lineHeight: '1.45' }}>
                      {currentBranch.realWorldSystems.dpdk.mechanism}
                    </p>
                  </div>
                )}

                {/* lwIP Embedded Card */}
                {currentBranch.realWorldSystems?.embeddedLwip && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '8px',
                    padding: '10px 12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={13} color="#10b981" />
                        <strong style={{ fontSize: '11px', color: '#a7f3d0' }}>
                          {currentBranch.realWorldSystems.embeddedLwip.title}
                        </strong>
                      </div>
                      <span className="badge badge-emerald" style={{ fontSize: '9px' }}>
                        lwIP Embedded RTOS
                      </span>
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                      Source: {currentBranch.realWorldSystems.embeddedLwip.path}
                    </div>
                    <p style={{ fontSize: '11px', color: '#e2e8f0', margin: 0, lineHeight: '1.45' }}>
                      {currentBranch.realWorldSystems.embeddedLwip.mechanism}
                    </p>
                  </div>
                )}

                {/* Production Takeaway */}
                {currentBranch.realWorldSystems?.productionApplication && (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '8px',
                    padding: '10px 12px'
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#fbbf24', textTransform: 'uppercase', marginBottom: '3px' }}>
                      💡 Production Architecture Insight:
                    </div>
                    <p style={{ fontSize: '11px', color: '#fef3c7', margin: 0, lineHeight: '1.45' }}>
                      {currentBranch.realWorldSystems.productionApplication}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Footer: Phase Navigation Arrows & Dot Indicators */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '10px'
            }}>
              <button
                onClick={() => setInspectedSubIndex(prev => Math.max(0, prev - 1))}
                disabled={inspectedSubIndex <= 0}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: inspectedSubIndex <= 0 ? '#475569' : '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: inspectedSubIndex <= 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>◀ Prev Phase</span>
              </button>

              {/* Dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {subDivisions.map((_, idx) => (
                  <span
                    key={idx}
                    onClick={() => setInspectedSubIndex(idx)}
                    style={{
                      width: inspectedSubIndex === idx ? '20px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: inspectedSubIndex === idx ? currentBranch.color : 'rgba(255, 255, 255, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title={`Jump to Phase ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setInspectedSubIndex(prev => Math.min(totalSubs - 1, prev + 1))}
                disabled={inspectedSubIndex >= totalSubs - 1}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: inspectedSubIndex >= totalSubs - 1 ? '#475569' : '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: inspectedSubIndex >= totalSubs - 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Next Phase ▶</span>
              </button>
            </div>

          </div>
        )}

        </div>

      </div>

      {/* 3. TERMINAL SECTION (Full-Width Clean MicroPS Console & Verified Output) */}
      <div 
        ref={terminalSectionRef}
        className="glass-panel"
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          scrollMarginTop: '20px',
          borderTop: '3px solid #10b981'
        }}
      >
        {/* Terminal Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
          
          {/* Left: Window Controls + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={17} color="#10b981" />
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                MicroPS Live Execution Terminal & Trace Console
              </h3>
            </div>
          </div>

          {/* Right: Badges & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: `${currentBranch.color}20`,
              border: `1px solid ${currentBranch.color}66`,
              color: currentBranch.color,
              fontSize: '11px',
              fontWeight: '700'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentBranch.color }} />
              <span>{currentBranch.title}</span>
            </span>

            <span className="badge badge-emerald" style={{ fontSize: '10px' }}>
              dev=net2 (TAP Virtual Link)
            </span>

            <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', fontSize: '10px' }}>
              {activeSubIndex === -1 ? 'STATUS: IDLE' : (isFinished ? (simulateError ? 'STATUS: UNSUCCESSFUL' : 'STATUS: COMMITTED') : `STAGE ${activeSubIndex + 1}/${totalSubs}`)}
            </span>

            <button
              className="btn-ghost"
              style={{ padding: '4px 8px', fontSize: '11px' }}
              onClick={() => setTerminalLogs([])}
              title="Clear terminal trace logs"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Dark Terminal Window */}
        <div 
          ref={terminalBoxRef}
          style={{
            background: '#040711',
            borderRadius: '10px',
            padding: '16px 18px',
            minHeight: '260px',
            maxHeight: '340px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: '1.6',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'inset 0 2px 14px rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
          }}
        >
          {terminalLogs.map((log, index) => {
            let tagColor = '#94a3b8';
            let tagBg = 'rgba(148, 163, 184, 0.15)';
            if (log.type === 'L2') { tagColor = '#f59e0b'; tagBg = 'rgba(245, 158, 11, 0.2)'; }
            else if (log.type === 'L3') { tagColor = '#06b6d4'; tagBg = 'rgba(6, 182, 212, 0.2)'; }
            else if (log.type === 'L4') { tagColor = '#a855f7'; tagBg = 'rgba(168, 85, 247, 0.2)'; }
            else if (log.type === 'SOCK') { tagColor = '#38bdf8'; tagBg = 'rgba(56, 189, 248, 0.2)'; }
            else if (log.type === 'APP') { tagColor = '#10b981'; tagBg = 'rgba(16, 185, 129, 0.2)'; }
            else if (log.type === 'SUCCESS') { tagColor = '#34d399'; tagBg = 'rgba(52, 211, 153, 0.25)'; }
            else if (log.type === 'ERROR') { tagColor = '#fb7185'; tagBg = 'rgba(244, 63, 94, 0.25)'; }
            else if (log.type === 'PROJECT') { tagColor = '#38bdf8'; tagBg = 'rgba(56, 189, 248, 0.2)'; }

            return (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#475569', flexShrink: 0 }}>[{log.time}]</span>
                <span style={{
                  color: tagColor,
                  background: tagBg,
                  fontWeight: '700',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  flexShrink: 0
                }}>
                  {log.tag}
                </span>
                <span style={{ color: log.type === 'SUCCESS' ? '#34d399' : (log.type === 'ERROR' ? '#fb7185' : '#e2e8f0'), wordBreak: 'break-all' }}>
                  {log.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Section: Result Box & Quick Actions Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '16px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Verified Execution Result:
              </span>
              {isFinished && (
                <span style={{ fontSize: '11px', color: simulateError ? '#f43f5e' : '#10b981', fontWeight: '800' }}>
                  {simulateError ? '✗ Output Dropped / Failure Simulated' : '✓ Output Verified against RFC Specifications'}
                </span>
              )}
            </div>
            {renderResultBox()}
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
            <button
              className={`btn ${isPlaying ? 'btn-amber' : 'btn-primary'}`}
              style={{ fontSize: '13px', padding: '10px 18px', width: '100%' }}
              onClick={handleTogglePlay}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              <span>{isPlaying ? 'Pause' : (isFinished ? 'Re-run Animation' : '▶ Re-run Protocol')}</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '8px 16px', width: '100%' }}
              onClick={handleStepForward}
              disabled={isPlaying}
            >
              <ChevronRight size={14} />
              <span>Step Next Stage</span>
            </button>
          </div>
        </div>

      </div>

      {/* 4. C LANGUAGE CODE & APPLICATION COMMENTARY SECTION (After the Terminal) */}
      <div
        id="c-language-code-section"
        className="glass-panel"
        style={{
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          borderTop: '3px solid #38bdf8',
          background: 'radial-gradient(ellipse at top left, rgba(14, 165, 233, 0.08), rgba(2, 6, 23, 0.95))',
          borderRadius: '16px',
          boxShadow: '0 20px 45px -15px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Section Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 10px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                4. C Language Implementation & Application Commentary
              </span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Authentic C Stack Code
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <FileCode size={22} color="#38bdf8" />
              <span>User-Space C Network Stack Code & Application Logic</span>
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0', maxWidth: '850px', lineHeight: '1.5' }}>
              Direct C source code modules implementing this user-space TCP/IP engine on Linux TAP. Each function includes dedicated in-line commentary (<code style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '1px 5px', borderRadius: '4px' }}>/* [HOW IT IS USED IN THIS APPLICATION] */</code>) explaining how the system calls, data structures, and protocol states execute.
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                const activeSnippet = C_SNIPPETS[selectedCModuleKey] || C_SNIPPETS['arp_protocol'];
                if (navigator.clipboard && activeSnippet?.code) {
                  navigator.clipboard.writeText(activeSnippet.code);
                  setCopiedCCode(true);
                  setTimeout(() => setCopiedCCode(false), 2000);
                }
              }}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Copy C source code to clipboard"
            >
              {copiedCCode ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copiedCCode ? 'Copied C Code!' : 'Copy C Source'}</span>
            </button>

            <button
              onClick={() => onOpenCodeSnippet && onOpenCodeSnippet(selectedCModuleKey)}
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #0284c7, #2563eb)' }}
              title="Open full-featured C Code Inspector with line bookmarks and search"
            >
              <Code2 size={14} />
              <span>Open in C Code Drawer</span>
            </button>
          </div>
        </div>

        {/* C Module Selector Tabs */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={13} color="#38bdf8" />
            <span>Select Protocol C Source Module (Click to Inspect Architecture & Comments):</span>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { key: 'ether_tap_driver', label: 'Linux TAP Driver', file: 'driver/ether_tap_linux.c' },
              { key: 'net_core', label: 'Worker Thread', file: 'net.c' },
              { key: 'ether_layer', label: 'Ethernet Framing', file: 'ether.c' },
              { key: 'arp_protocol', label: 'ARP Dynamic Cache', file: 'arp.c' },
              { key: 'ip_routing', label: 'IPv4 Routing', file: 'ip.c' },
              { key: 'icmp_ping', label: 'ICMP Echo Ping', file: 'icmp.c' },
              { key: 'tcp_fsm', label: 'TCP 11-State FSM', file: 'tcp.c' },
              { key: 'tcp_flow_control', label: 'TCP Flow Control', file: 'tcp.c' },
              { key: 'udp_protocol', label: 'UDP Stack', file: 'udp.c' },
              { key: 'sock_layer', label: 'BSD Socket API', file: 'sock.c' },
              { key: 'app_server', label: 'HTTP Web Server', file: 'app/tcps.c' },
            ].map((tab) => {
              const isSelected = selectedCModuleKey === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedCModuleKey(tab.key)}
                  style={{
                    background: isSelected 
                      ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(37, 99, 235, 0.35))' 
                      : 'rgba(15, 23, 42, 0.65)',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: isSelected ? '800' : '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '2px',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.25)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isSelected ? '#38bdf8' : '#475569' }} />
                    <span>{tab.label}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: isSelected ? '#7dd3fc' : '#64748b', fontFamily: 'monospace' }}>
                    {tab.file}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Module Detail & "How It Is Used In This Application" Commentary Banner */}
        {(() => {
          const activeSnippet = C_SNIPPETS[selectedCModuleKey] || C_SNIPPETS['arp_protocol'];
          if (!activeSnippet) return null;
          const codeLines = (activeSnippet.code || '').split('\n');

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* How It Is Used Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.7))',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BookOpen size={18} color="#38bdf8" />
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#f8fafc' }}>
                      How {activeSnippet.filename} Is Used In This Application:
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                      {activeSnippet.layer}
                    </span>
                    <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.06)', color: '#cbd5e1', padding: '2px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>
                      Lines: {activeSnippet.lines}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: '#e2e8f0', margin: 0, lineHeight: '1.6' }}>
                  {activeSnippet.howUsedInApp}
                </p>

                {activeSnippet.keyStructures && activeSnippet.keyStructures.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>
                      Key C Structs & Primitives:
                    </span>
                    {activeSnippet.keyStructures.map((structName, idx) => (
                      <code
                        key={idx}
                        style={{
                          fontSize: '11px',
                          color: '#34d399',
                          background: 'rgba(52, 211, 153, 0.1)',
                          border: '1px solid rgba(52, 211, 153, 0.25)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontFamily: 'monospace'
                        }}
                      >
                        {structName}
                      </code>
                    ))}
                  </div>
                )}
              </div>

              {/* Line-Numbered C Code Window */}
              <div
                style={{
                  background: '#040712',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.8)'
                }}
              >
                {/* Code Window Header Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: '700', marginLeft: '6px' }}>
                      microps-master/{activeSnippet.filename}
                    </span>
                  </div>

                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                    {codeLines.length} lines • ANSI C (C99) Standard
                  </span>
                </div>

                {/* Code Lines Body */}
                <div
                  style={{
                    maxHeight: '480px',
                    overflowY: 'auto',
                    padding: '12px 0',
                    fontFamily: 'Consolas, "Fira Code", monospace',
                    fontSize: '12.5px',
                    lineHeight: '1.6'
                  }}
                >
                  {codeLines.map((line, idx) => {
                    const isComment = line.trim().startsWith('/*') || line.trim().startsWith('*') || line.trim().startsWith('//');
                    const isHowUsedComment = line.includes('HOW IT IS USED') || line.includes('HOW USED IN THIS APP');
                    const isPreproc = line.trim().startsWith('#');

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          padding: '1px 16px',
                          background: isHowUsedComment 
                            ? 'rgba(56, 189, 248, 0.12)' 
                            : 'transparent',
                          borderLeft: isHowUsedComment ? '3px solid #38bdf8' : '3px solid transparent'
                        }}
                      >
                        {/* Line Number Column */}
                        <span
                          style={{
                            width: '42px',
                            minWidth: '42px',
                            textAlign: 'right',
                            paddingRight: '16px',
                            color: '#475569',
                            userSelect: 'none',
                            fontSize: '11px'
                          }}
                        >
                          {idx + 1}
                        </span>

                        {/* Code Content */}
                        <span
                          style={{
                            color: isHowUsedComment
                              ? '#38bdf8'
                              : isComment
                                ? '#34d399'
                                : isPreproc
                                  ? '#f59e0b'
                                  : '#e2e8f0',
                            fontWeight: isHowUsedComment ? '700' : 'normal',
                            whiteSpace: 'pre',
                            overflowX: 'auto'
                          }}
                        >
                          {line}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3 Core Architectural Takeaway Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginTop: '8px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Zap size={16} color="#38bdf8" />
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>Zero-Copy User-Space Engine</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                    The C driver interacts with Linux via <code style={{ color: '#38bdf8' }}>/dev/net/tun</code> and <code style={{ color: '#38bdf8' }}>net_thread()</code>. Raw frames move between user space and protocol queues without OS kernel socket overhead.
                  </p>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <ShieldCheck size={16} color="#c084fc" />
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>RFC Standard Bit Precision</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                    Adheres strictly to RFC 826 (ARP), RFC 791 (IPv4), RFC 792 (ICMP), and RFC 793 (TCP). Header checksums use RFC 1071 16-bit one's complement folding.
                  </p>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Activity size={16} color="#10b981" />
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>Live Trace Synchronization</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                    Every print statement seen in the terminal above (<code style={{ color: '#10b981' }}>infof()</code>, <code style={{ color: '#10b981' }}>debugf()</code>) corresponds to real logging calls in these exact C source files.
                  </p>
                </div>
              </div>

            </div>
          );
        })()}

      </div>

    </div>
  );
}
