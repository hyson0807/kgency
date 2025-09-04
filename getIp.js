const os = require('os');

// Get network interfaces
const networkInterfaces = os.networkInterfaces();

console.log('=== Current IP Addresses ===\n');

// Find and display IPv4 addresses
Object.keys(networkInterfaces).forEach(interfaceName => {
  const addresses = networkInterfaces[interfaceName];
  addresses.forEach(address => {
    // Skip internal (loopback) addresses and IPv6
    if (!address.internal && address.family === 'IPv4') {
      console.log(`Interface: ${interfaceName}`);
      console.log(`IP Address: ${address.address}`);
      console.log('---');
    }
  });
});

// Also show the most likely local IP (usually the first non-internal IPv4)
const localIPs = [];
Object.values(networkInterfaces).forEach(interfaces => {
  interfaces.forEach(iface => {
    if (!iface.internal && iface.family === 'IPv4') {
      localIPs.push(iface.address);
    }
  });
});

if (localIPs.length > 0) {
  console.log(`\nPrimary Local IP: ${localIPs[0]}`);
}