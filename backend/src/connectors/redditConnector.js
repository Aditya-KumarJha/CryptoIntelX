const fetch = require('node-fetch');
const crypto = require('crypto');
const AbortController = global.AbortController || require('abort-controller');

async function fetchRedditSubreddit(subreddit, mode='new', limit=25, pageAfter=null, userAgent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'){
  const afterPart = pageAfter ? `&after=${pageAfter}` : '';
  const url = `https://www.reddit.com/r/${subreddit}/${mode}.json?limit=${limit}${afterPart}`;
  // retry/backoff for 429/5xx
  let backoff = 1000;
  for (let attempt=0; attempt<4; attempt++){
    // timeout controller to avoid hanging
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try{
      const resp = await fetch(url, { 
        headers: { 
          'User-Agent': userAgent, 
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Referer': `https://www.reddit.com/r/${subreddit}/`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }, 
        signal: controller.signal 
      });
      const text = await resp.text();
      const sha256 = crypto.createHash('sha256').update(text).digest('hex');
      let json = null;
      try { json = JSON.parse(text); } catch(e) { json = null; }
      const afterToken = json?.data?.after || null;
      if (resp.status === 429 || resp.status >= 500){
        // retry
        if (attempt < 3){
          await new Promise(r=>setTimeout(r, backoff));
          backoff *= 2;
          continue;
        }
      }
      return { url, json, headers: resp.headers.raw(), status: resp.status, sha256, after: afterToken };
    }catch(e){
      // aborted or network error -> if last attempt throw
      if (attempt >= 3) throw e;
      await new Promise(r=>setTimeout(r, backoff));
      backoff *= 2;
    }finally{ clearTimeout(timeout); }
  }
}

async function fetchRedditComments(subreddit, postId, userAgent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'){
  const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json?limit=500`;
  let backoff = 1000;
  for (let attempt=0; attempt<4; attempt++){
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try{
      const resp = await fetch(url, { 
        headers: { 
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Referer': `https://www.reddit.com/r/${subreddit}/`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }, 
        signal: controller.signal 
      });
      const text = await resp.text();
      const sha256 = crypto.createHash('sha256').update(text).digest('hex');
      let json = null;
      try{ json = JSON.parse(text); } catch(e){ json = null; }
      if (resp.status === 429 || resp.status >= 500){
        console.warn(`⚠️ Reddit API returned ${resp.status}, retrying... (attempt ${attempt + 1}/4)`);
        if (attempt < 3){
          await new Promise(r=>setTimeout(r, backoff));
          backoff *= 2;
          continue;
        }
      }
      if (resp.status === 403) {
        console.error(`❌ Reddit API 403 Forbidden - possible rate limit or IP block. URL: ${url}`);
        console.error(`Response headers:`, resp.headers.raw());
      }
      return { url, json, headers: resp.headers.raw(), status: resp.status, sha256 };
    }catch(e){
      if (attempt >= 3) throw e;
      await new Promise(r=>setTimeout(r, backoff));
      backoff *= 2;
    }finally{ clearTimeout(timeout); }
  }
}

module.exports = { fetchRedditSubreddit, fetchRedditComments };
