/**
 * MicroPS Core Protocol Engine
 * Full L2-L4 User-Space Networking Stack Simulator mirroring C implementation in microps-master:
 * - net.c / driver: Physical & Logical Interface Abstraction (net0, net1, net2 TAP)
 * - ether.c: Ethernet II Framing (RFC 894, 14-byte MAC header)
 * - arp.c: Address Resolution Protocol (RFC 826) & Dynamic ARP Cache Table
 * - ip.c: IPv4 Packet Processing, Routing Table & Fragmentation (RFC 791)
 * - icmp.c: Internet Control Message Protocol Echo Ping (RFC 792)
 * - udp.c: User Datagram Protocol Connectionless Service (RFC 768)
 * - tcp.c: RFC 793 11-State Finite State Machine, TCB, Flow Control & Retransmission
 * - sock.c: BSD-compatible User-Space Socket API
 * - app/tcps.c: Web Server (HTTP/1.1) & Echo Server
 */

export const TCP_STATES = {
  CLOSED: 'CLOSED',
  LISTEN: 'LISTEN',
  SYN_SENT: 'SYN_SENT',
  SYN_RECEIVED: 'SYN_RECEIVED',
  ESTABLISHED: 'ESTABLISHED',
  FIN_WAIT_1: 'FIN_WAIT_1',
  FIN_WAIT_2: 'FIN_WAIT_2',
  CLOSING: 'CLOSING',
  TIME_WAIT: 'TIME_WAIT',
  CLOSE_WAIT: 'CLOSE_WAIT',
  LAST_ACK: 'LAST_ACK'
};

export const PORTS = {
  HTTP: 80,
  HTTPS: 443,
  ECHO: 7,
  DNS: 53,
  CLIENT_EPHEMERAL: 52140
};

export const HOST_DEVICE = {
  name: 'Client Node (Virtual Host A)',
  ip: '192.0.2.1',
  port: PORTS.CLIENT_EPHEMERAL,
  mac: '0e:4e:af:bc:64:c6',
  dev: 'vhost0'
};

export const SERVER_DEVICE = {
  name: 'MicroPS Host B (User-Space C Stack)',
  ip: '192.0.2.2',
  httpPort: PORTS.HTTP,
  echoPort: PORTS.ECHO,
  dnsPort: PORTS.DNS,
  mac: '00:00:5e:00:53:01',
  dev: 'net2 (TAP)'
};

export const GATEWAY_DEVICE = {
  name: 'Virtual Switch / Default Gateway',
  ip: '192.0.2.254',
  mac: '52:54:00:12:34:fe',
  dev: 'br0'
};

export const SYSTEM_DEVICES = [
  { name: 'net0', type: 'Null Device', driver: 'driver/null.c', state: 'UP', mtu: 65535, ip: '0.0.0.0', mac: '00:00:00:00:00:00', rxPkts: 0, txPkts: 0 },
  { name: 'net1', type: 'Loopback Device', driver: 'driver/loopback.c', state: 'UP', mtu: 65535, ip: '127.0.0.1', mac: '00:00:00:00:00:00', rxPkts: 12, txPkts: 12 },
  { name: 'net2', type: 'Ethernet TAP (Linux)', driver: 'driver/ether_tap_linux.c', state: 'UP', mtu: 1500, ip: '192.0.2.2', mac: '00:00:5e:00:53:01', rxPkts: 84, txPkts: 76 }
];

export const INITIAL_ROUTES = [
  { network: '127.0.0.0', netmask: '255.0.0.0', nexthop: '0.0.0.0', iface: '127.0.0.1', dev: 'net1', type: 'Local Loopback' },
  { network: '192.0.2.0', netmask: '255.255.255.0', nexthop: '0.0.0.0', iface: '192.0.2.2', dev: 'net2', type: 'Direct Link' },
  { network: '0.0.0.0', netmask: '0.0.0.0', nexthop: '192.0.2.1', iface: '192.0.2.2', dev: 'net2', type: 'Default Gateway' }
];

export const INITIAL_ARP_CACHE = [
  { ip: '192.0.2.1', mac: '0e:4e:af:bc:64:c6', dev: 'net2', state: 'RESOLVED', ttl: 28 },
  { ip: '192.0.2.254', mac: '52:54:00:12:34:fe', dev: 'net2', state: 'STATIC', ttl: 300 }
];

export const INITIAL_SOCKET_TABLE = [
  { fd: 3, family: 'AF_INET', type: 'SOCK_STREAM', proto: 'IPPROTO_TCP', local: '192.0.2.2:80', remote: '0.0.0.0:0', state: 'LISTEN', app: 'HTTP Web Server (app/tcps.c)' },
  { fd: 4, family: 'AF_INET', type: 'SOCK_STREAM', proto: 'IPPROTO_TCP', local: '192.0.2.2:7', remote: '0.0.0.0:0', state: 'LISTEN', app: 'Echo Server (app/tcps.c)' },
  { fd: 5, family: 'AF_INET', type: 'SOCK_DGRAM', proto: 'IPPROTO_UDP', local: '192.0.2.2:53', remote: '0.0.0.0:0', state: 'BOUND', app: 'DNS Responder (app/udps.c)' }
];

// Converts string to byte array
export function stringToBytes(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i) & 0xff);
  }
  return bytes;
}

// 16-bit 1's complement checksum (RFC 1071)
export function calculateChecksum(bytes) {
  let sum = 0;
  for (let i = 0; i < bytes.length; i += 2) {
    const high = bytes[i] || 0;
    const low = bytes[i + 1] || 0;
    sum += (high << 8) | low;
    while (sum >> 16) {
      sum = (sum & 0xffff) + (sum >> 16);
    }
  }
  return (~sum) & 0xffff;
}

// Generates Wireshark-style formatted hex dump
export function generateHexDump(bytes) {
  if (!bytes || bytes.length === 0) return '// No raw byte buffer';
  let lines = [];
  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16);
    const offset = i.toString(16).padStart(4, '0');
    
    const hexParts = [];
    for (let j = 0; j < 16; j++) {
      if (j < chunk.length) {
        hexParts.push(chunk[j].toString(16).padStart(2, '0'));
      } else {
        hexParts.push('  ');
      }
      if (j === 7) hexParts.push('');
    }
    const hexStr = hexParts.join(' ');
    const asciiStr = chunk.map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
    lines.push(`${offset}   ${hexStr.padEnd(50, ' ')}  |${asciiStr}|`);
  }
  return lines.join('\n');
}

// Builds Ethernet II Frame (RFC 894, 14 bytes)
export function buildEthernetFrame(dstMac, srcMac, etherType, payloadBytes) {
  const frame = [];
  dstMac.split(':').forEach(b => frame.push(parseInt(b, 16)));
  srcMac.split(':').forEach(b => frame.push(parseInt(b, 16)));
  frame.push((etherType >> 8) & 0xff);
  frame.push(etherType & 0xff);
  frame.push(...payloadBytes);
  while (frame.length < 60) frame.push(0x00); // 60B min Ethernet frame size (excluding 4B FCS)
  return frame;
}

// Builds ARP Request/Reply Packet (RFC 826, 28 bytes)
export function buildArpPacket(opcode, senderMac, senderIp, targetMac, targetIp) {
  const arp = [];
  arp.push(0x00, 0x01); // Hardware type: Ethernet (1)
  arp.push(0x08, 0x00); // Protocol type: IPv4 (0x0800)
  arp.push(0x06);       // Hardware size: 6
  arp.push(0x04);       // Protocol size: 4
  arp.push((opcode >> 8) & 0xff, opcode & 0xff); // Opcode: 1=Request, 2=Reply

  senderMac.split(':').forEach(b => arp.push(parseInt(b, 16)));
  senderIp.split('.').forEach(octet => arp.push(parseInt(octet, 10)));

  targetMac.split(':').forEach(b => arp.push(parseInt(b, 16)));
  targetIp.split('.').forEach(octet => arp.push(parseInt(octet, 10)));

  return arp;
}

// Builds IPv4 Packet Header & Body (RFC 791, 20 bytes min)
export function buildIpPacket(srcIp, dstIp, protocol, payloadBytes, id = 0x4102) {
  const ipHdr = [];
  ipHdr.push(0x45); // Version 4, IHL 5 (20 bytes)
  ipHdr.push(0x00); // DSCP/ECN
  const totalLength = 20 + payloadBytes.length;
  ipHdr.push((totalLength >> 8) & 0xff);
  ipHdr.push(totalLength & 0xff);
  ipHdr.push((id >> 8) & 0xff);
  ipHdr.push(id & 0xff);
  ipHdr.push(0x40); // Flags: Don't Fragment (DF)
  ipHdr.push(0x00); // Fragment Offset 0
  ipHdr.push(64);   // TTL 64
  ipHdr.push(protocol); // 1 = ICMP, 6 = TCP, 17 = UDP
  ipHdr.push(0x00, 0x00); // Checksum placeholder
  
  srcIp.split('.').forEach(octet => ipHdr.push(parseInt(octet, 10)));
  dstIp.split('.').forEach(octet => ipHdr.push(parseInt(octet, 10)));

  const csum = calculateChecksum(ipHdr);
  ipHdr[10] = (csum >> 8) & 0xff;
  ipHdr[11] = csum & 0xff;

  return [...ipHdr, ...payloadBytes];
}

// Builds ICMP Echo Request / Reply (RFC 792, 8 bytes + payload)
export function buildIcmpEchoPacket(type, code = 0, id = 1, seq = 1, payload = 'MicroPS Ping Echo Data (32 bytes)') {
  const icmp = [];
  icmp.push(type); // 8 = Echo Request, 0 = Echo Reply
  icmp.push(code); // 0
  icmp.push(0x00, 0x00); // Checksum placeholder
  icmp.push((id >> 8) & 0xff, id & 0xff);
  icmp.push((seq >> 8) & 0xff, seq & 0xff);

  const payloadBytes = typeof payload === 'string' ? stringToBytes(payload) : payload;
  icmp.push(...payloadBytes);

  const csum = calculateChecksum(icmp);
  icmp[2] = (csum >> 8) & 0xff;
  icmp[3] = csum & 0xff;

  return icmp;
}

// Builds TCP Segment (RFC 793, 20 bytes min)
export function buildTcpSegment(srcPort, dstPort, seq, ack, flags, window = 65535, payload = []) {
  const tcp = [];
  tcp.push((srcPort >> 8) & 0xff, srcPort & 0xff);
  tcp.push((dstPort >> 8) & 0xff, dstPort & 0xff);
  
  // Sequence Number (4 bytes)
  tcp.push((seq >>> 24) & 0xff, (seq >>> 16) & 0xff, (seq >>> 8) & 0xff, seq & 0xff);
  // Acknowledgment Number (4 bytes)
  tcp.push((ack >>> 24) & 0xff, (ack >>> 16) & 0xff, (ack >>> 8) & 0xff, ack & 0xff);

  // Data Offset (5 = 20B)
  tcp.push(0x50);
  // TCP Flags: URG, ACK, PSH, RST, SYN, FIN
  tcp.push(flags);

  // Flow Control Window Size (16 bits)
  tcp.push((window >> 8) & 0xff, window & 0xff);

  // Checksum placeholder & Urgent pointer
  tcp.push(0x00, 0x00, 0x00, 0x00);
  tcp.push(...payload);

  const csum = calculateChecksum(tcp);
  tcp[16] = (csum >> 8) & 0xff;
  tcp[17] = csum & 0xff;

  return tcp;
}

// Builds UDP Datagram (RFC 768, 8 bytes)
export function buildUdpDatagram(srcPort, dstPort, payload = []) {
  const udp = [];
  udp.push((srcPort >> 8) & 0xff, srcPort & 0xff);
  udp.push((dstPort >> 8) & 0xff, dstPort & 0xff);

  const length = 8 + payload.length;
  udp.push((length >> 8) & 0xff, length & 0xff);
  udp.push(0x00, 0x00); // Checksum placeholder
  udp.push(...payload);

  const csum = calculateChecksum(udp);
  udp[6] = (csum >> 8) & 0xff;
  udp[7] = csum & 0xff;

  return udp;
}

// Builds HTTP Request (Application Layer Protocol)
export function buildHttpRequest(method = 'GET', path = '/index.html', host = '192.0.2.2') {
  return `${method} ${path} HTTP/1.1\r\nHost: ${host}\r\nUser-Agent: MicroPS-UserSpace-Client/1.0\r\nAccept: text/html,application/json\r\nConnection: keep-alive\r\n\r\n`;
}

// Builds HTTP Response (Application Layer Protocol)
export function buildHttpResponse(statusCode = 200, statusText = 'OK', body = '<html><body><h1>MicroPS User-Space Web Server</h1><p>Processed entirely in user space by microps-master C stack!</p></body></html>') {
  return `HTTP/1.1 ${statusCode} ${statusText}\r\nDate: ${new Date().toUTCString()}\r\nServer: MicroPS/1.0-C (RFC-Compliant Stack)\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Length: ${body.length}\r\nConnection: keep-alive\r\n\r\n${body}`;
}
