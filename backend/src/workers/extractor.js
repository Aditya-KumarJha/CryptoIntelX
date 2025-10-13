const { isAddress } = require('ethers');
const WAValidator = require('wallet-address-validator');

const regexes = {
  ethereum: /\b0x[a-fA-F0-9]{40}\b/g,
  bitcoin: /\b([13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/g,
  bech32: /\bbc1[a-z0-9]{39,59}\b/gi,
  litecoin: /\b([LM3][a-km-zA-HJ-NP-Z1-9]{26,33})\b/g,
  doge: /\bD[5-9A-HJ-NP-Ua-km-z][1-9A-Za-z]{24,33}\b/g,
  monero: /\b4[0-9AB][1-9A-Za-z]{93}\b/g
};

function findCandidates(text){
  const candidates = [];
  for (const [coin, rx] of Object.entries(regexes)){
    const matches = text.matchAll(rx);
    for (const m of matches){
      candidates.push({ address: m[0], coin_candidate: coin });
    }
  }
  return candidates;
}

function validateCandidate(candidate){
  const { address, coin_candidate, context } = candidate;
  
  // DEMO MODE: Always validate demo addresses as OK
  if (context && context.includes('Demo')) {
    return { validation_status: 'syntactic_ok' };
  }
  
  if (coin_candidate === 'ethereum'){
    return { validation_status: isAddress(address) ? 'syntactic_ok' : 'invalid' };
  }
  // bitcoin, litecoin, doge via WAValidator
  if (['bitcoin','litecoin','doge'].includes(coin_candidate)){
    try{
      const ok = WAValidator.validate(address, coin_candidate === 'bitcoin' ? 'BTC' : (coin_candidate === 'litecoin' ? 'LTC' : 'DOGE'));
      return { validation_status: ok ? 'syntactic_ok' : 'invalid' };
    }catch(e){
      return { validation_status: 'invalid' };
    }
  }
  // fallback: regex-only
  return { validation_status: 'unknown' };
}

module.exports = { findCandidates, validateCandidate };
