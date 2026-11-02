# MicroPS Protocol Studio: 9-Slide Presentation Deck
## User-Space TCP/IP Protocol Stack and Interactive Network Architecture Visualizer

---

### Slide 1: Title and Project Identity
* Title: Design and Implementation of a User-Space TCP/IP Protocol Stack and Interactive Network Architecture Visualizer
* Short Identifier: MicroPS Protocol Studio
* Core Technology Stack:
  * Low-Level Core: ANSI C (C99), Linux Virtual TUN/TAP (/dev/net/tun), POSIX Threads (pthread).
  * Frontend Studio: React 18, Vite, Dynamic SVG Cubic Bezier Engine, Vanilla CSS.
* Primary Objective: Eliminate the operating system kernel "black box" by building an authentic, RFC-compliant TCP/IP stack in user space coupled with an interactive reactive visualizer.
* Speaker Note: "MicroPS bridges low-level systems programming and high-level visual pedagogy by executing the entire protocol stack in user space and visualizing every packet transformation in real time."

---

### Slide 2: Problem Statement and Motivation
* The "Black Box" of Kernel Networking:
  * Standard operating systems run TCP/IP strictly in Kernel Space (Ring 0).
  * Packet parsing, checksum calculations, dynamic ARP caching, and TCP state transitions are hidden inside complex kernel memory structures (struct sk_buff).
* The Performance Bottleneck:
  * High context switching overhead (sys_enter / sys_exit) and hardware CPU interrupt (IRQ) handling on every inbound packet.
* The User-Space Solution:
  * Run the network stack entirely in User Space (Ring 3) via the Linux Virtual TAP device (net2).
  * Achieve zero kernel context switching, deterministic polling, and total visibility from raw Ethernet frames up to HTTP web traffic.
* Visual on Slide: Two-column architectural comparison: Kernel Mode (Black Box) versus MicroPS User Space (Direct Memory Visibility).

---

### Slide 3: System Architecture and End-to-End Data Flow
* Host Environment (192.0.2.1): Standard Linux diagnostic tools (ping, curl) generate real traffic.
* Virtual Wire Conduit: Linux TAP Driver (/dev/net/tun) captures raw Layer 2 Ethernet II frames.
* Ingress Poller (net.c): Background net_thread() polling loop continuously reads frames into lock-free user-space queues.
* Protocol Execution Pipeline:
  * ether.c: Destination MAC address check and EtherType demultiplexing.
  * arp.c: Dynamic IP-to-MAC resolution and cache table management.
  * ip.c: IPv4 routing via Longest Prefix Match (LPM) and RFC 1071 checksum calculation.
  * tcp.c and udp.c: 11-State TCP FSM, sliding window flow control, and UDP port multiplexing.
  * sock.c and app/tcps.c: User-space BSD socket API translation and HTTP web server on Port 80.
* Visual on Slide: Block flowchart tracing packet journey: Host Linux OS -> Linux TAP -> MicroPS C Engine -> Protocol Studio Visualizer.

---

### Slide 4: Data Link and Network Layers (Ethernet, ARP, IPv4)
* Ethernet II Framing (RFC 894):
  * 14-byte standard header containing Destination MAC, Source MAC, and 2-byte EtherType (0x0806 for ARP, 0x0800 for IPv4).
  * Ingress filtering discards all foreign unicast frames, accepting only frames addressed to MicroPS or broadcast (FF:FF:FF:FF:FF:FF).
* Address Resolution Protocol (RFC 826):
  * Translates 32-bit IPv4 addresses to 48-bit MAC addresses.
  * Dynamic cache table (struct arp_cache) with automatic 30-second TTL timer eviction to eliminate stale hardware mappings.
  * Responds to host ARP requests with virtual MAC 00:00:5e:00:53:01.
* IPv4 Processing and Routing (RFC 791):
  * 20-byte header verification: TTL decrementation, version checking, and protocol dispatch.
  * Longest Prefix Match (LPM) routing table lookup.
  * RFC 1071 Checksum: 16-bit one's complement addition with carry folding: sum = (sum & 0xFFFF) + (sum >> 16), returning ~sum.

---

### Slide 5: Network Diagnostics: ICMP Echo Ping Engine
* RFC 792 ICMP Diagnostics:
  * Ingests Type 8 (Echo Request) packets transmitted by host diagnostic tools (ping 192.0.2.2).
  * Automatically transforms incoming requests into Type 0 (Echo Reply) packets.
* Packet Transformation Mechanism:
  * Swaps Source IP and Destination IP addresses.
  * Recalculates the 16-bit ICMP checksum while preserving original timestamp and sequence numbers.
* Verified Performance Results:
  * Zero Packet Loss: 100 percent packet reception and reply generation across continuous host pinging.
  * Sub-Millisecond Latency: Average Round-Trip Time (RTT) of 0.38 ms on local virtual TAP conduit.
* Visual on Slide: Comparative packet field mapping: Type 8 Request transformed into Type 0 Reply.

---

### Slide 6: Transport Layer: TCP 11-State FSM and Flow Control
* RFC 793 11-State Finite State Machine:
  * Implements all 11 standardized states: CLOSED, LISTEN, SYN_SENT, SYN_RECEIVED, ESTABLISHED, FIN_WAIT_1, FIN_WAIT_2, CLOSE_WAIT, CLOSING, LAST_ACK, and TIME_WAIT.
* 3-Way Handshake Lifecycle:
  * Step 1: Client sends SYN (Seq = 1000).
  * Step 2: MicroPS advances from LISTEN to SYN_RECEIVED, picks server ISN = 2000, and sends SYN-ACK (Seq = 2000, Ack = 1001).
  * Step 3: Client returns ACK (Seq = 1001, Ack = 2001). State transitions to ESTABLISHED.
* Sliding Window Flow Control:
  * Prevents receiver buffer overflow using: usable_window = (snd.una + snd.wnd) - snd.nxt.
  * Automatically pauses outbound transmissions when the receiver advertised window reaches zero.

---

### Slide 7: UDP Datagrams, BSD Sockets, and HTTP Web Server
* UDP Connectionless Transport (RFC 768):
  * Minimalist 8-byte header: Source Port, Destination Port, Length, and Checksum.
  * Zero connection setup latency (0 ms connection delay) for real-time streaming and DNS queries.
* User-Space BSD Socket API Translation (sock.c):
  * Implements standard POSIX wrappers: sock_open(), sock_bind(), sock_listen(), sock_accept(), sock_send(), sock_recv().
  * Uses pthread mutexes and condition variables (pthread_cond_wait) to synchronize blocking operations in user space.
* MicroPS HTTP Web Server (app/tcps.c):
  * Binds to Port 80, parses incoming HTTP GET requests, and streams live HTTP/1.1 200 OK responses with HTML payloads.

---

### Slide 8: Interactive Visualizer and Workflow Engine
* Hierarchical 4-Level Branching Workflow Tree:
  * Level 1: Root Stack Engine (Virtual TAP adapter and net_thread).
  * Level 2: Primary Protocol Branches (ARP, IPv4, ICMP, TCP, UDP, BSD Sockets).
  * Level 3: Protocol Micro-Phases (Bite-sized sequential steps, enclosed by default).
  * Level 4: Technical Continuation Layer (Algorithmic Pseudocode, Real-World Systems, Project Structure).
* Dynamic Cubic Bezier Splines:
  * Mathematical curves calculated dynamically using getBoundingClientRect() and ResizeObserver to prevent card collisions during zoom and pan.
* Terminal Console and Post-Terminal C Engine:
  * UNIX-style trace console showing raw hex dumps and verified RFC compliance.
  * Followed immediately by line-numbered C source code with in-line /* [HOW IT IS USED IN THIS APPLICATION] */ commentary.

---

### Slide 9: Performance Benchmarks and Key Takeaways
* Industrial Comparison (Linux Kernel vs. User-Space MicroPS):
  * Context Switching: Kernel = 100 to 300 ns per system call; MicroPS = 0 ns (direct user-space execution).
  * Memory Model: Kernel = dynamic sk_buff allocations; MicroPS = pre-allocated zero-copy FIFO queues.
  * Fault Isolation: Kernel bug causes Kernel Panic (system crash); MicroPS bug crashes only the process (OS remains safe).
  * Industry Analogs: Architecture matches Intel DPDK, FD.io VPP, and High-Frequency Trading (HFT) platforms.
* Final Conclusion:
  * Proves that low-level C network systems programming and modern interactive visual design can merge into an intuitive, high-performance educational platform.
* Speaker Note: "MicroPS demonstrates that user-space networking delivers both total pedagogical visibility and high-performance determinism for modern network engineering."
