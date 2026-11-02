/**
 * MicroPS Execution Workflows (workflow.io style)
 * Fully modeled node-based execution pipelines for all protocol operations:
 * 1. arp_resolution: Dynamic Address Resolution Protocol (RFC 826)
 * 2. icmp_ping: ICMP Ping Echo & IPv4 Routing (RFC 792 / 791)
 * 3. tcp_handshake: RFC 793 TCP 3-Way Handshake & TCB Allocation
 * 4. http_request: Application Layer HTTP Client-Server Exchange
 * 5. udp_service: Connectionless Datagram Transmission (RFC 768)
 * 6. flow_control: Sliding Window Flow Control & Buffer Pacing
 * 7. tcp_close: RFC 793 Graceful 4-Way Connection Teardown
 */

export const WORKFLOWS = {
  arp_resolution: {
    id: 'arp_resolution',
    title: 'ARP Dynamic Address Resolution Workflow',
    protocol: 'ARP (RFC 826)',
    layer: 'Layer 2 / Data Link',
    color: '#d97706',
    topic: 'Layer 2 Address Resolution Protocol (ARP RFC 826)',
    topicCategory: 'Data Link Layer & Local Network Hardware Addressing',
    theorySummary: 'Resolves an unknown 32-bit IPv4 address (192.0.2.2) to its physical 48-bit Ethernet MAC hardware address via broadcast querying, cache insertion, and unicast reply.',
    keyConcepts: [
      'Broadcast Request (FF:FF:FF:FF:FF:FF) vs Unicast Reply',
      'ARP Cache Lookup, Insertion & 30s TTL Expiration',
      'EtherType 0x0806 Demultiplexing in Network Driver',
      'Hardware vs Protocol Address Binding (Opcode 1 & 2)'
    ],
    procedureSteps: [
      'Step 1: Select "ARP (RFC 826)" from the protocol selector bar above.',
      'Step 2: Review the 8-node pipeline showing Cache Miss -> Broadcast Framing -> TAP Poll -> Cache Insert -> Unicast Reply.',
      'Step 3: Click "Run Pipeline" (or "Step Forward") to trigger execution in the user-space C stack.',
      'Step 4: Watch the live C kernel trace stream inside the Integrated Terminal beside.',
      'Step 5: Check the Execution Result box to verify the newly populated MAC mapping.'
    ],
    summary: 'Resolves an unknown IPv4 address (192.0.2.2) to its 48-bit Ethernet MAC hardware address using broadcast querying and cache insertion.',
    cModule: 'arp.c & ether.c',
    rfc: 'RFC 826',
    nodes: [
      {
        id: 'arp_1',
        title: 'ARP Cache Lookup (Miss)',
        sub: 'Client Host A',
        layer: 'L2',
        color: '#f59e0b',
        cFunc: 'arp_resolve() in arp.c',
        desc: 'Client prepares to send IP packet to 192.0.2.2. Checks local ARP cache table; entry is missing (cache miss).',
        ingress: 'Target IP: 192.0.2.2',
        egress: 'Cache Status: MISS -> Trigger ARP Query',
        code: `/* arp.c: arp_resolve() */
entry = arp_cache_lookup(pa);
if (!entry || entry->state != ARP_CACHE_STATE_RESOLVED) {
    arp_request(iface, pa);
    return -1; /* Packet queued pending ARP */
}`
      },
      {
        id: 'arp_2',
        title: 'Build ARP Request (Opcode 1)',
        sub: 'arp.c Framing',
        layer: 'L2',
        color: '#d97706',
        cFunc: 'arp_request() in arp.c',
        desc: 'Constructs 28-byte ARP header: Hardware=Ethernet(1), Proto=IPv4(0x0800), Opcode=1 (Request), Target MAC=00:00:00:00:00:00.',
        ingress: 'Sender: 192.0.2.1 / 0e:4e:af:bc:64:c6',
        egress: 'ARP Request: "Who has 192.0.2.2? Tell 192.0.2.1"',
        code: `/* arp.c: arp_request() */
struct arp_ether req;
req.hdr.op = hton16(ARP_OP_REQUEST);
memcpy(req.sha, iface->dev->addr, ETHER_ADDR_LEN);
req.spa = iface->unicast;
req.tpa = pa;`
      },
      {
        id: 'arp_3',
        title: 'Ethernet Broadcast Encapsulation',
        sub: 'ether.c Framing',
        layer: 'L2',
        color: '#f59e0b',
        cFunc: 'ether_output() in ether.c',
        desc: 'Prepends 14-byte Ethernet II header with broadcast MAC ff:ff:ff:ff:ff:ff and EtherType 0x0806 (ARP).',
        ingress: '28-byte ARP Payload',
        egress: 'Dst: ff:ff:ff:ff:ff:ff, Type: 0x0806 (42B Frame)',
        code: `/* ether.c: ether_output() */
hdr->type = hton16(ETHER_TYPE_ARP);
memcpy(hdr->dst, ETHER_ADDR_BROADCAST, ETHER_ADDR_LEN);
memcpy(hdr->src, dev->addr, ETHER_ADDR_LEN);`
      },
      {
        id: 'arp_4',
        title: 'Virtual Switch Forwarding (br0)',
        sub: 'Virtual Bus',
        layer: 'L1',
        color: '#6366f1',
        cFunc: 'Virtual Ethernet Bus',
        desc: 'The broadcast frame reaches the virtual switch fabric and is flooded to all attached virtual interfaces on the segment.',
        ingress: 'Frame Dst: ff:ff:ff:ff:ff:ff',
        egress: 'Flooded to TAP adapter net2',
        code: `/* Virtual Switch / Linux TAP Bridge */
/* Broadcast frame passed into /dev/net/tun file descriptor */`
      },
      {
        id: 'arp_5',
        title: 'MicroPS Driver Ingress (net2 TAP)',
        sub: 'driver/ether_tap_linux.c',
        layer: 'L1',
        color: '#6366f1',
        cFunc: 'ether_tap_poll() in ether_tap.c',
        desc: 'MicroPS user-space background thread polls the TAP file descriptor and pushes the raw frame into the net_thread queue.',
        ingress: 'Linux TAP /dev/net/tun FD',
        egress: 'Pushed to net_input_handler queue',
        code: `/* ether_tap_linux.c: ether_tap_poll() */
ret = read(tap->fd, buf, sizeof(buf));
if (ret > 0) {
    ether_input_helper(dev, buf, ret);
}`
      },
      {
        id: 'arp_6',
        title: 'EtherType Protocol Demux',
        sub: 'ether.c Input',
        layer: 'L2',
        color: '#f59e0b',
        cFunc: 'ether_input() in ether.c',
        desc: 'Validates frame destination MAC (matches broadcast), extracts EtherType 0x0806, and routes to arp_input().',
        ingress: '42-byte raw Ethernet frame',
        egress: 'Dispatched to arp_input(dev, data, len)',
        code: `/* ether.c: ether_input() */
if (ntoh16(hdr->type) == ETHER_TYPE_ARP) {
    net_input_handler(dev, ETHER_TYPE_ARP, data + sizeof(*hdr), len - sizeof(*hdr));
}`
      },
      {
        id: 'arp_7',
        title: 'Dynamic ARP Cache Insertion',
        sub: 'arp.c Cache Engine',
        layer: 'L2',
        color: '#10b981',
        cFunc: 'arp_cache_insert() in arp.c',
        desc: 'MicroPS learns sender IP-to-MAC mapping (192.0.2.1 -> 0e:4e:af:bc:64:c6) and inserts an entry with a 30s TTL timer.',
        ingress: 'SPA: 192.0.2.1, SHA: 0e:4e:af:bc:64:c6',
        egress: 'ARP Table updated (State: RESOLVED, TTL: 30s)',
        code: `/* arp.c: arp_cache_insert() */
entry->state = ARP_CACHE_STATE_RESOLVED;
entry->pa = msg->spa;
memcpy(entry->ha, msg->sha, ETHER_ADDR_LEN);
gettimeofday(&entry->timestamp, NULL);`
      },
      {
        id: 'arp_8',
        title: 'Build & Transmit ARP Reply (Opcode 2)',
        sub: 'arp.c Reply',
        layer: 'L2',
        color: '#10b981',
        cFunc: 'arp_reply() in arp.c',
        desc: 'Target IP matches net2 (192.0.2.2). MicroPS transmits unicast ARP Reply with its own MAC (00:00:5e:00:53:01).',
        ingress: 'Query for: 192.0.2.2',
        egress: 'ARP Reply: 192.0.2.2 is at 00:00:5e:00:53:01 (Unicast)',
        code: `/* arp.c: arp_reply() */
arp_output(dev, ARP_OP_REPLY, tha, tpa, dev->addr, dev->iface->unicast);
/* Destination: 0e:4e:af:bc:64:c6 (Host A) */`
      }
    ]
  },

  icmp_ping: {
    id: 'icmp_ping',
    title: 'ICMP Ping Reachability & Routing Workflow',
    protocol: 'ICMP / IPv4 (RFC 792 / 791)',
    layer: 'Layer 3 / Network',
    color: '#0891b2',
    topic: 'Layer 3 ICMP Echo & IPv4 Routing (RFC 792 / 791)',
    topicCategory: 'Network Layer Routing, Diagnostics & Header Verification',
    theorySummary: 'Verifies network reachability and latency between two IP hosts via longest-prefix routing, one\'s complement checksum validation, and Echo Request/Reply exchange.',
    keyConcepts: [
      'Routing Table Longest Prefix Match (192.0.2.0/24 on net2)',
      'RFC 1071 One\'s Complement 16-bit Checksum Verification',
      'ICMP Echo Request (Type 8, Code 0) & Echo Reply (Type 0, Code 0)',
      'Round Trip Time (RTT) & TTL Hop Count Decrement'
    ],
    procedureSteps: [
      'Step 1: Select "ICMP / IPv4" from the protocol selector bar.',
      'Step 2: Inspect the 8-node pipeline tracking IP route match, checksum math, TAP poll, and reply generation.',
      'Step 3: Click "Run Pipeline" to fire the ICMP ping packet from Host A to Server B.',
      'Step 4: Check the Integrated Terminal beside for checksum calculations and reply timestamps.',
      'Step 5: View confirmed RTT latency (0.380 ms) and 0% loss in the Execution Result card.'
    ],
    summary: 'Transmits an ICMP Echo Request, performs routing table lookup, computes 16-bit checksums, and handles the Echo Reply in user space.',
    cModule: 'ip.c & icmp.c',
    rfc: 'RFC 792 & RFC 791',
    nodes: [
      {
        id: 'icmp_1',
        title: 'Ping Command Issued',
        sub: 'Application Invocation',
        layer: 'APP',
        color: '#38bdf8',
        cFunc: 'ping command cli',
        desc: 'User or application requests round-trip reachability check to target IP address 192.0.2.2.',
        ingress: 'Target IP: 192.0.2.2',
        egress: 'ICMP Echo Session Initialized',
        code: `/* ping tool */
ping_send(dst_ip, seq=1, id=0x1a4);`
      },
      {
        id: 'icmp_2',
        title: 'IPv4 Routing Table Lookup',
        sub: 'ip.c Routing Engine',
        layer: 'L3',
        color: '#06b6d4',
        cFunc: 'ip_route_lookup() in ip.c',
        desc: 'Performs longest-prefix match against routing table. Destination 192.0.2.2 matches 192.0.2.0/24 on device net2.',
        ingress: 'Destination: 192.0.2.2',
        egress: 'Matched Route: net2 (Direct Link, NextHop: 0.0.0.0)',
        code: `/* ip.c: ip_route_lookup() */
for (route = routes; route; route = route->next) {
    if ((dst & route->netmask) == route->network) {
        candidate = route; /* Longest prefix match */
    }
}`
      },
      {
        id: 'icmp_3',
        title: 'Build ICMP Echo Request (Type 8)',
        sub: 'icmp.c Framing',
        layer: 'L3',
        color: '#0891b2',
        cFunc: 'icmp_output() in icmp.c',
        desc: 'Constructs 8-byte ICMP header: Type=8 (Echo Request), Code=0, Identifier=0x01a4, Sequence=1, plus 32B payload.',
        ingress: 'Type=8, Code=0, Payload=32B',
        egress: 'ICMP PDU: 40 bytes',
        code: `/* icmp.c: icmp_output() */
hdr->type = ICMP_TYPE_ECHO;
hdr->code = 0;
hdr->values.echo.id = hton16(id);
hdr->values.echo.seq = hton16(seq);`
      },
      {
        id: 'icmp_4',
        title: 'IP Header & 1\'s Complement Checksum',
        sub: 'ip.c Header Construction',
        layer: 'L3',
        color: '#06b6d4',
        cFunc: 'ip_calculate_checksum() in ip.c',
        desc: 'Builds 20-byte IPv4 header: Version=4, IHL=5, Protocol=1 (ICMP), TTL=64, DF=1. Calculates RFC 1071 checksum.',
        ingress: 'IPv4 Header + ICMP PDU',
        egress: 'Total Length: 60B, Checksum: 0x1663 [Valid]',
        code: `/* ip.c: ip_calculate_checksum() */
uint32_t sum = 0;
while (len > 1) { sum += *p++; len -= 2; }
while (sum >> 16) sum = (sum & 0xffff) + (sum >> 16);
hdr->sum = ~sum;`
      },
      {
        id: 'icmp_5',
        title: 'Ethernet Layer Encapsulation',
        sub: 'ether.c Frame Assembly',
        layer: 'L2',
        color: '#f59e0b',
        cFunc: 'ether_output() in ether.c',
        desc: 'Prepends 14B Ethernet header with resolved MAC 00:00:5e:00:53:01 from ARP cache, EtherType 0x0800 (IPv4).',
        ingress: '60B IPv4 Packet',
        egress: '74B Ethernet II Frame on wire',
        code: `/* ether.c: ether_output() */
memcpy(hdr->dst, arp_entry->ha, ETHER_ADDR_LEN);
hdr->type = hton16(ETHER_TYPE_IP);`
      },
      {
        id: 'icmp_6',
        title: 'MicroPS User-Space TAP Ingress',
        sub: 'net.c & driver',
        layer: 'L1',
        color: '#6366f1',
        cFunc: 'net_thread() in net.c',
        desc: 'Linux TAP adapter pushes frame to user space. net_thread pops frame from queue and dispatches to ip_input().',
        ingress: 'net2 TAP Interface',
        egress: 'Delivered to ip_input()',
        code: `/* net.c: net_thread() */
entry = queue_pop(&proto->queue);
proto->handler(entry->data, entry->len, entry->dev);`
      },
      {
        id: 'icmp_7',
        title: 'IPv4 Validation & Header Verification',
        sub: 'ip.c Ingress',
        layer: 'L3',
        color: '#06b6d4',
        cFunc: 'ip_input() in ip.c',
        desc: 'Verifies IP checksum, decrements TTL (64 -> 63), verifies destination IP matches net2 unicast (192.0.2.2).',
        ingress: 'Dst: 192.0.2.2, TTL: 64',
        egress: 'Checksum OK, Dispatched to icmp_input()',
        code: `/* ip.c: ip_input() */
if (ip_calculate_checksum(hdr, hlen) != 0) return; /* Drop corrupted */
if (hdr->dst != iface->unicast) return; /* Not for us */
proto = ip_protocol_get(hdr->protocol); /* Protocol 1: ICMP */`
      },
      {
        id: 'icmp_8',
        title: 'ICMP Echo Reply Generation (Type 0)',
        sub: 'icmp.c Dispatcher',
        layer: 'L3',
        color: '#10b981',
        cFunc: 'icmp_input() in icmp.c',
        desc: 'Detects Type 8 (Echo Request). Inverts source and destination IPs, changes Type to 0 (Echo Reply), and transmits.',
        ingress: 'ICMP Type 8 (Echo Request)',
        egress: 'ICMP Type 0 (Echo Reply) Sent',
        code: `/* icmp.c: icmp_input() */
case ICMP_TYPE_ECHO:
    icmp_output(ICMP_TYPE_ECHOREPLY, hdr->code, hdr->values,
                data + sizeof(*hdr), len - sizeof(*hdr), dst, src);
    break;`
      },
      {
        id: 'icmp_9',
        title: 'Echo Reply Received & RTT Calculated',
        sub: 'Client Diagnostics',
        layer: 'APP',
        color: '#10b981',
        cFunc: 'ping_recv()',
        desc: 'Client receives Echo Reply (Type 0), verifies sequence number and payload integrity, and reports RTT = 0.380 ms.',
        ingress: '64 bytes from 192.0.2.2: seq=1',
        egress: 'Status: SUCCESS, RTT: 0.38 ms',
        code: `/* ping result */
printf("64 bytes from 192.0.2.2: icmp_seq=1 ttl=64 time=0.380 ms\\n");`
      }
    ]
  },

  tcp_handshake: {
    id: 'tcp_handshake',
    title: 'RFC 793 TCP 3-Way Handshake Workflow',
    protocol: 'TCP (RFC 793)',
    layer: 'Layer 4 / Transport',
    color: '#7c3aed',
    topic: 'Layer 4 TCP 3-Way Handshake & State Synchronization (RFC 793)',
    topicCategory: 'Transport Layer Connection Establishment & TCB Management',
    theorySummary: 'Synchronizes Initial Sequence Numbers (ISNs) and allocates Transmission Control Blocks (TCBs) for reliable, full-duplex byte stream transmission.',
    keyConcepts: [
      'RFC 793 11-State Finite State Machine (CLOSED -> SYN_SENT -> ESTABLISHED)',
      '3-Way Handshake (SYN -> SYN-ACK -> ACK) Sequence Math',
      'Transmission Control Block (TCB / struct tcp_pcb) Memory Allocation',
      'Advertised Receive Window (65,535 bytes) & MSS Negotiation'
    ],
    procedureSteps: [
      'Step 1: Select "TCP (RFC 793)" from the protocol selector pills.',
      'Step 2: Trace the 7-node pipeline from sock_connect() active open to ESTABLISHED state transition.',
      'Step 3: Click "Run Pipeline" to trigger the SYN, SYN-ACK, and final ACK packets.',
      'Step 4: Watch TCP control block (TCB) state updates and sequence math live in the Terminal beside.',
      'Step 5: Verify the ESTABLISHED connection state and 65,535 byte window in the Execution Result card.'
    ],
    summary: 'Establishes a reliable full-duplex byte stream connection through SYN -> SYN-ACK -> ACK state synchronization and TCB allocation.',
    cModule: 'tcp.c & sock.c',
    rfc: 'RFC 793',
    nodes: [
      {
        id: 'tcp_1',
        title: 'Server Socket Initialization (LISTEN)',
        sub: 'MicroPS Server (sock.c)',
        layer: 'SOCK',
        color: '#38bdf8',
        cFunc: 'sock_bind() & sock_listen()',
        desc: 'Server opens TCP socket, binds to Port 80 (HTTP), calls sock_listen(soc, 5). State moves from CLOSED -> LISTEN.',
        ingress: 'Port: 80, Backlog: 5',
        egress: 'TCB State: LISTEN (Passive Open)',
        code: `/* sock.c & tcp.c */
soc = sock_open(AF_INET, SOCK_STREAM, IPPROTO_TCP);
sock_bind(soc, &addr, sizeof(addr));
sock_listen(soc, 5); /* pcb->state = TCP_STATE_LISTEN */`
      },
      {
        id: 'tcp_2',
        title: 'Client Active Open (sock_connect)',
        sub: 'Client Host A',
        layer: 'SOCK',
        color: '#a855f7',
        cFunc: 'sock_connect() in sock.c',
        desc: 'Client initiates connection to 192.0.2.2:80. Picks Initial Sequence Number (ISN=1000). State moves to SYN_SENT.',
        ingress: 'Dst: 192.0.2.2:80, Ephemeral Port: 52140',
        egress: 'ISN: 1000, Client State: SYN_SENT',
        code: `/* tcp.c: tcp_connect() */
pcb->snd.iss = 1000;
pcb->snd.nxt = pcb->snd.iss;
pcb->state = TCP_STATE_SYN_SENT;
tcp_output(pcb, TCP_FLG_SYN, NULL, 0);`
      },
      {
        id: 'tcp_3',
        title: 'Transmit Segment 1: TCP [SYN]',
        sub: 'tcp.c Segment Generation',
        layer: 'L4',
        color: '#a855f7',
        cFunc: 'tcp_output() in tcp.c',
        desc: 'Client sends SYN segment: Flags=0x02, Seq=1000, Ack=0, Window=65535, MSS=1460 to MicroPS server.',
        ingress: 'Seq: 1000, Flags: SYN',
        egress: 'TCP Segment on wire (54B total)',
        code: `/* tcp.c: tcp_output() */
hdr->flags = TCP_FLG_SYN;
hdr->seq = hton32(pcb->snd.nxt++);
hdr->wnd = hton16(pcb->rcv.wnd);`
      },
      {
        id: 'tcp_4',
        title: 'Server Ingress & TCB Allocation',
        sub: 'tcp.c FSM Handler',
        layer: 'L4',
        color: '#c084fc',
        cFunc: 'tcp_input_state() in tcp.c',
        desc: 'Server in LISTEN state matches SYN. Allocates new PCB for connection. Records client ISN: rcv.nxt = 1001, irs = 1000.',
        ingress: 'Flags=[SYN], Seq=1000',
        egress: 'Server State: SYN_RECEIVED',
        code: `/* tcp.c: tcp_input_state() case LISTEN */
pcb->rcv.nxt = ntoh32(hdr->seq) + 1;
pcb->rcv.irs = ntoh32(hdr->seq);
pcb->state = TCP_STATE_SYN_RECEIVED;`
      },
      {
        id: 'tcp_5',
        title: 'Transmit Segment 2: TCP [SYN, ACK]',
        sub: 'MicroPS Server Output',
        layer: 'L4',
        color: '#10b981',
        cFunc: 'tcp_output() in tcp.c',
        desc: 'Server generates its own ISN (2000) and acknowledges client SYN with Ack=1001. Flags=0x12 (SYN | ACK).',
        ingress: 'Seq: 2000, Ack: 1001',
        egress: 'Flags=[SYN, ACK], Window=65535 B',
        code: `/* tcp.c: tcp_output() */
pcb->snd.iss = 2000;
pcb->snd.nxt = pcb->snd.iss;
tcp_output(pcb, TCP_FLG_SYN | TCP_FLG_ACK, NULL, 0);`
      },
      {
        id: 'tcp_6',
        title: 'Client Ingress & State Transition',
        sub: 'Client TCP FSM',
        layer: 'L4',
        color: '#a855f7',
        cFunc: 'tcp_input_state() case SYN_SENT',
        desc: 'Client receives [SYN, ACK]. Records server sequence number (rcv.nxt = 2001) and transitions state to ESTABLISHED.',
        ingress: 'Flags=[SYN, ACK], Seq=2000, Ack=1001',
        egress: 'Client State: ESTABLISHED',
        code: `/* tcp.c: tcp_input_state() case SYN_SENT */
pcb->rcv.nxt = ntoh32(hdr->seq) + 1;
pcb->snd.una = ntoh32(hdr->ack);
pcb->state = TCP_STATE_ESTABLISHED;`
      },
      {
        id: 'tcp_7',
        title: 'Transmit Segment 3: TCP [ACK]',
        sub: 'Client Handshake Finalizer',
        layer: 'L4',
        color: '#38bdf8',
        cFunc: 'tcp_output() in tcp.c',
        desc: 'Client sends final ACK segment: Seq=1001, Ack=2001, Flags=0x10. No data payload attached.',
        ingress: 'Seq=1001, Ack=2001, Flags=ACK',
        egress: 'Segment 3 on wire -> Server',
        code: `/* tcp.c: tcp_output() */
tcp_output(pcb, TCP_FLG_ACK, NULL, 0);`
      },
      {
        id: 'tcp_8',
        title: 'Connection Established & Ready',
        sub: 'Full-Duplex Channel Open',
        layer: 'SOCK',
        color: '#10b981',
        cFunc: 'sock_accept() unblocks',
        desc: 'Server receives ACK. Transitions state to ESTABLISHED. sock_accept() unblocks and returns dedicated client socket descriptor.',
        ingress: 'Server receives ACK (Ack=2001)',
        egress: 'Both in ESTABLISHED, Ready for HTTP Stream',
        code: `/* tcp.c & app/tcps.c */
pcb->state = TCP_STATE_ESTABLISHED;
/* Connection ready for sock_send / sock_recv */`
      }
    ]
  },

  http_request: {
    id: 'http_request',
    title: 'HTTP Application Request-Response Workflow',
    protocol: 'HTTP/1.1 over TCP (Port 80)',
    layer: 'Application Layer / L5',
    color: '#059669',
    topic: 'Layer 7 HTTP/1.1 Web Exchange & Socket API (RFC 2616)',
    topicCategory: 'Application Layer Client-Server Interaction & BSD Sockets',
    theorySummary: 'Demonstrates end-to-end web document retrieval over an established TCP byte stream using HTTP GET request headers and server 200 OK HTML delivery.',
    keyConcepts: [
      'BSD Socket Interface (sock_open, sock_send, sock_recv)',
      'HTTP/1.1 Request Header Parsing (GET /index.html)',
      'HTTP Status Codes (200 OK, Content-Type: text/html)',
      'TCP Stream Buffering & PSH (Push) Flag Segmentation'
    ],
    procedureSteps: [
      'Step 1: Select "HTTP / Web" from the protocol selector pills.',
      'Step 2: Follow the 9-node pipeline from socket check to HTTP GET framing and HTML rendering.',
      'Step 3: Click "Run Pipeline" to execute the HTTP request and trigger the user-space web server.',
      'Step 4: Observe the HTTP header dispatch and socket stream queueing in the Terminal beside.',
      'Step 5: View the rendered HTTP/1.1 200 OK web response in the Execution Result card.'
    ],
    summary: 'Full client-server web exchange: client sends HTTP GET /index.html and MicroPS user-space web server serves HTML response.',
    cModule: 'app/tcps.c & sock.c',
    rfc: 'RFC 2616 & RFC 793',
    nodes: [
      {
        id: 'http_1',
        title: 'Check TCP Connection State',
        sub: 'Socket Verification',
        layer: 'SOCK',
        color: '#38bdf8',
        cFunc: 'sock_open() verification',
        desc: 'Verifies socket descriptor is bound to an active full-duplex TCP byte stream in ESTABLISHED state.',
        ingress: 'Socket FD: 3',
        egress: 'Socket Status: ESTABLISHED',
        code: `if (pcb->state != TCP_STATE_ESTABLISHED) {
    /* Must perform 3-way handshake first */
}`
      },
      {
        id: 'http_2',
        title: 'Construct HTTP/1.1 GET Request',
        sub: 'Application Layer PDU',
        layer: 'APP',
        color: '#10b981',
        cFunc: 'buildHttpRequest()',
        desc: 'Constructs standard HTTP request text: "GET /index.html HTTP/1.1\\r\\nHost: 192.0.2.2\\r\\nUser-Agent: MicroPS-Client\\r\\n\\r\\n".',
        ingress: 'Method: GET, Path: /index.html',
        egress: 'ASCII Request Buffer: 78 bytes',
        code: `/* Client HTTP Request Buffer */
char *req = "GET /index.html HTTP/1.1\\r\\nHost: 192.0.2.2\\r\\n\\r\\n";`
      },
      {
        id: 'http_3',
        title: 'TCP [PSH, ACK] Segmentation',
        sub: 'tcp.c Segmenter',
        layer: 'L4',
        color: '#a855f7',
        cFunc: 'sock_send() -> tcp_send()',
        desc: 'Encapsulates HTTP request bytes into a TCP segment with PSH and ACK flags (0x18) to trigger immediate receiver processing.',
        ingress: '78B HTTP Payload',
        egress: 'TCP Segment: Seq=1001, Ack=2001, Flags=PSH|ACK',
        code: `/* sock.c: sock_send() */
ret = tcp_send(entry->desc, buf, len);
/* Sets TCP_FLG_PSH | TCP_FLG_ACK */`
      },
      {
        id: 'http_4',
        title: 'IPv4 & Ethernet Encapsulation',
        sub: 'ip.c & ether.c',
        layer: 'L3',
        color: '#06b6d4',
        cFunc: 'ip_output() in ip.c',
        desc: 'Prepends 20B IPv4 header (Proto 6) and 14B Ethernet II header. Transmits frame over Linux TAP adapter net2.',
        ingress: '98B TCP Segment',
        egress: '132B Ethernet Frame on Wire',
        code: `/* ip.c: ip_output() */
ip_output_iface(iface, 6, data, len, src, dst);`
      },
      {
        id: 'http_5',
        title: 'MicroPS User-Space Queue Pop',
        sub: 'net.c Dispatcher',
        layer: 'L1',
        color: '#6366f1',
        cFunc: 'net_thread() & net_input_handler()',
        desc: 'Worker thread pops Ethernet frame from net2 queue, validates IP checksum, and dispatches segment into tcp_input().',
        ingress: 'TAP /dev/net/tun Ingress',
        egress: 'Delivered to tcp_input()',
        code: `/* net.c */
net_input_handler(dev, ETHER_TYPE_IP, data, len);`
      },
      {
        id: 'http_6',
        title: 'Application Read via sock_recv()',
        sub: 'app/tcps.c Server',
        layer: 'SOCK',
        color: '#38bdf8',
        cFunc: 'sock_recv() in sock.c',
        desc: 'Web server in app/tcps.c calls sock_recv(acc, buf, sizeof(buf)). Extracts HTTP request string from TCP receive queue.',
        ingress: 'TCP Reassembly Buffer',
        egress: 'Server receives: "GET /index.html HTTP/1.1"',
        code: `/* app/tcps.c */
ret = sock_recv(acc, buf, sizeof(buf));
/* buf contains GET /index.html */`
      },
      {
        id: 'http_7',
        title: 'Web Server Route Dispatch',
        sub: 'app/tcps.c Business Logic',
        layer: 'APP',
        color: '#10b981',
        cFunc: 'http_handle_request()',
        desc: 'Server parses method GET and path /index.html. Generates HTML document with HTTP/1.1 200 OK headers.',
        ingress: 'Path: /index.html',
        egress: 'HTTP/1.1 200 OK (Content-Length: 76)',
        code: `/* app/tcps.c */
char *resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/html\\r\\n\\r\\n<h1>MicroPS</h1>";`
      },
      {
        id: 'http_8',
        title: 'Transmit HTTP 200 OK Response',
        sub: 'sock_send() Streaming',
        layer: 'SOCK',
        color: '#10b981',
        cFunc: 'sock_send() in sock.c',
        desc: 'Server transmits response bytes over TCP socket: sock_send(acc, resp, len). Increments server SND.NXT sequence number.',
        ingress: '76B HTML Response',
        egress: 'TCP Segment: Seq=2001, Ack=1079, Flags=PSH|ACK',
        code: `/* app/tcps.c */
sock_send(acc, resp, strlen(resp));`
      },
      {
        id: 'http_9',
        title: 'Client Web Page Render',
        sub: 'Browser DOM Engine',
        layer: 'APP',
        color: '#10b981',
        cFunc: 'Client Application Receive',
        desc: 'Client socket receives HTTP/1.1 200 OK payload, parses HTML body, and displays rendered web content.',
        ingress: 'HTTP/1.1 200 OK received',
        egress: 'Status: 200 OK, Page Rendered Successfully',
        code: `/* HTTP Exchange Complete */`
      }
    ]
  },

  udp_service: {
    id: 'udp_service',
    title: 'UDP Zero-Handshake Datagram Workflow',
    protocol: 'UDP (RFC 768)',
    layer: 'Layer 4 / Transport',
    color: '#7c3aed',
    topic: 'Layer 4 UDP Connectionless Datagram Transport (RFC 768)',
    topicCategory: 'Transport Layer Low-Latency & Unreliable Best-Effort Delivery',
    theorySummary: 'Transmits independent datagrams directly to port 53 without 3-way handshakes, sequence tracking, or retransmission overhead.',
    keyConcepts: [
      'Connectionless Transport (Zero Handshake Latency)',
      'Compact 8-Byte UDP Header (Src Port, Dst Port, Length, Checksum)',
      'Port-Based Multiplexing & Socket Queue Buffering',
      'Best-Effort Delivery (No Flow Control or Retransmission)'
    ],
    procedureSteps: [
      'Step 1: Select "UDP (RFC 768)" from the protocol selector pills.',
      'Step 2: Inspect the 7-node pipeline showing immediate socket framing and zero negotiation latency.',
      'Step 3: Click "Run Pipeline" to emit the UDP datagram to port 53.',
      'Step 4: Watch the instant TAP encapsulation and socket queue pop inside the Terminal beside.',
      'Step 5: Verify the DNS query delivered to the server application in the Execution Result box.'
    ],
    summary: 'Connectionless, low-latency transmission: transmits datagrams immediately without 3-way handshake or connection state.',
    cModule: 'udp.c & sock.c',
    rfc: 'RFC 768',
    nodes: [
      {
        id: 'udp_1',
        title: 'Prepare Application Payload',
        sub: 'DNS Query / Message',
        layer: 'APP',
        color: '#8b5cf6',
        cFunc: 'Application Datagram Init',
        desc: 'Application prepares lightweight query payload (e.g. DNS Query for example.com, 24 bytes).',
        ingress: 'Message: "DNS Query: example.com"',
        egress: 'Payload Size: 24 bytes',
        code: `/* DNS Query Preparation */
char *query = "DNS Query: example.com";`
      },
      {
        id: 'udp_2',
        title: 'Socket Descriptor Allocation',
        sub: 'sock.c Datagram Socket',
        layer: 'SOCK',
        color: '#38bdf8',
        cFunc: 'sock_open(AF_INET, SOCK_DGRAM, 0)',
        desc: 'Opens a connectionless datagram socket. Binds ephemeral client port 52140 without any handshaking overhead.',
        ingress: 'Domain=AF_INET, Type=SOCK_DGRAM',
        egress: 'Socket FD: 5 allocated',
        code: `/* sock.c: sock_open() */
entry->desc = udp_open();
entry->type = SOCK_DGRAM;`
      },
      {
        id: 'udp_3',
        title: 'Build UDP Header (8 Bytes)',
        sub: 'udp.c Header Assembly',
        layer: 'L4',
        color: '#8b5cf6',
        cFunc: 'udp_output() in udp.c',
        desc: 'Constructs compact 8-byte UDP header: Source Port=52140, Dest Port=53 (DNS), Length=32B, Checksum.',
        ingress: 'Src: 52140, Dst: 53, Payload: 24B',
        egress: 'UDP Datagram: 32 bytes',
        code: `/* udp.c: udp_output() */
hdr->src = hton16(src_port);
hdr->dst = hton16(dst_port);
hdr->len = hton16(sizeof(*hdr) + len);
hdr->sum = 0; /* UDP checksum calculation */`
      },
      {
        id: 'udp_4',
        title: 'IPv4 Protocol 17 Encapsulation',
        sub: 'ip.c Network Layer',
        layer: 'L3',
        color: '#06b6d4',
        cFunc: 'ip_output() in ip.c',
        desc: 'Prepends 20B IPv4 header with Protocol number set to 17 (UDP). Computes IP checksum.',
        ingress: '32B UDP Datagram',
        egress: '52B IPv4 Packet (Proto 17)',
        code: `/* ip.c: ip_output() */
ip_output_iface(iface, 17, data, len, src, dst);`
      },
      {
        id: 'udp_5',
        title: 'Immediate Wire Transmission (0ms Delay)',
        sub: 'ether.c Framing',
        layer: 'L2',
        color: '#f59e0b',
        cFunc: 'ether_output() in ether.c',
        desc: 'Encapsulates into 66B Ethernet frame. Transmitted immediately without waiting for handshake completion.',
        ingress: '52B IP Packet',
        egress: 'Transmitted over TAP bus (Latency: 0.040 ms)',
        code: `/* ether.c */
dev->ops->transmit(dev, frame, len);`
      },
      {
        id: 'udp_6',
        title: 'MicroPS User-Space Port Demux',
        sub: 'udp.c Datagram Dispatcher',
        layer: 'L4',
        color: '#8b5cf6',
        cFunc: 'udp_input() in udp.c',
        desc: 'MicroPS receives datagram. Looks up UDP PCB matching destination port 53. Pushes payload directly into socket queue.',
        ingress: 'Dest Port: 53',
        egress: 'Matched PCB -> queue_push()',
        code: `/* udp.c: udp_input() */
pcb = udp_pcb_get(dst, hdr->dst);
queue_push(&pcb->queue, data + sizeof(*hdr), len);`
      },
      {
        id: 'udp_7',
        title: 'Application Consumes Datagram',
        sub: 'sock_recvfrom()',
        layer: 'SOCK',
        color: '#10b981',
        cFunc: 'sock_recvfrom() in sock.c',
        desc: 'DNS server application consumes datagram without connection state or acknowledgment overhead.',
        ingress: 'Queue pop: 24 bytes',
        egress: 'Status: DELIVERED (Connectionless)',
        code: `/* sock.c: sock_recvfrom() */
ret = queue_pop(&pcb->queue);`
      }
    ]
  },

  flow_control: {
    id: 'flow_control',
    title: 'Sliding Window Flow Control Pacing Workflow',
    protocol: 'TCP Flow Control (RFC 793)',
    layer: 'Layer 4 / Transport',
    color: '#0891b2',
    topic: 'Layer 4 TCP Sliding Window Flow Control & Buffer Pacing (RFC 793)',
    topicCategory: 'Transport Layer End-to-End Flow Control & Congestion Avoidance',
    theorySummary: 'Dynamically throttles sender transmission according to receiver buffer availability using the Advertised Window field (rcv.wnd) to prevent buffer overflows.',
    keyConcepts: [
      'Receiver Advertised Window (rcv.wnd) Buffer Pacing',
      'Sender Usable Window Calculation: (snd.una + snd.wnd) - snd.nxt',
      'Zero-Window Probing & Silly Window Syndrome Prevention',
      'End-to-End Reliability with Zero Buffer-Drop Guarantee'
    ],
    procedureSteps: [
      'Step 1: Select "TCP Flow Control" from the protocol selector pills.',
      'Step 2: Observe the 6-node pipeline modeling receiver buffer saturation down to 16KB.',
      'Step 3: Click "Run Pipeline" to simulate window throttling in the user-space stack.',
      'Step 4: Check the Terminal beside to see tcp_window_available() flight calculation in action.',
      'Step 5: Verify the paced window limit (16,384 bytes) and zero dropped packets in the Result card.'
    ],
    summary: 'Demonstrates end-to-end flow control: the receiver advertises available buffer space (snd_wnd) to throttle sender pacing.',
    cModule: 'tcp.c (Window Management)',
    rfc: 'RFC 793 Section 3.7',
    nodes: [
      {
        id: 'flow_1',
        title: 'Receiver Buffer Saturation Check',
        sub: 'MicroPS Buffer Monitor',
        layer: 'L4',
        color: '#06b6d4',
        cFunc: 'tcp_rx_buffer_check()',
        desc: 'Receiver socket buffer occupancy increases. Available space drops to 16,384 bytes.',
        ingress: 'Initial Window: 65,535 bytes',
        egress: 'New Advertised Window: 16,384 bytes',
        code: `/* Buffer space computation */
available_buf = rcv_buf_size - rcv_buffered_bytes;`
      },
      {
        id: 'flow_2',
        title: 'Generate Advertised Window (rcv.wnd)',
        sub: 'tcp.c Window Field',
        layer: 'L4',
        color: '#a855f7',
        cFunc: 'tcp_output() in tcp.c',
        desc: 'Sets the 16-bit Window field in the outgoing TCP segment to 16,384 bytes.',
        ingress: 'rcv.wnd = 16384',
        egress: 'TCP Window Field = 0x4000',
        code: `/* tcp.c: tcp_output() */
hdr->wnd = hton16(pcb->rcv.wnd); /* Advertised Window */`
      },
      {
        id: 'flow_3',
        title: 'Transmit Window Advertisement ACK',
        sub: 'Network Transport',
        layer: 'L4',
        color: '#a855f7',
        cFunc: 'tcp_output(ACK)',
        desc: 'Transmits TCP ACK segment carrying the updated window size to the sender.',
        ingress: 'Flags=[ACK], Win=16384 B',
        egress: 'Segment received by sender',
        code: `/* Transmission over net2 */`
      },
      {
        id: 'flow_4',
        title: 'Sender Window Calculation',
        sub: 'tcp.c Usable Window',
        layer: 'L4',
        color: '#38bdf8',
        cFunc: 'tcp_window_available() in tcp.c',
        desc: 'Sender updates snd.wnd = 16,384. Computes usable flight window = (snd.una + snd.wnd) - snd.nxt.',
        ingress: 'snd.wnd = 16384 B',
        egress: 'Usable Flight Window = 16,384 B',
        code: `/* tcp.c: tcp_window_available() */
if (pcb->snd.nxt >= pcb->snd.una + pcb->snd.wnd) {
    return 0; /* Receiver window full: PAUSE transmission */
}
usable = (pcb->snd.una + pcb->snd.wnd) - pcb->snd.nxt;`
      },
      {
        id: 'flow_5',
        title: 'Sender Transmission Throttling',
        sub: 'Flow Control Pacing',
        layer: 'L4',
        color: '#f59e0b',
        cFunc: 'tcp_output() Throttler',
        desc: 'Sender caps outgoing segment burst to 16,384 bytes, matching the receiver processing speed.',
        ingress: 'Segment Payload <= Usable Window',
        egress: 'Transmission Rate Paced to 16KB',
        code: `/* Rate throttled to prevent buffer overrun */`
      },
      {
        id: 'flow_6',
        title: 'Zero Packet Loss Guaranteed',
        sub: 'Reliability Guarantee',
        layer: 'L4',
        color: '#10b981',
        cFunc: 'Flow Control Verification',
        desc: 'Receiver processes incoming stream without memory overflow or dropped packets.',
        ingress: 'Paced Stream Received',
        egress: 'Status: 0 Dropped Packets, Flow Control ACTIVE',
        code: `/* Receiver Buffer Healthy */`
      }
    ]
  },

  tcp_close: {
    id: 'tcp_close',
    title: 'RFC 793 TCP 4-Way Connection Teardown Workflow',
    protocol: 'TCP Teardown (RFC 793)',
    layer: 'Layer 4 / Transport',
    color: '#e11d48',
    topic: 'Layer 4 TCP 4-Way Connection Teardown & Resource Cleanup (RFC 793)',
    topicCategory: 'Transport Layer Connection Termination & FSM Transitions',
    theorySummary: 'Gracefully terminates bidirectional TCP byte streams via FIN and ACK exchanges across FIN_WAIT_1, CLOSE_WAIT, LAST_ACK, and TIME_WAIT states.',
    keyConcepts: [
      'Bidirectional 4-Way Handshake (FIN -> ACK -> FIN -> ACK)',
      'Half-Closed Connection Semantics (FIN_WAIT_2)',
      'TIME_WAIT State & 2*MSL (Maximum Segment Lifetime) Timer',
      'TCB Memory Deallocation & File Descriptor Recycling'
    ],
    procedureSteps: [
      'Step 1: Select "TCP Teardown" from the protocol selector pills.',
      'Step 2: Trace the 8-node pipeline through active close, ACK response, passive close, and final TIME_WAIT.',
      'Step 3: Click "Run Pipeline" to execute the 4-way FIN exchange.',
      'Step 4: Monitor the socket state changes and TCB deallocation in the Terminal beside.',
      'Step 5: Confirm state transition to CLOSED and socket descriptor recycling in the Result box.'
    ],
    summary: 'Graceful bidirectional connection termination: FIN -> ACK -> FIN -> ACK through FIN_WAIT_1, CLOSE_WAIT, and TIME_WAIT.',
    cModule: 'tcp.c & sock.c',
    rfc: 'RFC 793 Section 3.5',
    nodes: [
      {
        id: 'close_1',
        title: 'Client Active Close (sock_close)',
        sub: 'Client Host A',
        layer: 'SOCK',
        color: '#38bdf8',
        cFunc: 'sock_close() in sock.c',
        desc: 'Client application calls sock_close(fd). MicroPS initiates connection termination.',
        ingress: 'sock_close(fd)',
        egress: 'Initiate FIN Segment',
        code: `/* sock.c: sock_close() */
tcp_close(entry->desc);`
      },
      {
        id: 'close_2',
        title: 'Transmit Client FIN [FIN_WAIT_1]',
        sub: 'tcp.c Segment 1',
        layer: 'L4',
        color: '#f43f5e',
        cFunc: 'tcp_output(FIN | ACK)',
        desc: 'Client transmits FIN segment. Transitions state from ESTABLISHED -> FIN_WAIT_1.',
        ingress: 'Seq=1001, Flags=[FIN, ACK]',
        egress: 'Client State: FIN_WAIT_1',
        code: `/* tcp.c: tcp_close() */
pcb->state = TCP_STATE_FIN_WAIT_1;
tcp_output(pcb, TCP_FLG_FIN | TCP_FLG_ACK, NULL, 0);`
      },
      {
        id: 'close_3',
        title: 'Server Ingress [CLOSE_WAIT]',
        sub: 'MicroPS Server FSM',
        layer: 'L4',
        color: '#f59e0b',
        cFunc: 'tcp_input_state() case ESTABLISHED',
        desc: 'Server receives FIN. Transitions state from ESTABLISHED -> CLOSE_WAIT. Acknowledges with ACK.',
        ingress: 'Flags=[FIN, ACK]',
        egress: 'Server State: CLOSE_WAIT',
        code: `/* tcp.c */
pcb->rcv.nxt = ntoh32(hdr->seq) + 1;
pcb->state = TCP_STATE_CLOSE_WAIT;
tcp_output(pcb, TCP_FLG_ACK, NULL, 0);`
      },
      {
        id: 'close_4',
        title: 'Client State Transition [FIN_WAIT_2]',
        sub: 'Client FSM',
        layer: 'L4',
        color: '#38bdf8',
        cFunc: 'tcp_input_state() case FIN_WAIT_1',
        desc: 'Client receives ACK for its FIN. Transitions state from FIN_WAIT_1 -> FIN_WAIT_2 (half-closed).',
        ingress: 'Server ACK received',
        egress: 'Client State: FIN_WAIT_2',
        code: `/* tcp.c */
pcb->state = TCP_STATE_FIN_WAIT_2;`
      },
      {
        id: 'close_5',
        title: 'Server Passive Close [LAST_ACK]',
        sub: 'MicroPS Server Teardown',
        layer: 'L4',
        color: '#f43f5e',
        cFunc: 'tcp_output(FIN | ACK)',
        desc: 'Server flushes remaining outbound data and transmits its own FIN segment. State moves to LAST_ACK.',
        ingress: 'Server Finished Sending',
        egress: 'Server State: LAST_ACK',
        code: `/* tcp.c */
pcb->state = TCP_STATE_LAST_ACK;
tcp_output(pcb, TCP_FLG_FIN | TCP_FLG_ACK, NULL, 0);`
      },
      {
        id: 'close_6',
        title: 'Client Final ACK [TIME_WAIT]',
        sub: 'Client 2*MSL Timer',
        layer: 'L4',
        color: '#f59e0b',
        cFunc: 'tcp_output(ACK)',
        desc: 'Client acknowledges server FIN. Transitions state from FIN_WAIT_2 -> TIME_WAIT (starts 2*MSL timer).',
        ingress: 'Server FIN received',
        egress: 'Client State: TIME_WAIT',
        code: `/* tcp.c */
pcb->state = TCP_STATE_TIME_WAIT;
tcp_output(pcb, TCP_FLG_ACK, NULL, 0);`
      },
      {
        id: 'close_7',
        title: 'Server Transition [CLOSED]',
        sub: 'Server PCB Deallocation',
        layer: 'L4',
        color: '#10b981',
        cFunc: 'tcp_pcb_release()',
        desc: 'Server receives final ACK. Transitions to CLOSED and frees PCB memory.',
        ingress: 'Final ACK received',
        egress: 'Server State: CLOSED',
        code: `/* tcp.c */
pcb->state = TCP_STATE_CLOSED;
tcp_pcb_release(pcb);`
      },
      {
        id: 'close_8',
        title: 'Connection Fully Terminated',
        sub: 'Resource Cleanup Complete',
        layer: 'SOCK',
        color: '#10b981',
        cFunc: 'sock_free()',
        desc: 'Both endpoints closed cleanly. Socket descriptors and file handles recycled.',
        ingress: 'Both Sockets CLOSED',
        egress: 'Status: TERMINATED Cleanly',
        code: `/* Teardown Complete */`
      }
    ]
  }
};
