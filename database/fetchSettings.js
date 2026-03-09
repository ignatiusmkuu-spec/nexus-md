const { getSettings } = require('../database/config');

const CACHE_TTL = 30000;
let _cache = null;
let _cacheAt = 0;

async function fetchSettings() {
  const now = Date.now();
  if (_cache && (now - _cacheAt) < CACHE_TTL) {
    return _cache;
  }
  const data = await getSettings();
  _cache = {
    wapresence: data.wapresence,
    autoread: data.autoread,
    mode: data.mode,
    prefix: data.prefix,
    autolike: data.autolike,
    autoview: data.autoview,
    antilink: data.antilink,
    antilinkall: data.antilinkall,
    antidelete: data.antidelete,
    antitag: data.antitag,
    antibot: data.antibot,
    welcome: data.welcome,
    autobio: data.autobio,
    badword: data.badword,
    gptdm: data.gptdm,
    anticall: data.anticall
  };
  _cacheAt = now;
  return _cache;
}

function invalidateCache() {
  _cache = null;
  _cacheAt = 0;
}

module.exports = fetchSettings;
module.exports.invalidateCache = invalidateCache;
