const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fetch = require('node-fetch');
const { findCandidates, validateCandidate } = require('../src/workers/extractor');

const fs = require('fs');

async function fetchThread(urlOrPath){
  // if file exists locally, read and parse
  if (fs.existsSync(urlOrPath)){
    const text = fs.readFileSync(urlOrPath, 'utf8');
    return JSON.parse(text);
  }
  const api = urlOrPath.replace(/\/$/, '') + '.json?limit=500';
  // timeout
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15000);
  let resp;
  try{
    resp = await fetch(api, { headers: { 'User-Agent': 'CryptoIntelX-test/0.1', 'Accept': 'application/json' }, signal: controller.signal });
    const text = await resp.text();
    try{ return JSON.parse(text); }catch(e){
      console.error('Failed to parse JSON; status', resp.status);
      console.error('Body snippet:', text.slice(0,1200));
      throw e;
    }
  }finally{ clearTimeout(t); }
}

async function run(){
  const url = 'https://www.reddit.com/r/ethereum/comments/4c6yd0/im_confused_about_ethereum_account_format_is_it/';
  console.log('Fetching thread', url);
  const json = await fetchThread(url);
  const post = json[0].data.children[0].data;
  console.log('Post title:', post.title);
  console.log('Post selftext (truncated):', (post.selftext||'').slice(0,400));
  const postText = (post.title||'') + '\n' + (post.selftext||'');
  const postCandidates = findCandidates(postText);
  console.log('Post candidates:', postCandidates);
  for (const c of postCandidates){
    console.log('Validation', c.address, c.coin_candidate, '->', validateCandidate(c));
  }
  // comments
  const comments = json[1].data.children || [];
  console.log('\nComments count:', comments.length);
  for (const c of comments){
    const body = c?.data?.body || '';
    if (!body) continue;
    const cand = findCandidates(body);
    if (cand.length>0) console.log('Comment id', c.data.id, 'candidates', cand);
  }
}

run().catch(e=>{ console.error(e); process.exit(1); });
