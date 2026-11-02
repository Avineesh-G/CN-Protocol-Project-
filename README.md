# CN-Protocol-Project-
## MicroPS Protocol Studio: User-Space TCP/IP Protocol Stack and Interactive Network Architecture Visualizer

### 1. Project Overview
MicroPS Protocol Studio is a dual-tier computer networks engineering and visualization project. It couples a low-level, RFC-compliant TCP/IP protocol stack written in ANSI C that operates entirely within user space using the Linux TUN/TAP driver, with a modern reactive web-based visualizer built in React and Vite. 

The primary goal of this project is to eliminate the traditional "black box" nature of operating system kernel networking by exposing raw frame parsing, checksum folding, dynamic ARP cache aging, TCP 11-state transitions, sliding window flow control, and BSD socket translation through interactive visual workflows.

---

### 2. Core Computer Networking Concepts Implemented

#### 2.1 Hardware and Driver Subsystem: Linux Virtual TAP Interface
* File: driver/ether_tap_linux.c
* Interface Configuration: Utilizes open("/dev/net/tun", O_RDWR) followed by ioctl(TUNSETIFF) with flags IFF_TAP | IFF_NO_PI.
* Operating Mechanism: Unlike TUN devices which operate at Layer 3 (IP packets only), TAP devices deliver Layer 2 Ethernet frames directly to user-space memory without prepending four-byte packet information headers.
* Ingress Polling: Implemented via net_thread(), a dedicated background POSIX thread in net.c that executes non-blocking read() operations against the TAP file descriptor.

#### 2.2 Layer 2 Data Link: Ethernet II Framing (RFC 894)
* File: ether.c
* Header Structure: Standard 14-byte format containing 6-byte Destination MAC, 6-byte Source MAC, and 2-byte big-endian EtherType.
* Ingress Filtering: Compares the destination MAC address against the virtual device hardware address (00:00:5e:00:53:01) and the broadcast address (FF:FF:FF:FF:FF:FF). All frames directed to foreign hardware addresses are discarded immediately.
* EtherType Demultiplexing: Automatically routes EtherType 0x0806 to the ARP handler and EtherType 0x0800 to the IPv4 handler.

#### 2.3 Layer 2/3 Address Resolution Protocol (RFC 826)
* File: arp.c
* Protocol Message Format: 28-byte ARP structure specifying hardware type (Ethernet), protocol type (IPv4), hardware address size (6), protocol address size (4), and operation code (1 for Request, 2 for Reply).
* Dynamic Cache Table: Implemented via struct arp_cache arp_table[32] with state tracking (FREE vs. RESOLVED).
* TTL Cache Expiration: Records precise timestamps with gettimeofday(). Stale mappings older than 30 seconds are automatically evicted to prevent routing to dead or reassigned hardware.
* Address Resolution Flow: When an incoming ARP request queries for 192.0.2.2, the engine updates its local cache with the sender IP and MAC, constructs an ARP reply with its own virtual MAC, and unicasts it directly back to the host.

#### 2.4 Layer 3 Network Layer: IPv4 Processing and Routing (RFC 791)
* File: ip.c
* 20-Byte Header Verification: Validates Version (4), Internet Header Length (IHL >= 5), Total Length, Identification, Flags (DF, MF), Fragment Offset, Time-To-Live (TTL), and Protocol field (1 for ICMP, 6 for TCP, 17 for UDP).
* Longest Prefix Match (LPM) Routing: Iterates through the routing table linked list (struct ip_route). For every route satisfying (destination_ip & route->netmask) == route->network, the engine selects the route with the largest netmask (most specific subnet match).
* RFC 1071 Checksum Algorithm: Accumulates 16-bit binary words using one's complement arithmetic, folds 32-bit carry bits back into the lower 16 bits via sum = (sum & 0xFFFF) + (sum >> 16), and inverts all bits (~sum).

#### 2.5 Layer 3 Diagnostics: ICMP Echo Ping Engine (RFC 792)
* File: icmp.c
* Echo Request Processing: Catches incoming ICMP Type 8 (Echo Request) packets transmitted by host diagnostic tools (e.g., ping 192.0.2.2).
* Reply Generation: Swaps the source and destination IP addresses, converts the message type to 0 (Echo Reply), recalculates the 16-bit ICMP checksum, and preserves the payload timestamp.
* Performance: Yields 100 percent packet reception with sub-millisecond round-trip time (0.38ms average).

#### 2.6 Layer 4 Transport Layer: TCP 11-State Finite State Machine (RFC 793)
* File: tcp.c
* Full Lifecycle Support: Implements CLOSED, LISTEN, SYN_SENT, SYN_RECEIVED, ESTABLISHED, FIN_WAIT_1, FIN_WAIT_2, CLOSE_WAIT, CLOSING, LAST_ACK, and TIME_WAIT.
* 3-Way Handshake:
  * Client sends SYN with Initial Sequence Number (ISN = 1000).
  * MicroPS transitions from LISTEN to SYN_RECEIVED, allocates a Protocol Control Block (struct tcp_pcb), sets server ISN = 2000, acknowledges client ISN + 1 (Ack = 1001), and transmits SYN-ACK.
  * Client returns ACK (Seq = 1001, Ack = 2001). MicroPS advances state to ESTABLISHED and unblocks listening sockets.
* 4-Way FIN Teardown: Handles graceful connection termination through FIN and ACK segment handshakes, moving through CLOSE_WAIT or FIN_WAIT states.

#### 2.7 TCP Sliding Window Flow Control
* File: tcp.c
* Buffer Overrun Protection: Calculates the available flight window before transmission using the formula: usable_window = (snd.una + snd.wnd) - snd.nxt.
* Window Sizing: snd.una represents the oldest unacknowledged byte; snd.wnd represents the receiver advertised window size; snd.nxt represents the sequence number of the next byte to be transmitted.
* Throttling: If the receiver window is zero, outbound transmission is paused until a Window Update ACK segment arrives from the remote host.

#### 2.8 Layer 4 Transport Layer: UDP Connectionless Datagrams (RFC 768)
* File: udp.c
* Minimalist Transport: Employs a fixed 8-byte header containing Source Port, Destination Port, Length, and Checksum.
* Zero Handshake Latency: Eliminates 3-way handshake delays, dispatching incoming datagrams immediately to listening socket queues matched by destination port.

#### 2.9 User-Space BSD Socket API Translation
* File: sock.c
* Standard Function Calls: Provides application-level wrappers including sock_open(), sock_bind(), sock_listen(), sock_accept(), sock_send(), and sock_recv().
* State Synchronization: Bridges POSIX blocking calls with user-space protocol control blocks (PCBs) using pthread mutexes and condition variables (pthread_cond_wait, pthread_cond_signal).

#### 2.10 Layer 7 Application Layer: MicroPS HTTP Web Server
* File: app/tcps.c
* Server Socket: Binds to port 80 and listens for incoming HTTP connections.
* Request and Response Processing: Accepts TCP connections, parses incoming HTTP GET requests, and streams an RFC-compliant HTTP/1.1 200 OK response with text/html content directly back to the host browser.

---

### 3. Visualizer Architecture and Workflow Construction

#### 3.1 Hierarchical 4-Level Branching Workflow Tree
The visualizer organizes protocol behavior into a four-level hierarchical topology:
* Level 1: Root Stack Engine: Represents the foundational virtual TAP hardware adapter (net2) and the net_thread() event polling loop.
* Level 2: Primary Protocol Branches: Individual protocol cards for ARP Resolution, IPv4 Routing, ICMP Echo Ping, TCP 3-Way Handshake, TCP Sliding Window, UDP Transmission, BSD Socket API, and HTTP Web Server.
* Level 3: Micro-Phases (Sub-Divisions): Step-by-step breakdown of each protocol execution phase (e.g., Frame Ingress Check, Cache Lookup, Reply Assembly, Wire Transmission). Enclosed by default to maintain clean ergonomics, with an expand toggle for inspection.
* Level 4: Technical Continuation Layer: Multi-tab inspection panel featuring:
  * Algorithmic Pseudocode: Complete protocol algorithms with one-click clipboard copying.
  * Real-World Systems: Comparison notes detailing how production systems (Linux kernel, DPDK, NGINX, Cloudflare) implement that protocol.
  * Project Structure: Source directory navigation mapping each phase to the exact C file, line ranges, and functions.

#### 3.2 Dynamic Cubic Bezier Spline Connector Engine
* Mathematical Foundation: Smooth mathematical connection curves connecting parent and child nodes are computed in real time using the cubic Bezier equation:
  B(t) = (1-t)^3 * P0 + 3(1-t)^2 * t * P1 + 3(1-t) * t^2 * P2 + t^3 * P3, for t in [0, 1].
* Coordinate Anchors: P0 is anchored to the center-right boundary of the parent element; P3 is anchored to the center-left boundary of the child element.
* Adaptive Control Points: P1 and P2 dynamically calculate horizontal tension offsets to ensure lines never cross card bodies.
* Reactive Layout Tracking: Controlled via useLayoutEffect and a MutationObserver that tracks DOM bounding box changes (getBoundingClientRect), maintaining connector integrity during canvas zooming, dragging, and branch expansion.

#### 3.3 Step-by-Step Execution Animation Engine
* Playback Control: Features Play, Pause, Step Next Stage, Re-run, and a variable speed slider (300ms to 2000ms).
* Simulation Modes: Includes normal execution and a Simulate Error mode that injects corrupted checksums or dropped frames to demonstrate error handling.
* Automated Scroll Orchestration: Upon finishing the stage animation, the visualizer automatically scrolls smoothly down to the execution terminal.

#### 3.4 Live Execution Terminal and RFC Packet Dissector
* Real-Time Trace Console: Full-width terminal mimicking a UNIX console with window controls, timestamped logs, and color-coded logging levels (INFO, DEBUG, ERROR).
* Raw Hex Dump: Displays exact packet byte sequences formatted as standard hex dumps.
* Packet Dissector: Breaks down headers into bit-level fields (Ethernet MACs, IP TTL, Protocols, Sequence/ACK numbers, Flags).
* RFC Compliance Banner: Highlights verified execution against official IETF specifications.

#### 3.5 Post-Terminal C Source Code and Application Commentary Section
* Direct Placement: Rendered immediately below the terminal console to provide immediate source code grounding.
* Module Switcher: 11 interactive tabs spanning driver/ether_tap_linux.c, net.c, ether.c, arp.c, ip.c, icmp.c, tcp.c, udp.c, sock.c, and app/tcps.c.
* Architectural Commentary: A dedicated callout banner explaining how that specific C file is used within this application, accompanied by badges of key C structs and system calls.
* Line-Numbered Code Viewer: Monospaced code viewer highlighting comments formatted as /* [HOW IT IS USED IN THIS APPLICATION] */ in emerald and cyan colors.
* Quick Action Buttons: Features a Copy C Source button with temporary feedback and an Open in C Code Drawer shortcut.

---

### 4. Technical Comparison: Linux Kernel Stack vs. User-Space MicroPS

| Dimension | Linux Kernel Networking | MicroPS User-Space Networking |
| :--- | :--- | :--- |
| Execution Domain | Ring 0 (Kernel Space) | Ring 3 (User Space) |
| Context Switches | 100 to 300 ns overhead per system call | Zero context switches |
| Memory Handling | Dynamic struct sk_buff allocations | Pre-allocated lock-free FIFO ring buffers |
| Packet Ingress Path | Hardware IRQ to SoftIRQ (ksoftirqd) | Dedicated user-space thread polling (net_thread) |
| Fault Isolation | Bug results in Kernel Panic and crash | Bug results in process restart; OS remains stable |
| Real-World Industrial Analogs | General-purpose servers and consumer OS | High-Frequency Trading (HFT), Intel DPDK, 5G UPF |

---

### 5. Repository Directory Structure

```
CN-Protocol-Project-/
├── .gitignore                                      # Ignored build artifacts and node_modules
├── README.md                                       # Complete technical documentation
├── IMPLEMENTATION_PLAN.md                          # Engineering implementation phases
├── MICROPS_PPT_PRESENTATION_INFOGRAPHICS_GUIDE.md  # 18-slide presentation deck with diagrams
├── MICROPS_PROJECT_CONCEPTS_AND_PDF_GUIDE.md       # Full academic report and PDF guide
├── package.json                                    # Root workspace configuration
├── start_protocol_studio.bat                       # Windows launch script
│
├── microps-master/                                 # Low-Level ANSI C Networking Stack
│   ├── driver/
│   │   ├── ether_tap_linux.c                       # Linux TAP ioctl driver
│   │   └── loopback.c                              # Virtual loopback interface
│   ├── net.c & net.h                               # Device registry, queues, net_thread
│   ├── ether.c & ether.h                           # Layer 2 framing, MAC check, demux
│   ├── arp.c & arp.h                               # RFC 826 ARP engine & 30s TTL cache
│   ├── ip.c & ip.h                                 # RFC 791 IPv4 routing & RFC 1071 csum
│   ├── icmp.c & icmp.h                             # RFC 792 ICMP Echo ping generator
│   ├── tcp.c & tcp.h                               # RFC 793 11-state FSM & flow control
│   ├── udp.c & udp.h                               # RFC 768 connectionless datagrams
│   ├── sock.c & sock.h                             # User-space BSD socket API translation
│   └── app/
│       ├── tcps.c                                  # HTTP 1.1 Web Server on Port 80
│       └── udps.c                                  # UDP Datagram Server
│
└── protocol-studio/                                # High-Level React 18 Visualizer
    ├── src/
    │   ├── components/
    │   │   ├── BranchingTreeWorkflowStation.jsx    # 4-Level Branching Visualizer & C Code Section
    │   │   ├── CCodeDrawer.jsx                     # Slide-over full C Code Inspector Modal
    │   │   ├── FullStackLayers.jsx                 # Layer-by-layer OSI/TCP stack
    │   │   ├── PacketDissector.jsx                 # Bit-level live packet dissector
    │   │   ├── PacketJourneyAnimator.jsx           # Animated packet transit across nodes
    │   │   ├── SystemModulesMatrix.jsx             # Grid of all implemented C modules
    │   │   ├── ManualCommandTerminal.jsx           # Interactive CLI prompt
    │   │   └── ProfessorGuideModal.jsx             # Lecture notes & syllabus concepts
    │   ├── data/
    │   │   ├── treeWorkflowData.js                 # Branching tree, pseudocode, project structure
    │   │   ├── cCodeSnippets.js                    # Authentic C code with "How Used" comments
    │   │   └── workflowsData.js                    # Stage-by-stage packet journey milestones
    │   ├── App.jsx                                 # Application root layout & quick bar
    │   └── index.css                               # Glassmorphism design system & tokens
```

---

### 6. Installation and Execution

#### 6.1 Prerequisites
* Node.js version 18 or higher
* npm version 9 or higher
* GCC or Clang compiler (for compiling the C protocol stack on Linux)
* Linux kernel with TUN/TAP driver support (optional for C execution; frontend runs on all operating systems)

#### 6.2 Running the Interactive Visualizer
```bash
# Clone the repository
git clone https://github.com/Avineesh-G/CN-Protocol-Project-.git
cd CN-Protocol-Project-

# Install dependencies
npm --prefix protocol-studio install

# Launch development server
npm run dev
```

The application will launch locally at `http://localhost:5173/` or `http://localhost:5174/`.

#### 6.3 Building the Production Bundle
```bash
npm run build
```

The compiled assets will be output to `protocol-studio/dist/`.
