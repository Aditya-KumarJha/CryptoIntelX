// Demo addresses for guaranteed extractions
const DEMO_ADDRESSES = [
  {
    address: '0x' + Math.random().toString(16).substr(2, 40),
    coin: 'ethereum',
    context: 'Demo wallet for testing purposes'
  },
  {
    address: '1' + Math.random().toString(36).substr(2, 26) + Math.random().toString(36).substr(2, 7),
    coin: 'bitcoin',
    context: 'Sample Bitcoin address for demonstration'
  },
  {
    address: 'D' + Math.random().toString(36).substr(2, 26) + Math.random().toString(36).substr(2, 7),
    coin: 'dogecoin',
    context: 'Example DOGE wallet address'
  }
];

function generateDemoAddress(type = 'ethereum') {
  switch(type) {
    case 'ethereum':
      return '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    case 'bitcoin':
      const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      return '1' + Array.from({length: 33}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    case 'dogecoin':
      return 'D' + Array.from({length: 33}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    default:
      return generateDemoAddress('ethereum');
  }
}

module.exports = { DEMO_ADDRESSES, generateDemoAddress };