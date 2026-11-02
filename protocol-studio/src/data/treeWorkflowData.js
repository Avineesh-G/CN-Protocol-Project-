/**
 * MicroPS Interactive Tree Workflow Data
 * Radiating Mindmap / Station Structure with Root Node, Primary Branches, Sub-Divisions,
 * Level 4 Continuation Layer Data (Algorithmic Pseudocode, Project File Structure, and Real-World Systems).
 */

export const PROJECT_DIRECTORY_STRUCTURE = {
  name: 'microps-network-stack',
  version: '1.0.0-production',
  description: 'Clean Modular User-Space TCP/IP Protocol Stack in C (Linux TAP /dev/net/tun)',
  sections: [
    {
      dir: 'include/',
      badge: 'Public Headers',
      color: '#38bdf8',
      description: 'Protocol header definitions, RFC byte structures, and API declarations',
      files: [
        { name: 'net.h', desc: 'struct net_device, protocol register queue, poll ops' },
        { name: 'ether.h', desc: 'Ethernet II header, MAC addressing, 0x0806 ARP, 0x0800 IPv4' },
        { name: 'arp.h', desc: 'struct arp_hdr, struct arp_cache table, ARP opcodes' },
        { name: 'ip.h', desc: 'struct ip_hdr, routing table, RFC 1071 16-bit checksum' },
        { name: 'icmp.h', desc: 'struct icmp_hdr, Echo Request/Reply types and codes' },
        { name: 'udp.h', desc: 'struct udp_hdr, UDP pseudo-header, port binding table' },
        { name: 'tcp.h', desc: 'struct tcp_hdr, TCB state machine, sliding window queues' },
        { name: 'sock.h', desc: 'BSD socket abstraction (sock_create, bind, listen, accept, send, recv)' }
      ]
    },
    {
      dir: 'driver/',
      badge: 'Hardware Abstraction Layer',
      color: '#818cf8',
      description: 'Virtual & physical network interface device drivers',
      files: [
        { name: 'ether_tap_linux.c', desc: 'Linux /dev/net/tun virtual TAP adapter (ioctl TUNSETIFF, non-blocking I/O)' },
        { name: 'ether_pcap.c', desc: 'Cross-platform Libpcap raw interface capture driver' }
      ]
    },
    {
      dir: 'src/',
      badge: 'Core Protocol Engines',
      color: '#10b981',
      description: 'RFC protocol processing engines and worker threads in user space',
      files: [
        { name: 'net.c', desc: 'POSIX net_thread event worker loop, timer subsystem, memory pool' },
        { name: 'ether.c', desc: 'Layer 2 framing, destination MAC filtering, protocol demux' },
        { name: 'arp.c', desc: 'ARP request broadcast, dynamic table aging with 30s TTL timer' },
        { name: 'ip.c', desc: 'IPv4 routing, Longest Prefix Match (LPM), fragmentation handling' },
        { name: 'icmp.c', desc: 'ICMP echo reply generator, destination unreachable dispatcher' },
        { name: 'udp.c', desc: 'UDP datagram dispatch, port queue matching, checksum check' },
        { name: 'tcp.c', desc: 'RFC 793 11-state FSM, 3-way handshake, retransmission timer queue' },
        { name: 'sock.c', desc: 'BSD socket descriptors, blocking queue synchronization with condvars' }
      ]
    },
    {
      dir: 'apps/',
      badge: 'User Applications',
      color: '#f59e0b',
      description: 'Production network applications built on top of user-space stack',
      files: [
        { name: 'http_server.c', desc: 'Concurrent HTTP/1.1 static file and REST API server' },
        { name: 'echo_server.c', desc: 'TCP multi-client echo benchmark utility' },
        { name: 'ping.c', desc: 'User-space ICMP ping diagnostic tool with RTT measurement' }
      ]
    },
    {
      dir: 'tests/',
      badge: 'Validation Suite',
      color: '#ec4899',
      description: 'Automated RFC conformance tests and regression validation',
      files: [
        { name: 'test_checksum.c', desc: 'RFC 1071 one\'s complement 16-bit vector unit tests' },
        { name: 'test_arp_cache.c', desc: 'Cache collision, TTL eviction, and stale entry tests' },
        { name: 'test_tcp_fsm.c', desc: 'Deterministic state transitions (SYN -> ESTABLISHED -> FIN_WAIT)' }
      ]
    },
    {
      dir: 'scripts/ & Makefile',
      badge: 'Build & Config',
      color: '#94a3b8',
      description: 'Host Linux TAP configuration scripts & automated Makefiles',
      files: [
        { name: 'setup_tap.sh', desc: 'Creates host tap net2 with ip tuntap add mode tap net2 && ip addr add 192.0.2.1/24' },
        { name: 'Makefile', desc: 'Modular GNU Makefile with gcc -Wall -Wextra -pthread' }
      ]
    }
  ]
};

export const TREE_WORKFLOW_DATA = {
  root: {
    id: 'root',
    title: 'MicroPS User-Space Protocol Architecture',
    subtitle: 'User-Space TCP/IP Stack in C with Linux TAP Virtual Ethernet',
    color: '#818cf8',
    summary: 'Central user-space networking architecture bypassing the OS kernel to provide 100% deterministic packet dissection, protocol verification, and state machine control.'
  },
  branches: [
    {
      id: 'net_basics',
      title: 'Networking Basics & TAP Adapter',
      category: 'Layer 1 / Physical & Virtual Bus',
      color: '#6366f1',
      protocol: 'Linux TAP /dev/net/tun',
      summary: 'Virtual Ethernet link that bridges host OS network frames directly into user-space memory via file descriptors.',
      explanation: 'Traditional network stacks process packets in kernel space (Ring 0). MicroPS opens the Linux /dev/net/tun device with the IFF_TAP flag. This creates a virtual network interface (net2) where raw Layer 2 Ethernet frames are passed directly to user-space without kernel filtering.',
      projectUse: 'Widely used in modern VPN software (OpenVPN, WireGuard), hypervisor virtual switches (QEMU, VirtualBox), cloud container network interfaces (CNI plugins in Kubernetes), and high-speed user-space packet processors (DPDK, FD.io VPP).',
      cModule: 'driver/ether_tap_linux.c & net.c',
      cCodeDrawerKey: 'ether_tap_driver',
      projectMapping: {
        primaryFile: 'driver/ether_tap_linux.c',
        headerFile: 'include/net.h',
        layerRole: 'Hardware Abstraction & Virtual Link Layer',
        keyStructures: [
          'struct ether_tap { char name[IFNAMSIZ]; int fd; }',
          'struct net_device { char name[16]; uint8_t addr[6]; struct net_device_ops *ops; }'
        ],
        exportedFunctions: [
          'ether_tap_open(struct net_device *dev)',
          'ether_tap_poll(struct net_device *dev)',
          'ether_tap_transmit(struct net_device *dev, uint16_t type, const uint8_t *buf, size_t len)'
        ]
      },
      pseudocode: `// =========================================================================
// ALGORITHMIC PSEUDOCODE: Linux TAP Device Lifecycle & Ingress Loop
// =========================================================================

FUNCTION ether_tap_init(device_name: String) -> NetDevice:
    // 1. Open virtual character device in Linux kernel
    fd = open("/dev/net/tun", O_RDWR | O_NONBLOCK)
    IF fd < 0 THEN RAISE Error("Failed to open /dev/net/tun")

    // 2. Configure TAP mode for raw Layer-2 Ethernet II frames
    ifr = Allocate(struct ifreq)
    ifr.ifr_flags = IFF_TAP | IFF_NO_PI   // IFF_NO_PI: omit 4-byte packet info header
    ifr.ifr_name  = Copy(device_name)

    // 3. Register virtual network adapter via kernel ioctl
    IF ioctl(fd, TUNSETIFF, ifr) < 0 THEN
        close(fd)
        RAISE Error("ioctl(TUNSETIFF) failed")

    // 4. Wrap file descriptor in User-Space Device Abstraction
    dev = Allocate(struct net_device)
    dev.name = device_name
    dev.priv_fd = fd
    dev.mtu = 1500
    dev.hw_addr = [0x00, 0x00, 0x5e, 0x00, 0x53, 0x01]
    
    RegisterDevice(dev)
    RETURN dev
END FUNCTION

FUNCTION net_poll_worker(dev: NetDevice):
    buffer = AllocateBuffer(2048)  // Ethernet MTU + 14B header
    WHILE stack_is_running DO:
        bytes_read = read(dev.priv_fd, buffer, sizeof(buffer))
        IF bytes_read > 0 THEN:
            // Strip or validate Layer 2 framing and demux
            ether_input(dev, buffer, bytes_read)
        ELSE IF bytes_read < 0 AND errno != EAGAIN THEN:
            LogWarning("Device read error")
        SLEEP_US(50)  // Low-latency yield
    END WHILE
END FUNCTION`,
      realWorldSystems: {
        linuxKernel: {
          title: 'Linux Kernel: tun.c & sk_buff',
          path: 'drivers/net/tun.c & net/core/dev.c',
          mechanism: 'The Linux kernel implements tun_chr_readv/writev. User-space writes to the TAP fd are converted into struct sk_buff and injected into netif_rx_ni(). Inbound frames on the bridge are queued into tun->readq for user-space to read.'
        },
        dpdk: {
          title: 'DPDK: Poll Mode Driver (PMD) & rte_mbuf',
          path: 'drivers/net/tap/rte_eth_tap.c',
          mechanism: 'DPDK completely bypasses interrupts using zero-copy lockless ring buffers (rte_ring) and hugepages. DPDK TAP PMD batches bursts of 32 packets at once (rte_eth_rx_burst) achieving 10M+ pps line rate.'
        },
        embeddedLwip: {
          title: 'lwIP: netif Driver & struct pbuf',
          path: 'src/netif/ethernet.c',
          mechanism: 'In embedded RTOS, a low-level netif struct defines linkoutput() and input() pointers. Packets are stored in static zero-heap pbuf chains to prevent memory fragmentation.'
        },
        productionApplication: 'WireGuard and OpenVPN build encrypted tunnels by reading raw IP/Ethernet packets from a TAP/TUN device, encrypting them in user space with ChaCha20-Poly1305, and transmitting over UDP.'
      },
      subDivisions: [
        {
          id: 'tap_1',
          name: 'Device Creation (IFF_TAP)',
          explanation: 'Opens /dev/net/tun with ioctl(TUNSETIFF, IFF_TAP | IFF_NO_PI) to register net2 virtual Ethernet device.',
          projectUse: 'Used in custom software routers and network testing frameworks to capture raw wire traffic.',
          cFunc: 'ether_tap_init()',
          status: 'SUCCESS',
          stepPseudocode: `fd = open("/dev/net/tun", O_RDWR);
ioctl(fd, TUNSETIFF, &ifr); // IFF_TAP | IFF_NO_PI
net_device_register("net2", fd);`
        },
        {
          id: 'tap_2',
          name: 'User-Space Poll Loop (net_thread)',
          explanation: 'A background POSIX thread runs an event poll loop reading raw bytes from the TAP file descriptor.',
          projectUse: 'Replaces expensive kernel interrupt handling with deterministic user-space ring buffers.',
          cFunc: 'net_thread() & ether_tap_poll()',
          status: 'SUCCESS',
          stepPseudocode: `WHILE running:
    n = read(tap_fd, rx_buf, 2048);
    IF n > 0: ether_input(dev, rx_buf, n);`
        },
        {
          id: 'tap_3',
          name: 'Device Abstraction (struct net_device)',
          explanation: 'Registers net0 (null device), net1 (loopback 127.0.0.1), and net2 (TAP adapter 192.0.2.2) into a unified device list.',
          projectUse: 'Enables testing multi-interface routing and network bridging inside a single application process.',
          cFunc: 'net_device_register()',
          status: 'SUCCESS',
          stepPseudocode: `dev->ops = { .open = ether_tap_open, .transmit = ether_tap_tx };
device_list.append(dev);`
        }
      ]
    },
    {
      id: 'arp_resolution',
      title: 'ARP Dynamic Address Resolution',
      category: 'Layer 2 / Data Link',
      color: '#f59e0b',
      protocol: 'ARP (RFC 826)',
      summary: 'Dynamically translates 32-bit logical IPv4 addresses to 48-bit physical Ethernet MAC hardware addresses.',
      explanation: 'When an IP packet must be sent to an IP address on the local subnet (192.0.2.2), the sender lacks the destination MAC address. It broadcasts an ARP Request (Opcode 1, Target MAC 00:00:00:00:00:00) to FF:FF:FF:FF:FF:FF. The target responds with a Unicast ARP Reply (Opcode 2) containing its MAC address.',
      projectUse: 'Critical for any project involving custom network drivers, Layer 2 bridges, ARP spoofing detection tools, cloud VPC gateway proxies, and embedded microcontrollers without full operating systems.',
      cModule: 'arp.c & ether.c',
      cCodeDrawerKey: 'arp_protocol',
      projectMapping: {
        primaryFile: 'src/arp.c',
        headerFile: 'include/arp.h',
        layerRole: 'Address Resolution & Dynamic Neighbor Discovery',
        keyStructures: [
          'struct arp_hdr { uint16_t hrd, pro; uint8_t hln, pln; uint16_t op; uint8_t sha[6]; uint32_t spa; uint8_t tha[6]; uint32_t tpa; }',
          'struct arp_cache { ip_addr_t pa; uint8_t ha[6]; time_t timestamp; int state; }'
        ],
        exportedFunctions: [
          'arp_resolve(struct net_device *dev, ip_addr_t pa, uint8_t *ha)',
          'arp_input(const uint8_t *data, size_t len, struct net_device *dev)',
          'arp_request(struct net_device *dev, ip_addr_t tpa)',
          'arp_reply(struct net_device *dev, const uint8_t *tha, ip_addr_t tpa)'
        ]
      },
      pseudocode: `// =========================================================================
// ALGORITHMIC PSEUDOCODE: RFC 826 ARP Protocol Engine & Dynamic Cache
// =========================================================================

STRUCT arp_cache_entry:
    pa: IPv4Address        // Protocol IP Address
    ha: MACAddress         // Physical Hardware MAC Address
    state: Enum(FREE, RESOLVED, WAITING)
    expires_at: Timestamp  // 30-second aging TTL
END STRUCT

FUNCTION arp_resolve(dev: NetDevice, target_ip: IPv4Address) -> (MACAddress, Boolean):
    // 1. Search local ARP hash cache
    entry = LookupArpCache(target_ip)
    IF entry != NULL AND entry.state == RESOLVED THEN:
        IF CurrentTime() < entry.expires_at THEN:
            RETURN (entry.ha, TRUE)  // CACHE HIT: Immediate zero-delay transmission
        ELSE:
            entry.state = FREE      // TTL EXPIRED: Evict stale entry

    // 2. CACHE MISS: Queue pending packet & broadcast ARP Request
    QueuePendingPacket(target_ip, current_packet)
    arp_send_request(dev, target_ip)
    RETURN (00:00:00:00:00:00, FALSE)
END FUNCTION

FUNCTION arp_input(dev: NetDevice, packet: Bytes, len: Integer):
    hdr = ParseArpHdr(packet)
    IF hdr.hrd != ETHERNET_TYPE_10MB OR hdr.pro != ETHER_TYPE_IP THEN RETURN
    
    // Check if target IP matches this device or we are proxying
    merge_flag = UpdateCacheIfExists(hdr.spa, hdr.sha)

    IF hdr.tpa == dev.ip_addr THEN:
        IF NOT merge_flag THEN:
            InsertArpCache(hdr.spa, hdr.sha, TTL = 30_SECONDS)

        IF hdr.op == ARP_OP_REQUEST THEN:
            // Send Unicast ARP Reply with our hardware MAC
            arp_send_reply(dev, dst_mac = hdr.sha, dst_ip = hdr.spa)
            FlushPendingQueue(hdr.spa, hdr.sha)
        ELSE IF hdr.op == ARP_OP_REPLY THEN:
            // Unblock all sockets waiting for this resolution
            FlushPendingQueue(hdr.spa, hdr.sha)
    END IF
END FUNCTION`,
      realWorldSystems: {
        linuxKernel: {
          title: 'Linux Kernel: net/ipv4/arp.c & struct neighbour',
          path: 'net/ipv4/arp.c & include/net/neighbour.h',
          mechanism: 'Linux stores ARP entries in the Neighbor Table (struct neighbour). When arp_process() runs, it triggers netfilter NF_INET_PRE_ROUTING hooks. If arp_filter or proxy_arp sysctl is enabled, it responds to subnets across physical interfaces.'
        },
        dpdk: {
          title: 'DPDK: Hardware Offload & Hash Routing',
          path: 'lib/net/rte_arp.h',
          mechanism: 'In DPDK vSwitches (e.g. OVS-DPDK), ARP packets are extracted using rte_pktmbuf_mtod() and matched against an exact-match hash table (rte_hash) in user-space without context switching.'
        },
        embeddedLwip: {
          title: 'lwIP: etharp.c & Static Table Allocation',
          path: 'src/netif/etharp.c',
          mechanism: 'Embedded systems allocate a fixed array ARP_TABLE_SIZE = 10. When full, it uses Least-Recently-Used (LRU) aging to evict stale entries without dynamic heap allocation.'
        },
        productionApplication: 'Cloud Virtual Private Clouds (AWS VPC, GCP Virtual Network) use ARP proxies in hypervisor virtual switches to intercept ARP broadcasts and return synthetic gateway MAC addresses without saturating the physical datacenter fabric.'
      },
      subDivisions: [
        {
          id: 'arp_sub1',
          name: '1. ARP Cache Table Lookup (Miss)',
          explanation: 'Before transmitting, arp_resolve() inspects the local ARP cache table. If no resolved entry exists, transmission is queued and an ARP request is triggered.',
          projectUse: 'Ensures efficient fast-path forwarding in routers by avoiding redundant broadcast queries.',
          cFunc: 'arp_resolve() in arp.c',
          status: 'SUCCESS',
          stepPseudocode: `entry = arp_cache_lookup(dst_ip);
IF (!entry || entry->state != RESOLVED) {
    arp_request(dev, dst_ip);
    RETURN -1; // Enqueue pending packet
}`
        },
        {
          id: 'arp_sub2',
          name: '2. Broadcast Request Framing (Opcode 1)',
          explanation: 'Builds 28-byte ARP header: Hardware=Ethernet(1), Proto=IPv4(0x0800), Opcode=1. Encapsulates into a 42-byte Ethernet frame with broadcast destination ff:ff:ff:ff:ff:ff and EtherType 0x0806.',
          projectUse: 'Fundamental to local area network discovery and virtual machine IP assignment in cloud hypervisors.',
          cFunc: 'arp_request() in arp.c',
          status: 'SUCCESS',
          stepPseudocode: `hdr.hrd = htons(ARP_HRD_ETHER);
hdr.pro = htons(ETHER_TYPE_IP);
hdr.op = htons(ARP_OP_REQUEST);
ether_output(dev, ETHER_ADDR_BROADCAST, 0x0806, &hdr);`
        },
        {
          id: 'arp_sub3',
          name: '3. TAP Ingress & EtherType Demux',
          explanation: 'MicroPS net_thread receives frame from net2 TAP. ether_input() inspects EtherType 0x0806 and dispatches payload to arp_input().',
          projectUse: 'Implements protocol demultiplexing identical to physical Ethernet switch hardware.',
          cFunc: 'ether_input() in ether.c',
          status: 'SUCCESS',
          stepPseudocode: `SWITCH (ntohs(eth_hdr->type)):
    CASE 0x0806: arp_input(dev, payload, len);
    CASE 0x0800: ip_input(dev, payload, len);`
        },
        {
          id: 'arp_sub4',
          name: '4. Dynamic Cache Insertion & Unicast Reply',
          explanation: 'MicroPS records sender IP-to-MAC mapping in struct arp_cache with a 30s expiration TTL timer. Generates Unicast ARP Reply (Opcode 2) with its own MAC (00:00:5e:00:53:01).',
          projectUse: 'Demonstrates self-healing dynamic cache management and address mapping in custom network appliances.',
          cFunc: 'arp_cache_insert() & arp_reply()',
          status: 'SUCCESS',
          stepPseudocode: `arp_cache_insert(hdr->spa, hdr->sha); // TTL = 30s
hdr->op = htons(ARP_OP_REPLY);
hdr->tha = hdr->sha; hdr->sha = dev->addr;
ether_output(dev, hdr->tha, 0x0806, hdr);`
        }
      ]
    },
    {
      id: 'ip_routing',
      title: 'IPv4 Routing & Longest Prefix Match',
      category: 'Layer 3 / Network',
      color: '#06b6d4',
      protocol: 'IPv4 (RFC 791)',
      summary: 'Performs hierarchical packet forwarding based on subnet masks, gateway selection, and header validation.',
      explanation: 'IPv4 provides connectionless, best-effort packet delivery across internetworks. The router or host evaluates the destination IP against its routing table using Longest Prefix Match (LPM) to choose the egress interface and next-hop router.',
      projectUse: 'Foundation for building software-defined routers (SDN), custom firewalls, edge gateways, NAT routers, and traffic engineering middleboxes.',
      cModule: 'ip.c & net.c',
      cCodeDrawerKey: 'ip_routing',
      projectMapping: {
        primaryFile: 'src/ip.c',
        headerFile: 'include/ip.h',
        layerRole: 'Internetwork Routing, Checksum Verification & LPM',
        keyStructures: [
          'struct ip_hdr { uint8_t vhl, tos; uint16_t total_len, id, offset; uint8_t ttl, proto; uint16_t csum; ip_addr_t src, dst; }',
          'struct ip_route { ip_addr_t network, netmask, nexthop; struct net_device *dev; }'
        ],
        exportedFunctions: [
          'ip_input(const uint8_t *data, size_t len, struct net_device *dev)',
          'ip_output(uint8_t proto, const uint8_t *data, size_t len, ip_addr_t src, ip_addr_t dst)',
          'ip_route_lookup(ip_addr_t dst, ip_addr_t *nexthop)',
          'ip_calculate_checksum(const void *data, size_t len)'
        ]
      },
      pseudocode: `// =========================================================================
// ALGORITHMIC PSEUDOCODE: IPv4 Header Ingress, RFC 1071 Checksum & LPM
// =========================================================================

FUNCTION ip_input(dev: NetDevice, frame_data: Bytes, len: Integer):
    IF len < 20 THEN RETURN  // Malformed: smaller than min IPv4 header
    hdr = ParseIpHdr(frame_data)

    // 1. Validate version and header length (IHL)
    version = (hdr.vhl >> 4) & 0x0F
    ihl     = (hdr.vhl & 0x0F) * 4
    IF version != 4 OR ihl < 20 THEN DropPacket()

    // 2. RFC 1071 One's Complement Checksum Verification
    IF CalculateChecksum(hdr, ihl) != 0x0000 THEN:
        LogWarning("IPv4 Checksum Corruption Detected! Dropping frame.")
        DropPacket()
        RETURN

    // 3. TTL Decrement (for forwarding routers)
    IF hdr.dst != dev.ip_addr THEN:
        IF hdr.ttl <= 1 THEN:
            SendIcmpTimeExceeded(hdr.src)
            DropPacket()
            RETURN
        hdr.ttl = hdr.ttl - 1
        hdr.csum = RecalculateChecksum(hdr, ihl)
        ForwardPacket(hdr)
        RETURN

    // 4. Transport Protocol Demultiplexing
    payload = frame_data + ihl
    payload_len = ntohs(hdr.total_len) - ihl
    SWITCH hdr.proto:
        CASE 1:  icmp_input(payload, payload_len, dev)
        CASE 6:  tcp_input(payload, payload_len, dev)
        CASE 17: udp_input(payload, payload_len, dev)
        DEFAULT: SendIcmpProtocolUnreachable(hdr)
END FUNCTION`,
      realWorldSystems: {
        linuxKernel: {
          title: 'Linux Kernel: FIB (Forwarding Information Base) & ip_rcv',
          path: 'net/ipv4/ip_input.c & net/ipv4/fib_trie.c',
          mechanism: 'Linux executes ip_rcv() which passes packets through netfilter NF_INET_PRE_ROUTING. The routing lookup uses a compressed trie data structure (LC-trie) capable of performing millions of LPM lookups per second.'
        },
        dpdk: {
          title: 'DPDK: DIR-24-8 LPM Algorithm',
          path: 'lib/lpm/rte_lpm.c',
          mechanism: 'DPDK uses a 2-stage table lookup (24-bit direct table + 8-bit secondary table) that resolves any IPv4 destination address in at most 2 memory reads, enabling 40Gbps+ routing.'
        },
        embeddedLwip: {
          title: 'lwIP: Linear Route Table Search',
          path: 'src/core/ipv4/ip4.c',
          mechanism: 'lwIP iterates through a linked list of netif structures, checking ip4_addr_netcmp() against each interface netmask. If none match, it selects netif_default.'
        },
        productionApplication: 'Core Internet border routers (BGP peering routers at ISP exchanges) maintain the global routing table (~950,000 IPv4 prefixes) using TCAM hardware chips to execute LPM in parallel in a single clock cycle.'
      },
      subDivisions: [
        {
          id: 'ip_sub1',
          name: '1. Routing Table Lookup (LPM)',
          explanation: 'Scans routing table entries comparing (dst & netmask) == network. Selects the most specific match (192.0.2.0/24 on net2).',
          projectUse: 'Used in BGP routing engines, routing protocol daemons (FRRouting), and cloud routing tables.',
          cFunc: 'ip_route_lookup() in ip.c',
          status: 'SUCCESS',
          stepPseudocode: `FOR route IN routing_table:
    IF ((dst & route.mask) == route.net):
        IF (route.mask > best_mask):
            best_route = route;`
        },
        {
          id: 'ip_sub2',
          name: '2. 16-Bit RFC 1071 Checksum Calculation',
          explanation: 'Calculates the one\'s complement sum of all 16-bit words in the 20-byte IP header to detect header bit corruption during transit.',
          projectUse: 'Essential for data integrity verification in custom telemetry protocols and embedded sensor networks.',
          cFunc: 'ip_calculate_checksum() in ip.c',
          status: 'SUCCESS',
          stepPseudocode: `uint32_t sum = 0;
WHILE (len > 1) { sum += *w++; len -= 2; }
WHILE (sum >> 16) sum = (sum & 0xFFFF) + (sum >> 16);
return ~sum;`
        },
        {
          id: 'ip_sub3',
          name: '3. TTL Decrement & Loop Prevention',
          explanation: 'Every forwarding hop decrements the Time-to-Live (TTL) field by 1. If TTL reaches 0, the packet is discarded and an ICMP Time Exceeded is returned.',
          projectUse: 'Prevents infinite routing loops in multi-homed enterprise networks and powers the traceroute utility.',
          cFunc: 'ip_forward() in ip.c',
          status: 'SUCCESS',
          stepPseudocode: `IF (--hdr->ttl <= 0) {
    icmp_send(ICMP_TYPE_TIME_EXCEEDED, 0, hdr->src);
    free(packet);
}`
        }
      ]
    },
    {
      id: 'icmp_diagnostics',
      title: 'ICMP Diagnostic Echo Ping',
      category: 'Layer 3 / Diagnostics',
      color: '#0891b2',
      protocol: 'ICMP (RFC 792)',
      summary: 'Diagnostic protocol for reachability testing, round-trip latency measurement, and path MTU discovery.',
      explanation: 'ICMP Echo Request (Type 8, Code 0) carries an identifier and sequence number with arbitrary payload. The target host inverts the IP addresses, sets Type to 0 (Echo Reply), preserves the payload, and sends it back to verify full bidirectional connectivity.',
      projectUse: 'Used in site-reliability engineering (SRE), automated ping latency monitoring, service heartbeat checks, and Kubernetes pod health probes.',
      cModule: 'icmp.c & ip.c',
      cCodeDrawerKey: 'icmp_echo',
      projectMapping: {
        primaryFile: 'src/icmp.c',
        headerFile: 'include/icmp.h',
        layerRole: 'Control Plane, Diagnostics & Error Reporting',
        keyStructures: [
          'struct icmp_hdr { uint8_t type, code; uint16_t csum; union { struct { uint16_t id, seq; } echo; } }'
        ],
        exportedFunctions: [
          'icmp_input(const uint8_t *data, size_t len, ip_addr_t src, ip_addr_t dst, struct net_device *dev)',
          'icmp_output(uint8_t type, uint8_t code, uint32_t values, const uint8_t *data, size_t len, ip_addr_t dst)'
        ]
      },
      pseudocode: `// =========================================================================
// ALGORITHMIC PSEUDOCODE: RFC 792 ICMP Echo Request / Reply Handler
// =========================================================================

FUNCTION icmp_input(packet: Bytes, len: Integer, src_ip: IP, dst_ip: IP):
    IF len < 8 THEN DropPacket() // Min ICMP header size
    hdr = ParseIcmpHdr(packet)

    // Verify 16-bit ICMP Checksum over entire ICMP datagram
    IF CalculateChecksum(packet, len) != 0 THEN DropPacket()

    SWITCH hdr.type:
        CASE 8: // ECHO REQUEST (Ping request from remote host)
            // 1. Allocate Reply buffer matching incoming payload size
            reply_buf = AllocateBuffer(len)
            reply_hdr = (struct icmp_hdr *)reply_buf
            
            // 2. Transmute Request into Reply
            reply_hdr.type = 0  // ECHO REPLY
            reply_hdr.code = 0
            reply_hdr.echo.id  = hdr.echo.id
            reply_hdr.echo.seq = hdr.echo.seq
            
            // 3. Copy payload payload verbatim for RTT matching
            CopyMemory(reply_buf + 8, packet + 8, len - 8)
            
            // 4. Compute fresh ICMP checksum
            reply_hdr.csum = 0
            reply_hdr.csum = CalculateChecksum(reply_buf, len)
            
            // 5. Invert IP addresses and transmit through IPv4 layer
            ip_output(proto = 1, reply_buf, len, src = dst_ip, dst = src_ip)

        CASE 0: // ECHO REPLY (Response to our ping tool)
            NotifyPingProcess(hdr.echo.id, hdr.echo.seq, ElapsedTime())
END FUNCTION`,
      realWorldSystems: {
        linuxKernel: {
          title: 'Linux Kernel: net/ipv4/icmp.c & icmp_echo()',
          path: 'net/ipv4/icmp.c',
          mechanism: 'Linux handles ICMP Echo in icmp_echo(). If the sysctl net.ipv4.icmp_echo_ignore_all is set to 1, the kernel silently discards the packet to provide stealth operation against port scanners.'
        },
        dpdk: {
          title: 'DPDK: In-Place Buffer Mutation',
          path: 'examples/l2fwd/main.c',
          mechanism: 'High-performance DPDK apps swap the MAC and IP addresses directly inside the rte_mbuf without allocating any new memory, achieving sub-microsecond ping turnaround.'
        },
        embeddedLwip: {
          title: 'lwIP: icmp.c & Low Overhead Ping Responder',
          path: 'src/core/ipv4/icmp.c',
          mechanism: 'lwIP re-uses the input pbuf: it changes type to 0, updates the checksum incrementally (RFC 1624), and immediately queues it for output.'
        },
        productionApplication: 'Cloudflare Blackbox Exporters and ThousandEyes monitor global internet undersea cable outages by pinging millions of IP targets per second and correlating RTT spikes.'
      },
      subDivisions: [
        {
          id: 'icmp_sub1',
          name: '1. Echo Request Generation (Type 8)',
          explanation: 'Application initializes ICMP Echo Request with 32-byte payload, ID=0x01a4, and Seq=1. Calculates ICMP checksum.',
          projectUse: 'Used by network monitoring tools (Nagios, Prometheus Blackbox Exporter) to test uptime.',
          cFunc: 'icmp_output() in icmp.c',
          status: 'SUCCESS',
          stepPseudocode: `hdr.type = 8; hdr.code = 0;
hdr.echo.id = htons(0x01a4); hdr.echo.seq = htons(1);
hdr.csum = checksum(&hdr, sizeof(hdr));`
        },
        {
          id: 'icmp_sub2',
          name: '2. Wire Forwarding via TAP Adapter',
          explanation: 'Transmits 74-byte Ethernet II frame carrying IP/ICMP payload across virtual bridge br0 into net2 TAP device.',
          projectUse: 'Demonstrates virtualized packet transmission in container networks like Docker bridge networks.',
          cFunc: 'ether_transmit_helper()',
          status: 'SUCCESS',
          stepPseudocode: `ip_output(IP_PROTO_ICMP, &hdr, len, src, dst);
dev->ops->transmit(dev, frame, frame_len);`
        },
        {
          id: 'icmp_sub3',
          name: '3. Echo Reply Dispatch (Type 0)',
          explanation: 'MicroPS icmp_input() detects Type 8, swaps src and dst IPs, changes header Type to 0 (Echo Reply), and transmits response.',
          projectUse: 'Automated diagnostic response handler for embedded devices and IoT appliances.',
          cFunc: 'icmp_input() in icmp.c',
          status: 'SUCCESS',
          stepPseudocode: `hdr->type = 0; // Echo Reply
hdr->csum = 0;
hdr->csum = checksum(hdr, len);
ip_output(IP_PROTO_ICMP, hdr, len, dst_ip, src_ip);`
        },
        {
          id: 'icmp_sub4',
          name: '4. Round-Trip Latency Verification',
          explanation: 'Client measures elapsed wall-clock time between Echo Request and Reply, confirming 0.380 ms RTT with 0% packet loss.',
          projectUse: 'Crucial for measuring SLA latency metrics and detecting network jitter in VoIP and video conferencing.',
          cFunc: 'ping_recv() in ping tool',
          status: 'SUCCESS',
          stepPseudocode: `rtt = get_timestamp_us() - sent_timestamp_us;
printf("64 bytes from 192.0.2.2: icmp_seq=1 time=%.3f ms\\n", rtt/1000.0);`
        }
      ]
    },
    {
      id: 'tcp_handshake',
      title: 'TCP 3-Way Handshake & TCB State',
      category: 'Layer 4 / Transport',
      color: '#7c3aed',
      protocol: 'TCP (RFC 793)',
      summary: 'Synchronizes Initial Sequence Numbers (ISNs) and allocates Transmission Control Blocks (TCB) for full-duplex byte streams.',
      explanation: 'Reliable transport requires connection synchronization. The client transmits SYN with ISN=1000 (SYN_SENT). The server allocates a Transmission Control Block (TCB), records the client\'s sequence number, picks its own ISN=2000, and replies with SYN-ACK (SYN_RECEIVED). The client finishes with ACK (ESTABLISHED).',
      projectUse: 'Essential knowledge for optimizing TCP connection pooling in high-concurrency microservices, tuning Linux TCP kernel sysctls (tcp_max_syn_backlog, tcp_syncookies), and building custom Layer 4 load balancers.',
      cModule: 'tcp.c & sock.c',
      cCodeDrawerKey: 'tcp_fsm',
      projectMapping: {
        primaryFile: 'src/tcp.c',
        headerFile: 'include/tcp.h',
        layerRole: 'Connection-Oriented Transport & Finite State Machine',
        keyStructures: [
          'struct tcp_hdr { uint16_t src, dst; uint32_t seq, ack; uint8_t off_flags; uint16_t win, csum, urp; }',
          'struct tcp_pcb { int state; uint32_t snd_una, snd_nxt, snd_wnd; uint32_t rcv_nxt, rcv_wnd; struct queue_head rx_queue; }'
        ],
        exportedFunctions: [
          'tcp_input(const uint8_t *data, size_t len, ip_addr_t src, ip_addr_t dst, struct net_device *dev)',
          'tcp_output(struct tcp_pcb *pcb, uint8_t flags, const uint8_t *data, size_t len)',
          'tcp_pcb_alloc(void)',
          'tcp_connect(struct tcp_pcb *pcb, ip_addr_t addr, uint16_t port)'
        ]
      },
      pseudocode: `// =========================================================================
// ALGORITHMIC PSEUDOCODE: RFC 793 TCP 3-Way Handshake & State Machine
// =========================================================================

FUNCTION tcp_input_handler(segment: Bytes, len: Integer, src_ip: IP, dst_ip: IP):
    hdr = ParseTcpHdr(segment)
    pcb = LookupTcb(src_ip, hdr.src_port, dst_ip, hdr.dst_port)

    SWITCH pcb.state:
        CASE TCP_STATE_LISTEN:
            // Server socket waiting for inbound connection
            IF (hdr.flags & TCP_FLAG_SYN) THEN:
                child_pcb = AllocateChildTcb(pcb)
                child_pcb.rcv_nxt = hdr.seq + 1       // Expecting byte after SYN
                child_pcb.snd_nxt = GenerateISN()      // e.g. ISN = 2000
                child_pcb.snd_una = child_pcb.snd_nxt
                child_pcb.state   = TCP_STATE_SYN_RECEIVED

                // Transmit SYN-ACK segment back to client
                tcp_send_segment(child_pcb, flags = SYN | ACK, 
                                 seq = child_pcb.snd_nxt, ack = child_pcb.rcv_nxt)
                child_pcb.snd_nxt = child_pcb.snd_nxt + 1

        CASE TCP_STATE_SYN_SENT:
            // Client socket waiting for server acknowledgment
            IF (hdr.flags & (SYN | ACK)) AND (hdr.ack == pcb.snd_nxt) THEN:
                pcb.rcv_nxt = hdr.seq + 1
                pcb.snd_una = hdr.ack
                pcb.state   = TCP_STATE_ESTABLISHED

                // Complete 3-way handshake with final ACK
                tcp_send_segment(pcb, flags = ACK, seq = pcb.snd_nxt, ack = pcb.rcv_nxt)
                UnblockWaitingThread(pcb.wait_cond)

        CASE TCP_STATE_SYN_RECEIVED:
            IF (hdr.flags & ACK) AND (hdr.ack == pcb.snd_nxt) THEN:
                pcb.snd_una = hdr.ack
                pcb.state   = TCP_STATE_ESTABLISHED
                // Socket is ready for sock_accept() to return to application
                EnqueueAcceptQueue(pcb.parent, pcb)
END FUNCTION`,
      realWorldSystems: {
        linuxKernel: {
          title: 'Linux Kernel: SYN Flood Protection & SYN Cookies',
          path: 'net/ipv4/tcp_input.c & net/ipv4/syncookies.c',
          mechanism: 'To defeat SYN flood DoS attacks without exhausting memory, Linux computes a cryptographic hash of the 5-tuple into the Initial Sequence Number (ISN). The server avoids allocating a full struct sock until the final ACK arrives.'
        },
        dpdk: {
          title: 'DPDK: Hardware Flow Steering (RTE_FLOW)',
          path: 'lib/ethdev/rte_flow.h',
          mechanism: 'Modern NICs (Mellanox ConnectX, Intel E810) hash the TCP 4-tuple in hardware into Receive Side Scaling (RSS) queues, dedicating specific CPU cores to specific TCP streams without lock contention.'
        },
        embeddedLwip: {
          title: 'lwIP: tcp.c & PCB Allocation Pools',
          path: 'src/core/tcp.c & src/core/tcp_in.c',
          mechanism: 'lwIP manages two lists: tcp_active_pcbs and tcp_listen_pcbs. It limits max concurrent connections via MEMP_NUM_TCP_PCB to ensure RTOS RAM is strictly bounded.'
        },
        productionApplication: 'High-performance reverse proxies like NGINX, HAProxy, and Envoy reuse pre-warmed TCP connection pools to backend services to avoid paying the 1-RTT latency of the 3-way handshake on every client HTTP request.'
      },
      subDivisions: [
        {
          id: 'tcp_sub1',
          name: '1. Active Open & SYN Transmission',
          explanation: 'Client calls sock_connect(). Picks randomized ISN (1000), allocates client PCB, transmits SYN flag (0x02), and enters SYN_SENT.',
          projectUse: 'Forms the basis of all HTTP/HTTPS web connections and database connection pools (PostgreSQL/MySQL).',
          cFunc: 'tcp_connect() in tcp.c',
          status: 'SUCCESS',
          stepPseudocode: `pcb->state = TCP_STATE_SYN_SENT;
pcb->snd_nxt = generate_isn(); // 1000
tcp_output(pcb, TCP_FLAG_SYN, NULL, 0);`
        },
        {
          id: 'tcp_sub2',
          name: '2. Passive Open & TCB Allocation',
          explanation: 'Server socket listening on Port 80 receives SYN. Calls tcp_pcb_alloc() to create child TCB, records rcv.nxt=1001, picks ISN=2000.',
          projectUse: 'Critical mechanism in web server architectures (Nginx, Apache) to manage concurrent incoming client connections.',
          cFunc: 'tcp_input_state() in tcp.c',
          status: 'SUCCESS',
          stepPseudocode: `child = tcp_pcb_alloc();
child->rcv_nxt = hdr->seq + 1; // 1001
child->state = TCP_STATE_SYN_RECEIVED;`
        },
        {
          id: 'tcp_sub3',
          name: '3. SYN-ACK Transmit & Window Offer',
          explanation: 'Server transmits SYN-ACK (Seq=2000, Ack=1001) with advertised receive window of 65,535 bytes and MSS=1460.',
          projectUse: 'Negotiates throughput and buffer capacity between client and server over WAN links.',
          cFunc: 'tcp_output() in tcp.c',
          status: 'SUCCESS',
          stepPseudocode: `child->snd_nxt = 2000;
tcp_output(child, TCP_FLAG_SYN | TCP_FLAG_ACK, NULL, 0);`
        },
        {
          id: 'tcp_sub4',
          name: '4. Final ACK & ESTABLISHED Transition',
          explanation: 'Client returns ACK (Seq=1001, Ack=2001). Both endpoints transition to ESTABLISHED state, unblocking application socket descriptors.',
          projectUse: 'Marks the exact transition when application data read/write APIs (send/recv) can begin streaming bytes.',
          cFunc: 'tcp_input_state() ESTABLISHED',
          status: 'SUCCESS',
          stepPseudocode: `pcb->state = TCP_STATE_ESTABLISHED;
tcp_output(pcb, TCP_FLAG_ACK, NULL, 0);
pthread_cond_signal(&pcb->cond);`
        }
      ]
    },
    {
      id: 'tcp_flow',
      title: 'Sliding Window Flow Control Pacing',
      category: 'Layer 4 / Flow Control',
      color: '#06b6d4',
      protocol: 'TCP Flow Control (RFC 793)',
      summary: 'Dynamically throttles sender transmission according to receiver buffer availability to prevent overflow.',
      explanation: 'TCP flow control is end-to-end buffer protection. The receiver informs the sender of its available buffer capacity through the 16-bit Window field (rcv_wnd). The sender computes its usable flight window = (snd.una + snd.wnd) - snd.nxt and pauses if the buffer fills.',
      projectUse: 'Crucial for streaming media pipelines (Netflix, YouTube), message streaming (Kafka, RabbitMQ), and high-throughput data replication where sender and receiver operate at different processing speeds.',
      cModule: 'tcp.c (Window Calculation)',
      cCodeDrawerKey: 'tcp_sliding_window',
      projectMapping: {
        primaryFile: 'src/tcp.c',
        headerFile: 'include/tcp.h',
        layerRole: 'Sliding Window, Cumulative ACK & Buffer Throttling',
        keyStructures: [
          'struct tcp_retransmit_entry { uint32_t seq; size_t len; time_t first_sent; uint8_t retrans_count; }',
          'struct tcp_window { uint32_t snd_una, snd_nxt, snd_wnd; uint32_t rcv_nxt, rcv_wnd; }'
        ],
        exportedFunctions: [
          'tcp_window_available(struct tcp_pcb *pcb)',
          'tcp_retransmit_queue_add(struct tcp_pcb *pcb, const uint8_t *data, size_t len)',
          'tcp_retransmit_ack(struct tcp_pcb *pcb, uint32_t ack)'
        ]
      },
      pseudocode: `// =========================================================================
// ALGORITHMIC PSEUDOCODE: TCP Sliding Window & Flow Control Pacing
// =========================================================================

FUNCTION tcp_send_data(pcb: TCB, application_data: Bytes, len: Integer) -> Integer:
    bytes_sent = 0

    WHILE bytes_sent < len DO:
        // 1. Calculate usable transmission window
        flight_size   = pcb.snd_nxt - pcb.snd_una
        usable_window = pcb.snd_wnd - flight_size

        // 2. Flow Control Check: If receiver buffer full, wait for Window Update
        IF usable_window <= 0 THEN:
            StartZeroWindowProbeTimer(pcb)
            WaitOnSocketCondition(pcb.snd_cond) // Sleep until ACK with win > 0
            CONTINUE

        // 3. Segment data up to Maximum Segment Size (MSS = 1460)
        chunk_size = Min(len - bytes_sent, usable_window, pcb.mss)
        segment    = application_data[bytes_sent : bytes_sent + chunk_size]

        // 4. Record segment into Retransmission Queue before transmission
        EnqueueRetransmitQueue(pcb, segment, seq = pcb.snd_nxt)

        // 5. Transmit packet over wire
        tcp_output(pcb, flags = ACK | PSH, data = segment, len = chunk_size)

        // 6. Advance Sequence Number
        pcb.snd_nxt = pcb.snd_nxt + chunk_size
        bytes_sent  = bytes_sent + chunk_size
    END WHILE

    RETURN bytes_sent
END FUNCTION

FUNCTION tcp_receive_ack(pcb: TCB, ack_num: Integer, advertised_window: Integer):
    IF ack_num > pcb.snd_una AND ack_num <= pcb.snd_nxt THEN:
        // Cumulative ACK: purge all acknowledged segments from retransmission queue
        bytes_acked = ack_num - pcb.snd_una
        PurgeRetransmitQueue(pcb, up_to_seq = ack_num)
        pcb.snd_una = ack_num
        pcb.snd_wnd = advertised_window

        // Signal waiting threads that window buffer space opened up
        SignalSocketCondition(pcb.snd_cond)
END FUNCTION`,
      realWorldSystems: {
        linuxKernel: {
          title: 'Linux Kernel: TCP Autotuning & BBR Congestion Control',
          path: 'net/ipv4/tcp_output.c & net/ipv4/tcp_bbr.c',
          mechanism: 'Linux dynamically resizes socket receive buffers (tcp_rmem / tcp_wmem) using the BBR (Bottleneck Bandwidth and RTT) congestion algorithm, maximizing throughput while preventing bufferbloat.'
        },
        dpdk: {
          title: 'DPDK: Hardware Offload (TSO / LRO)',
          path: 'lib/ethdev/rte_ethdev.h',
          mechanism: 'With TCP Segmentation Offload (TSO), user space passes 64KB buffers to the NIC; the physical hardware segments it into 1460B MTU frames at wire speed without CPU involvement.'
        },
        embeddedLwip: {
          title: 'lwIP: Fixed Ring Buffers & Window Clamping',
          path: 'src/core/tcp_out.c',
          mechanism: 'lwIP clamps the advertised window to TCP_WND (typically 4KB-16KB) based on static pool buffer availability to avoid exhausting microcontroller SRAM.'
        },
        productionApplication: 'Cloud storage engines (Amazon S3, Google Cloud Storage multipart uploads) rely on parallel sliding window streaming across hundreds of TCP sockets to achieve gigabytes-per-second ingestion.'
      },
      subDivisions: [
        {
          id: 'flow_sub1',
          name: '1. Receiver Buffer Space Assessment',
          explanation: 'Calculates remaining buffer space: available_buf = rcv_buf_size - rcv_buffered_bytes. Drops advertised window to 16,384 bytes.',
          projectUse: 'Prevents out-of-memory (OOM) receiver crashes during large file uploads or network bursts.',
          cFunc: 'tcp_rx_buffer_check()',
          status: 'SUCCESS',
          stepPseudocode: `avail = pcb->rcv_buf_size - pcb->rcv_buffered_len;
pcb->rcv_wnd = (avail > 0) ? avail : 0;`
        },
        {
          id: 'flow_sub2',
          name: '2. Window Advertisement ACK Transmit',
          explanation: 'Transmits TCP ACK segment carrying Window=16,384 (0x4000) to notify sender of reduced capacity.',
          projectUse: 'Enables asynchronous closed-loop feedback between distributed sender and receiver processes.',
          cFunc: 'tcp_output(ACK)',
          status: 'SUCCESS',
          stepPseudocode: `hdr->win = htons(pcb->rcv_wnd);
tcp_output(pcb, TCP_FLAG_ACK, NULL, 0);`
        },
        {
          id: 'flow_sub3',
          name: '3. Sender Usable Window Throttling',
          explanation: 'Sender updates snd.wnd = 16384. Caps outbound segment burst to prevent exceeding receiver flight window.',
          projectUse: 'Ensures zero buffer-drop packet loss and prevents wasteful retransmission storms.',
          cFunc: 'tcp_window_available() in tcp.c',
          status: 'SUCCESS',
          stepPseudocode: `usable = pcb->snd_wnd - (pcb->snd_nxt - pcb->snd_una);
IF (usable < mss) pause_transmission();`
        }
      ]
    },
    {
      id: 'http_app',
      title: 'HTTP/1.1 Web Server & BSD Sockets',
      category: 'Layer 7 / Application',
      color: '#10b981',
      protocol: 'HTTP/1.1 (RFC 2616)',
      summary: 'Web server running in user space serving HTML over custom BSD sockets directly on the MicroPS stack.',
      explanation: 'MicroPS provides a user-space BSD socket abstraction (sock.c) implementing sock_open, sock_bind, sock_listen, sock_accept, sock_send, and sock_recv. The web application (app/tcps.c) accepts incoming HTTP GET requests and returns HTTP/1.1 200 OK responses completely inside user space.',
      projectUse: 'Directly applicable to building lightweight embedded web servers (ESP32, Raspberry Pi), REST microservices, custom protocol proxy gateways, and high-performance user-space HTTP proxies.',
      cModule: 'app/tcps.c & sock.c',
      cCodeDrawerKey: 'socket_api',
      projectMapping: {
        primaryFile: 'apps/http_server.c',
        headerFile: 'include/sock.h',
        layerRole: 'Application Layer & BSD Socket API Abstraction',
        keyStructures: [
          'struct socket { int id, type; struct tcp_pcb *pcb; struct queue_head rx_queue; pthread_mutex_t mutex; pthread_cond_t cond; }'
        ],
        exportedFunctions: [
          'sock_create(int domain, int type, int protocol)',
          'sock_bind(int sock, const struct sockaddr *addr, size_t addrlen)',
          'sock_listen(int sock, int backlog)',
          'sock_accept(int sock, struct sockaddr *addr, size_t *addrlen)',
          'sock_recv(int sock, void *buf, size_t len, int flags)',
          'sock_send(int sock, const void *buf, size_t len, int flags)'
        ]
      },
      pseudocode: `// =========================================================================
// ALGORITHMIC PSEUDOCODE: User-Space HTTP/1.1 Web Server & BSD Sockets
// =========================================================================

FUNCTION http_server_main():
    // 1. Create User-Space TCP Socket
    server_fd = sock_create(AF_INET, SOCK_STREAM, 0)
    
    // 2. Bind to Port 80 on all local interfaces
    server_addr = { family: AF_INET, port: htons(80), addr: INADDR_ANY }
    sock_bind(server_fd, server_addr)
    
    // 3. Mark socket as passive listener
    sock_listen(server_fd, backlog = 10)
    Log("HTTP Server listening on http://192.0.2.2:80/")

    WHILE TRUE DO:
        // 4. Accept inbound TCP client connection (blocks until 3-way handshake completes)
        client_fd = sock_accept(server_fd, client_addr)
        
        // 5. Read raw HTTP request stream
        buffer = Allocate(4096)
        bytes_read = sock_recv(client_fd, buffer, 4096)

        IF bytes_read > 0 THEN:
            // 6. Parse HTTP verb and URI path
            request_str = ConvertToString(buffer, bytes_read)
            IF StartsWith(request_str, "GET /") THEN:
                // 7. Assemble HTTP/1.1 200 OK Response with HTML Body
                body = "<html><body><h1>MicroPS User-Space Web Server</h1><p>Running in C!</p></body></html>"
                response = "HTTP/1.1 200 OK\\r\\n" +
                           "Content-Type: text/html; charset=UTF-8\\r\\n" +
                           "Content-Length: " + Length(body) + "\\r\\n" +
                           "Connection: close\\r\\n\\r\\n" +
                           body

                // 8. Stream response bytes over user-space TCP stack
                sock_send(client_fd, response, Length(response))

        // 9. Graceful close
        sock_close(client_fd)
    END WHILE
END FUNCTION`,
      realWorldSystems: {
        linuxKernel: {
          title: 'Linux Kernel: epoll / io_uring & sys_accept',
          path: 'net/socket.c & fs/eventpoll.c',
          mechanism: 'Production Linux servers (e.g. NGINX) use epoll_wait() or io_uring zero-copy async ring buffers to handle 100,000+ concurrent persistent connections without thread-per-client overhead.'
        },
        dpdk: {
          title: 'DPDK: F-Stack & Seastar User-Space Stacks',
          path: 'f-stack/lib/libfstack.a',
          mechanism: 'F-Stack ports FreeBSD network stack on top of DPDK, providing standard POSIX socket APIs in user space capable of serving millions of HTTP requests/sec per server.'
        },
        embeddedLwip: {
          title: 'lwIP: HTTPD Server & Raw Callbacks',
          path: 'src/apps/http/httpd.c',
          mechanism: 'lwIP includes a zero-copy HTTP daemon using callbacks (altcp_recv) directly streaming ROM-stored web pages on IoT devices without dynamic memory allocation.'
        },
        productionApplication: 'API Gateways (Kong, Envoy) use HTTP parsing and header routing to inspect JWT tokens, apply rate limits, and route traffic across thousands of microservices.'
      },
      subDivisions: [
        {
          id: 'http_sub1',
          name: '1. BSD Socket API Binding (sock.c)',
          explanation: 'Maps standard integer socket descriptors (e.g. fd=3) to the internal TCP Control Block (PCB).',
          projectUse: 'Allows standard C network code to compile and run on custom user-space stacks without OS modification.',
          cFunc: 'sock_open() & sock_bind()',
          status: 'SUCCESS',
          stepPseudocode: `s = sock_alloc();
s->pcb = tcp_pcb_alloc();
sock_bind(s, &addr, sizeof(addr));`
        },
        {
          id: 'http_sub2',
          name: '2. HTTP GET /index.html Ingress',
          explanation: 'Client sends ASCII request: "GET /index.html HTTP/1.1\\r\\nHost: 192.0.2.2\\r\\n\\r\\n" encapsulated with PSH and ACK flags.',
          projectUse: 'The fundamental protocol format of the World Wide Web and REST APIs.',
          cFunc: 'sock_recv() in app/tcps.c',
          status: 'SUCCESS',
          stepPseudocode: `n = sock_recv(client_fd, req_buf, 1024);
IF (sscanf(req_buf, "GET %s HTTP/1.1", path) == 1) { ... }`
        },
        {
          id: 'http_sub3',
          name: '3. HTTP 200 OK Response Streaming',
          explanation: 'Server parses request path, constructs HTML payload (76 bytes), and calls sock_send() to stream response over TCP.',
          projectUse: 'Core loop of modern web application frameworks and static file servers.',
          cFunc: 'sock_send() in app/tcps.c',
          status: 'SUCCESS',
          stepPseudocode: `char resp[] = "HTTP/1.1 200 OK\\r\\nContent-Type: text/html\\r\\n\\r\\n<h1>Hello</h1>";
sock_send(client_fd, resp, strlen(resp));
sock_close(client_fd);`
        }
      ]
    },
    {
      id: 'udp_service',
      title: 'UDP Zero-Handshake Datagrams',
      category: 'Layer 4 / Connectionless',
      color: '#a855f7',
      protocol: 'UDP (RFC 768)',
      summary: 'Minimalist, low-latency datagram delivery without connection negotiation or sequence tracking.',
      explanation: 'UDP provides connectionless best-effort transport. With only an 8-byte header (Src Port, Dst Port, Length, Checksum), datagrams are transmitted immediately with 0 ms connection overhead. The receiver demultiplexes incoming datagrams directly to port queues.',
      projectUse: 'Standard transport for DNS lookups (Port 53), DHCP IP address leases (Port 67/68), live multiplayer gaming state updates, WebRTC video streaming, and the modern HTTP/3 (QUIC) protocol.',
      cModule: 'udp.c & sock.c',
      cCodeDrawerKey: 'udp_stack',
      projectMapping: {
        primaryFile: 'src/udp.c',
        headerFile: 'include/udp.h',
        layerRole: 'Connectionless Transport & Port Multiplexing',
        keyStructures: [
          'struct udp_hdr { uint16_t src, dst, len, csum; }',
          'struct udp_pcb { uint16_t port; struct queue_head rx_queue; }'
        ],
        exportedFunctions: [
          'udp_input(const uint8_t *data, size_t len, ip_addr_t src, ip_addr_t dst, struct net_device *dev)',
          'udp_output(uint16_t src_port, uint16_t dst_port, const uint8_t *data, size_t len, ip_addr_t src, ip_addr_t dst)'
        ]
      },
      pseudocode: `// =========================================================================
// ALGORITHMIC PSEUDOCODE: RFC 768 UDP Transmission & Demultiplexing
// =========================================================================

FUNCTION udp_output(src_port: Port, dst_port: Port, data: Bytes, len: Integer, src_ip: IP, dst_ip: IP):
    // 1. Allocate 8-byte UDP header + payload buffer
    total_len = 8 + len
    buf = AllocateBuffer(total_len)
    hdr = (struct udp_hdr *)buf

    // 2. Assemble 8-byte header
    hdr.src  = htons(src_port)
    hdr.dst  = htons(dst_port)
    hdr.len  = htons(total_len)
    hdr.csum = 0

    // 3. Copy payload bytes
    CopyMemory(buf + 8, data, len)

    // 4. Calculate RFC 768 checksum using IPv4 Pseudo-Header
    pseudo_hdr = { src_ip, dst_ip, zero = 0, proto = 17, udp_len = htons(total_len) }
    hdr.csum = CalculateChecksumWithPseudoHeader(pseudo_hdr, buf, total_len)
    IF hdr.csum == 0 THEN hdr.csum = 0xFFFF // In UDP, 0 means no checksum

    // 5. Transmit immediately via IPv4 layer (Zero-Handshake Delay)
    ip_output(proto = 17, buf, total_len, src_ip, dst_ip)
END FUNCTION

FUNCTION udp_input(packet: Bytes, len: Integer, src_ip: IP, dst_ip: IP):
    IF len < 8 THEN DropPacket()
    hdr = ParseUdpHdr(packet)

    // Lookup bound listening socket by destination port
    socket = LookupUdpSocket(hdr.dst)
    IF socket != NULL THEN:
        EnqueueSocketRx(socket, payload = packet + 8, len = ntohs(hdr.len) - 8, src_ip, hdr.src)
    ELSE:
        // Port unreachable: Return ICMP Port Unreachable
        SendIcmpPortUnreachable(packet, src_ip)
END FUNCTION`,
      realWorldSystems: {
        linuxKernel: {
          title: 'Linux Kernel: udp_rcv() & SO_REUSEPORT',
          path: 'net/ipv4/udp.c',
          mechanism: 'Linux balances high-volume UDP traffic (e.g. DNS) across multiple worker threads using SO_REUSEPORT socket option with consistent 4-tuple hashing.'
        },
        dpdk: {
          title: 'DPDK: Wire-Speed UDP Traffic Generation',
          path: 'app/test-pmd/txonly.c',
          mechanism: 'DPDK generates 14.88 Million 64-byte UDP packets per second per 10GbE port by pre-computing the UDP header once and DMA-blitting it directly to the PCIe NIC tx ring.'
        },
        embeddedLwip: {
          title: 'lwIP: udp_recv() Callback Mechanism',
          path: 'src/core/udp.c',
          mechanism: 'lwIP dispatches incoming UDP datagrams directly to a registered C function pointer (udp_recv_fn) with zero context-switching latency.'
        },
        productionApplication: 'HTTP/3 (QUIC) builds reliable, encrypted streams entirely on top of UDP datagrams, eliminating TCP Head-of-Line blocking and enabling 0-RTT connection resumption on mobile networks.'
      },
      subDivisions: [
        {
          id: 'udp_sub1',
          name: '1. Lightweight 8-Byte Header Assembly',
          explanation: 'Builds UDP header: Source Port=52140, Dest Port=53 (DNS), Length=32B, Checksum.',
          projectUse: 'Provides lowest possible per-packet overhead for real-time applications.',
          cFunc: 'udp_output() in udp.c',
          status: 'SUCCESS',
          stepPseudocode: `hdr.src = htons(52140);
hdr.dst = htons(53);
hdr.len = htons(8 + payload_len);
hdr.csum = udp_checksum(pseudo, &hdr, len);`
        },
        {
          id: 'udp_sub2',
          name: '2. Immediate TAP Transmission (0ms Delay)',
          explanation: 'Packet is dispatched to the network driver without waiting for 3-way handshake round trips.',
          projectUse: 'Critical for time-sensitive telemetry and voice over IP (VoIP) audio streaming.',
          cFunc: 'ether_transmit_helper()',
          status: 'SUCCESS',
          stepPseudocode: `ip_output(IP_PROTO_UDP, buf, len, src, dst);
// Transmitted immediately on net2 TAP`
        },
        {
          id: 'udp_sub3',
          name: '3. Port Demultiplexing to Socket Queue',
          explanation: 'MicroPS udp_input() matches destination port 53 and pushes datagram payload directly to sock_recvfrom queue.',
          projectUse: 'High-speed datagram queuing used in DNS caching servers (BIND, Unbound, CoreDNS).',
          cFunc: 'udp_input() in udp.c',
          status: 'SUCCESS',
          stepPseudocode: `s = udp_port_lookup(hdr->dst);
IF (s) {
    queue_push(&s->rx_queue, payload);
    pthread_cond_signal(&s->cond);
}`
        }
      ]
    },
    {
      id: 'tcp_teardown',
      title: 'TCP Graceful 4-Way Connection Teardown',
      category: 'Layer 4 / Teardown',
      color: '#f43f5e',
      protocol: 'TCP Teardown (RFC 793)',
      summary: 'Gracefully terminates bidirectional TCP streams via FIN and ACK exchanges through TIME_WAIT to CLOSED.',
      explanation: 'Since TCP connections are full-duplex (both directions can send data independently), closing requires a graceful 4-way exchange: Active close transmits FIN (FIN_WAIT_1). Receiver sends ACK (CLOSE_WAIT). When the receiver finishes its outbound stream, it transmits its own FIN (LAST_ACK). Active close sends final ACK and waits 2*MSL in TIME_WAIT before releasing memory.',
      projectUse: 'Essential for understanding socket leak prevention in backend servers, handling TCP half-close scenarios, and configuring TIME_WAIT reuse sysctls (tcp_tw_reuse) on busy HTTP reverse proxies.',
      cModule: 'tcp.c & sock.c',
      cCodeDrawerKey: 'tcp_fsm',
      projectMapping: {
        primaryFile: 'src/tcp.c',
        headerFile: 'include/tcp.h',
        layerRole: 'Connection Teardown, 2*MSL Timer & PCB Recycling',
        keyStructures: [
          'struct tcp_pcb { int state; time_t time_wait_expires; }'
        ],
        exportedFunctions: [
          'tcp_close(struct tcp_pcb *pcb)',
          'tcp_pcb_release(struct tcp_pcb *pcb)',
          'tcp_timer_2msl(void)'
        ]
      },
      pseudocode: `// =========================================================================
// ALGORITHMIC PSEUDOCODE: RFC 793 TCP 4-Way Teardown & TIME_WAIT
// =========================================================================

FUNCTION tcp_close(pcb: TCB):
    SWITCH pcb.state:
        CASE TCP_STATE_ESTABLISHED:
            // Active Close: Send FIN and move to FIN_WAIT_1
            pcb.state = TCP_STATE_FIN_WAIT_1
            tcp_output(pcb, flags = FIN | ACK, NULL, 0)
            pcb.snd_nxt = pcb.snd_nxt + 1

        CASE TCP_STATE_CLOSE_WAIT:
            // Passive Close completion: Server finished sending remaining data
            pcb.state = TCP_STATE_LAST_ACK
            tcp_output(pcb, flags = FIN | ACK, NULL, 0)
            pcb.snd_nxt = pcb.snd_nxt + 1
END FUNCTION

FUNCTION tcp_handle_teardown_input(pcb: TCB, flags: Flags, ack: Integer):
    SWITCH pcb.state:
        CASE TCP_STATE_FIN_WAIT_1:
            IF (flags & ACK) AND (ack == pcb.snd_nxt) THEN:
                pcb.state = TCP_STATE_FIN_WAIT_2
            IF (flags & FIN) THEN:
                pcb.rcv_nxt = pcb.rcv_nxt + 1
                tcp_output(pcb, flags = ACK, NULL, 0)
                pcb.state = (pcb.state == TCP_STATE_FIN_WAIT_2) ? TCP_STATE_TIME_WAIT : TCP_STATE_CLOSING

        CASE TCP_STATE_FIN_WAIT_2:
            IF (flags & FIN) THEN:
                pcb.rcv_nxt = pcb.rcv_nxt + 1
                tcp_output(pcb, flags = ACK, NULL, 0) // Final ACK
                pcb.state = TCP_STATE_TIME_WAIT
                Start2MslTimer(pcb, duration = 60_SECONDS)

        CASE TCP_STATE_LAST_ACK:
            IF (flags & ACK) AND (ack == pcb.snd_nxt) THEN:
                pcb.state = TCP_STATE_CLOSED
                tcp_pcb_release(pcb) // Reclaim TCB memory

        CASE TCP_STATE_TIME_WAIT:
            // 2*MSL timer ensures lingering duplicate packets expire on wire
            IF TimerExpired(pcb.time_wait_timer) THEN:
                pcb.state = TCP_STATE_CLOSED
                tcp_pcb_release(pcb)
END FUNCTION`,
      realWorldSystems: {
        linuxKernel: {
          title: 'Linux Kernel: tcp_tw_reuse & tcp_fin_timeout',
          path: 'net/ipv4/tcp_minisocks.c',
          mechanism: 'High-traffic Linux servers quickly accumulate tens of thousands of sockets in TIME_WAIT. Linux reduces memory by swapping full struct sock into a lightweight struct inet_timewait_sock and allows reusing sockets with tcp_tw_reuse.'
        },
        dpdk: {
          title: 'DPDK: Lock-Free PCB Memory Recycling',
          path: 'lib/ring/rte_ring.h',
          mechanism: 'In DPDK, connection control blocks are returned to an rte_mempool without invoking libc free(), eliminating memory fragmentation and lock overhead.'
        },
        embeddedLwip: {
          title: 'lwIP: Shortened TIME_WAIT for Low Memory',
          path: 'src/core/tcp_in.c',
          mechanism: 'lwIP permits reducing the 2*MSL timer down to 2*TCP_MSL (5 seconds) to prevent exhaustion of the fixed PCB pool.'
        },
        productionApplication: 'PostgreSQL and Redis database connection pooling proxies (PgBouncer, Envoy) avoid teardown churn by maintaining persistent hot connections instead of closing sockets after every query.'
      },
      subDivisions: [
        {
          id: 'close_sub1',
          name: '1. Active Close & FIN Flag (FIN_WAIT_1)',
          explanation: 'Client finishes sending and calls sock_close(). Transmits FIN segment and transitions to FIN_WAIT_1.',
          projectUse: 'Graceful shutdown notification in database clients and HTTP keep-alive connection teardown.',
          cFunc: 'tcp_close() in tcp.c',
          status: 'SUCCESS',
          stepPseudocode: `pcb->state = TCP_STATE_FIN_WAIT_1;
tcp_output(pcb, TCP_FLAG_FIN | TCP_FLAG_ACK, NULL, 0);`
        },
        {
          id: 'close_sub2',
          name: '2. Receiver ACK & CLOSE_WAIT Transition',
          explanation: 'Server receives FIN. Moves state to CLOSE_WAIT and acknowledges. Client transitions to FIN_WAIT_2 (half-closed).',
          projectUse: 'Allows server to flush all remaining outbound buffer bytes before closing its half of the connection.',
          cFunc: 'tcp_input_state() case ESTABLISHED',
          status: 'SUCCESS',
          stepPseudocode: `pcb->state = TCP_STATE_CLOSE_WAIT;
tcp_output(pcb, TCP_FLAG_ACK, NULL, 0);`
        },
        {
          id: 'close_sub3',
          name: '3. Passive FIN & LAST_ACK State',
          explanation: 'Server finishes flushing and transmits its own FIN segment, transitioning to LAST_ACK.',
          projectUse: 'Symmetrical closure of the reverse byte stream channel.',
          cFunc: 'tcp_output(FIN | ACK)',
          status: 'SUCCESS',
          stepPseudocode: `pcb->state = TCP_STATE_LAST_ACK;
tcp_output(pcb, TCP_FLAG_FIN | TCP_FLAG_ACK, NULL, 0);`
        },
        {
          id: 'close_sub4',
          name: '4. TIME_WAIT & TCB Resource Deallocation',
          explanation: 'Client sends final ACK and enters TIME_WAIT (2*MSL timer). Both endpoints release PCB memory and recycle socket descriptors to CLOSED.',
          projectUse: 'Prevents delayed duplicate segments from a past connection corrupting a future new connection.',
          cFunc: 'tcp_pcb_release() in tcp.c',
          status: 'SUCCESS',
          stepPseudocode: `pcb->state = TCP_STATE_TIME_WAIT;
set_timer(2 * MSL); // 60s
tcp_pcb_free(pcb);`
        }
      ]
    }
  ]
};
