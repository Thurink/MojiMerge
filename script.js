// Emoji Merge — Ji (v13)
// Rebuilt from v12 with full Prestige Tree restored + requested v13 enhancements.

const STARTING_JI = 200;
const TIER1_COST = 100;
const START_UNLOCKED = 4;
const UNLOCK_STEP = 1;
const BOARD_ARRAY_SIZE = 60;

// Emoji sets (available at Prestige ≥100)
const EMOJI_SETS = {
  classic: ['\uD83D\uDE42','\uD83D\uDE04','\uD83D\uDE0E','\uD83E\uDD29','\uD83E\uDD11','\uD83D\uDC51','\uD83C\uDF1F','\uD83D\uDE80','\uD83E\uDE99','\uD83D\uDC8E','\uD83C\uDFC6','\uD83E\uDDE0','\uD83C\uDFAF','\uD83D\uDD25','⚡','✨','☀️','\uD83C\uDF08','\uD83C\uDF40','\uD83E\uDE84'],
  animals: ['\uD83D\uDC04','\uD83D\uDC11','\uD83D\uDC13','\uD83D\uDC16','\uD83D\uDC07','\uD83E\uDD8A','\uD83D\uDC3A','\uD83D\uDC17','\uD83E\uDD8C','\uD83E\uDD85','\uD83E\uDD89','\uD83D\uDC1F','\uD83D\uDC20','\uD83E\uDD88','\uD83D\uDC22','\uD83E\uDD8E','\uD83D\uDC0D','\uD83E\uDD8B','\uD83D\uDC1E'],
  food: ['\uD83C\uDF4E','\uD83C\uDF4A','\uD83C\uDF47','\uD83C\uDF53','\uD83C\uDF49','\uD83C\uDF4C','\uD83C\uDF4D','\uD83E\uDD5D','\uD83E\uDD51','\uD83C\uDF3D','\uD83E\uDD55','\uD83C\uDF54','\uD83C\uDF5F','\uD83C\uDF55','\uD83C\uDF2D','\uD83C\uDF63','\uD83C\uDF59','\uD83C\uDF5C','\uD83C\uDF69']
};

let state = {
  ji: STARTING_JI,
  autosave: true,
  settings: { sciNotation: false, freezeEnabled: true, emojiSetKey: 'classic' },
  board: Array(BOARD_ARRAY_SIZE).fill(null),
  unlockedCount: START_UNLOCKED,
  maxBuyTier: 1,
  tierPurchases: {},
  bonusStreamsLevel: 0,
  streamStackCapLevel: 0,
  occupiedBiasLevel: 0,
  unfreezeRewardLevel: 0,
  prestigeLevel: 0,
  mojiPlus: 0,
  mojiPlusPlus: 0,
  mojiPPLevel: 0,
  autoSpawnUnlocked: false,
  autoMergeUnlocked: false,
  spawnSpeedLevel: 0,
  mergeSpeedLevel: 0,
  freezeTimerReduceLevel: 0,
  prestigeTree: {
    maxTierBonusUnlocked: false,
    maxTierBonus2Unlocked: false,
    maxTierBonus3Unlocked: false,
    freezingUnlocked: false,
    bonusStreamsUnlocked: false,
    streamStackCapUnlocked: false,
    occupiedBiasUnlocked: false,
    shopEfficiencyLevel: 0,
    boardStartBonusLevel: 0,
    passivePpsLevel: 0,
    boardCapacityBonusLevel: 0,
    unfreezeBaseBonusLevel: 0,
    shopEfficiencyLevel2: 0,
    shopEfficiencyLevel3: 0,
    passivePpsLevel2: 0,
    tierInfusionLevel: 0,
  },
  stats: {
    current: { prestigeLevel: 0, purchasesPerTier: {}, merges: 0, emojisFrozen: 0, lifetimeJi: 0, jiFrozen: 0, jiPassive: 0,
               tilesUnlocked:0, emojisDeleted:0, highestTier:0, jiSpentShop:0, jiSpentUpg:0, runTimeSec:0 },
    allTime: { purchasesPerTier: {}, merges: 0, emojisFrozen: 0, lifetimeJi: 0, jiFrozen: 0, jiPassive: 0,
               tilesUnlocked:0, emojisDeleted:0, highestTier:0, jiSpentShop:0, jiSpentUpg:0, runTimeSec:0 },
  },
  lastTick: Date.now(),
};

let stackCounts = Array(BOARD_ARRAY_SIZE).fill(0);
let streamsIntervalId = null;
let freezeIntervalId = null;
let frozenSet = new Set();
let autoSpawnIntervalId = null;
let autoMergeIntervalId = null;

const el = {
  ji: document.getElementById('ji'), jips: document.getElementById('jips'), message: document.getElementById('message'),
  prestigeLevel: document.getElementById('prestigeLevel'),
  tabs: Array.from(document.querySelectorAll('.tab')),
  panels: { game: document.getElementById('tab-game'), stats: document.getElementById('tab-stats'), prestige: document.getElementById('tab-prestige'), settings: document.getElementById('tab-settings') },
  board: document.getElementById('board'), shop: document.getElementById('shop'), minTierLabel: document.getElementById('minTierLabel'), maxTierLabel: document.getElementById('maxTierLabel'), tierCap: document.getElementById('tierCap'), upgradesList: document.getElementById('upgradesList'),
  prestigeBtn: document.getElementById('prestigeBtn'), prestigeTree: document.getElementById('prestigeTree'),
  fullResetBtn: document.getElementById('fullResetBtn'), prestigeReadyBanner: document.getElementById('prestigeReadyBanner'),
  sciToggle: document.getElementById('sciToggle'), freezeToggle: document.getElementById('freezeToggle'), freezeSetting: document.getElementById('freezeSetting'), emojiSetSetting: document.getElementById('emojiSetSetting'),
  exportBtn: document.getElementById('exportBtn'), importFile: document.getElementById('importFile'), importBtn: document.getElementById('importBtn'),
  mojiPlusCounter: document.getElementById('mojiPlusCounter'), mojiPPpill: document.getElementById('mojiPPpill'), mojiPlusPlus: document.getElementById('mojiPlusPlus'), estPrestigeJi: document.getElementById('estPrestigeJi'),
  mojiPPSection: document.getElementById('mojiPPSection'), mojiPPLevel: document.getElementById('mojiPPLevel'), mojiPPBtn: document.getElementById('mojiPPBtn'),
  autoSpawnUpgrade: document.getElementById('autoSpawnUpgrade'), autoSpawnBtn: document.getElementById('autoSpawnBtn'), autoSpawnStatus: document.getElementById('autoSpawnStatus'), spawnIntervalLabel: document.getElementById('spawnIntervalLabel'),
  autoMergeUpgrade: document.getElementById('autoMergeUpgrade'), autoMergeBtn: document.getElementById('autoMergeBtn'), autoMergeStatus: document.getElementById('autoMergeStatus'), mergeIntervalLabel: document.getElementById('mergeIntervalLabel'),
  spawnSpeedUpgrade: document.getElementById('spawnSpeedUpgrade'), spawnSpeedBtn: document.getElementById('spawnSpeedBtn'), spawnSpeedLevel: document.getElementById('spawnSpeedLevel'),
  mergeSpeedUpgrade: document.getElementById('mergeSpeedUpgrade'), mergeSpeedBtn: document.getElementById('mergeSpeedBtn'), mergeSpeedLevel: document.getElementById('mergeSpeedLevel'),
  freezeStatCur: document.getElementById('freezeStatCur'), freezeStatCur2: document.getElementById('freezeStatCur2'), freezeStatAll: document.getElementById('freezeStatAll'), freezeStatAll2: document.getElementById('freezeStatAll2'),
  freezeHowto: document.getElementById('freezeHowto'), freezeTimerLabel: document.getElementById('freezeTimerLabel'),
  s_curPrestige: document.getElementById('s_curPrestige'), s_curLifeJi: document.getElementById('s_curLifeJi'), s_curFrozenJi: document.getElementById('s_curFrozenJi'), s_curPassiveJi: document.getElementById('s_curPassiveJi'), s_curMerges: document.getElementById('s_curMerges'), s_curFrozen: document.getElementById('s_curFrozen'), s_curTilesUnlocked: document.getElementById('s_curTilesUnlocked'), s_curDeleted: document.getElementById('s_curDeleted'), s_curHighestTier: document.getElementById('s_curHighestTier'), s_curJiSpentShop: document.getElementById('s_curJiSpentShop'), s_curJiSpentUpg: document.getElementById('s_curJiSpentUpg'), s_curRunTime: document.getElementById('s_curRunTime'), s_curPurchases: document.getElementById('s_curPurchases'),
  s_allLifeJi: document.getElementById('s_allLifeJi'), s_allFrozenJi: document.getElementById('s_allFrozenJi'), s_allPassiveJi: document.getElementById('s_allPassiveJi'), s_allMerges: document.getElementById('s_allMerges'), s_allFrozen: document.getElementById('s_allFrozen'), s_allTilesUnlocked: document.getElementById('s_allTilesUnlocked'), s_allDeleted: document.getElementById('s_allDeleted'), s_allHighestTier: document.getElementById('s_allHighestTier'), s_allJiSpentShop: document.getElementById('s_allJiSpentShop'), s_allJiSpentUpg: document.getElementById('s_allJiSpentUpg'), s_allRunTime: document.getElementById('s_allRunTime'), s_allPurchases: document.getElementById('s_allPurchases'),
};

function message(msg){ el.message.textContent = msg; if (msg){ setTimeout(() => { if (el.message.textContent === msg) el.message.textContent = ''; }, 3000); } }
function fmtSci(n){ if (!isFinite(n) || isNaN(n)) return '—'; if (n === 0) return '0'; const e = Math.floor(Math.log10(Math.abs(n))); const m = n / Math.pow(10,e); return m.toFixed(3) + 'e' + (e>=0?'+':'') + e; }
function fmtJi(n){ if (!isFinite(n) || isNaN(n)) return '—'; if (state.settings.sciNotation) return fmtSci(n); if (n < 1000) return n.toFixed(0); const units=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc']; let u=0,v=n; while(v>=1000&&u<units.length-1){v/=1000;u++;} return v.toFixed(2)+units[u]; }
function getEmojiForTier(t){ const set = EMOJI_SETS[state.settings.emojiSetKey] || EMOJI_SETS.classic; return set[(t-1) % set.length]; }
function getPPS(tier){ if (tier <= 1) return 1; let p = 1; for (let i=2;i<=tier;i++) p = p * 2 + i; return p; }
function tileMultiplier(idx){ const stacks = stackCounts[idx] || 0; return Math.pow(2, stacks); }
function isFrozen(idx){ return frozenSet.has(idx); }

function effectivePriceTier(t){ const shift = state.mojiPPLevel || 0; return Math.max(1, t - shift); }
function tierBasePrice(t){ return TIER1_COST * Math.pow(2.5, t-1); }
function tierPurchaseCount(t){ const tp = state.tierPurchases || {}; const c = tp[t]; return (typeof c === 'number' && isFinite(c)) ? c : 0; }
function shopEfficiencyFactor(){ const pt = state.prestigeTree || {}; const l = (pt.shopEfficiencyLevel||0) + (pt.shopEfficiencyLevel2||0) + (pt.shopEfficiencyLevel3||0); const f = 1 - 0.01 * l; return Math.max(0.85, f); }
function tierPrice(t){ const baseTier = effectivePriceTier(t); const base = tierBasePrice(baseTier); const infl = Math.pow(1.04, tierPurchaseCount(t)); const eff = shopEfficiencyFactor(); return Math.round(base * infl * eff); }
function maxTierCap(){ return 10 + (state.prestigeLevel||0) * 2; }
function buyableTierCap(){ return Math.max(1, maxTierCap() - 2); }
function minBuyTier(){ return Math.min(maxTierCap(), 1 + (state.mojiPPLevel||0)); }
function boardMaxCapacity(){ const pt = state.prestigeTree || {}; return 10 + (state.prestigeLevel||0) * 2 + ((pt.boardCapacityBonusLevel||0) * 2); }

function passivePpsFactor(){ const pt = state.prestigeTree || {}; const l = (pt.passivePpsLevel||0) + (pt.passivePpsLevel2||0); const prestigeBonus = 1 + 0.01 * (state.prestigeLevel||0); const mojiPPBonus = 1 + 0.015 * ((state.mojiPlusPlus||0) + (state.mojiPPLevel||0)); return (1 + 0.05 * l) * prestigeBonus * mojiPPBonus; }
function tierInfusionBonusForTile(idx){ const cell = state.board[idx]; if (!cell) return 0; const pt = state.prestigeTree || {}; return (pt.tierInfusionLevel||0) * cell.tier; }
function totalPPS(){ let sum = 0; const capCount = Math.min(state.unlockedCount, boardMaxCapacity()); for (let i=0;i<capCount;i++){ const cell = state.board[i]; if (cell && !isFrozen(i)) sum += (getPPS(cell.tier) * tileMultiplier(i) + tierInfusionBonusForTile(i)); } return sum * passivePpsFactor(); }
function totalPpsSafe(){ const val = totalPPS(); return isFinite(val) && !isNaN(val) ? val : 0; }

function normalizeState(){ state.tierPurchases = state.tierPurchases && typeof state.tierPurchases==='object' ? state.tierPurchases : {}; state.prestigeLevel = Number(state.prestigeLevel)||0; state.mojiPlus = Number(state.mojiPlus)||0; state.mojiPlusPlus = Number(state.mojiPlusPlus)||0; state.mojiPPLevel = Number(state.mojiPPLevel)||0; state.settings = state.settings && typeof state.settings==='object' ? state.settings : { sciNotation:false, freezeEnabled:true, emojiSetKey:'classic' }; state.settings.freezeEnabled = state.settings.freezeEnabled!==false; state.settings.emojiSetKey = state.settings.emojiSetKey || 'classic'; state.prestigeTree = state.prestigeTree && typeof state.prestigeTree==='object' ? state.prestigeTree : {}; const pt = state.prestigeTree; const defaults = { maxTierBonusUnlocked:false, maxTierBonus2Unlocked:false, maxTierBonus3Unlocked:false, freezingUnlocked:false, bonusStreamsUnlocked:false, streamStackCapUnlocked:false, occupiedBiasUnlocked:false, shopEfficiencyLevel:0, boardStartBonusLevel:0, passivePpsLevel:0, boardCapacityBonusLevel:0, unfreezeBaseBonusLevel:0, shopEfficiencyLevel2:0, shopEfficiencyLevel3:0, passivePpsLevel2:0, tierInfusionLevel:0 }; Object.keys(defaults).forEach(k => { if (pt[k]===undefined) pt[k]=defaults[k]; }); state.freezeTimerReduceLevel = Number(state.freezeTimerReduceLevel)||0; state.autoSpawnUnlocked = !!state.autoSpawnUnlocked; state.autoMergeUnlocked = !!state.autoMergeUnlocked; state.spawnSpeedLevel = Number(state.spawnSpeedLevel)||0; state.mergeSpeedLevel = Number(state.mergeSpeedLevel)||0; state.streamStackCapLevel = Number(state.streamStackCapLevel)||0; state.occupiedBiasLevel = Number(state.occupiedBiasLevel)||0; state.unfreezeRewardLevel = Number(state.unfreezeRewardLevel)||0; }
function save(){ if (!state.autosave) return; try{ localStorage.setItem('emoji-merge-ji-save-v13', JSON.stringify(state)); }catch(e){ console.warn('Save failed', e); } }
function load(){ try{ const raw = localStorage.getItem('emoji-merge-ji-save-v13'); if (raw){ const data = JSON.parse(raw); if (data && Array.isArray(data.board)) state = { ...state, ...data }; } else { const prev = localStorage.getItem('emoji-merge-ji-save-v12'); if (prev){ const d = JSON.parse(prev); state = { ...state, ...d }; } } }catch(e){ console.warn('Load failed', e); } finally { normalizeState(); } }

function offlineProgress(){ const now = Date.now(); const elapsed = Math.max(0, Math.floor((now - state.lastTick) / 1000)); if (elapsed > 0){ const gain = totalPpsSafe() * elapsed; state.ji += gain; state.lastTick = now; addStatsPassive(gain); addRunTime(elapsed); if (gain>0) message(`Welcome back! Earned +${fmtJi(gain)} Ji while away.`); } }

function firstEmptyUnlockedIndex(){ const capCount = Math.min(state.unlockedCount, boardMaxCapacity()); for (let i=0;i<capCount;i++) if (state.board[i] == null) return i; return -1; }
function occupiedUnlockedIndices(){ const capCount = Math.min(state.unlockedCount, boardMaxCapacity()); const arr=[]; for (let i=0;i<capCount;i++) if (state.board[i] != null) arr.push(i); return arr; }
function hasMaxTierEmoji(){ const cap = maxTierCap(); const capCount = Math.min(state.unlockedCount, boardMaxCapacity()); for (let i=0;i<capCount;i++){ const c = state.board[i]; if (c && c.tier === cap) return true; } return false; }

function addRunTime(sec){ state.stats.current.runTimeSec += sec; state.stats.allTime.runTimeSec += sec; }
function addTilesUnlocked(n){ state.stats.current.tilesUnlocked += n; state.stats.allTime.tilesUnlocked += n; }
function addDeleted(){ state.stats.current.emojisDeleted += 1; state.stats.allTime.emojisDeleted += 1; }
function addJiSpentShop(x){ state.stats.current.jiSpentShop += x; state.stats.allTime.jiSpentShop += x; }
function addJiSpentUpg(x){ state.stats.current.jiSpentUpg += x; state.stats.allTime.jiSpentUpg += x; }
function updateHighestTier(t){ state.stats.current.highestTier = Math.max(state.stats.current.highestTier||0, t); state.stats.allTime.highestTier = Math.max(state.stats.allTime.highestTier||0, t); }
function incMap(map,key,by){ map[key] = (map[key]||0) + by; }
function addStatsPurchase(tier){ incMap(state.stats.current.purchasesPerTier, tier, 1); incMap(state.stats.allTime.purchasesPerTier, tier, 1); }
function addStatsMerge(){ state.stats.current.merges += 1; state.stats.allTime.merges += 1; }
function addStatsPassive(amount){ state.stats.current.lifetimeJi += amount; state.stats.current.jiPassive += amount; state.stats.allTime.lifetimeJi += amount; state.stats.allTime.jiPassive += amount; }
function addStatsFrozen(amount){ state.stats.current.lifetimeJi += amount; state.stats.current.jiFrozen += amount; state.stats.allTime.lifetimeJi += amount; state.stats.allTime.jiFrozen += amount; }

function fmtTime(s){ const d=Math.floor(s/86400), h=Math.floor((s%86400)/3600), m=Math.floor((s%3600)/60), sec=Math.floor(s%60); const parts=[]; if(d) parts.push(`${d}d`); if(h) parts.push(`${h}h`); if(m) parts.push(`${m}m`); parts.push(`${sec}s`); return parts.join(' '); }
function renderTierGrid(container,map){ container.innerHTML=''; const tiers=Object.keys(map||{}).map(n=>Number(n)).sort((a,b)=>a-b); tiers.forEach(t=>{ const box=document.createElement('div'); box.className='tierbox'; box.innerHTML=`<span>T${t}</span><span>${map[t]}</span>`; container.appendChild(box); }); }
function renderStats(){ const cur=state.stats.current; const all=state.stats.allTime; el.s_curPrestige.textContent=String(state.prestigeLevel); el.s_curLifeJi.textContent=fmtJi(cur.lifetimeJi); el.s_curFrozenJi.textContent=fmtJi(cur.jiFrozen); el.s_curPassiveJi.textContent=fmtJi(cur.jiPassive); el.s_curMerges.textContent=String(cur.merges); el.s_curFrozen.textContent=String(cur.emojisFrozen); el.s_curTilesUnlocked.textContent=String(cur.tilesUnlocked); el.s_curDeleted.textContent=String(cur.emojisDeleted); el.s_curHighestTier.textContent=String(cur.highestTier||0); el.s_curJiSpentShop.textContent=fmtJi(cur.jiSpentShop); el.s_curJiSpentUpg.textContent=fmtJi(cur.jiSpentUpg); el.s_curRunTime.textContent=fmtTime(cur.runTimeSec);
  el.s_allLifeJi.textContent=fmtJi(all.lifetimeJi); el.s_allFrozenJi.textContent=fmtJi(all.jiFrozen); el.s_allPassiveJi.textContent=fmtJi(all.jiPassive); el.s_allMerges.textContent=String(all.merges); el.s_allFrozen.textContent=String(all.emojisFrozen); el.s_allTilesUnlocked.textContent=String(all.tilesUnlocked); el.s_allDeleted.textContent=String(all.emojisDeleted); el.s_allHighestTier.textContent=String(all.highestTier||0); el.s_allJiSpentShop.textContent=fmtJi(all.jiSpentShop); el.s_allJiSpentUpg.textContent=fmtJi(all.jiSpentUpg); el.s_allRunTime.textContent=fmtTime(all.runTimeSec);
  renderTierGrid(el.s_curPurchases,cur.purchasesPerTier); renderTierGrid(el.s_allPurchases,all.purchasesPerTier);
  const freezeUnlocked = !!(state.prestigeTree && state.prestigeTree.freezingUnlocked);
  el.freezeStatCur.hidden = !freezeUnlocked; el.freezeStatCur2.hidden = !freezeUnlocked; el.freezeStatAll.hidden = !freezeUnlocked; el.freezeStatAll2.hidden = !freezeUnlocked;
}

function renderBoard(){ el.board.innerHTML=''; const gridCount = boardMaxCapacity(); state.unlockedCount = Math.min(state.unlockedCount, gridCount);
 for (let i=0;i<gridCount;i++){
  const cell = state.board[i]; const unlocked = i < state.unlockedCount; const d = document.createElement('div'); d.className = 'tile' + (unlocked? '' : ' locked') + ((cell && unlocked)? '' : ' empty') + (isFrozen(i)? ' frozen' : ''); d.setAttribute('role','button'); d.dataset.index = String(i);
  const stacks = stackCounts[i]||0; const ratio = Math.min(1, stacks/6); const hue = Math.round(120*ratio); d.style.boxShadow = stacks>0 ? `0 0 0 3px hsl(${hue} 80% 50% / 0.9)` : '';
  if (cell && unlocked){ const em = document.createElement('div'); em.className='emoji'; em.textContent=getEmojiForTier(cell.tier); const tier=document.createElement('div'); tier.className='tier-label'; const isMax = cell.tier===maxTierCap(); tier.textContent=isMax?`T${cell.tier} • Max`:`T${cell.tier}`; if(isMax) tier.classList.add('max'); const pps=document.createElement('div'); pps.className='pps-label'; const eff=isFrozen(i)?0:Math.round((getPPS(cell.tier)*tileMultiplier(i)+tierInfusionBonusForTile(i))*passivePpsFactor()); pps.textContent=`${fmtJi(eff)} /s`; const sb=document.createElement('div'); sb.className='stack-badge'; sb.textContent=stacks>0 ? `×${Math.pow(2, stacks)} (${stacks})` : ''; d.appendChild(em); d.appendChild(tier); d.appendChild(pps); d.appendChild(sb); d.draggable=true; d.addEventListener('dragstart', dragStart); d.addEventListener('dragover', dragOver); d.addEventListener('drop', drop); d.addEventListener('auxclick', onTileAuxClick); 
  
d.appendChild(em);
d.appendChild(tier);
d.appendChild(pps);
d.appendChild(sb);

// existing handlers...
d.draggable = true;
d.addEventListener('dragstart', dragStart);
d.addEventListener('dragover', dragOver);
d.addEventListener('drop', drop);
d.addEventListener('auxclick', onTileAuxClick);

// NEW: thaw on double‑click
d.addEventListener('dblclick', onTileDoubleClick);
}
  d.addEventListener('click', onTileClick); el.board.appendChild(d);
 }
 el.prestigeReadyBanner.hidden = !canPrestige();
}

function renderShop(){ el.shop.innerHTML=''; const cap = maxTierCap(); const buyCap = buyableTierCap(); const minTier = minBuyTier(); const maxListTier = Math.min(state.maxBuyTier, buyCap); el.tierCap.textContent = String(cap); el.minTierLabel.textContent = String(minTier); for (let t=maxListTier; t>=minTier; t--){ const btn=document.createElement('button'); btn.className='shop-btn'; btn.type='button'; btn.dataset.tier=String(t); const price=tierPrice(t); btn.innerHTML=`<span class="label">Buy T${t}</span><span class="price">${fmtJi(price)} Ji</span>`; btn.disabled=!shopCanBuy(t); btn.addEventListener('click',()=>buyTier(t),{once:false}); el.shop.appendChild(btn); } el.maxTierLabel.textContent=String(maxListTier); }
function shopCanBuy(t){ return state.ji >= tierPrice(t) && firstEmptyUnlockedIndex() !== -1; }
function updateShopButtonsState(){ const buttons=Array.from(document.querySelectorAll('.shop-btn')); buttons.forEach(b=>{ const t=Number(b.dataset.tier); b.disabled=!shopCanBuy(t); }); }

function renderUpgrades(){ const items=[];
  const boardMaxed = !canUnlockMore();
  items.push({ key:'board', title:'Board', desc:'Unlock +1 tile', sub:`Level ${boardUnlockLevel()} • Capacity ${state.unlockedCount}/${boardMaxCapacity()}`, maxTag: boardMaxed, btn:{ id:'unlockBoardBtn', label:`Unlock (${fmtJi(nextUnlockCost())} Ji)`, disabled:(boardMaxed||state.ji<nextUnlockCost()) }});
  const buyCap = buyableTierCap(); const shopMaxed = state.maxBuyTier>=buyCap;
  items.push({ key:'shop', title:'Shop', desc:'Increase max tier to buy +1 (limit T'+buyCap+')', sub:`Level ${shopUpgradeLevel()} • Current max T${state.maxBuyTier}`, maxTag: shopMaxed, btn:{ id:'upgradeShopTierBtn', label:`Upgrade (${fmtJi(nextShopTierCost())} Ji)`, disabled:(state.ji<nextShopTierCost()||shopMaxed) }});
  if (state.prestigeTree.freezingUnlocked){ const labelMult = (2*(1+(state.unfreezeRewardLevel||0)+(state.prestigeTree.unfreezeBaseBonusLevel||0))).toFixed(0); items.push({ key:'unfreeze', title:'Unfreeze Reward', desc:'Increase thaw reward multiplier', sub:`Level ${state.unfreezeRewardLevel} • Multiplier ×${labelMult}`, maxTag:false, btn:{ id:'upgradeUnfreezeRewardBtn', label:`Upgrade (${fmtJi(nextUnfreezeRewardCost())} Ji)`, disabled:(state.ji<nextUnfreezeRewardCost()) }}); }
  if (state.prestigeTree.bonusStreamsUnlocked){ const streamsMaxed = state.bonusStreamsLevel>=boardMaxCapacity(); items.push({ key:'streams', title:'Bonus Streams', desc:'Add concurrent bonus multipliers (reassign every 5s)', sub:`Level ${state.bonusStreamsLevel}/${boardMaxCapacity()}`, maxTag: streamsMaxed, btn:{ id:'upgradeBonusStreamsBtn', label:`Upgrade (${fmtJi(nextBonusStreamsCost())} Ji)`, disabled:(state.ji<nextBonusStreamsCost()||streamsMaxed) }}); }
  if (state.prestigeTree.streamStackCapUnlocked){ const stackCapMaxed = state.streamStackCapLevel>=5; items.push({ key:'streamstack', title:'Stream Stack Cap', desc:'Increase max stacks for Streams', sub:`Level ${state.streamStackCapLevel}/5 • Current cap ${currentStreamStackCap()}`, maxTag: stackCapMaxed, btn:{ id:'upgradeStreamStackCapBtn', label:`Upgrade (${fmtJi(nextStreamStackCapCost())} Ji)`, disabled:(state.ji<nextStreamStackCapCost()||stackCapMaxed) }}); }
  if (state.prestigeTree.occupiedBiasUnlocked){ const biasMaxed = state.occupiedBiasLevel>=50; items.push({ key:'bias', title:'Occupied Bias', desc:'Increase chance to target tiles with emojis', sub:`Level ${state.occupiedBiasLevel}/50 • Chance ${Math.round(occupiedBiasChance()*100)}%`, maxTag: biasMaxed, btn:{ id:'upgradeOccupiedBiasBtn', label:`Upgrade (${fmtJi(nextOccupiedBiasCost())} Ji)`, disabled:(state.ji<nextOccupiedBiasCost()||biasMaxed) }}); }
  if (state.prestigeTree.freezingUnlocked && state.prestigeTree.unfreezeBaseBonusLevel>=2){ const reduceMaxed = state.freezeTimerReduceLevel>=15; items.push({ key:'freezeReduce', title:'Freeze Timer Reducer', desc:'Reduce freeze timer by 1s per tier', sub:`Level ${state.freezeTimerReduceLevel}/15 • Current interval ${freezeIntervalSeconds()}s`, maxTag: reduceMaxed, btn:{ id:'upgradeFreezeReduceBtn', label:`Upgrade (${fmtJi(nextFreezeReduceCost())} Ji)`, disabled:(state.ji<nextFreezeReduceCost()||reduceMaxed) }}); }

  el.upgradesList.innerHTML='';
  items.forEach(it=>{ const box=document.createElement('div'); box.className='upgrade'; const left=document.createElement('div'); const t=document.createElement('div'); t.className='title'; t.textContent=it.title; const d=document.createElement('div'); d.className='desc'; d.textContent=it.desc; const s=document.createElement('div'); s.className='sub'; s.textContent=it.sub; left.appendChild(t); left.appendChild(d); left.appendChild(s); if (it.maxTag){ const tag=document.createElement('span'); tag.className='tag'; tag.textContent='Max'; left.appendChild(tag); } box.appendChild(left); if (!it.maxTag){ const btn=document.createElement('button'); btn.id=it.btn.id; btn.type='button'; btn.textContent=it.btn.label; btn.disabled=it.btn.disabled; box.appendChild(btn); } el.upgradesList.appendChild(box); });
  const btns={ unlockBoardBtn:upgradeUnlockBoard, upgradeShopTierBtn:upgradeShopTier, upgradeUnfreezeRewardBtn:upgradeUnfreezeReward, upgradeBonusStreamsBtn:upgradeBonusStreams, upgradeStreamStackCapBtn:upgradeStreamStackCap, upgradeOccupiedBiasBtn:upgradeOccupiedBias, upgradeFreezeReduceBtn:upgradeFreezeReduce };
  Object.entries(btns).forEach(([id,fn])=>{ const b=document.getElementById(id); if(b){ b.addEventListener('click', fn, {once:false}); b.addEventListener('mousedown', e=>e.stopPropagation()); }});
}

function boardUnlockLevel(){ return Math.floor((state.unlockedCount-START_UNLOCKED)/UNLOCK_STEP); }
function nextUnlockCost(){ const level=boardUnlockLevel(); return Math.round(500*Math.pow(3,level)); }
function canUnlockMore(){ return state.unlockedCount < boardMaxCapacity(); }
function upgradeUnlockBoard(){ const cost=nextUnlockCost(); if(!canUnlockMore()){ message('Capacity reached.'); return; } if(state.ji<cost){ message('Not enough Ji for board unlock.'); return; } state.ji-=cost; addJiSpentUpg(cost); state.unlockedCount=Math.min(boardMaxCapacity(), state.unlockedCount+UNLOCK_STEP); addTilesUnlocked(1); message('Unlocked +1 tile!'); renderAll(); save(); }

const SHOP_UPGRADE_BASE_COST=1000; function shopUpgradeLevel(){ return Math.max(0, state.maxBuyTier-1); } function nextShopTierCost(){ return Math.round(SHOP_UPGRADE_BASE_COST*Math.pow(2.02, shopUpgradeLevel())); } function upgradeShopTier(){ const buyCap=buyableTierCap(); if(state.maxBuyTier>=buyCap){ message(`Shop buy limit reached (T${buyCap}).`); return; } const cost=nextShopTierCost(); if(state.ji<cost){ message('Not enough Ji to upgrade shop tier.'); return; } state.ji-=cost; addJiSpentUpg(cost); state.maxBuyTier+=1; message(`Shop upgraded! You can now buy up to T${state.maxBuyTier} (limit T${buyCap}).`); renderAll(); save(); }

function currentStreamStackCap(){ return 1 + (state.streamStackCapLevel||0); }
function bonusStreamsMax(){ return boardMaxCapacity(); }
function occupiedBiasChance(){ const pt=state.prestigeTree||{}; if(!pt.occupiedBiasUnlocked) return 0; return Math.min(1, 0.02*(state.occupiedBiasLevel||0)); }
function nextBonusStreamsCost(){ const lvl=state.bonusStreamsLevel||0; return Math.round(2000*Math.pow(2,lvl)); }
function nextStreamStackCapCost(){ const lvl=state.streamStackCapLevel||0; return Math.round(1500*Math.pow(2,lvl)); }
function nextOccupiedBiasCost(){ const lvl=state.occupiedBiasLevel||0; return Math.round(1200*Math.pow(1.5,lvl)); }
function nextUnfreezeRewardCost(){ const lvl=state.unfreezeRewardLevel||0; return Math.round(1400*Math.pow(1.8,lvl)); }
function upgradeBonusStreams(){ const pt=state.prestigeTree||{}; if(!pt.bonusStreamsUnlocked){ message('Unlock Bonus Streams in the Prestige Tree first.'); return; } const max=bonusStreamsMax(); if((state.bonusStreamsLevel||0)>=max){ message('Bonus Streams at maximum.'); return; } const cost=nextBonusStreamsCost(); if(state.ji<cost){ message('Not enough Ji to upgrade Bonus Streams.'); return; } state.ji-=cost; addJiSpentUpg(cost); state.bonusStreamsLevel=(state.bonusStreamsLevel||0)+1; message(`Bonus Streams +1 (now ${state.bonusStreamsLevel}).`); renderAll(); save(); }
function upgradeStreamStackCap(){ const pt=state.prestigeTree||{}; if(!pt.streamStackCapUnlocked){ message('Unlock Stream Stack Cap in the Prestige Tree first.'); return; } if((state.streamStackCapLevel||0)>=5){ message('Stream Stack Cap at maximum.'); return; } const cost=nextStreamStackCapCost(); if(state.ji<cost){ message('Not enough Ji to upgrade Stream Stack Cap.'); return; } state.ji-=cost; addJiSpentUpg(cost); state.streamStackCapLevel=(state.streamStackCapLevel||0)+1; message(`Stream Stack Cap increased (now ${currentStreamStackCap()}).`); renderAll(); save(); }
function upgradeOccupiedBias(){ const pt=state.prestigeTree||{}; if(!pt.occupiedBiasUnlocked){ message('Unlock Occupied Bias in the Prestige Tree first.'); return; } if((state.occupiedBiasLevel||0)>=50){ message('Occupied Bias at maximum.'); return; } const cost=nextOccupiedBiasCost(); if(state.ji<cost){ message('Not enough Ji to upgrade Occupied Bias.'); return; } state.ji-=cost; addJiSpentUpg(cost); state.occupiedBiasLevel=(state.occupiedBiasLevel||0)+1; message(`Occupied Bias increased (now ${Math.round(occupiedBiasChance()*100)}%).`); renderAll(); save(); }
function upgradeUnfreezeReward(){ const pt=state.prestigeTree||{}; if(!pt.freezingUnlocked){ message('Unlock Freezing in the Prestige Tree first.'); return; } const cost=nextUnfreezeRewardCost(); if(state.ji<cost){ message('Not enough Ji to upgrade Unfreeze Reward.'); return; } state.ji-=cost; addJiSpentUpg(cost); state.unfreezeRewardLevel=(state.unfreezeRewardLevel||0)+1; message(`Unfreeze Reward increased (×${(2*(1+(state.unfreezeRewardLevel||0)+(pt.unfreezeBaseBonusLevel||0))).toFixed(0)}).`); renderAll(); save(); }

function freezeEnabled(){ return !!state.settings.freezeEnabled; }
function freezeIntervalSeconds(){ return Math.max(5, 30 - (state.freezeTimerReduceLevel||0)); }
function nextFreezeReduceCost(){ const lvl=state.freezeTimerReduceLevel||0; return Math.round(1500*Math.pow(1.6,lvl)); }
function upgradeFreezeReduce(){ if (!state.prestigeTree.freezingUnlocked || state.prestigeTree.unfreezeBaseBonusLevel < 2){ message('Requires Unfreeze Base II.'); return; } if ((state.freezeTimerReduceLevel||0) >= 15){ message('Freeze Timer Reducer at maximum.'); return; } const cost = nextFreezeReduceCost(); if (state.ji < cost){ message('Not enough Ji to upgrade Freeze Timer Reducer.'); return; } state.ji -= cost; addJiSpentUpg(cost); state.freezeTimerReduceLevel = (state.freezeTimerReduceLevel||0) + 1; message(`Freeze interval reduced (now ${freezeIntervalSeconds()}s).`); renderAll(); save(); ensureFreezeScheduler(true); }
function tryFreeze(){ if(!freezeEnabled()) return; const pt=state.prestigeTree||{}; if(!pt.freezingUnlocked) return; const occ=occupiedUnlockedIndices(); if(occ.length===0) return; const idx=occ[Math.floor(Math.random()*occ.length)]; frozenSet.add(idx); state.stats.current.emojisFrozen += 1; state.stats.allTime.emojisFrozen += 1; renderBoard(); message('An emoji froze! Double‑click it to thaw.'); }
function thawReward(idx){ const cell=state.board[idx]; if(!cell) return 0; const pt=state.prestigeTree||{}; const base=getPPS(cell.tier)*tileMultiplier(idx); const mult=2*(1+(state.unfreezeRewardLevel||0)+(pt.unfreezeBaseBonusLevel||0)); return base*mult; }
function ensureFreezeScheduler(force){ const pt=state.prestigeTree||{}; const enabled = pt.freezingUnlocked && freezeEnabled(); if(freezeIntervalId){ clearInterval(freezeIntervalId); freezeIntervalId=null; } if (enabled){ const ms = freezeIntervalSeconds()*1000; el.freezeHowto.hidden = false; el.freezeTimerLabel.textContent = String(freezeIntervalSeconds())+'s'; freezeIntervalId=setInterval(tryFreeze, ms); } else { el.freezeHowto.hidden = true; }
}

function clearAllStacks(){ stackCounts=Array(BOARD_ARRAY_SIZE).fill(0); }
function allIndices(){ return Array.from({length:boardMaxCapacity()},(_,i)=>i); }
function pickIndexWeighted(){ const occ=occupiedUnlockedIndices(); const chance=occupiedBiasChance(); if(Math.random()<chance && occ.length>0){ return occ[Math.floor(Math.random()*occ.length)]; } const idxs=allIndices(); return idxs[Math.floor(Math.random()*idxs.length)]; }
function reassignStreams(){ const pt=state.prestigeTree||{}; if(!pt.bonusStreamsUnlocked) return; clearAllStacks(); const cap=currentStreamStackCap(); const level=state.bonusStreamsLevel||0; if(level<=0){ renderBoard(); return; } for(let s=0; s<level; s++){ const i=pickIndexWeighted(); if(i!=null){ stackCounts[i]=Math.min(cap, (stackCounts[i]||0) + 1); } } renderBoard(); }
function ensureStreamsScheduler(){ const pt=state.prestigeTree||{}; if(!pt.bonusStreamsUnlocked) return; reassignStreams(); if(!streamsIntervalId) streamsIntervalId=setInterval(reassignStreams, 5000); }

function spawnIntervalSeconds(){ return Math.max(5, 30 - 5*(state.spawnSpeedLevel||0)); }
function mergeIntervalSeconds(){ return Math.max(5, 30 - 5*(state.mergeSpeedLevel||0)); }
function ensureAutomationSchedulers(){ if(autoSpawnIntervalId){ clearInterval(autoSpawnIntervalId); autoSpawnIntervalId=null; } if(autoMergeIntervalId){ clearInterval(autoMergeIntervalId); autoMergeIntervalId=null; } if(state.autoSpawnUnlocked){ autoSpawnIntervalId=setInterval(runAutoSpawn, spawnIntervalSeconds()*1000); } if(state.autoMergeUnlocked){ autoMergeIntervalId=setInterval(()=>{ setTimeout(runAutoMerge, 250); }, mergeIntervalSeconds()*1000); } }
function secondHighestBuyableTier(){ const buyCap=buyableTierCap(); const maxListTier=Math.min(state.maxBuyTier, buyCap); return Math.max(1, maxListTier-1); }
function runAutoSpawn(){ const idx=firstEmptyUnlockedIndex(); if (idx===-1) return; const t = secondHighestBuyableTier(); if (t < 1) return; state.board[idx] = { tier: t }; updateHighestTier(t); message(`Auto‑spawned T${t}.`); renderAll(); save(); }
function runAutoMerge(){ const capCount = Math.min(state.unlockedCount, boardMaxCapacity()); const positions={}; for(let i=0;i<capCount;i++){ const c=state.board[i]; if(c && !isFrozen(i)){ const t=c.tier; if(!positions[t]) positions[t]=[]; positions[t].push(i); } }
  for(const t of Object.keys(positions).map(Number).sort((a,b)=>b-a)){ const arr=positions[t]; if(arr.length>=2){ const i=arr[0], j=arr[1]; const nextTier=t+1; const cap=maxTierCap(); if(nextTier>cap) continue; state.board[i] = { tier: nextTier }; state.board[j] = null; addStatsMerge(); updateHighestTier(nextTier); message(`Auto‑merged to T${nextTier}.`); renderAll(); save(); return; } }
}

function mojiPPGrant(){ const lvl = state.prestigeLevel; if (lvl >= 100 && (lvl - 100) % 2 === 0) return 1; if (lvl >= 50 && (lvl - 50) % 3 === 0) return 1; return 0; }
function awardMojiPPIfEligible(){ const g = mojiPPGrant(); if (g>0){ state.mojiPlusPlus += g; message('Earned +1 Moji++ point!'); } }
function canPrestige(){ return hasMaxTierEmoji(); }
function maxTierBonusPerEmoji(){ const pt=state.prestigeTree||{}; const cap=maxTierCap(); const mult = (pt.maxTierBonusUnlocked?10:0) + (pt.maxTierBonus2Unlocked?20:0) + (pt.maxTierBonus3Unlocked?30:0); return cap * mult; }
function estimatePrestigeJi(){ const capCount = Math.min(state.unlockedCount, boardMaxCapacity()); let maxTierCount=0; const cap=maxTierCap(); for(let i=0;i<capCount;i++){ const c=state.board[i]; if(c && c.tier===cap) maxTierCount++; } return STARTING_JI + maxTierCount * maxTierBonusPerEmoji(); }
function prestige(){ if(!canPrestige()){ message('Prestige requires at least one max‑tier emoji on the board.'); return; }
  const capCount = Math.min(state.unlockedCount, boardMaxCapacity()); let maxTierCount=0; const cap=maxTierCap(); for(let i=0;i<capCount;i++){ const c=state.board[i]; if(c && c.tier===cap) maxTierCount++; }
  const bonus = maxTierCount * maxTierBonusPerEmoji();
  state.ji = STARTING_JI + bonus; state.prestigeLevel += 1; state.mojiPlus += 1; awardMojiPPIfEligible();
  state.board = Array(BOARD_ARRAY_SIZE).fill(null); state.unlockedCount = START_UNLOCKED; state.maxBuyTier = 1; state.tierPurchases = {}; frozenSet = new Set(); stackCounts=Array(BOARD_ARRAY_SIZE).fill(0);
  state.stats.current = { prestigeLevel: state.prestigeLevel, purchasesPerTier:{}, merges:0, emojisFrozen:0, lifetimeJi:0, jiFrozen:0, jiPassive:0, tilesUnlocked:0, emojisDeleted:0, highestTier:0, jiSpentShop:0, jiSpentUpg:0, runTimeSec:0 };
  message(`Prestiged to ${state.prestigeLevel}! Tier cap T${maxTierCap()}, board capacity ${boardMaxCapacity()} tiles. +1 Moji+`);
  renderAll(); save(); ensureSchedulers(true); }

const treeNodes = [
  { id:'maxTierBonus', level:1, title:'Max Tier Bonus I (Additive)', sub:'+10×MaxTier Ji per max-tier emoji upon prestige.', cost:1, prereqs:[], unlock:() => { state.prestigeTree.maxTierBonusUnlocked = true; } },
  { id:'freezingUnlock', level:2, title:'Unlock Freezing', sub:'Enables freeze/thaw mechanic and Freeze settings.', cost:1, prereqs:['maxTierBonus'], unlock:() => { state.prestigeTree.freezingUnlocked = true; ensureFreezeScheduler(true); } },
  { id:'shopEfficiency1', level:2, title:'Shop Efficiency I', sub:'Reduces tier prices by 1% (cumulative).', cost:1, prereqs:['maxTierBonus'], unlock:() => { state.prestigeTree.shopEfficiencyLevel = (state.prestigeTree.shopEfficiencyLevel||0)+1; } },
  { id:'unfreezeBase1', level:3, title:'Unfreeze Base I', sub:'+1 to base thaw multiplier.', cost:1, prereqs:['freezingUnlock'], unlock:() => { state.prestigeTree.unfreezeBaseBonusLevel = Math.max(state.prestigeTree.unfreezeBaseBonusLevel||0, 1); } },
  { id:'boardStart1', level:3, title:'Board Start I', sub:'+1 starting unlocked tile immediately.', cost:1, prereqs:['shopEfficiency1'], unlock:() => { state.prestigeTree.boardStartBonusLevel = (state.prestigeTree.boardStartBonusLevel||0)+1; state.unlockedCount += 1; addTilesUnlocked(1); } },
  { id:'boardCapacity1', level:4, title:'Board Capacity I', sub:'Unlocks +2 tiles capacity.', cost:1, prereqs:['boardStart1'], unlock:() => { state.prestigeTree.boardCapacityBonusLevel = (state.prestigeTree.boardCapacityBonusLevel||0)+1; } },
  { id:'streamsUnlock', level:4, title:'Unlock Bonus Streams', sub:'Unlocks Bonus Streams upgrade (adds concurrent multipliers; reassign every 5s). Requires Prestige ≥5.', cost:1, prereqs:['unfreezeBase1'], unlock:() => { if (state.prestigeLevel < 5){ message('Requires Prestige ≥5.'); return false; } state.prestigeTree.bonusStreamsUnlocked = true; ensureStreamsScheduler(); return true; } },
  { id:'unfreezeBase2', level:5, title:'Unfreeze Base II', sub:'+1 to base thaw multiplier and unlocks Freeze Timer Reducer.', cost:1, prereqs:['unfreezeBase1'], unlock:() => { state.prestigeTree.unfreezeBaseBonusLevel = 2; } },
  { id:'shopEfficiency2', level:5, title:'Shop Efficiency II', sub:'Reduces tier prices by an additional 1%.', cost:1, prereqs:['boardCapacity1'], unlock:() => { state.prestigeTree.shopEfficiencyLevel2 = (state.prestigeTree.shopEfficiencyLevel2||0)+1; } },
  { id:'maxTierBonus2', level:6, title:'Max Tier Bonus II (Additive)', sub:'+20×MaxTier Ji per max-tier emoji upon prestige.', cost:1, prereqs:['streamsUnlock'], unlock:() => { state.prestigeTree.maxTierBonus2Unlocked = true; } },
  { id:'passivePps1', level:6, title:'Passive PPS I', sub:'+5% Ji/sec global multiplier.', cost:1, prereqs:['shopEfficiency2'], unlock:() => { state.prestigeTree.passivePpsLevel = (state.prestigeTree.passivePpsLevel||0)+1; } },
  { id:'streamStackCapUnlock', level:7, title:'Unlock Stream Stack Cap', sub:'Unlocks Stream Stack Cap upgrade (increases max stacks for Streams). Requires Prestige ≥7 and Streams.', cost:1, prereqs:['streamsUnlock'], unlock:() => { if (state.prestigeLevel < 7 || !state.prestigeTree.bonusStreamsUnlocked){ message('Requires Prestige ≥7 and Bonus Streams.'); return false; } state.prestigeTree.streamStackCapUnlocked = true; return true; } },
  { id:'occupiedBiasUnlock', level:7, title:'Unlock Occupied Bias', sub:'Unlocks Occupied Bias (+2% per level chance to target occupied tiles).', cost:1, prereqs:['passivePps1'], unlock:() => { state.prestigeTree.occupiedBiasUnlocked = true; } },
  { id:'passivePps2', level:8, title:'Passive PPS II', sub:'+5% Ji/sec global multiplier.', cost:1, prereqs:['streamStackCapUnlock'], unlock:() => { state.prestigeTree.passivePpsLevel2 = (state.prestigeTree.passivePpsLevel2||0)+1; } },
  { id:'shopEfficiency3', level:8, title:'Shop Efficiency III', sub:'Reduces tier prices by an additional 1%.', cost:1, prereqs:['occupiedBiasUnlock'], unlock:() => { state.prestigeTree.shopEfficiencyLevel3 = (state.prestigeTree.shopEfficiencyLevel3||0)+1; } },
  { id:'boardCapacity2', level:9, title:'Board Capacity II', sub:'+2 tiles capacity.', cost:1, prereqs:['passivePps2'], unlock:() => { state.prestigeTree.boardCapacityBonusLevel = (state.prestigeTree.boardCapacityBonusLevel||0)+1; } },
  { id:'maxTierBonus3', level:9, title:'Max Tier Bonus III (Additive)', sub:'+30×MaxTier Ji per max-tier emoji upon prestige.', cost:1, prereqs:['shopEfficiency3'], unlock:() => { state.prestigeTree.maxTierBonus3Unlocked = true; } },
  { id:'finalInfusion', level:10, title:'Tier Infusion (∞)', sub:'Emoji gain +tier Ji/sec per level (additive). Requires all prior nodes.', cost:1, prereqs:['boardCapacity2','maxTierBonus3'], infinite:true, unlock:() => { state.prestigeTree.tierInfusionLevel = (state.prestigeTree.tierInfusionLevel||0)+1; } },
];

function allNonFinalUnlocked(){ return treeNodes.filter(n=>n.id!=='finalInfusion').every(n=>isNodeUnlocked(n.id)); }
function isNodeUnlocked(id){ const pt=state.prestigeTree||{}; switch(id){ case 'maxTierBonus': return !!pt.maxTierBonusUnlocked; case 'maxTierBonus2': return !!pt.maxTierBonus2Unlocked; case 'maxTierBonus3': return !!pt.maxTierBonus3Unlocked; case 'freezingUnlock': return !!pt.freezingUnlocked; case 'streamsUnlock': return !!pt.bonusStreamsUnlocked; case 'streamStackCapUnlock': return !!pt.streamStackCapUnlocked; case 'occupiedBiasUnlock': return !!pt.occupiedBiasUnlocked; case 'shopEfficiency1': return (pt.shopEfficiencyLevel||0)>0; case 'shopEfficiency2': return (pt.shopEfficiencyLevel2||0)>0; case 'shopEfficiency3': return (pt.shopEfficiencyLevel3||0)>0; case 'boardStart1': return (pt.boardStartBonusLevel||0)>0; case 'passivePps1': return (pt.passivePpsLevel||0)>0; case 'passivePps2': return (pt.passivePpsLevel2||0)>0; case 'unfreezeBase1': return (pt.unfreezeBaseBonusLevel||0)>0; case 'unfreezeBase2': return (pt.unfreezeBaseBonusLevel||0)>1; case 'boardCapacity1': return (pt.boardCapacityBonusLevel||0)>0; case 'boardCapacity2': return (pt.boardCapacityBonusLevel||0)>1; case 'finalInfusion': return (pt.tierInfusionLevel||0)>0; default: return false; } }
function canUnlockNode(node){ if(node.id==='finalInfusion' && !allNonFinalUnlocked()) return false; for(const p of node.prereqs){ if(!isNodeUnlocked(p)) return false; } return state.mojiPlus >= node.cost; }
function unlockNode(node){ if(!canUnlockNode(node)){ message('Requirements not met or not enough Moji+.'); return; } const result=node.unlock(); if(result===false){ return; } state.mojiPlus -= node.cost; message(`${node.title} unlocked.`); renderAll(); save(); }
function renderPrestigeTree(){ el.prestigeTree.innerHTML=''; const levels=[...new Set(treeNodes.map(n=>n.level))].sort((a,b)=>a-b); levels.forEach(lvl=>{ const row=document.createElement('div'); row.className='tree-level'; const nodes=treeNodes.filter(n=>n.level===lvl); nodes.forEach(n=>{ const node=document.createElement('div'); node.className='node'; const unlocked=isNodeUnlocked(n.id); const available=canUnlockNode(n) && !unlocked; node.classList.toggle('unlocked',unlocked); node.classList.toggle('locked',!unlocked); node.classList.toggle('available',available); node.innerHTML=`<div class="title">${n.title}${n.infinite?' (∞)':''}</div><div class="sub">${n.sub}</div><div class="cost">Cost: ${n.cost} Moji+</div>`; const actions=document.createElement('div'); actions.className='actions'; const btn=document.createElement('button'); btn.type='button'; btn.textContent=unlocked?'Unlocked':'Unlock'; btn.disabled = unlocked || !canUnlockNode(n); btn.addEventListener('click',()=>unlockNode(n),{once:false}); actions.appendChild(btn); node.appendChild(actions); row.appendChild(node); }); el.prestigeTree.appendChild(row); });
  el.mojiPlusCounter.textContent = String(state.mojiPlus);
  el.estPrestigeJi.textContent = fmtJi(estimatePrestigeJi());
  const showPP = (state.prestigeLevel>=50) || (state.mojiPlusPlus>0) || (state.mojiPPLevel>0);
  el.mojiPPpill.hidden = !(state.mojiPlusPlus>0 || state.mojiPPLevel>0);
  el.mojiPlusPlus.textContent = String(state.mojiPlusPlus);
  el.mojiPPSection.hidden = !showPP; el.mojiPPLevel.textContent = String(state.mojiPPLevel);
  el.autoSpawnUpgrade.hidden = !(state.prestigeLevel>=50);
  el.autoMergeUpgrade.hidden = !(state.prestigeLevel>=75);
  el.spawnSpeedUpgrade.hidden = !(state.prestigeLevel>=100);
  el.mergeSpeedUpgrade.hidden = !(state.prestigeLevel>=100);
}

function upgradeMojiPP(){ if (state.mojiPlusPlus <= 0){ message('No Moji++ available.'); return; } state.mojiPlusPlus -= 1; state.mojiPPLevel += 1; message(`Base Tier Boost increased to ${state.mojiPPLevel}.`); renderAll(); save(); }
function unlockAutoSpawn(){ if (state.prestigeLevel < 50){ message('Requires Prestige ≥50.'); return; } if (state.autoSpawnUnlocked){ message('Auto Spawn already unlocked.'); return; } if (state.mojiPlusPlus <= 0){ message('No Moji++ available.'); return; } state.mojiPlusPlus -= 1; state.autoSpawnUnlocked = true; message('Auto Spawn unlocked.'); ensureAutomationSchedulers(); renderAll(); save(); }
function unlockAutoMerge(){ if (state.prestigeLevel < 75){ message('Requires Prestige ≥75.'); return; } if (state.autoMergeUnlocked){ message('Auto Merge already unlocked.'); return; } if (state.mojiPlusPlus <= 0){ message('No Moji++ available.'); return; } state.mojiPlusPlus -= 1; state.autoMergeUnlocked = true; message('Auto Merge unlocked.'); ensureAutomationSchedulers(); renderAll(); save(); }
function upgradeSpawnSpeed(){ if (state.prestigeLevel < 100){ message('Requires Prestige ≥100.'); return; } if ((state.spawnSpeedLevel||0)>=5){ message('Auto Spawn Speed at maximum.'); return; } if (state.mojiPlusPlus <= 0){ message('No Moji++ available.'); return; } state.mojiPlusPlus -= 1; state.spawnSpeedLevel += 1; el.spawnSpeedLevel.textContent = `${state.spawnSpeedLevel}/5`; el.spawnIntervalLabel.textContent = `${spawnIntervalSeconds()}s`; message(`Auto Spawn interval reduced (now ${spawnIntervalSeconds()}s).`); ensureAutomationSchedulers(); renderAll(); save(); }
function upgradeMergeSpeed(){ if (state.prestigeLevel < 100){ message('Requires Prestige ≥100.'); return; } if ((state.mergeSpeedLevel||0)>=5){ message('Auto Merge Speed at maximum.'); return; } if (state.mojiPlusPlus <= 0){ message('No Moji++ available.'); return; } state.mojiPlusPlus -= 1; state.mergeSpeedLevel += 1; el.mergeSpeedLevel.textContent = `${state.mergeSpeedLevel}/5`; el.mergeIntervalLabel.textContent = `${mergeIntervalSeconds()}s`; message(`Auto Merge interval reduced (now ${mergeIntervalSeconds()}s).`); ensureAutomationSchedulers(); renderAll(); save(); }

function buyTier(tier){ const cap=maxTierCap(); if(tier>cap){ message(`Tier cap T${cap}. Prestige to raise it.`); return; } const price=tierPrice(tier); if(state.ji<price){ message('Not enough Ji.'); return; } const idx=firstEmptyUnlockedIndex(); if(idx===-1){ message('No empty unlocked tiles. Unlock more in Upgrades.'); return; } state.ji-=price; addJiSpentShop(price); state.board[idx]={ tier }; updateHighestTier(tier); state.tierPurchases[tier]= (state.tierPurchases[tier]||0)+1; addStatsPurchase(tier); message(`Bought T${tier}.`); renderAll(); save(); }

let selectedIndex=null;
function onTileClick(e){ const idx=Number(e.currentTarget.dataset.index); const unlocked=idx<state.unlockedCount; const cell=state.board[idx]; if(!unlocked){ message('Tile is locked. Unlock more tiles in Upgrades.'); return; } if(isFrozen(idx)){ message('Frozen emojis cannot be moved or merged.'); return; }
  const tiles = Array.from(document.querySelectorAll('.tile')); tiles.forEach(t=>t.classList.remove('selected'));
  if (selectedIndex == null){ if (cell != null){ selectedIndex = idx; e.currentTarget.classList.add('selected'); } }
  else { if (selectedIndex === idx){ selectedIndex = null; return; } if(isFrozen(selectedIndex)){ message('Frozen emojis cannot be moved or merged.'); selectedIndex=null; return; }
    const a = state.board[selectedIndex]; const b = state.board[idx]; const cap = maxTierCap(); if(a && b && a.tier === b.tier){ const nextTier = b.tier + 1; if (nextTier > cap){ message(`Tier cap T${cap}. Prestige to raise it.`); selectedIndex = null; renderBoard(); return; } state.board[idx] = { tier: nextTier }; updateHighestTier(nextTier); state.board[selectedIndex] = null; addStatsMerge(); message(`Merged to Tier ${nextTier}!`); }
    else { state.board[idx] = a; state.board[selectedIndex] = b; message('Moved.'); }
    selectedIndex = null; renderAll(); save(); }
}
function dragStart(e){ e.dataTransfer.setData('text/plain', e.currentTarget.dataset.index); }
function dragOver(e){ e.preventDefault(); }
function drop(e){ e.preventDefault(); const from=Number(e.dataTransfer.getData('text/plain')); const to=Number(e.currentTarget.dataset.index); if(from===to) return; if(to>=state.unlockedCount){ message('Target tile is locked.'); return; } if(isFrozen(from) || isFrozen(to)){ message('Frozen emojis cannot be moved or merged.'); return; } const a=state.board[from]; const b=state.board[to]; if(!a) return; const cap=maxTierCap(); if(a && b && a.tier===b.tier){ const nextTier=b.tier+1; if(nextTier>cap){ message(`Tier cap T${cap}. Prestige to raise it.`); return; } state.board[to]={ tier: nextTier }; updateHighestTier(nextTier); state.board[from]=null; addStatsMerge(); message(`Merged to Tier ${nextTier}!`); } else { state.board[to]=a; state.board[from]=b; message('Moved.'); } renderAll(); save(); }

// Double‑click thaw
function onTileDoubleClick(e) {
  try {
    e.preventDefault();
    e.stopPropagation();

    const idx = Number(e.currentTarget.dataset.index);
    if (!isFrozen(idx)) return;

    // Unfreeze + award Ji
    frozenSet.delete(idx);
    const reward = thawReward(idx);
    state.ji += reward;
    addStatsFrozen(reward);

    // Clean up selection state in case a first click selected something
    selectedIndex = null;

    message(`Thawed! +${fmtJi(reward)} Ji`);
    renderAll();
    save();
  } catch (err) {
    console.warn('dblclick handler error', err);
  }
}


function onTileAuxClick(e){ try{ if (e.button !== 1) return; const idx = Number(e.currentTarget.dataset.index); const unlocked = idx < state.unlockedCount; const cell = state.board[idx]; if (!unlocked || !cell) return; if (isFrozen(idx)){ message('Frozen emojis cannot be deleted.'); return; } if (confirm('Delete this emoji? This cannot be undone.')){ state.board[idx] = null; addDeleted(); renderAll(); save(); } } catch(err){ console.warn('auxclick handler error', err); }
}

function tick(){ const now=Date.now(); const dt=(now-state.lastTick)/1000; const gain=totalPpsSafe()*dt; state.ji+=gain; state.lastTick=now; addStatsPassive(gain); addRunTime(dt); el.ji.textContent=fmtJi(state.ji)+' Ji'; el.jips.textContent=fmtJi(totalPpsSafe()); el.prestigeLevel.textContent=String(state.prestigeLevel); updateShopButtonsState(); renderUpgrades(); renderPrestigeTree(); renderStats(); }

function reset(){ if(!confirm('Reset progress? This clears your board and Ji.')) return; if(streamsIntervalId){ clearInterval(streamsIntervalId); streamsIntervalId=null; } if(freezeIntervalId){ clearInterval(freezeIntervalId); freezeIntervalId=null; } if(autoSpawnIntervalId){ clearInterval(autoSpawnIntervalId); autoSpawnIntervalId=null; } if(autoMergeIntervalId){ clearInterval(autoMergeIntervalId); autoMergeIntervalId=null; } state.ji=STARTING_JI; state.board=Array(BOARD_ARRAY_SIZE).fill(null); state.unlockedCount=START_UNLOCKED; state.maxBuyTier=1; state.tierPurchases={}; state.bonusStreamsLevel=0; state.streamStackCapLevel=0; state.occupiedBiasLevel=0; state.unfreezeRewardLevel=0; stackCounts=Array(BOARD_ARRAY_SIZE).fill(0); frozenSet=new Set(); selectedIndex=null; save(); renderAll(); ensureSchedulers(true); }
function fullReset(){ if(!confirm('Full Reset WILL erase ALL progress including Prestige and Moji+/Moji++. Continue?')) return; if(!confirm('Are you sure? This cannot be undone.')) return; try{ const keys = ['emoji-merge-ji-save-v13','emoji-merge-ji-save-v12']; keys.forEach(k=>localStorage.removeItem(k)); }catch(e){ console.warn('Clear saves failed', e); }
  state = { ji: STARTING_JI, autosave:true, settings:{sciNotation:false, freezeEnabled:true, emojiSetKey:'classic'}, board:Array(BOARD_ARRAY_SIZE).fill(null), unlockedCount:START_UNLOCKED, maxBuyTier:1, tierPurchases:{}, bonusStreamsLevel:0, streamStackCapLevel:0, occupiedBiasLevel:0, unfreezeRewardLevel:0, prestigeLevel:0, mojiPlus:0, mojiPlusPlus:0, mojiPPLevel:0, autoSpawnUnlocked:false, autoMergeUnlocked:false, spawnSpeedLevel:0, mergeSpeedLevel:0, freezeTimerReduceLevel:0, prestigeTree:{ maxTierBonusUnlocked:false, maxTierBonus2Unlocked:false, maxTierBonus3Unlocked:false, freezingUnlocked:false, bonusStreamsUnlocked:false, streamStackCapUnlocked:false, occupiedBiasUnlocked:false, shopEfficiencyLevel:0, boardStartBonusLevel:0, passivePpsLevel:0, boardCapacityBonusLevel:0, unfreezeBaseBonusLevel:0, shopEfficiencyLevel2:0, shopEfficiencyLevel3:0, passivePpsLevel2:0, tierInfusionLevel:0 }, stats:{ current:{ prestigeLevel:0, purchasesPerTier:{}, merges:0, emojisFrozen:0, lifetimeJi:0, jiFrozen:0, jiPassive:0, tilesUnlocked:0, emojisDeleted:0, highestTier:0, jiSpentShop:0, jiSpentUpg:0, runTimeSec:0 }, allTime:{ purchasesPerTier:{}, merges:0, emojisFrozen:0, lifetimeJi:0, jiFrozen:0, jiPassive:0, tilesUnlocked:0, emojisDeleted:0, highestTier:0, jiSpentShop:0, jiSpentUpg:0, runTimeSec:0 } }, lastTick:Date.now() };
  stackCounts=Array(BOARD_ARRAY_SIZE).fill(0); frozenSet=new Set(); selectedIndex=null; save(); renderAll(); ensureSchedulers(true); message('Full Reset complete.'); }

function exportSave(){ try{ const data = JSON.stringify(state, null, 2); const blob = new Blob([data], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='emoji-merge-ji-save-v13.json'; a.click(); URL.revokeObjectURL(a.href); } catch(e){ message('Export failed.'); } }
function importSave(){ const file = el.importFile.files && el.importFile.files[0]; if(!file){ message('Choose a JSON file first.'); return; } const reader = new FileReader(); reader.onload = () => { try{ const data = JSON.parse(reader.result); state = { ...state, ...data }; normalizeState(); save(); renderAll(); ensureSchedulers(true); message('Import successful.'); }catch(e){ message('Invalid JSON.'); } }; reader.readAsText(file); }

function ensureSchedulers(force){ ensureStreamsScheduler(); ensureFreezeScheduler(force); ensureAutomationSchedulers(); }
function init(){ try{ load(); offlineProgress(); el.tabs.forEach(btn=>btn.addEventListener('click',()=>setActiveTab(btn.dataset.tab))); setActiveTab('game'); el.prestigeBtn && el.prestigeBtn.addEventListener('click', prestige, {once:false}); el.fullResetBtn && el.fullResetBtn.addEventListener('click', fullReset, {once:false}); if(el.sciToggle){ el.sciToggle.checked = !!state.settings.sciNotation; el.sciToggle.addEventListener('change', onSciToggle); } function onSciToggle(e){ state.settings.sciNotation = !!e.target.checked; renderAll(); save(); }
  if(el.freezeToggle){ el.freezeToggle.checked = !!state.settings.freezeEnabled; el.freezeToggle.addEventListener('change', onFreezeToggle); }
  function onFreezeToggle(e){ state.settings.freezeEnabled = !!e.target.checked; ensureFreezeScheduler(true); renderAll(); save(); }
  document.querySelectorAll('input[name="emojiSet"]').forEach(r=>{ r.checked = (r.value === state.settings.emojiSetKey); r.addEventListener('change', onEmojiSetChange); });
  function onEmojiSetChange(e){ state.settings.emojiSetKey = e.target.value; renderAll(); save(); }
  el.exportBtn && el.exportBtn.addEventListener('click', exportSave);
  el.importBtn && el.importBtn.addEventListener('click', importSave);
  el.mojiPPBtn && el.mojiPPBtn.addEventListener('click', upgradeMojiPP);
  el.autoSpawnBtn && el.autoSpawnBtn.addEventListener('click', unlockAutoSpawn);
  el.autoMergeBtn && el.autoMergeBtn.addEventListener('click', unlockAutoMerge);
  el.spawnSpeedBtn && el.spawnSpeedBtn.addEventListener('click', upgradeSpawnSpeed);
  el.mergeSpeedBtn && el.mergeSpeedBtn.addEventListener('click', upgradeMergeSpeed);
  renderAll(); ensureSchedulers(true); setInterval(tick, 250); message('Loaded v13.'); } catch(err){ console.error(err); message('Initialization error — please refresh.'); }
}

function setActiveTab(name){ el.tabs.forEach(btn=>{ const active=btn.dataset.tab===name; btn.classList.toggle('active',active); btn.setAttribute('aria-selected',active?'true':'false'); }); Object.entries(el.panels).forEach(([k,sec])=>{ sec.classList.toggle('active',k===name); }); }

function renderAll(){ el.ji.textContent=fmtJi(state.ji)+' Ji'; el.jips.textContent=fmtJi(totalPpsSafe()); el.prestigeLevel.textContent=String(state.prestigeLevel); renderBoard(); renderShop(); renderUpgrades(); renderStats(); renderPrestigeTree(); el.minTierLabel.textContent=String(minBuyTier()); el.maxTierLabel.textContent=String(Math.min(state.maxBuyTier, buyableTierCap())); el.tierCap.textContent=String(maxTierCap()); el.spawnIntervalLabel && (el.spawnIntervalLabel.textContent = `${spawnIntervalSeconds()}s`); el.mergeIntervalLabel && (el.mergeIntervalLabel.textContent = `${mergeIntervalSeconds()}s`);
  // Settings visibility toggles
  el.freezeSetting.hidden = !(state.prestigeTree && state.prestigeTree.freezingUnlocked);
  el.emojiSetSetting.hidden = !(state.prestigeLevel >= 100);
}

window.addEventListener('DOMContentLoaded', init);
