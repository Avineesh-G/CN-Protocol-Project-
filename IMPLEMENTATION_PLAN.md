# MicroPS Visual Protocol Studio & Network Engine
## Project Implementation Plan & Professor Presentation Strategy

---

## 1. Executive Summary & Concept

**Project Title:** MicroPS Interactive Protocol Studio & User-Space TCP/IP Engine  
**Core Academic Merit:** Traditional operating system networking stacks (Linux, Windows) operate in kernel space as opaque black boxes. This project showcases **MicroPS**, a complete, RFC-compliant Layer 2 to Layer 4 networking stack implemented in user-space C, coupled with an **interactive web-based network inspection and simulation dashboard**.

The web application bridges raw systems-level networking code with a visual, interactive presentation platform that runs locally on `localhost`. It allows you to demonstrate real-time packet encapsulation, TCP state transitions, ARP resolution, and socket API workflows directly to your professor.

---

## 2. Key Capabilities & What We Can Demonstrate

### A. Protocol Stack Layer-by-Layer Visualization (L2 to L4)
1. **Ethernet Layer (`ether.c`)**:
   - 14-byte Ethernet framing: Destination MAC, Source MAC, and EtherType (`0x0806` ARP, `0x0800` IPv4).
   - Frame preamble, CRC/FCS checksum validation.
2. **ARP Protocol Engine (`arp.c`)**:
   - Broadcast ARP Request (`ff:ff:ff:ff:ff:ff`) and Unicast ARP Reply.
   - Dynamic ARP Cache table visualization (IP ↔ MAC address mapping, TTL decay, state transitions).
3. **IPv4 Routing & Fragmentation (`ip.c`)**:
   - 20-byte IP Header dissection: Version, IHL, Type of Service, Total Length, Identification, Flags (DF/MF), Fragment Offset, TTL, Protocol number, and IP Checksum.
   - Virtual routing table lookup (`ip_route_add`), default gateway resolution.
4. **ICMP Protocol (`icmp.c`)**:
   - Ping Echo Request (Type 8, Code 0) & Echo Reply (Type 0, Code 0) with latency timing and round-trip calculation.
5. **UDP Datagram Engine (`udp.c`)**:
   - Lightweight connectionless transmission: Source Port, Destination Port, Length, Checksum.
6. **TCP Finite State Machine & Flow Control (`tcp.c`)**:
   - Full 11-State RFC 793 State Machine (LISTEN, SYN_SENT, SYN_RECEIVED, ESTABLISHED, FIN_WAIT_1, FIN_WAIT_2, CLOSE_WAIT, CLOSING, LAST_ACK, TIME_WAIT, CLOSED).
   - 3-Way Handshake (`SYN` → `SYN-ACK` → `ACK`) with Sequence (SEQ) and Acknowledgment (ACK) number tracking.
   - Sliding Window flow control, Maximum Segment Size (MSS), and TCP Retransmission simulation.
7. **BSD-Style Socket API (`sock.c`)**:
   - Step-by-step interactive demo of `sock_open()`, `sock_bind()`, `sock_listen()`, `sock_accept()`, `sock_connect()`, `sock_send()`, `sock_recv()`.

---

## 3. Web Product Architecture

### Key UI Features:
1. **Network Topology & Device Control**:
   - Virtual Host A (`192.0.2.1`, MAC: `0e:4e:af:bc:64:c6`)
   - MicroPS Host B (`192.0.2.2`, MAC: `00:00:5e:00:53:01`)
   - Virtual Switch & Gateway (`192.0.2.254`)
2. **Animated Packet Journey Canvas**:
   - Visual packet traveling between nodes and moving down/up the OSI stack layers.
   - PDU breakdown: Application Data → TCP Segment → IP Packet → Ethernet Frame.
3. **Interactive TCP State Machine Graph**:
   - Live highlighted nodes showing the exact state of client and server sockets.
4. **Live Wireshark-Style Packet Dissector**:
   - Color-coded protocol headers with raw byte inspection and human-readable field decoding.
5. **Socket API Playground**:
   - Click to execute socket calls (`sock_bind`, `sock_listen`, `sock_connect`, `sock_send`), watching the internal queues and buffers update.
6. **Source Code Linker**:
   - Side-by-side drawer showing the exact C function in `microps-master/` (e.g., `arp_input()` in `arp.c`, `tcp_input()` in `tcp.c`, `net_run()` in `net.c`).

---

## 4. Professor Presentation Demonstration Workflow

When presenting to your professor, follow this structured 4-step walkthrough:

### Step 1: The Foundation & Architecture (2 mins)
- **What to say:** *"Most developers use socket libraries without knowing how the OS kernel processes network packets. In this project, we explored and demonstrated a custom user-space TCP/IP protocol stack called MicroPS written in C, coupled with an interactive protocol engine to inspect every layer."*
- **What to show:** Open the dashboard, show the Network Topology with virtual interfaces (`net0` Null, `net1` Loopback, `net2` Tap Ethernet) matching `net.c`.

### Step 2: Layer 2 & 3 — ARP & ICMP Ping (2 mins)
- **What to say:** *"Before Host A can send an IP packet to Host B (192.0.2.2), it has no MAC address. It must initiate an ARP broadcast."*
- **What to show:**
  - Trigger **ARP Request**. Show the broadcast frame `ff:ff:ff:ff:ff:ff` and the ARP reply populating the ARP Cache table.
  - Trigger **Ping (ICMP Echo)**. Show packet assembly: ICMP Echo Request (Type 8) → IPv4 encapsulation → Ethernet transmission → ICMP Echo Reply (Type 0).
  - Open the **Code Inspector** tab to show `arp.c` (`arp_input`) and `icmp.c` (`icmp_input`).

### Step 3: Layer 4 — TCP 3-Way Handshake & State Machine (3 mins)
- **What to say:** *"MicroPS implements a complete RFC 793 TCP state machine across 11 states. Let's trace a connection from scratch."*
- **What to show:**
  - Start TCP Echo Server on port 7 (`tcp_bind` → `tcp_listen`). State moves from `CLOSED` to `LISTEN`.
  - Client initiates `tcp_connect()`. Watch `SYN` (SEQ=100) sent (Client → `SYN_SENT`).
  - Server receives `SYN`, transitions to `SYN_RECEIVED`, replies with `SYN-ACK` (SEQ=300, ACK=101).
  - Client responds with `ACK` (SEQ=101, ACK=301). Both transition to `ESTABLISHED`.
  - Send sample payload *"Hello MicroPS"*. Show byte streaming and sequence number incrementation.
  - Trigger connection teardown: `FIN` → `ACK` → `FIN` → `ACK` through `FIN_WAIT_1`, `FIN_WAIT_2`, and `TIME_WAIT`.

### Step 4: The Socket API Abstraction (2 mins)
- **What to say:** *"To allow applications like `tcps` and `udps` to interact with this custom stack, MicroPS provides a BSD-compatible user-space socket layer."*
- **What to show:** Show how `app/tcps.c` uses `sock_open(AF_INET, SOCK_STREAM, IPPROTO_TCP)` and connects directly to our stack.

---

## 5. Technology Stack & Implementation Steps

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | Fast dev server, zero configuration, single command `npm run dev` on localhost |
| **Styling & Aesthetics** | Modern Vanilla CSS (Glassmorphic Dark Mode) | Premium developer studio aesthetic (dark slate/navy, glowing accents, cybernetic metrics) |
| **Protocol Engine** | Client-Side JavaScript/TypeScript Protocol Simulator | Fully portable on Windows without needing Linux TAP/root permissions |
| **Local Server** | Node.js / Vite on `http://localhost:5173` | Lightweight, standard, ready in seconds |

### Step-by-Step Execution Plan:
1. **Initialize Web App**: Scaffold Vite + React in `protocol-studio` directory inside the project root.
2. **Build the Core MicroPS Protocol Simulator**:
   - Implement Ethernet, ARP, IPv4, ICMP, UDP, and TCP state machine matching `microps`'s C structures.
3. **Design the UI Components**:
   - Interactive Network Canvas & Packet Journey Animator.
   - TCP RFC-793 State Machine Diagram with active state highlights.
   - Packet Dissector (Hex dump + dissected tree view).
   - Socket API Playground & Terminal.
   - C Source Code Explorer showing the original `microps` C files side-by-side.
4. **Test & Verify**: Start the dev server on localhost, test all demo flows, and verify smooth presentation capability.
