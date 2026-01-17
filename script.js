
// Moji Merge
const VERSION = "4.0";

// Inlined PrestigeIds to avoid ES modules
function applyTheme() {
    let theme = (state.settings && state.settings.theme) || 'system';
    if (theme === 'system') {
        // Use system preference
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        theme = mq.matches ? 'dark' : 'light';
    }
    document.body.classList.toggle('theme-dark', theme === 'dark');
    document.body.classList.toggle('theme-light', theme === 'light');
}
const PrestigeIds = {
    maxTierBonus1: 'maxTierBonus1',
    maxTierBonus2: 'maxTierBonus2',
    maxTierBonus3: 'maxTierBonus3',
    freezingUnlock: 'freezingUnlock',
    bonusStreamsUnlock: 'streamsUnlock',
    streamStackCapUnlock: 'streamStackCapUnlock',
    occupiedBiasUnlock: 'occupiedBiasUnlock',
    emojiCoreUnlock: 'emojiCoreUnlock',
    globalBoostUnlock: 'globalBoostUnlock',
    shopEfficiency1: 'shopEfficiency1',
    shopEfficiency2: 'shopEfficiency2',
    shopEfficiency3: 'shopEfficiency3',
    boardStart1: 'boardStart1',
    passivePps1: 'passivePps1',
    passivePps2: 'passivePps2',
    unfreezeBase1: 'unfreezeBase1',
    unfreezeBase2: 'unfreezeBase2',
    boardCapacity1: 'boardCapacity1',
    boardCapacity2: 'boardCapacity2',
    finalInfusion: 'finalInfusion',
};

// Implements requested enhancements: bonuses section, page/header rename, prestige button visibility, remove prestige gates from Streams nodes, click-to-thaw badge, Emoji Cores feature, and Global Ji/sec boost track.
const STARTING_JI = 200;
const TIER1_COST = 100;
const START_UNLOCKED = 4;
const UNLOCK_STEP = 1;
const BOARD_ARRAY_SIZE = 60;
// Emoji sets
const EMOJI_SETS = {
    classic: ['🙂', '😄', '😎', '🤩', '🤑', '👑', '🌟', '🚀', '🪙', '💎', '🏆', '🧠', '🎯', '🔥', '⚡', '✨', '☀️', '🌈', '🍀', '🦄'],
    animals: ['🐄', '🐑', '🐓', '🐖', '🐇', '🦊', '🐺', '🐗', '🦌', '🦍', '🦇', '🐟', '🐠', '🦈', '🐢', '🦎', '🐍', '🦅', '🐞'],
    food: ['🍎', '🍊', '🍇', '🍓', '🍉', '🍌', '🍍', '🥝', '🌽', '🥕', '🍔', '🍟', '🍕', '🌭', '🍣', '🍙', '🍜', '🍩', '🍪']
};
let state = {
    ji: STARTING_JI,
    autosave: true,
    settings: {
        sciNotation: false,
        freezeEnabled: true,
        emojiSetKey: 'classic',
        theme: 'dark'
    },
    board: Array(BOARD_ARRAY_SIZE).fill(null),
    unlockedCount: START_UNLOCKED,
    maxBuyTier: 1,
    tierPurchases: {},
    // Streams & misc
    bonusStreamsLevel: 0,
    streamStackCapLevel: 0,
    occupiedBiasLevel: 0,
    unfreezeRewardLevel: 0,
    // Progress
    prestigeLevel: 0,
    mojiPlus: 0,
    mojiPlusPlus: 0,
    mojiPPLevel: 0,
    cheatsUnlocked: false,
    autoSpawnUnlocked: false,
    autoMergeUnlocked: false,
    spawnSpeedLevel: 0,
    mergeSpeedLevel: 0,
    freezeTimerReduceLevel: 0,
    // NEW: Emoji Cores (per tier), not reset on prestige
    emojiCores: {}, // { tier: count (0..100) }
    globalBoostLevel: 0,
    prestigeTree: {
        maxTierBonusLevel: 0, // 0=locked, 1=I, 2=II, 3=III
        freezing: 0,
        bonusStreams: 0,
        streamStackCap: 0,
        occupiedBias: 0,
        emojiCore: 0,
        globalBoost: 0,
        shopEfficiencyLevel: 0,
        boardStartBonusLevel: 0,
        passivePpsLevel: 0, // 0=locked, 1=I, 2=II
        boardCapacityBonusLevel: 0,
        unfreezeBaseBonusLevel: 0,
        tierInfusionLevel: 0,
    },
    stats: {
        current: {
            purchasesPerTier: {},
            merges: 0,
            emojisFrozen: 0,
            lifetimeJi: 0,
            jiFrozen: 0,
            jiPassive: 0,
            tilesUnlocked: 0,
            emojisDeleted: 0,
            highestTier: 0,
            jiSpentShop: 0,
            jiSpentUpg: 0,
            runTimeSec: 0
        },
        allTime: {
            purchasesPerTier: {},
            merges: 0,
            emojisFrozen: 0,
            lifetimeJi: 0,
            jiFrozen: 0,
            jiPassive: 0,
            tilesUnlocked: 0,
            emojisDeleted: 0,
            highestTier: 0,
            jiSpentShop: 0,
            jiSpentUpg: 0,
            runTimeSec: 0
        },
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
    ji: document.getElementById('ji'),
    jips: document.getElementById('jips'),
    message: document.getElementById('message'),
    prestigeLevel: document.getElementById('prestigeLevel'),
    tabs: Array.from(document.querySelectorAll('.tab')),
    panels: {
        game: document.getElementById('tab-game'),
        stats: document.getElementById('tab-stats'),
        prestige: document.getElementById('tab-prestige'),
        settings: document.getElementById('tab-settings'),
        petmoji: document.getElementById('tab-petmoji')
    },
    board: document.getElementById('board'),
    shop: document.getElementById('shop'),
    minTierLabel: document.getElementById('minTierLabel'),
    maxTierLabel: document.getElementById('maxTierLabel'),
    tierCap: document.getElementById('tierCap'),
    upgradesList: document.getElementById('upgradesList'),
    prestigeBtn: document.getElementById('prestigeBtn'),
    prestigeTree: document.getElementById('prestigeTree'),
    prestigeReadyBanner: document.getElementById('prestigeReadyBanner'),
    fullResetBtn: document.getElementById('fullResetBtn'),
    sciToggle: document.getElementById('sciToggle'),
    freezeToggle: document.getElementById('freezeToggle'),
    freezeSetting: document.getElementById('freezeSetting'),
    emojiSetSetting: document.getElementById('emojiSetSetting'),
    exportBtn: document.getElementById('exportBtn'),
    importFile: document.getElementById('importFile'),
    importBtn: document.getElementById('importBtn'),
    mojiPlusCounter: document.getElementById('mojiPlusCounter'),
    mojiPPpill: document.getElementById('mojiPPpill'),
    mojiPlusPlus: document.getElementById('mojiPlusPlus'),
    estPrestigeJi: document.getElementById('estPrestigeJi'),
    mojiPPSection: document.getElementById('mojiPPSection'),
    mojiPPLevel: document.getElementById('mojiPPLevel'),
    mojiPPBtn: document.getElementById('mojiPPBtn'),
    autoSpawnUpgrade: document.getElementById('autoSpawnUpgrade'),
    autoSpawnBtn: document.getElementById('autoSpawnBtn'),
    autoSpawnStatus: document.getElementById('autoSpawnStatus'),
    spawnIntervalLabel: document.getElementById('spawnIntervalLabel'),
    autoMergeUpgrade: document.getElementById('autoMergeUpgrade'),
    autoMergeBtn: document.getElementById('autoMergeBtn'),
    autoMergeStatus: document.getElementById('autoMergeStatus'),
    mergeIntervalLabel: document.getElementById('mergeIntervalLabel'),
    spawnSpeedUpgrade: document.getElementById('spawnSpeedUpgrade'),
    spawnSpeedBtn: document.getElementById('spawnSpeedBtn'),
    spawnSpeedLevel: document.getElementById('spawnSpeedLevel'),
    mergeSpeedUpgrade: document.getElementById('mergeSpeedUpgrade'),
    mergeSpeedBtn: document.getElementById('mergeSpeedBtn'),
    mergeSpeedLevel: document.getElementById('mergeSpeedLevel'),
    freezeStatCur: document.getElementById('freezeStatCur'),
    freezeStatCur2: document.getElementById('freezeStatCur2'),
    freezeStatAll: document.getElementById('freezeStatAll'),
    freezeStatAll2: document.getElementById('freezeStatAll2'),
    freezeHowto: document.getElementById('freezeHowto'),
    freezeTimerLabel: document.getElementById('freezeTimerLabel'),
    // Stats bonuses
    bonusPrestige: document.getElementById('bonusPrestige'),
    bonusMojiPPRow: document.getElementById('bonusMojiPPRow'),
    bonusMojiPP: document.getElementById('bonusMojiPP'),
    bonusGlobalRow: document.getElementById('bonusGlobalRow'),
    bonusGlobal: document.getElementById('bonusGlobal'),
    coresSection: document.getElementById('coresSection'),
    coresGrid: document.getElementById('coresGrid'),
    // Stats elements
    s_curPrestige: document.getElementById('s_curPrestige'),
    s_curLifeJi: document.getElementById('s_curLifeJi'),
    s_curFrozenJi: document.getElementById('s_curFrozenJi'),
    s_curPassiveJi: document.getElementById('s_curPassiveJi'),
    s_curMerges: document.getElementById('s_curMerges'),
    s_curFrozen: document.getElementById('s_curFrozen'),
    s_curPurchases: document.getElementById('s_curPurchases'),
    s_curTilesUnlocked: document.getElementById('s_curTilesUnlocked'),
    s_curDeleted: document.getElementById('s_curDeleted'),
    s_curHighestTier: document.getElementById('s_curHighestTier'),
    s_curJiSpentShop: document.getElementById('s_curJiSpentShop'),
    s_curJiSpentUpg: document.getElementById('s_curJiSpentUpg'),
    s_curRunTime: document.getElementById('s_curRunTime'),
    s_allLifeJi: document.getElementById('s_allLifeJi'),
    s_allFrozenJi: document.getElementById('s_allFrozenJi'),
    s_allPassiveJi: document.getElementById('s_allPassiveJi'),
    s_allMerges: document.getElementById('s_allMerges'),
    s_allFrozen: document.getElementById('s_allFrozen'),
    s_allPurchases: document.getElementById('s_allPurchases'),
    s_allTilesUnlocked: document.getElementById('s_allTilesUnlocked'),
    s_allDeleted: document.getElementById('s_allDeleted'),
    s_allHighestTier: document.getElementById('s_allHighestTier'),
    s_allJiSpentShop: document.getElementById('s_allJiSpentShop'),
    s_allJiSpentUpg: document.getElementById('s_allJiSpentUpg'),
    s_allRunTime: document.getElementById('s_allRunTime'),
};
function message(msg) {
    el.message.textContent = msg;
    if (msg) {
        setTimeout(() => {
            if (el.message.textContent === msg)
                el.message.textContent = '';
        }, 3000);
    }
}
function fmtSci(n) {
    if (!isFinite(n) || isNaN(n))
        return '—';
    if (n === 0)
        return '0';
    const e = Math.floor(Math.log10(Math.abs(n)));
    const m = n / Math.pow(10, e);
    return m.toFixed(3) + 'e' + (e >= 0 ? '+' : '') + e;
}
function fmtJi(n) {
    if (!isFinite(n) || isNaN(n))
        return '—';
    if (state.settings.sciNotation)
        return fmtSci(n);
    if (n < 1000)
        return n.toFixed(0);
    const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    let u = 0,
    v = n;
    while (v >= 1000 && u < units.length - 1) {
        v /= 1000;
        u++;
    }
    return v.toFixed(2) + units[u];
}
function getEmojiForTier(t) {
    const set = EMOJI_SETS[state.settings.emojiSetKey] || EMOJI_SETS.classic;
    return set[(t - 1) % set.length];
}
function getPPS(tier) {
    if (tier <= 1)
        return 1;
    let p = 1;
    for (let i = 2; i <= tier; i++)
        p = p * 2 + i;
    return p;
}
function tileMultiplier(idx) {
    const stacks = stackCounts[idx] || 0;
    return Math.pow(2, stacks);
}
function isFrozen(idx) {
    return frozenSet.has(idx);
}
// Pricing & caps
function tierBasePrice(t) {
    return TIER1_COST * Math.pow(2.5, t - 1);
}
function tierPurchaseCount(t) {
    const c = state.tierPurchases[t];
    return (typeof c === 'number' && isFinite(c)) ? c : 0;
}
function shopEfficiencyFactor() {
    const pt = state.prestigeTree || {};
    const l = (pt.shopEfficiencyLevel || 0) + (pt.shopEfficiencyLevel2 || 0) + (pt.shopEfficiencyLevel3 || 0);
    const f = 1 - 0.01 * l;
    return Math.max(0.85, f);
}
function tierPrice(t) {
    const base = tierBasePrice(t);
    const infl = Math.pow(1.04, tierPurchaseCount(t));
    const eff = shopEfficiencyFactor();
    return Math.round(base * infl * eff);
}
function maxTierCap() {
    return 10 + (state.prestigeLevel || 0) * 2;
}
function buyableTierCap() {
    return Math.max(1, maxTierCap() - 2);
}
function minBuyTier() {
    return Math.min(maxTierCap(), 1 + (state.mojiPPLevel || 0));
}
function boardMaxCapacity() {
    const pt = state.prestigeTree || {};
    return 10 + (state.prestigeLevel || 0) * 2 + (((pt.boardCapacityBonusLevel || 0) * 2));
}
// PPS & bonuses
function prestigeBonusFactor() {
    return 1 + 0.01 * (state.prestigeLevel || 0);
}
function mojiPPFactor() {
    return 1 + 0.015 * (((state.mojiPlusPlus || 0) + (state.mojiPPLevel || 0)));
}
function globalBoostFactor() {
    return 1 + 0.01 * (state.globalBoostLevel || 0);
}
function coreTierFactor(tier) {
    const c = (state.emojiCores && state.emojiCores[tier]) || 0;
    return 1 + 0.01 * c;
}
function tierInfusionBonusForTile(idx) {
    const cell = state.board[idx];
    if (!cell)
        return 0;
    const pt = state.prestigeTree || {};
    return (pt.tierInfusionLevel || 0) * cell.tier;
}
function totalPPS() {
    let sum = 0;
    const capCount = Math.min(state.unlockedCount, boardMaxCapacity());
    for (let i = 0; i < capCount; i++) {
        const cell = state.board[i];
        if (cell && !isFrozen(i))
            sum += (getPPS(cell.tier) * tileMultiplier(i) * coreTierFactor(cell.tier) + tierInfusionBonusForTile(i));
    }
    return sum * prestigeBonusFactor() * mojiPPFactor() * globalBoostFactor() * (typeof petmojiFactor === "function" ? petmojiFactor() : 1);
}
function totalPpsSafe() {
    const val = totalPPS();
    return isFinite(val) && !isNaN(val) ? val : 0;
}
// Save/Load
function normalizeState() {
    state.tierPurchases = state.tierPurchases && typeof state.tierPurchases === 'object' ? state.tierPurchases : {};
    state.prestigeLevel = Number(state.prestigeLevel) || 0;
    state.mojiPlus = Number(state.mojiPlus) || 0;
    state.mojiPlusPlus = Number(state.mojiPlusPlus) || 0;
    state.mojiPPLevel = Number(state.mojiPPLevel) || 0;
    state.settings = state.settings && typeof state.settings === 'object' ? state.settings : {
        sciNotation: false,
        freezeEnabled: true,
        emojiSetKey: 'classic',
        theme: 'dark'
    };
    state.settings.freezeEnabled = state.settings.freezeEnabled !== false;
    state.settings.emojiSetKey = state.settings.emojiSetKey || 'classic';
    // Accept 'system', 'light', or 'dark'. Default to 'system'.
    if (state.settings.theme !== 'light' && state.settings.theme !== 'dark' && state.settings.theme !== 'system') {
        state.settings.theme = 'system';
    }
    state.prestigeTree = state.prestigeTree && typeof state.prestigeTree === 'object' ? state.prestigeTree : {};
    state.emojiCores = state.emojiCores && typeof state.emojiCores === 'object' ? state.emojiCores : {};
}
const SAVE_KEY = 'moji-merge-save';
const OLD_SAVE_KEY = 'moji-merge-save-v14';
function save() {
    if (!state.autosave)
        return;
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Save failed', e);
    }
}
function load() {
    try {
        let raw = localStorage.getItem(SAVE_KEY);
        if (!raw) {
            // Try old save key if new one is not found
            raw = localStorage.getItem(OLD_SAVE_KEY);
        }
        if (raw) {
            const data = JSON.parse(raw);
            if (data && Array.isArray(data.board))
                state = {
                    ...state,
                    ...data
                };
        }
    } catch (e) {
        console.warn('Load failed', e);
    } finally {
        normalizeState();
    }
}
function offlineProgress() {
    const now = Date.now();
    const elapsed = Math.max(0, Math.floor((now - state.lastTick) / 1000));
    if (elapsed > 0) {
        const gain = totalPpsSafe() * elapsed;
        state.ji += gain;
        state.lastTick = now;
        addStatsPassive(gain);
        addRunTime(elapsed);
        if (gain > 0)
            message(`Welcome back! Earned +${fmtJi(gain)} Ji while away.`);
    }
}
// Board helpers
function firstEmptyUnlockedIndex() {
    const capCount = Math.min(state.unlockedCount, boardMaxCapacity());
    for (let i = 0; i < capCount; i++)
        if (state.board[i] == null)
            return i;
    return -1;
}
function occupiedUnlockedIndices() {
    const capCount = Math.min(state.unlockedCount, boardMaxCapacity());
    const arr = [];
    for (let i = 0; i < capCount; i++)
        if (state.board[i] != null)
            arr.push(i);
    return arr;
}
function hasMaxTierEmoji() {
    const cap = maxTierCap();
    const capCount = Math.min(state.unlockedCount, boardMaxCapacity());
    for (let i = 0; i < capCount; i++) {
        const c = state.board[i];
        if (c && c.tier === cap)
            return true;
    }
    return false;
}
// Stats helpers
function addRunTime(sec) {
    state.stats.current.runTimeSec += sec;
    state.stats.allTime.runTimeSec += sec;
}
function addTilesUnlocked(n) {
    state.stats.current.tilesUnlocked += n;
    state.stats.allTime.tilesUnlocked += n;
}
function addDeleted() {
    state.stats.current.emojisDeleted += 1;
    state.stats.allTime.emojisDeleted += 1;
}
function addJiSpentShop(x) {
    state.stats.current.jiSpentShop += x;
    state.stats.allTime.jiSpentShop += x;
}
function addJiSpentUpg(x) {
    state.stats.current.jiSpentUpg += x;
    state.stats.allTime.jiSpentUpg += x;
}
function updateHighestTier(t) {
    state.stats.current.highestTier = Math.max(state.stats.current.highestTier || 0, t);
    state.stats.allTime.highestTier = Math.max(state.stats.allTime.highestTier || 0, t);
}
function incMap(map, key, by) {
    map[key] = (map[key] || 0) + by;
}
function addStatsPurchase(tier) {
    incMap(state.stats.current.purchasesPerTier, tier, 1);
    incMap(state.stats.allTime.purchasesPerTier, tier, 1);
}
function addStatsMerge() {
    state.stats.current.merges += 1;
    state.stats.allTime.merges += 1;
}
function addStatsPassive(amount) {
    state.stats.current.lifetimeJi += amount;
    state.stats.current.jiPassive += amount;
    state.stats.allTime.lifetimeJi += amount;
    state.stats.allTime.jiPassive += amount;
}
function addStatsFrozen(amount) {
    state.stats.current.lifetimeJi += amount;
    state.stats.current.jiFrozen += amount;
    state.stats.allTime.lifetimeJi += amount;
    state.stats.allTime.jiFrozen += amount;
}
// Rendering
window.renderPetmojiHUD = function () {
    try {
        if (typeof ensurePM === 'function')
            ensurePM();
        const hud = document.getElementById('pm_hud');
        if (!hud)
            return;
        const showHUD = !!(state.petmoji && state.petmoji.settings && state.petmoji.settings.showOnHUD !== false);
        const a = (typeof active === 'function') ? active() : null;
        hud.style.display = showHUD ? '' : 'none';
        if (!showHUD)
            return;
        if (a) {
            hud.textContent = a.def.emoji;
            hud.title = a.def.name + ' (' + a.def.tier + ')';
        } else {
            hud.textContent = '—';
            hud.title = 'Active Pet';
        }
    } catch (e) {}
};
function renderBoard() {
    el.board.innerHTML = '';
    const gridCount = boardMaxCapacity();
    state.unlockedCount = Math.min(state.unlockedCount, gridCount);
    for (let i = 0; i < gridCount; i++) {
        const cell = state.board[i];
        const unlocked = i < state.unlockedCount;
        const d = document.createElement('div');
        d.className = 'tile' + (unlocked ? '' : ' locked') + ((cell && unlocked) ? '' : ' empty') + (isFrozen(i) ? ' frozen' : '');
        d.setAttribute('role', 'button');
        d.dataset.index = String(i);
        const stacks = stackCounts[i] || 0;
        const ratio = Math.min(1, stacks / 6);
        const hue = Math.round(120 * ratio);
        d.style.boxShadow = stacks > 0 ? `0 0 0 3px hsl(${hue} 80% 50% / 0.9)` : '';
        if (cell && unlocked) {
            const em = document.createElement('div');
            em.className = 'emoji';
            em.textContent = getEmojiForTier(cell.tier);
            const tier = document.createElement('div');
            tier.className = 'tier-label';
            const isMax = cell.tier === maxTierCap();
            tier.textContent = isMax ? `T${cell.tier} • Max` : `T${cell.tier}`;
            if (isMax)
                tier.classList.add('max');
            const pps = document.createElement('div');
            pps.className = 'pps-label';
            const eff = isFrozen(i) ? 0 : Math.round((getPPS(cell.tier) * tileMultiplier(i) * coreTierFactor(cell.tier) + tierInfusionBonusForTile(i)) * prestigeBonusFactor() * mojiPPFactor() * globalBoostFactor());
            pps.textContent = `${fmtJi(eff)} /s`;
            const sb = document.createElement('div');
            sb.className = 'stack-badge';
            sb.textContent = stacks > 0 ? `×${Math.pow(2, stacks)} (${stacks})` : '';
            d.appendChild(em);
            d.appendChild(tier);
            d.appendChild(pps);
            d.appendChild(sb);
            // Freeze badge (click to thaw)
            if (isFrozen(i)) {
                const fb = document.createElement('div');
                fb.className = 'freeze-badge';
                fb.textContent = '❄️';
                fb.title = 'Click to thaw';
                fb.addEventListener('click', () => thawFrozenAt(i));
                d.appendChild(fb);
            }
            d.draggable = true;
            d.addEventListener('dragstart', dragStart);
            d.addEventListener('dragover', dragOver);
            d.addEventListener('drop', drop);
            d.addEventListener('auxclick', onTileAuxClick);
            d.addEventListener('dblclick', onTileDoubleClick);
        }
        d.addEventListener('click', onTileClick);
        el.board.appendChild(d);
    }
    el.prestigeReadyBanner.hidden = !canPrestige();
}
function renderShop() {
    el.shop.innerHTML = '';
    const cap = maxTierCap();
    const buyCap = buyableTierCap();
    const minTier = minBuyTier();
    const maxListTier = Math.min(state.maxBuyTier, buyCap);
    el.tierCap.textContent = String(cap);
    el.minTierLabel.textContent = String(minTier);
    for (let t = maxListTier; t >= minTier; t--) {
        const btn = document.createElement('button');
        btn.className = 'shop-btn';
        btn.type = 'button';
        btn.dataset.tier = String(t);
		const em = document.createElement('div');
		em.className = 'emoji';
		em.textContent = getEmojiForTier(t);
        const price = tierPrice(t);
        btn.innerHTML = `<span class="label">Buy T${t}</span><span class="price">${fmtJi(price)} Ji</span>`;
		btn.prepend(em)
        btn.disabled = !shopCanBuy(t);
        btn.addEventListener('click', () => buyTier(t));
        el.shop.appendChild(btn);
    }
    el.maxTierLabel.textContent = String(maxListTier);
}
function shopCanBuy(t) {
    return state.ji >= tierPrice(t) && firstEmptyUnlockedIndex() !== -1;
}
function updateShopButtonsState() {
    const buttons = Array.from(document.querySelectorAll('.shop-btn'));
    buttons.forEach(b => {
        const t = Number(b.dataset.tier);
        b.disabled = !shopCanBuy(t);
    });
}
// Upgrades
function boardUnlockLevel() {
    return Math.max(0, state.unlockedCount - START_UNLOCKED);
}
function nextUnlockCost() {
    const level = boardUnlockLevel();
    return Math.round(500 * Math.pow(3, level));
}
function canUnlockMore() {
    return state.unlockedCount < boardMaxCapacity();
}
const SHOP_UPGRADE_BASE_COST = 1000;
function shopUpgradeLevel() {
    return Math.max(0, state.maxBuyTier - 1);
}
function nextShopTierCost() {
    return Math.round(SHOP_UPGRADE_BASE_COST * Math.pow(2.02, shopUpgradeLevel()));
}
function nextBonusStreamsCost() {
    const lvl = state.bonusStreamsLevel || 0;
    return Math.round(2000 * Math.pow(2, lvl));
}
function nextStreamStackCapCost() {
    const lvl = state.streamStackCapLevel || 0;
    return Math.round(1500 * Math.pow(2, lvl));
}
function nextOccupiedBiasCost() {
    const lvl = state.occupiedBiasLevel || 0;
    return Math.round(1200 * Math.pow(1.5, lvl));
}
function nextUnfreezeRewardCost() {
    const lvl = state.unfreezeRewardLevel || 0;
    return Math.round(1400 * Math.pow(1.8, lvl));
}
function nextFreezeReduceCost() {
    const lvl = state.freezeTimerReduceLevel || 0;
    return Math.round(1500 * Math.pow(1.6, lvl));
}
function globalBoostMaxLevels() {
    return 2 * maxTierCap();
}
function nextGlobalBoostCost() {
    const lvl = state.globalBoostLevel || 0;
    return Math.round(1600 * Math.pow(1.4, lvl));
}
function renderUpgrades() {
    const items = [];
    const boardMaxed = !canUnlockMore();
    items.push({
        key: 'board',
        title: 'Board',
        desc: 'Unlock +1 tile',
        sub: `Capacity ${state.unlockedCount}/${boardMaxCapacity()}`,
        maxTag: boardMaxed,
        btn: {
            id: 'unlockBoardBtn',
            label: `Unlock (${fmtJi(nextUnlockCost())} Ji)`,
            disabled: (boardMaxed || state.ji < nextUnlockCost())
        }
    });
    const buyCap = buyableTierCap();
    const shopMaxed = state.maxBuyTier >= buyCap;
    items.push({
        key: 'shop',
        title: 'Shop',
        desc: 'Increase max tier to buy +1 (limit T' + buyCap + ')',
        sub: `Current max T${state.maxBuyTier}`,
        maxTag: shopMaxed,
        btn: {
            id: 'upgradeShopTierBtn',
            label: `Upgrade (${fmtJi(nextShopTierCost())} Ji)`,
            disabled: (state.ji < nextShopTierCost() || shopMaxed)
        }
    });
    if ((state.prestigeTree.freezing || 0) >= 1) {
        items.push({
            key: 'unfreeze',
            title: 'Unfreeze Reward',
            desc: 'Increase thaw reward multiplier',
            sub: `Level ${state.unfreezeRewardLevel} • Multiplier ×${(2 * (1 + (state.unfreezeRewardLevel || 0) + (state.prestigeTree.unfreezeBaseBonusLevel || 0))).toFixed(0)}`,
            maxTag: false,
            btn: {
                id: 'upgradeUnfreezeRewardBtn',
                label: `Upgrade (${fmtJi(nextUnfreezeRewardCost())} Ji)`,
                disabled: (state.ji < nextUnfreezeRewardCost())
            }
        });
    }
    if ((state.prestigeTree.bonusStreams || 0) >= 1) {
        const streamsMaxed = state.bonusStreamsLevel >= boardMaxCapacity();
        items.push({
            key: 'streams',
            title: 'Bonus Streams',
            desc: 'Add concurrent bonus multipliers (reassign every 5s)',
            sub: `Level ${state.bonusStreamsLevel}/${boardMaxCapacity()}`,
            maxTag: streamsMaxed,
            btn: {
                id: 'upgradeBonusStreamsBtn',
                label: `Upgrade (${fmtJi(nextBonusStreamsCost())} Ji)`,
                disabled: (state.ji < nextBonusStreamsCost() || streamsMaxed)
            }
        });
    }
    if ((state.prestigeTree.streamStackCap || 0) >= 1) {
        const stackCapMaxed = state.streamStackCapLevel >= 5;
        items.push({
            key: 'streamstack',
            title: 'Stream Stack Cap',
            desc: 'Increase max stacks for Streams',
            sub: `Level ${state.streamStackCapLevel}/5 • Current cap ${1 + (state.streamStackCapLevel || 0)}`,
            maxTag: stackCapMaxed,
            btn: {
                id: 'upgradeStreamStackCapBtn',
                label: `Upgrade (${fmtJi(nextStreamStackCapCost())} Ji)`,
                disabled: (state.ji < nextStreamStackCapCost() || stackCapMaxed)
            }
        });
    }
    if ((state.prestigeTree.occupiedBias || 0) >= 1) {
        const biasMaxed = state.occupiedBiasLevel >= 50;
        items.push({
            key: 'bias',
            title: 'Occupied Bias',
            desc: 'Increase chance to target tiles with emojis',
            sub: `Level ${state.occupiedBiasLevel}/50 • Chance ${Math.round(Math.min(1, 0.02 * (state.occupiedBiasLevel || 0)) * 100)}%`,
            maxTag: biasMaxed,
            btn: {
                id: 'upgradeOccupiedBiasBtn',
                label: `Upgrade (${fmtJi(nextOccupiedBiasCost())} Ji)`,
                disabled: (state.ji < nextOccupiedBiasCost() || biasMaxed)
            }
        });
    }
    if ((state.prestigeTree.freezing || 0) >= 1 && state.prestigeTree.unfreezeBaseBonusLevel >= 2) {
        const reduceMaxed = state.freezeTimerReduceLevel >= 15;
        items.push({
            key: 'freezeReduce',
            title: 'Freeze Timer Reducer',
            desc: 'Reduce freeze timer by 1s per tier',
            sub: `Level ${state.freezeTimerReduceLevel}/15 • Current interval ${Math.max(5, 30 - (state.freezeTimerReduceLevel || 0))}s`,
            maxTag: reduceMaxed,
            btn: {
                id: 'upgradeFreezeReduceBtn',
                label: `Upgrade (${fmtJi(nextFreezeReduceCost())} Ji)`,
                disabled: (state.ji < nextFreezeReduceCost() || reduceMaxed)
            }
        });
    }
    if ((state.prestigeTree.globalBoost || 0) >= 1) {
        const maxLv = globalBoostMaxLevels();
        const lv = state.globalBoostLevel || 0;
        const boostMaxed = lv >= maxLv;
        items.push({
            key: 'globalBoost',
            title: 'Global Ji/sec Boost',
            desc: '+1% Ji/sec per level',
            sub: `Level ${lv}/${maxLv} • Bonus +${lv}%`,
            maxTag: boostMaxed,
            btn: {
                id: 'upgradeGlobalBoostBtn',
                label: `Upgrade (${fmtJi(nextGlobalBoostCost())} Ji)`,
                disabled: (state.ji < nextGlobalBoostCost() || boostMaxed)
            }
        });
    }
    el.upgradesList.innerHTML = '';
    items.forEach(it => {
        const box = document.createElement('div');
        box.className = 'upgrade';
        const left = document.createElement('div');
        const t = document.createElement('div');
        t.className = 'title';
        t.textContent = it.title;
        const d = document.createElement('div');
        d.className = 'desc';
        d.textContent = it.desc;
        const s = document.createElement('div');
        s.className = 'sub';
        s.textContent = it.sub;
        left.appendChild(t);
        left.appendChild(d);
        left.appendChild(s);
        if (it.maxTag) {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = 'Max';
            left.appendChild(tag);
        }
        box.appendChild(left);
        if (!it.maxTag) {
            const btn = document.createElement('button');
            btn.id = it.btn.id;
            btn.type = 'button';
            btn.textContent = it.btn.label;
            btn.disabled = it.btn.disabled;
            box.appendChild(btn);
        }
        el.upgradesList.appendChild(box);
    });
    const btns = {
        unlockBoardBtn: upgradeUnlockBoard,
        upgradeShopTierBtn: upgradeShopTier,
        upgradeUnfreezeRewardBtn: upgradeUnfreezeReward,
        upgradeBonusStreamsBtn: upgradeBonusStreams,
        upgradeStreamStackCapBtn: upgradeStreamStackCap,
        upgradeOccupiedBiasBtn: upgradeOccupiedBias,
        upgradeFreezeReduceBtn: upgradeFreezeReduce,
        upgradeGlobalBoostBtn: upgradeGlobalBoost
    };
    Object.entries(btns).forEach(([id, fn]) => {
        const b = document.getElementById(id);
        if (b) {
            b.addEventListener('click', fn);
            b.addEventListener('mousedown', e => e.stopPropagation());
        }
    });
}
function upgradeUnlockBoard() {
    const cost = nextUnlockCost();
    if (!canUnlockMore()) {
        message('Capacity reached.');
        return;
    }
    if (state.ji < cost) {
        message('Not enough Ji for board unlock.');
        return;
    }
    state.ji -= cost;
    addJiSpentUpg(cost);
    state.unlockedCount = Math.min(boardMaxCapacity(), state.unlockedCount + UNLOCK_STEP);
    addTilesUnlocked(1);
    message('Unlocked +1 tile!');
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
function upgradeShopTier() {
    const buyCap = buyableTierCap();
    if (state.maxBuyTier >= buyCap) {
        message(`Shop buy limit reached (T${buyCap}).`);
        return;
    }
    const cost = nextShopTierCost();
    if (state.ji < cost) {
        message('Not enough Ji to upgrade shop tier.');
        return;
    }
    state.ji -= cost;
    addJiSpentUpg(cost);
    state.maxBuyTier += 1;
    message(`Shop upgraded! You can now buy up to T${state.maxBuyTier} (limit T${buyCap}).`);
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
function upgradeBonusStreams() {
    if (!state.prestigeTree.bonusStreams) {
        message('Unlock Bonus Streams in the Prestige Tree first.');
        return;
    }
    const max = boardMaxCapacity();
    if ((state.bonusStreamsLevel || 0) >= max) {
        message('Bonus Streams at maximum.');
        return;
    }
    const cost = nextBonusStreamsCost();
    if (state.ji < cost) {
        message('Not enough Ji to upgrade Bonus Streams.');
        return;
    }
    state.ji -= cost;
    addJiSpentUpg(cost);
    state.bonusStreamsLevel = (state.bonusStreamsLevel || 0) + 1;
    message(`Bonus Streams +1 (now ${state.bonusStreamsLevel}).`);
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
function upgradeStreamStackCap() {
    if (!state.prestigeTree.streamStackCap) {
        message('Unlock Stream Stack Cap in the Prestige Tree first.');
        return;
    }
    if ((state.streamStackCapLevel || 0) >= 5) {
        message('Stream Stack Cap at maximum.');
        return;
    }
    const cost = nextStreamStackCapCost();
    if (state.ji < cost) {
        message('Not enough Ji to upgrade Stream Stack Cap.');
        return;
    }
    state.ji -= cost;
    addJiSpentUpg(cost);
    state.streamStackCapLevel = (state.streamStackCapLevel || 0) + 1;
    message(`Stream Stack Cap increased (now ${1 + (state.streamStackCapLevel || 0)}).`);
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
function upgradeOccupiedBias() {
    if (!state.prestigeTree.occupiedBias) {
        message('Unlock Occupied Bias in the Prestige Tree first.');
        return;
    }
    if ((state.occupiedBiasLevel || 0) >= 50) {
        message('Occupied Bias at maximum.');
        return;
    }
    const cost = nextOccupiedBiasCost();
    if (state.ji < cost) {
        message('Not enough Ji to upgrade Occupied Bias.');
        return;
    }
    state.ji -= cost;
    addJiSpentUpg(cost);
    state.occupiedBiasLevel = (state.occupiedBiasLevel || 0) + 1;
    message(`Occupied Bias increased (now ${Math.round(Math.min(1, 0.02 * (state.occupiedBiasLevel || 0)) * 100)}%).`);
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
function upgradeUnfreezeReward() {
    if (!state.prestigeTree.freezing) {
        message('Unlock Freezing in the Prestige Tree first.');
        return;
    }
    const cost = nextUnfreezeRewardCost();
    if (state.ji < cost) {
        message('Not enough Ji to upgrade Unfreeze Reward.');
        return;
    }
    state.ji -= cost;
    addJiSpentUpg(cost);
    state.unfreezeRewardLevel = (state.unfreezeRewardLevel || 0) + 1;
    message(`Unfreeze Reward increased (×${(2 * (1 + (state.unfreezeRewardLevel || 0) + (state.prestigeTree.unfreezeBaseBonusLevel || 0))).toFixed(0)}).`);
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
function upgradeFreezeReduce() {
    if (!state.prestigeTree.freezing || state.prestigeTree.unfreezeBaseBonusLevel < 2) {
        message('Requires Unfreeze Base II.');
        return;
    }
    if ((state.freezeTimerReduceLevel || 0) >= 15) {
        message('Freeze Timer Reducer at maximum.');
        return;
    }
    const cost = nextFreezeReduceCost();
    if (state.ji < cost) {
        message('Not enough Ji to upgrade Freeze Timer Reducer.');
        return;
    }
    state.ji -= cost;
    addJiSpentUpg(cost);
    state.freezeTimerReduceLevel = (state.freezeTimerReduceLevel || 0) + 1;
    message(`Freeze interval reduced (now ${Math.max(5, 30 - (state.freezeTimerReduceLevel || 0))}s).`);
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
    ensureFreezeScheduler(true);
}
function upgradeGlobalBoost() {
    if (!state.prestigeTree.globalBoost > 0) {
        message('Unlock Global Ji/sec Boost in the Prestige Tree first.');
        return;
    }
    const maxLv = globalBoostMaxLevels();
    const lv = state.globalBoostLevel || 0;
    if (lv >= maxLv) {
        message('Global Ji/sec Boost at maximum.');
        return;
    }
    const cost = nextGlobalBoostCost();
    if (state.ji < cost) {
        message('Not enough Ji to upgrade Global Ji/sec Boost.');
        return;
    }
    state.ji -= cost;
    addJiSpentUpg(cost);
    state.globalBoostLevel = lv + 1;
    message(`Global Ji/sec Boost increased (+${state.globalBoostLevel}%).`);
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
// Core actions & thaw
function buyTier(tier) {
    const cap = maxTierCap();
    if (tier > cap) {
        message(`Tier cap T${cap}. Prestige to raise it.`);
        return;
    }
    const price = tierPrice(tier);
    if (state.ji < price) {
        message('Not enough Ji.');
        return;
    }
    const idx = firstEmptyUnlockedIndex();
    if (idx === -1) {
        message('No empty unlocked tiles. Unlock more in Upgrades.');
        return;
    }
    state.ji -= price;
    addJiSpentShop(price);
    state.board[idx] = {
        tier
    };
    updateHighestTier(tier);
    state.tierPurchases[tier] = (state.tierPurchases[tier] || 0) + 1;
    addStatsPurchase(tier);
    message(`Bought T${tier}.`);
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
let selectedIndex = null;
function onTileClick(e) {
    const idx = Number(e.currentTarget.dataset.index);
    const unlocked = idx < state.unlockedCount;
    const cell = state.board[idx];
    if (!unlocked) {
        message('Tile is locked. Unlock more tiles in Upgrades.');
        return;
    }
    if (isFrozen(idx)) {
        message('Frozen emojis cannot be moved or merged.');
        return;
    }
    const tiles = Array.from(document.querySelectorAll('.tile'));
    tiles.forEach(t => t.classList.remove('selected'));
    if (selectedIndex == null) {
        if (cell != null) {
            selectedIndex = idx;
            e.currentTarget.classList.add('selected');
        }
    } else {
        if (selectedIndex === idx) {
            selectedIndex = null;
            return;
        }
        if (isFrozen(selectedIndex)) {
            message('Frozen emojis cannot be moved or merged.');
            selectedIndex = null;
            return;
        }
        const a = state.board[selectedIndex];
        const b = state.board[idx];
        const cap = maxTierCap();
        if (a && b && a.tier === b.tier) {
            const mergedTier = b.tier;
            const nextTier = b.tier + 1;
            if (nextTier > cap) {
                message(`Tier cap T${cap}. Prestige to raise it.`);
                selectedIndex = null;
                renderBoard();
                return;
            }
            state.board[idx] = {
                tier: nextTier
            };
            updateHighestTier(nextTier);
            state.board[selectedIndex] = null;
            addStatsMerge();
            maybeGrantEmojiCore(mergedTier);
            tryPetmojiShardOnMerge && tryPetmojiShardOnMerge();
            tryPetmojiShardOnMerge();
            message(`Merged to Tier ${nextTier}!`);
        } else {
            state.board[idx] = a;
            state.board[selectedIndex] = b;
            message('Moved.');
        }
        selectedIndex = null;
        renderAll();
        if (typeof syncCheatsUI === "function")
            syncCheatsUI();
        save();
    }
}
function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.currentTarget.dataset.index);
}
function dragOver(e) {
    e.preventDefault();
}
function drop(e) {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData('text/plain'));
    const to = Number(e.currentTarget.dataset.index);
    if (from === to)
        return;
    if (to >= state.unlockedCount) {
        message('Target tile is locked.');
        return;
    }
    if (isFrozen(from) || isFrozen(to)) {
        message('Frozen emojis cannot be moved or merged.');
        return;
    }
    const a = state.board[from];
    const b = state.board[to];
    if (!a)
        return;
    const cap = maxTierCap();
    if (a && b && a.tier === b.tier) {
        const mergedTier = b.tier;
        const nextTier = b.tier + 1;
        if (nextTier > cap) {
            message(`Tier cap T${cap}. Prestige to raise it.`);
            return;
        }
        state.board[to] = {
            tier: nextTier
        };
        updateHighestTier(nextTier);
        state.board[from] = null;
        addStatsMerge();
        maybeGrantEmojiCore(mergedTier);
        tryPetmojiShardOnMerge && tryPetmojiShardOnMerge();
        message(`Merged to T${nextTier}!`);
    } else {
        state.board[to] = a;
        state.board[from] = b;
        message('Moved.');
    }
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
function onTileAuxClick(e) {
    if (e.button !== 1)
        return;
    const idx = Number(e.currentTarget.dataset.index);
    const unlocked = idx < state.unlockedCount;
    const cell = state.board[idx];
    if (!unlocked || !cell)
        return;
    if (isFrozen(idx)) {
        message('Frozen emojis cannot be deleted.');
        return;
    }
    if (confirm('Delete this emoji? This cannot be undone.')) {
        state.board[idx] = null;
        addDeleted();
        renderAll();
        if (typeof syncCheatsUI === "function")
            syncCheatsUI();
        save();
    }
}
function onTileDoubleClick(e) {
    try {
        e.preventDefault();
        e.stopPropagation();
        const idx = Number(e.currentTarget.dataset.index);
        if (!isFrozen(idx))
            return;
        thawFrozenAt(idx);
    } catch (err) {
        console.warn('dblclick error', err);
    }
}
function thawFrozenAt(idx) {
    frozenSet.delete(idx);
    const reward = thawReward(idx);
    state.ji += reward;
    addStatsFrozen(reward);
    selectedIndex = null;
    message(`Thawed! +${fmtJi(reward)} Ji`);
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
function thawReward(idx) {
    const cell = state.board[idx];
    if (!cell)
        return 0;
    const base = getPPS(cell.tier) * tileMultiplier(idx) * coreTierFactor(cell.tier);
    const mult = 2 * (1 + (state.unfreezeRewardLevel || 0) + (state.prestigeTree.unfreezeBaseBonusLevel || 0));
    return base * mult;
}
// Emoji Core grant (1% per merge) when unlocked
function maybeGrantEmojiCore(tier) {
    if ((state.prestigeTree.emojiCore || 0) < 1)
        return;
    if (Math.random() < 0.01) {
        const cur = state.emojiCores[tier] || 0;
        if (cur < 100) {
            state.emojiCores[tier] = cur + 1;
            message(`🎯 Emoji Core gained for T${tier}! (+1% Ji/sec for this tier, ${state.emojiCores[tier]}/100)`);
            renderStats();
            if (typeof renderPetmoji === "function")
                renderPetmoji();
            save();
        }
    }
}
// Freeze mechanics
function freezeEnabled() {
    return !!state.settings.freezeEnabled;
}
function freezeIntervalSeconds() {
    return Math.max(5, 30 - (state.freezeTimerReduceLevel || 0));
}
function tryFreeze() {
    if (!freezeEnabled())
        return;
    const pt = state.prestigeTree || {};
    if (!pt.freezing)
        return;
    const occ = occupiedUnlockedIndices();
    if (occ.length === 0)
        return;
    const idx = occ[Math.floor(Math.random() * occ.length)];
    frozenSet.add(idx);
    state.stats.current.emojisFrozen += 1;
    state.stats.allTime.emojisFrozen += 1;
    renderBoard();
    message('An emoji froze! Click the ❄️ badge or double‑click to thaw.');
}
function ensureFreezeScheduler(force) {
    const pt = state.prestigeTree || {};
    const enabled = pt.freezing && freezeEnabled();
    if (freezeIntervalId) {
        clearInterval(freezeIntervalId);
        freezeIntervalId = null;
    }
    if (enabled) {
        const ms = freezeIntervalSeconds() * 1000;
        el.freezeHowto.hidden = false;
        el.freezeTimerLabel.textContent = String(freezeIntervalSeconds()) + 's';
        freezeIntervalId = setInterval(tryFreeze, ms);
    } else {
        el.freezeHowto.hidden = true;
    }
}
// Streams scheduler
function clearAllStacks() {
    stackCounts = Array(BOARD_ARRAY_SIZE).fill(0);
}
function allIndices() {
    return Array.from({
        length: boardMaxCapacity()
    }, (_, i) => i);
}
function pickIndexWeighted() {
    const occ = occupiedUnlockedIndices();
    const chance = Math.min(1, 0.02 * (state.occupiedBiasLevel || 0));
    if (Math.random() < chance && occ.length > 0) {
        return occ[Math.floor(Math.random() * occ.length)];
    }
    const idxs = allIndices();
    return idxs[Math.floor(Math.random() * idxs.length)];
}
function reassignStreams() {
    const pt = state.prestigeTree || {};
    if (!pt.bonusStreams)
        return;
    clearAllStacks();
    const cap = 1 + (state.streamStackCapLevel || 0);
    const level = state.bonusStreamsLevel || 0;
    if (level <= 0) {
        renderBoard();
        return;
    }
    for (let s = 0; s < level; s++) {
        const i = pickIndexWeighted();
        if (i != null) {
            stackCounts[i] = Math.min(cap, (stackCounts[i] || 0) + 1);
        }
    }
    renderBoard();
}
function ensureStreamsScheduler() {
    const pt = state.prestigeTree || {};
    if (!pt.bonusStreams)
        return;
    reassignStreams();
    if (!streamsIntervalId)
        streamsIntervalId = setInterval(reassignStreams, 5000);
}
// Automation (Moji++)
function spawnIntervalSeconds() {
    return Math.max(5, 30 - 5 * (state.spawnSpeedLevel || 0));
}
function mergeIntervalSeconds() {
    return Math.max(5, 30 - 5 * (state.mergeSpeedLevel || 0));
}
function ensureAutomationSchedulers() {
    if (autoSpawnIntervalId) {
        clearInterval(autoSpawnIntervalId);
        autoSpawnIntervalId = null;
    }
    if (autoMergeIntervalId) {
        clearInterval(autoMergeIntervalId);
        autoMergeIntervalId = null;
    }
    if (state.autoSpawnUnlocked) {
        autoSpawnIntervalId = setInterval(runAutoSpawn, spawnIntervalSeconds() * 1000);
    }
    if (state.autoMergeUnlocked) {
        autoMergeIntervalId = setInterval(() => {
            setTimeout(runAutoMerge, 250);
        }, mergeIntervalSeconds() * 1000);
    }
}
function secondHighestBuyableTier() {
    const buyCap = buyableTierCap();
    const maxListTier = Math.min(state.maxBuyTier, buyCap);
    return Math.max(1, maxListTier - 1);
}
function runAutoSpawn() {
    const idx = firstEmptyUnlockedIndex();
    if (idx === -1)
        return;
    const t = secondHighestBuyableTier();
    if (t < 1)
        return;
    state.board[idx] = {
        tier: t
    };
    updateHighestTier(t);
    message(`Auto‑spawned T${t}.`);
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
function runAutoMerge() {
    const capCount = Math.min(state.unlockedCount, boardMaxCapacity());
    const positions = {};
    for (let i = 0; i < capCount; i++) {
        const c = state.board[i];
        if (c && !isFrozen(i)) {
            const t = c.tier;
            if (!positions[t])
                positions[t] = [];
            positions[t].push(i);
        }
    }
    for (const t of Object.keys(positions).map(Number).sort((a, b) => b - a)) {
        const arr = positions[t];
        if (arr.length >= 2) {
            const i = arr[0],
            j = arr[1];
            const nextTier = t + 1;
            const cap = maxTierCap();
            if (nextTier > cap)
                continue;
            state.board[i] = {
                tier: nextTier
            };
            state.board[j] = null;
            addStatsMerge();
            updateHighestTier(nextTier);
            maybeGrantEmojiCore(t);
            tryPetmojiShardOnMerge && tryPetmojiShardOnMerge();
            message(`Auto‑merged to T${nextTier}.`);
            renderAll();
            if (typeof syncCheatsUI === "function")
                syncCheatsUI();
            save();
            return;
        }
    }
}
// Prestige & Moji++
function mojiPPGrant() {
    const lvl = state.prestigeLevel;
    if (lvl >= 100 && (lvl - 100) % 2 === 0)
        return 1;
    if (lvl >= 50 && (lvl - 50) % 3 === 0)
        return 1;
    return 0;
}
function awardMojiPPIfEligible() {
    const g = mojiPPGrant();
    if (g > 0) {
        state.mojiPlusPlus += g;
        message('Earned +1 Moji++ point!');
    }
}
function canPrestige() {
    return hasMaxTierEmoji();
}
function maxTierBonusPerEmoji() {
    const pt = state.prestigeTree || {};
    const cap = maxTierCap();
    let mult = 0;
    if (pt.maxTierBonusLevel >= 1)
        mult += 10;
    if (pt.maxTierBonusLevel >= 2)
        mult += 20;
    if (pt.maxTierBonusLevel >= 3)
        mult += 30;
    return cap * mult;
}
function estimatePrestigeJi() {
    const capCount = Math.min(state.unlockedCount, boardMaxCapacity());
    let maxTierCount = 0;
    const cap = maxTierCap();
    for (let i = 0; i < capCount; i++) {
        const c = state.board[i];
        if (c && c.tier === cap)
            maxTierCount++;
    }
    return STARTING_JI + maxTierCount * maxTierBonusPerEmoji();
}
function prestige() {
    // Check can prestige, if not, abort
    if (!canPrestige()) {
        message('Prestige requires at least one max‑tier emoji on the board.');
        return;
    }
    // Run Prestige actions
    const capCount = Math.min(state.unlockedCount, boardMaxCapacity());
    let maxTierCount = 0;
    const cap = maxTierCap();
    for (let i = 0; i < capCount; i++) {
        const c = state.board[i];
        if (c && c.tier === cap)
            maxTierCount++;
    }
    const bonus = maxTierCount * maxTierBonusPerEmoji();
    state.ji = STARTING_JI + bonus;
    state.prestigeLevel += 1;
    state.mojiPlus += 1;
    awardMojiPPIfEligible();
    // Reset run (emoji cores persist)
    state.board = Array(BOARD_ARRAY_SIZE).fill(null);
    state.unlockedCount = START_UNLOCKED;
    state.maxBuyTier = 1;
    state.tierPurchases = {};
    frozenSet = new Set();
    stackCounts = Array(BOARD_ARRAY_SIZE).fill(0);
    state.globalBoostLevel = 0;
    state.stats.current = {
        purchasesPerTier: {},
        merges: 0,
        emojisFrozen: 0,
        lifetimeJi: 0,
        jiFrozen: 0,
        jiPassive: 0,
        tilesUnlocked: 0,
        emojisDeleted: 0,
        highestTier: 0,
        jiSpentShop: 0,
        jiSpentUpg: 0,
        runTimeSec: 0
    };
    message(`Prestiged to ${state.prestigeLevel}! Tier cap T${maxTierCap()}, board capacity ${boardMaxCapacity()} tiles. +1 Moji+`);
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
    ensureSchedulers(true);
}
// Prestige Tree (with new row after Max Tier Bonus I)
const treeNodes = [{
        id: PrestigeIds.maxTierBonus1,
        level: 1,
        title: 'Max Tier Bonus I (Additive)',
        sub: '+10×MaxTier Ji per max-tier emoji upon prestige.',
        cost: 1,
        prereqs: [],
        unlock: () => {
            state.prestigeTree.maxTierBonusLevel = 1;
        }
    }, {
        id: PrestigeIds.emojiCoreUnlock,
        level: 2,
        title: 'Unlock Emoji Cores',
        sub: '1% chance on merge to gain an Emoji Core for that tier (+1% Ji/sec per core, up to 100, persists across prestige).',
        cost: 1,
        prereqs: [PrestigeIds.maxTierBonus1],
        unlock: () => {
            state.prestigeTree.emojiCore = 1;
        }
    }, {
        id: PrestigeIds.globalBoostUnlock,
        level: 2,
        title: 'Unlock Global Ji/sec Boost',
        sub: 'Unlocks an upgrade track with levels = 2× emoji cap; each level adds +1% Ji/sec.',
        cost: 1,
        prereqs: [PrestigeIds.maxTierBonus1],
        unlock: () => {
            state.prestigeTree.globalBoost = 1;
        }
    }, {
        id: PrestigeIds.freezingUnlock,
        level: 3,
        title: 'Unlock Freezing',
        sub: 'Enables freeze/thaw mechanic and Freeze settings.',
        cost: 1,
        prereqs: [PrestigeIds.emojiCoreUnlock],
        unlock: () => {
            state.prestigeTree.freezing = 1;
            ensureFreezeScheduler(true);
        }
    }, {
        id: PrestigeIds.shopEfficiency1,
        level: 3,
        title: 'Shop Efficiency I',
        sub: 'Reduces tier prices by 1% (cumulative).',
        cost: 1,
        prereqs: [PrestigeIds.globalBoostUnlock],
        unlock: () => {
            state.prestigeTree.shopEfficiencyLevel += 1;
        }
    }, {
        id: PrestigeIds.unfreezeBase1,
        level: 4,
        title: 'Unfreeze Base I',
        sub: '+1 to base thaw multiplier.',
        cost: 1,
        prereqs: [PrestigeIds.freezingUnlock],
        unlock: () => {
            state.prestigeTree.unfreezeBaseBonusLevel = Math.max(state.prestigeTree.unfreezeBaseBonusLevel || 0, 1);
        }
    }, {
        id: PrestigeIds.boardStart1,
        level: 4,
        title: 'Board Start I',
        sub: '+1 starting unlocked tile immediately.',
        cost: 1,
        prereqs: [PrestigeIds.shopEfficiency1],
        unlock: () => {
            state.prestigeTree.boardStartBonusLevel += 1;
            state.unlockedCount += 1;
            addTilesUnlocked(1);
        }
    }, {
        id: PrestigeIds.boardCapacity1,
        level: 5,
        title: 'Board Capacity I',
        sub: 'Unlocks +2 tiles capacity.',
        cost: 1,
        prereqs: [PrestigeIds.unfreezeBase1],
        unlock: () => {
            state.prestigeTree.boardCapacityBonusLevel += 1;
        }
    }, {
        id: PrestigeIds.bonusStreamsUnlock,
        level: 5,
        title: 'Unlock Bonus Streams',
        sub: 'Unlocks Bonus Streams upgrade (adds concurrent multipliers; reassign every 5s).',
        cost: 1,
        prereqs: [PrestigeIds.boardStart1],
        unlock: () => {
            state.prestigeTree.bonusStreams = 1;
            ensureStreamsScheduler();
            return true;
        }
    }, {
        id: PrestigeIds.unfreezeBase2,
        level: 6,
        title: 'Unfreeze Base II',
        sub: '+1 to base thaw multiplier and unlocks Freeze Timer Reducer.',
        cost: 1,
        prereqs: [PrestigeIds.boardCapacity1, PrestigeIds.unfreezeBase1],
        unlock: () => {
            state.prestigeTree.unfreezeBaseBonusLevel = 2;
        }
    }, {
        id: PrestigeIds.shopEfficiency2,
        level: 6,
        title: 'Shop Efficiency II',
        sub: 'Reduces tier prices by an additional 1%.',
        cost: 1,
        prereqs: [PrestigeIds.bonusStreamsUnlock, PrestigeIds.shopEfficiency1],
        unlock: () => {
            state.prestigeTree.shopEfficiencyLevel += 1;
        }
    }, {
        id: PrestigeIds.maxTierBonus2,
        level: 7,
        title: 'Max Tier Bonus II (Additive)',
        sub: '+20×MaxTier Ji per max-tier emoji upon prestige.',
        cost: 1,
        prereqs: [PrestigeIds.unfreezeBase2, PrestigeIds.maxTierBonus1],
        unlock: () => {
            state.prestigeTree.maxTierBonusLevel = 2;
        }
    }, {
        id: PrestigeIds.streamStackCapUnlock,
        level: 7,
        title: 'Unlock Stream Stack Cap',
        sub: 'Unlocks Stream Stack Cap upgrade (increases max stacks for Streams). Requires Streams.',
        cost: 1,
        prereqs: [PrestigeIds.shopEfficiency2, PrestigeIds.bonusStreamsUnlock],
        unlock: () => {
            state.prestigeTree.streamStackCap = 1;
            return true;
        }
    }, {
        id: PrestigeIds.passivePps1,
        level: 8,
        title: 'Passive PPS I',
        sub: '+5% Ji/sec global multiplier.',
        cost: 1,
        prereqs: [PrestigeIds.maxTierBonus2],
        unlock: () => {
            state.prestigeTree.passivePpsLevel = 1;
        }
    }, {
        id: PrestigeIds.occupiedBiasUnlock,
        level: 8,
        title: 'Unlock Occupied Bias',
        sub: 'Unlocks Occupied Bias (+2% per level chance to target occupied tiles).',
        cost: 1,
        prereqs: [PrestigeIds.streamStackCapUnlock],
        unlock: () => {
            state.prestigeTree.occupiedBias = 1;
        }
    }, {
        id: PrestigeIds.boardCapacity2,
        level: 9,
        title: 'Board Capacity II',
        sub: '+2 tiles capacity.',
        cost: 1,
        prereqs: [PrestigeIds.passivePps1, PrestigeIds.boardCapacity1],
        unlock: () => {
            state.prestigeTree.boardCapacityBonusLevel += 1;
        }
    }, {
        id: PrestigeIds.shopEfficiency3,
        level: 9,
        title: 'Shop Efficiency III',
        sub: 'Reduces tier prices by an additional 1%.',
        cost: 1,
        prereqs: [PrestigeIds.occupiedBiasUnlock, PrestigeIds.shopEfficiency2],
        unlock: () => {
            state.prestigeTree.shopEfficiencyLevel += 1;
        }
    }, {
        id: PrestigeIds.passivePps2,
        level: 10,
        title: 'Passive PPS II',
        sub: '+5% Ji/sec global multiplier.',
        cost: 1,
        prereqs: [PrestigeIds.boardCapacity2, PrestigeIds.passivePps1],
        unlock: () => {
            state.prestigeTree.passivePpsLevel = 2;
        }
    }, {
        id: PrestigeIds.maxTierBonus3,
        level: 10,
        title: 'Max Tier Bonus III (Additive)',
        sub: '+30×MaxTier Ji per max-tier emoji upon prestige.',
        cost: 1,
        prereqs: [PrestigeIds.shopEfficiency3, PrestigeIds.maxTierBonus2],
        unlock: () => {
            state.prestigeTree.maxTierBonusLevel = 3;
        }
    }, {
        id: PrestigeIds.finalInfusion,
        level: 11,
        title: 'Tier Infusion (∞)',
        sub: 'Emoji gain +tier Ji/sec per level (additive). Requires all prior nodes.',
        cost: 1,
        prereqs: [PrestigeIds.boardCapacity2, PrestigeIds.maxTierBonus3],
        infinite: true,
        unlock: () => {
            state.prestigeTree.tierInfusionLevel += 1;
        }
    },
];
function allNonFinalUnlocked() {
    return treeNodes.filter(n => n.id !== 'finalInfusion').every(n => isNodeUnlocked(n.id));
}
function isNodeUnlocked(id) {
    const pt = state.prestigeTree || {};
    // All unlocks are now int-based: 0 = locked, 1+ = unlocked/upgraded
    if (id === PrestigeIds.maxTierBonus1)
        return (pt.maxTierBonusLevel || 0) >= 1;
    if (id === PrestigeIds.maxTierBonus2)
        return (pt.maxTierBonusLevel || 0) >= 2;
    if (id === PrestigeIds.maxTierBonus3)
        return (pt.maxTierBonusLevel || 0) >= 3;
    if (id === PrestigeIds.freezingUnlock)
        return (pt.freezing || 0) >= 1;
    if (id === PrestigeIds.bonusStreamsUnlock)
        return (pt.bonusStreams || 0) >= 1;
    if (id === PrestigeIds.streamStackCapUnlock)
        return (pt.streamStackCap || 0) >= 1;
    if (id === PrestigeIds.occupiedBiasUnlock)
        return (pt.occupiedBias || 0) >= 1;
    if (id === PrestigeIds.emojiCoreUnlock)
        return (pt.emojiCore || 0) >= 1;
    if (id === PrestigeIds.globalBoostUnlock)
        return (pt.globalBoost || 0) >= 1;
    if (id === PrestigeIds.shopEfficiency1)
        return (pt.shopEfficiencyLevel || 0) >= 1;
    if (id === PrestigeIds.shopEfficiency2)
        return (pt.shopEfficiencyLevel || 0) >= 2;
    if (id === PrestigeIds.shopEfficiency3)
        return (pt.shopEfficiencyLevel || 0) >= 3;
    if (id === PrestigeIds.boardStart1)
        return (pt.boardStartBonusLevel || 0) >= 1;
    if (id === PrestigeIds.passivePps1)
        return (pt.passivePpsLevel || 0) >= 1;
    if (id === PrestigeIds.passivePps2)
        return (pt.passivePpsLevel || 0) >= 2;
    if (id === PrestigeIds.unfreezeBase1)
        return (pt.unfreezeBaseBonusLevel || 0) >= 1;
    if (id === PrestigeIds.unfreezeBase2)
        return (pt.unfreezeBaseBonusLevel || 0) >= 2;
    if (id === PrestigeIds.boardCapacity1)
        return (pt.boardCapacityBonusLevel || 0) >= 1;
    if (id === PrestigeIds.boardCapacity2)
        return (pt.boardCapacityBonusLevel || 0) >= 2;
    if (id === PrestigeIds.finalInfusion)
        return (pt.tierInfusionLevel || 0) >= 1;
    return false;
}
function canUnlockNode(node) {
    if (node.id === 'finalInfusion' && !allNonFinalUnlocked())
        return false;
    for (const p of node.prereqs) {
        if (!isNodeUnlocked(p))
            return false;
    }
    return state.mojiPlus >= node.cost;
}
function unlockNode(node) {
    if (!canUnlockNode(node)) {
        message('Requirements not met or not enough Moji+.');
        return;
    }
    const result = node.unlock();
    if (result === false) {
        return;
    }
    state.mojiPlus -= node.cost;
    message(`${node.title} unlocked.`);
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
function renderPrestigeTree() {
    el.prestigeTree.innerHTML = '';
    const levels = [...new Set(treeNodes.map(n => n.level))].sort((a, b) => a - b);
    levels.forEach(lvl => {
        const row = document.createElement('div');
        row.className = 'tree-level';
        // P# label column
        const pLabel = document.createElement('div');
        pLabel.className = 'prestige-row-label';
        pLabel.textContent = `P${lvl}`;
        row.appendChild(pLabel);
        // Upgrades column
        const upgradesCol = document.createElement('div');
        upgradesCol.className = 'prestige-upgrades-col';
        upgradesCol.style.display = 'grid';
        upgradesCol.style.gridTemplateColumns = `repeat(auto-fit, minmax(220px, 1fr))`;
        upgradesCol.style.gap = '10px';
        const nodes = treeNodes.filter(n => n.level === lvl);
        nodes.forEach(n => {
            const node = document.createElement('div');
            node.className = 'node';
            const unlocked = isNodeUnlocked(n.id);
            const available = (state.prestigeLevel >= n.level) && canUnlockNode(n) && !unlocked;
            node.classList.toggle('unlocked', unlocked);
            node.classList.toggle('locked', !unlocked);
            node.classList.toggle('available', available);
            node.innerHTML = `<div class="title">${n.title}${n.infinite ? ' (∞)' : ''}</div><div class="sub">${n.sub}</div>${unlocked ? '' : `<div class="cost">Cost: ${n.cost} Moji+</div>`}`;
			const actions = document.createElement('div');
            actions.className = 'actions';
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = unlocked ? 'Unlocked' : 'Unlock';
            btn.disabled = unlocked || !available;
            btn.addEventListener('click', () => unlockNode(n));
            actions.appendChild(btn);
            node.appendChild(actions);
            upgradesCol.appendChild(node);
        });
        row.appendChild(upgradesCol);
        el.prestigeTree.appendChild(row);
    });
    el.mojiPlusCounter.textContent = String(state.mojiPlus);
    el.estPrestigeJi.textContent = fmtJi(estimatePrestigeJi());
    const showPP = (state.prestigeLevel >= 50) || (state.mojiPlusPlus > 0) || (state.mojiPPLevel > 0);
    el.mojiPPpill.hidden = !(state.mojiPlusPlus > 0 || state.mojiPPLevel > 0);
    el.mojiPlusPlus.textContent = String(state.mojiPlusPlus);
    el.mojiPPSection.hidden = !showPP;
    el.mojiPPLevel.textContent = String(state.mojiPPLevel);
}
// Moji++ actions
function upgradeMojiPP() {
    if (state.mojiPlusPlus <= 0) {
        message('No Moji++ available.');
        return;
    }
    state.mojiPlusPlus -= 1;
    state.mojiPPLevel += 1;
    message(`Base Tier Boost increased to ${state.mojiPPLevel}.`);
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
function unlockAutoSpawn() {
    if (state.prestigeLevel < 50) {
        message('Requires Prestige ≥50.');
        return;
    }
    if (state.autoSpawnUnlocked) {
        message('Auto Spawn already unlocked.');
        return;
    }
    if (state.mojiPlusPlus <= 0) {
        message('No Moji++ available.');
        return;
    }
    state.mojiPlusPlus -= 1;
    state.autoSpawnUnlocked = true;
    message('Auto Spawn unlocked.');
    ensureAutomationSchedulers();
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
function unlockAutoMerge() {
    if (state.prestigeLevel < 75) {
        message('Requires Prestige ≥75.');
        return;
    }
    if (state.autoMergeUnlocked) {
        message('Auto Merge already unlocked.');
        return;
    }
    if (state.mojiPlusPlus <= 0) {
        message('No Moji++ available.');
        return;
    }
    state.mojiPlusPlus -= 1;
    state.autoMergeUnlocked = true;
    message('Auto Merge unlocked.');
    ensureAutomationSchedulers();
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
function upgradeSpawnSpeed() {
    if (state.prestigeLevel < 100) {
        message('Requires Prestige ≥100.');
        return;
    }
    if ((state.spawnSpeedLevel || 0) >= 5) {
        message('Auto Spawn Speed at maximum.');
        return;
    }
    if (state.mojiPlusPlus <= 0) {
        message('No Moji++ available.');
        return;
    }
    state.mojiPlusPlus -= 1;
    state.spawnSpeedLevel += 1;
    el.spawnSpeedLevel.textContent = `${state.spawnSpeedLevel}/5`;
    el.spawnIntervalLabel.textContent = `${spawnIntervalSeconds()}s`;
    message(`Auto Spawn interval reduced (now ${spawnIntervalSeconds()}s).`);
    ensureAutomationSchedulers();
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
function upgradeMergeSpeed() {
    if (state.prestigeLevel < 100) {
        message('Requires Prestige ≥100.');
        return;
    }
    if ((state.mergeSpeedLevel || 0) >= 5) {
        message('Auto Merge Speed at maximum.');
        return;
    }
    if (state.mojiPlusPlus <= 0) {
        message('No Moji++ available.');
        return;
    }
    state.mojiPlusPlus -= 1;
    state.mergeSpeedLevel += 1;
    el.mergeSpeedLevel.textContent = `${state.mergeSpeedLevel}/5`;
    el.mergeIntervalLabel.textContent = `${mergeIntervalSeconds()}s`;
    message(`Auto Merge interval reduced (now ${mergeIntervalSeconds()}s).`);
    ensureAutomationSchedulers();
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    save();
}
// UI & stats
function fmtTime(s) {
    const d = Math.floor(s / 86400),
    h = Math.floor((s % 86400) / 3600),
    m = Math.floor((s % 3600) / 60),
    sec = Math.floor(s % 60);
    const parts = [];
    if (d)
        parts.push(`${d}d`);
    if (h)
        parts.push(`${h}h`);
    if (m)
        parts.push(`${m}m`);
    parts.push(`${sec}s`);
    return parts.join(' ');
}
function renderTierGrid(container, map) {
    container.innerHTML = '';
    const tiers = Object.keys(map || {}).map(n => Number(n)).sort((a, b) => a - b);
    tiers.forEach(t => {
        const box = document.createElement('div');
        box.className = 'tierbox';
        box.innerHTML = `<span>T${t}</span><span>${map[t]}</span>`;
        container.appendChild(box);
    });
}
function renderCores() {
    const cores = state.emojiCores || {};
    const tiers = Object.keys(cores).map(n => Number(n)).filter(t => cores[t] > 0).sort((a, b) => a - b);
    el.coresGrid.innerHTML = '';
    if (tiers.length === 0) {
        el.coresSection.hidden = true;
        return;
    }
    el.coresSection.hidden = false;
    tiers.forEach(t => {
        const box = document.createElement('div');
        box.className = 'tierbox';
        const emoji = getEmojiForTier(t);
        const count = cores[t];
        box.innerHTML = `<span>${emoji} • T${t}</span><span>${count}/100 (+${count}% Ji/sec)</span>`;
        el.coresGrid.appendChild(box);
    });
}
function renderStats() {
    const cur = state.stats.current;
    const all = state.stats.allTime;
    const freezeUnlocked = !!state.prestigeTree.freezing;
    el.freezeStatCur.hidden = !freezeUnlocked;
    el.freezeStatCur2.hidden = !freezeUnlocked;
    el.freezeStatAll.hidden = !freezeUnlocked;
    el.freezeStatAll2.hidden = !freezeUnlocked;
    el.s_curPrestige.textContent = String(state.prestigeLevel);
    el.s_curLifeJi.textContent = fmtJi(cur.lifetimeJi);
    el.s_curFrozenJi.textContent = fmtJi(cur.jiFrozen);
    el.s_curPassiveJi.textContent = fmtJi(cur.jiPassive);
    el.s_curMerges.textContent = String(cur.merges);
    el.s_curFrozen.textContent = String(cur.emojisFrozen);
    el.s_curTilesUnlocked.textContent = String(cur.tilesUnlocked);
    el.s_curDeleted.textContent = String(cur.emojisDeleted);
    el.s_curHighestTier.textContent = String(cur.highestTier || 0);
    el.s_curJiSpentShop.textContent = fmtJi(cur.jiSpentShop);
    el.s_curJiSpentUpg.textContent = fmtJi(cur.jiSpentUpg);
    el.s_curRunTime.textContent = fmtTime(cur.runTimeSec);
    el.s_allLifeJi.textContent = fmtJi(all.lifetimeJi);
    el.s_allFrozenJi.textContent = fmtJi(all.jiFrozen);
    el.s_allPassiveJi.textContent = fmtJi(all.jiPassive);
    el.s_allMerges.textContent = String(all.merges);
    el.s_allFrozen.textContent = String(all.emojisFrozen);
    el.s_allTilesUnlocked.textContent = String(all.tilesUnlocked);
    el.s_allDeleted.textContent = String(all.emojisDeleted);
    el.s_allHighestTier.textContent = String(all.highestTier || 0);
    el.s_allJiSpentShop.textContent = fmtJi(all.jiSpentShop);
    el.s_allJiSpentUpg.textContent = fmtJi(all.jiSpentUpg);
    el.s_allRunTime.textContent = fmtTime(all.runTimeSec);
    renderTierGrid(el.s_curPurchases, cur.purchasesPerTier);
    renderTierGrid(el.s_allPurchases, all.purchasesPerTier);
    // Bonuses
    el.bonusPrestige.textContent = `+${(state.prestigeLevel || 0)}%`;
    const mojiPPVisible = (state.prestigeLevel >= 50) || (state.mojiPlusPlus > 0) || (state.mojiPPLevel > 0);
    el.bonusMojiPPRow.hidden = !mojiPPVisible;
    el.bonusMojiPP.textContent = `+${(((state.mojiPlusPlus || 0) + (state.mojiPPLevel || 0)) * 1.5).toFixed(1)}%`;
    const globalVisible = (state.prestigeTree.globalBoost || 0) >= 1 || (state.globalBoostLevel > 0);
    el.bonusGlobalRow.hidden = !globalVisible;
    el.bonusGlobal.textContent = `+${(state.globalBoostLevel || 0)}%`;
    renderCores();
}
function renderAll() {
    el.ji.textContent = fmtJi(state.ji) + ' Ji';
    el.jips.textContent = fmtJi(totalPpsSafe());
    el.prestigeLevel.textContent = String(state.prestigeLevel);
    renderBoard();
    renderShop();
    renderUpgrades();
    renderStats();
    if (typeof renderPetmoji === "function")
        renderPetmoji();
    renderPrestigeTree();
    el.minTierLabel.textContent = String(minBuyTier());
    el.maxTierLabel.textContent = String(Math.min(state.maxBuyTier, buyableTierCap()));
    el.tierCap.textContent = String(maxTierCap());
    updatePrestigeButtonVisibility();
    el.freezeSetting.hidden = !((state.prestigeTree.freezing || 0) >= 1);
    el.emojiSetSetting.hidden = !(state.prestigeLevel >= 100);
    applyTheme();
    // Add version to bottom of settings tab
    let versionLabel = document.getElementById('versionLabel');
    if (!versionLabel) {
        versionLabel = document.createElement('div');
        versionLabel.id = 'versionLabel';
        versionLabel.style.cssText = 'margin-top:2em;text-align:center;font-size:0.95em;opacity:0.7;';
        el.panels.settings.appendChild(versionLabel);
    }
    versionLabel.textContent = 'Version: ' + VERSION;
}
function updatePrestigeButtonVisibility() {
    const visible = canPrestige();
    el.prestigeBtn.hidden = !visible;
}
function setActiveTab(name) {
    el.tabs.forEach(btn => {
        const active = btn.dataset.tab === name;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    Object.entries(el.panels).forEach(([k, sec]) => {
        sec.classList.toggle('active', k === name);
    });
    if (name === 'petmoji' && typeof renderPetmoji === 'function') {
        renderPetmoji();
    }
}
// Tick & reset
function tick() {
    const now = Date.now();
    const dt = (now - state.lastTick) / 1000;
    const gain = totalPpsSafe() * dt;
    state.ji += gain;
    state.lastTick = now;
    addStatsPassive(gain);
    addRunTime(dt);
    el.ji.textContent = fmtJi(state.ji) + ' Ji';
    el.jips.textContent = fmtJi(totalPpsSafe());
    el.prestigeLevel.textContent = String(state.prestigeLevel);
    updateShopButtonsState();
    renderUpgrades();
    renderStats();
    if (typeof renderPetmoji === "function")
        renderPetmoji();
    updatePrestigeButtonVisibility();
}
function reset() {
    if (!confirm('Reset progress? This clears your board and Ji.'))
        return;
    if (streamsIntervalId) {
        clearInterval(streamsIntervalId);
        streamsIntervalId = null;
    }
    if (freezeIntervalId) {
        clearInterval(freezeIntervalId);
        freezeIntervalId = null;
    }
    if (autoSpawnIntervalId) {
        clearInterval(autoSpawnIntervalId);
        autoSpawnIntervalId = null;
    }
    if (autoMergeIntervalId) {
        clearInterval(autoMergeIntervalId);
        autoMergeIntervalId = null;
    }
    state.ji = STARTING_JI;
    state.board = Array(BOARD_ARRAY_SIZE).fill(null);
    state.unlockedCount = START_UNLOCKED;
    state.maxBuyTier = 1;
    state.tierPurchases = {};
    state.bonusStreamsLevel = 0;
    state.streamStackCapLevel = 0;
    state.occupiedBiasLevel = 0;
    state.unfreezeRewardLevel = 0;
    stackCounts = Array(BOARD_ARRAY_SIZE).fill(0);
    frozenSet = new Set();
    selectedIndex = null;
    save();
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    ensureSchedulers(true);
}
function fullReset() {
    if (!confirm('Full Reset WILL erase ALL progress including Prestige and Moji+/Moji++. Continue?'))
        return;
    if (!confirm('Are you sure? This cannot be undone.'))
        return;
    try {
        localStorage.removeItem('moji-merge-save-v14');
    } catch (e) {
        console.warn('Clear saves failed', e);
    }
    state = {
        ji: STARTING_JI,
        autosave: true,
        settings: {
            sciNotation: false,
            freezeEnabled: true,
            emojiSetKey: 'classic'
        },
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
        cheatsUnlocked: false,
        autoSpawnUnlocked: false,
        autoMergeUnlocked: false,
        spawnSpeedLevel: 0,
        mergeSpeedLevel: 0,
        freezeTimerReduceLevel: 0,
        emojiCores: {},
        globalBoostLevel: 0,
        prestigeTree: {
            maxTierBonusLevel: 0,
            freezing: 0,
            bonusStreams: 0,
            streamStackCap: 0,
            occupiedBias: 0,
            emojiCore: 0,
            globalBoost: 0,
            shopEfficiencyLevel: 0,
            boardStartBonusLevel: 0,
            passivePpsLevel: 0,
            boardCapacityBonusLevel: 0,
            unfreezeBaseBonusLevel: 0,
            tierInfusionLevel: 0
        },
        stats: {
            current: {
                purchasesPerTier: {},
                merges: 0,
                emojisFrozen: 0,
                lifetimeJi: 0,
                jiFrozen: 0,
                jiPassive: 0,
                tilesUnlocked: 0,
                emojisDeleted: 0,
                highestTier: 0,
                jiSpentShop: 0,
                jiSpentUpg: 0,
                runTimeSec: 0
            },
            allTime: {
                purchasesPerTier: {},
                merges: 0,
                emojisFrozen: 0,
                lifetimeJi: 0,
                jiFrozen: 0,
                jiPassive: 0,
                tilesUnlocked: 0,
                emojisDeleted: 0,
                highestTier: 0,
                jiSpentShop: 0,
                jiSpentUpg: 0,
                runTimeSec: 0
            }
        },
        lastTick: Date.now()
    };
    stackCounts = Array(BOARD_ARRAY_SIZE).fill(0);
    frozenSet = new Set();
    selectedIndex = null;
    save();
    renderAll();
    if (typeof syncCheatsUI === "function")
        syncCheatsUI();
    ensureSchedulers(true);
    renderAll();
    if (typeof syncCheatsUI === 'function')
        syncCheatsUI();
    message('Full Reset complete.');
}
// Events & init
function exportSave() {
    try {
        const data = JSON.stringify(state, null, 2);
        const blob = new Blob([data], {
            type: 'application/json'
        });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'moji-merge-save-v14.json';
        a.click();
        URL.revokeObjectURL(a.href);
    } catch (e) {
        message('Export failed.');
    }
}
function importSave() {
    const file = el.importFile.files && el.importFile.files[0];
    if (!file) {
        message('Choose a JSON file first.');
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);
            state = {
                ...state,
                ...data
            };
            normalizeState();
            save();
            renderAll();
            if (typeof syncCheatsUI === "function")
                syncCheatsUI();
            ensureSchedulers(true);
            message('Import successful.');
        } catch (e) {
            message('Invalid JSON.');
        }
    };
    reader.readAsText(file);
}
function ensureSchedulers(force) {
    ensureStreamsScheduler();
    ensureFreezeScheduler(force);
    ensureAutomationSchedulers();
}
function init() {
    try {
        load();
        offlineProgress();
        el.tabs.forEach(btn => btn.addEventListener('click', () => setActiveTab(btn.dataset.tab)));
        setActiveTab('game');
        el.prestigeBtn && el.prestigeBtn.addEventListener('click', prestige);
        el.fullResetBtn && el.fullResetBtn.addEventListener('click', fullReset);
        if (el.sciToggle) {
            el.sciToggle.checked = !!state.settings.sciNotation;
            el.sciToggle.addEventListener('change', (e) => {
                state.settings.sciNotation = !!e.target.checked;
                renderAll();
                if (typeof syncCheatsUI === "function")
                    syncCheatsUI();
                save();
            });
        }
        if (el.freezeToggle) {
            el.freezeToggle.checked = !!state.settings.freezeEnabled;
            el.freezeToggle.addEventListener('change', (e) => {
                state.settings.freezeEnabled = !!e.target.checked;
                ensureFreezeScheduler(true);
                renderAll();
                if (typeof syncCheatsUI === "function")
                    syncCheatsUI();
                save();
            });
        }
        // Theme selector (static in HTML)
        const themeSelector = document.getElementById('themeSelector');
        if (themeSelector) {
            // Set selector to saved value or 'system' if not set
            themeSelector.value = state.settings.theme || 'system';
            themeSelector.addEventListener('change', (e) => {
                state.settings.theme = e.target.value;
                applyTheme();
                save();
            });
            // Listen for system theme changes if 'system' is selected
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                if ((state.settings.theme || 'system') === 'system') {
                    applyTheme();
                }
            });
        }
        document.querySelectorAll('input[name="emojiSet"]').forEach(r => {
            r.checked = (r.value === state.settings.emojiSetKey);
            r.addEventListener('change', (e) => {
                state.settings.emojiSetKey = e.target.value;
                renderAll();
                if (typeof syncCheatsUI === "function")
                    syncCheatsUI();
                save();
            });
        });
        el.exportBtn && el.exportBtn.addEventListener('click', exportSave);
        el.importBtn && el.importBtn.addEventListener('click', importSave);
        el.mojiPPBtn && el.mojiPPBtn.addEventListener('click', upgradeMojiPP);
        el.autoSpawnBtn && el.autoSpawnBtn.addEventListener('click', unlockAutoSpawn);
        el.autoMergeBtn && el.autoMergeBtn.addEventListener('click', unlockAutoMerge);
        el.spawnSpeedBtn && el.spawnSpeedBtn.addEventListener('click', upgradeSpawnSpeed);
        el.mergeSpeedBtn && el.mergeSpeedBtn.addEventListener('click', upgradeMergeSpeed);
        renderAll();
        if (typeof syncCheatsUI === "function")
            syncCheatsUI();
        ensureSchedulers(true);
        setInterval(tick, 250);
        message('Loaded v' + state.version + '.');
    } catch (err) {
        console.error(err);
        message('Initialization error — please refresh.');
    }
}
window.addEventListener('DOMContentLoaded', init);
function enforcePetmojiTabVisibility() {
    try {
        const btn = document.getElementById("tabBtn-petmoji");
        if (btn) {
            btn.hidden = !((state.prestigeLevel || 0) >= 10);
        }
    } catch (e) {}
}
setInterval(enforcePetmojiTabVisibility, 500);
setTimeout(() => {
    const unlockBtn = document.getElementById('unlockCheatsBtn');
    if (unlockBtn) {
        unlockBtn.addEventListener('click', () => {
            const pwd = (document.getElementById('cheatPassword')?.value || '').trim();
            if (pwd === 'cheater67') {
                state.cheatsUnlocked = true;
                const inp = document.getElementById('cheatPassword');
                if (inp)
                    inp.value = '';
                message('Cheats unlocked.');
                if (typeof syncCheatsUI === 'function')
                    syncCheatsUI();
                save();
            } else {
                message('Incorrect password.');
            }
        });
    }
    const addJiBtn = document.getElementById('addJiBtn');
    if (addJiBtn) {
        addJiBtn.addEventListener('click', () => {
			const addJiAmt = document.getElementById('addJiAmount')?.valueAsNumber || 0;
            if (!state.cheatsUnlocked) {
                message('Cheats are locked.');
                return;
            }
            state.ji += (1000000 * addJiAmt);
            renderAll();
            save();
            message('+' + addJiAmt.toFixed(2) + 'M Ji added!');
        });
    }
    const ipBtn = document.getElementById('instantPrestigeBtn');
    if (ipBtn) {
        ipBtn.addEventListener('click', () => {
            if (!state.cheatsUnlocked) {
                message('Cheats are locked.');
                return;
            }
            prestigeInstant();
        });
    }
    // NEW: petmoji shard cheat button
    const shardBtn = document.getElementById('petmojiShardBtn');
    if (shardBtn) {
        shardBtn.addEventListener('click', () => {
            if (!state.cheatsUnlocked) {
                message('Cheats are locked.');
                return;
            }
            grantRandomEligiblePetmojiShard();
        });
    }
}, 0);
function syncCheatsUI() {
    const cs = document.getElementById('cheatsStatusLabel');
    if (cs)
        cs.textContent = state.cheatsUnlocked ? '(unlocked)' : '(locked)';
    const a = document.getElementById('addJiSetting');
    if (a)
        a.hidden = !state.cheatsUnlocked;
    const i = document.getElementById('instantPrestigeSetting');
    if (i)
        i.hidden = !state.cheatsUnlocked;
    const s = document.getElementById('petmojiShardSetting');
    if (s)
        s.hidden = !state.cheatsUnlocked;
    const b = document.getElementById('cheaterBanner');
    if (b)
        b.hidden = !state.cheatsUnlocked;
}
function prestigeInstant() {
    try {
        const capCount = Math.min(state.unlockedCount, boardMaxCapacity());
        let maxTierCount = 0;
        const cap = maxTierCap();
        for (let i = 0; i < capCount; i++) {
            const c = state.board[i];
            if (c && c.tier === cap)
                maxTierCount++;
        }
        const bonus = maxTierCount * maxTierBonusPerEmoji();
        state.ji = STARTING_JI + bonus;
        state.prestigeLevel += 1;
        state.mojiPlus += 1;
        awardMojiPPIfEligible();
        state.board = Array(BOARD_ARRAY_SIZE).fill(null);
        state.unlockedCount = START_UNLOCKED;
        state.maxBuyTier = 1;
        state.tierPurchases = {};
        frozenSet = new Set();
        stackCounts = Array(BOARD_ARRAY_SIZE).fill(0);
        state.globalBoostLevel = 0;
        state.stats.current = {
            purchasesPerTier: {},
            merges: 0,
            emojisFrozen: 0,
            lifetimeJi: 0,
            jiFrozen: 0,
            jiPassive: 0,
            tilesUnlocked: 0,
            emojisDeleted: 0,
            highestTier: 0,
            jiSpentShop: 0,
            jiSpentUpg: 0,
            runTimeSec: 0
        };
        message(`CHEAT Prestige to ${state.prestigeLevel}! Tier cap T${maxTierCap()}, board capacity ${boardMaxCapacity()} tiles. +1 Moji+`);
        renderAll();
        save();
        ensureSchedulers(true);
    } catch (e) {
        console.warn('prestigeInstant error', e);
        message('Instant Prestige failed.');
    }
}
// ===== Petmoji Module (Full) =====
(function () {
    const PM_TIERS = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const PM_PER_RANK = {
        common: 1,
        uncommon: 2,
        rare: 4,
        epic: 6,
        legendary: 10
    };
    const PM_FIB = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
    const PM_MAX_RANK = 10;
    const PM_PETS = [
        // Common
        {
            id: 'dog',
            name: 'Dog',
            emoji: '\uD83D\uDC36',
            tier: 'common'
        }, {
            id: 'cat',
            name: 'Cat',
            emoji: '\uD83D\uDC31',
            tier: 'common'
        }, {
            id: 'mouse',
            name: 'Mouse',
            emoji: '\uD83D\uDC2D',
            tier: 'common'
        }, {
            id: 'ham',
            name: 'Hamster',
            emoji: '\uD83D\uDC39',
            tier: 'common'
        }, {
            id: 'bun',
            name: 'Rabbit',
            emoji: '\uD83D\uDC30',
            tier: 'common'
        }, {
            id: 'fox',
            name: 'Fox',
            emoji: '\uD83E\uDD8A',
            tier: 'common'
        }, {
            id: 'bear',
            name: 'Bear',
            emoji: '\uD83D\uDC3B',
            tier: 'common'
        }, {
            id: 'frog',
            name: 'Frog',
            emoji: '\uD83D\uDC38',
            tier: 'common'
        },
        // Uncommon
        {
            id: 'raccoon',
            name: 'Raccoon',
            emoji: '\uD83E\uDD9D',
            tier: 'uncommon'
        }, {
            id: 'hedgehog',
            name: 'Hedgehog',
            emoji: '\uD83E\uDD94',
            tier: 'uncommon'
        }, {
            id: 'skunk',
            name: 'Skunk',
            emoji: '\uD83E\uDDA8',
            tier: 'uncommon'
        }, {
            id: 'panda',
            name: 'Panda',
            emoji: '\uD83D\uDC3C',
            tier: 'uncommon'
        }, {
            id: 'koala',
            name: 'Koala',
            emoji: '\uD83D\uDC28',
            tier: 'uncommon'
        }, {
            id: 'llama',
            name: 'Llama',
            emoji: '\uD83E\uDD99',
            tier: 'uncommon'
        }, {
            id: 'sloth',
            name: 'Sloth',
            emoji: '\uD83E\uDDA5',
            tier: 'uncommon'
        },
        // Rare
        {
            id: 'tiger',
            name: 'Tiger',
            emoji: '\uD83D\uDC2F',
            tier: 'rare',
            special: 'keen_eye'
        }, {
            id: 'lion',
            name: 'Lion',
            emoji: '\uD83E\uDD81',
            tier: 'rare',
            special: 'momentum'
        }, {
            id: 'monkey',
            name: 'Monkey',
            emoji: '\uD83D\uDC35',
            tier: 'rare',
            special: 'pouch'
        }, {
            id: 'wolf',
            name: 'Wolf',
            emoji: '\uD83D\uDC3A',
            tier: 'rare',
            special: 'momentum'
        }, {
            id: 'eagle',
            name: 'Eagle',
            emoji: '\uD83E\uDD85',
            tier: 'rare',
            special: 'keen_eye'
        },
        // Epic (P25+)
        {
            id: 'owl',
            name: 'Owl',
            emoji: '\uD83E\uDD89',
            tier: 'epic',
            special: 'lucky_surge'
        }, {
            id: 'bat',
            name: 'Bat',
            emoji: '\uD83E\uDD87',
            tier: 'epic',
            special: 'focus'
        }, {
            id: 'croc',
            name: 'Crocodile',
            emoji: '\uD83D\uDC0A',
            tier: 'epic',
            special: 'collector'
        }, {
            id: 'leopard',
            name: 'Leopard',
            emoji: '\uD83D\uDC06',
            tier: 'epic',
            special: 'overclock'
        },
        // Legendary (P50+)
        {
            id: 'unicorn',
            name: 'Unicorn',
            emoji: '\uD83E\uDD84',
            tier: 'legendary',
            special: 'royal_decree'
        }, {
            id: 'dragon',
            name: 'Dragon',
            emoji: '\uD83D\uDC09',
            tier: 'legendary',
            special: 'ascendant'
        }, {
            id: 'dragon2',
            name: 'Azure Dragon',
            emoji: '\uD83D\uDC32',
            tier: 'legendary',
            special: 'arcane_funnel'
        }
    ];
    function ensurePM() {
        if (!state.petmoji || typeof state.petmoji !== 'object') {
            state.petmoji = {
                isUnlocked: false,
                equippedPetId: null,
                pets: {},
                universalShards: 0,
                settings: {
                    autoSpendShards: true,
                    showOnHUD: true
                }
            };
        }
        PM_PETS.forEach(p => {
            if (!state.petmoji.pets[p.id])
                state.petmoji.pets[p.id] = {
                    rank: 0,
                    shards: 0
                };
        });
        state.petmoji.isUnlocked = (state.prestigeLevel || 0) >= 10;
    }
    function fibCost(rank) {
        return rank >= PM_MAX_RANK ? Infinity : PM_FIB[rank];
    }
    function addShard(id) {
        const ps = state.petmoji.pets[id];
        ps.shards++;
        autoSpend(id);
    }
    function autoSpend(id) {
        if (!state.petmoji.settings.autoSpendShards)
            return;
        const ps = state.petmoji.pets[id];
        while (ps.rank < PM_MAX_RANK) {
            const cost = fibCost(ps.rank);
            if (ps.shards >= cost) {
                ps.shards -= cost;
                ps.rank++;
            } else
                break;
        }
    }
    function active() {
        try {
            if (typeof ensurePM === 'function')
                ensurePM();
        } catch (e) {}
        const pm = state.petmoji || {
            equippedPetId: null,
            pets: {}
        };
        const id = pm.equippedPetId || null;
        if (!id)
            return null;
        const def = PM_PETS.find(p => p.id === id);
        const st = def ? pm.pets[id] : null;
        if (!def || !st || st.rank < 1)
            return null;
        return {
            def,
            st
        };
    }
    function shardChance() {
        const p = state.prestigeLevel || 0;
        if (p < 10)
            return 0;
        return 0.0001 * (p - 9);
    }
    function tierWeights() {
        const p = state.prestigeLevel || 0;
        let w = {
            common: 90,
            uncommon: 9,
            rare: 1,
            epic: 0,
            legendary: 0
        };
        if (p >= 15)
            w = {
                common: 85,
                uncommon: 12,
                rare: 3,
                epic: 0,
                legendary: 0
            };
        if (p >= 20)
            w = {
                common: 80,
                uncommon: 15,
                rare: 5,
                epic: 0,
                legendary: 0
            };
        if (p >= 25)
            w = {
                common: 75,
                uncommon: 17,
                rare: 7,
                epic: 1,
                legendary: 0
            };
        if (p >= 30)
            w = {
                common: 68,
                uncommon: 20,
                rare: 10,
                epic: 2,
                legendary: 0
            };
        if (p >= 35)
            w = {
                common: 60,
                uncommon: 24,
                rare: 13,
                epic: 3,
                legendary: 0
            };
        if (p >= 40)
            w = {
                common: 52,
                uncommon: 27,
                rare: 17,
                epic: 4,
                legendary: 0
            };
        if (p >= 45)
            w = {
                common: 45,
                uncommon: 30,
                rare: 20,
                epic: 5,
                legendary: 0
            };
        if (p >= 50)
            w = {
                common: 40,
                uncommon: 32,
                rare: 22,
                epic: 5,
                legendary: 1
            };
        if (p >= 55)
            w = {
                common: 35,
                uncommon: 33,
                rare: 24,
                epic: 6,
                legendary: 2
            };
        if (p >= 60)
            w = {
                common: 30,
                uncommon: 34,
                rare: 26,
                epic: 7,
                legendary: 3
            };
        if (p >= 70)
            w = {
                common: 26,
                uncommon: 34,
                rare: 28,
                epic: 8,
                legendary: 4
            };
        if (p >= 80)
            w = {
                common: 22,
                uncommon: 34,
                rare: 30,
                epic: 9,
                legendary: 5
            };
        if (p >= 100)
            w = {
                common: 20,
                uncommon: 34,
                rare: 31,
                epic: 10,
                legendary: 5
            };
        return w;
    }
    function pickWeighted(weights) {
        const entries = Object.entries(weights);
        const total = entries.reduce((s, [, v]) => s + v, 0);
        let r = Math.random() * total;
        for (const [k, v] of entries) {
            r -= v;
            if (r < 0)
                return k;
        }
        return 'common';
    }
    // Passive & active effects
    window.petmojiPassivePercent = function () {
        let s = 0;
        for (const p of PM_PETS) {
            const ps = state.petmoji.pets[p.id];
            if (ps && ps.rank > 0)
                s += PM_PER_RANK[p.tier] * ps.rank;
        }
        return s;
    };
    window.petmojiPassivePercentWithRoyal = function () {
        const a = active();
        let base = petmojiPassivePercent();
        if (a && a.def.special === 'royal_decree')
            base *= 1.10;
        return base;
    };
    window.petmojiActiveJiSecPercent = function () {
        const a = active();
        if (!a)
            return 0;
        let pct = 0;
        if (a.def.special === 'momentum')
            pct += 3;
        if (a.def.special === 'overclock')
            pct += 5;
        if (a.def.special === 'royal_decree')
            pct += 10;
        return pct;
    };
    window.petmojiFactor = function () {
        const pct = petmojiPassivePercentWithRoyal() + petmojiActiveJiSecPercent();
        return 1 + pct / 100;
    };
    // Manual merge shard hook (call this from merge handlers)
    window.tryPetmojiShardOnMerge = function () {
        ensurePM();
        if (!state.petmoji.isUnlocked)
            return;
        const p = shardChance();
        if (Math.random() >= p)
            return;
        const weights = tierWeights();
        const chosenTier = pickWeighted(weights);
        // Respect prestige locks for Epic/Legendary (skip to Rare if locked)
        let tier = chosenTier;
        if (tier === 'legendary' && (state.prestigeLevel || 0) < 50)
            tier = 'epic';
        if (tier === 'epic' && (state.prestigeLevel || 0) < 25)
            tier = 'rare';
        const pool = PM_PETS.filter(x => x.tier === tier);
        if (pool.length) {
            const tgt = pool[Math.floor(Math.random() * pool.length)];
            addShard(tgt.id);
            state.lastPetmojiDrop = `${tgt.emoji} ${tgt.name} (${tier})`;
            if (typeof renderPetmoji === 'function')
                renderPetmoji();
            if (typeof save === 'function')
                save();
        }
    };
    // NEW: Cheats action — grant random eligible Petmoji shard
    window.grantRandomEligiblePetmojiShard = function () {
        try {
            ensurePM();
        } catch (e) {}
        const p = state.prestigeLevel || 0;
        const pool = PM_PETS.filter(x => {
            if (x.tier === 'legendary')
                return p >= 50;
            if (x.tier === 'epic')
                return p >= 25;
            return true;
        });
        if (pool.length === 0) {
            message('No eligible Petmoji for current prestige.');
            return;
        }
        const pick = pool[Math.floor(Math.random() * pool.length)];
        const ps = state.petmoji.pets[pick.id];
        ps.shards += 1;
        autoSpend(pick.id);
        renderPetmoji && renderPetmoji();
        save && save();
        message(`Cheat: +1 shard to ${pick.emoji} ${pick.name} (${pick.tier}).`);
    };
    // Rendering
    window.renderPetmojiHUD = function () {
        try {
            if (typeof ensurePM === 'function')
                ensurePM();
            const hud = document.getElementById('pm_hud');
            if (!hud)
                return;
            const showHUD = !!(state.petmoji && state.petmoji.settings && state.petmoji.settings.showOnHUD !== false);
            const a = (typeof active === 'function') ? active() : null;
            hud.style.display = showHUD ? '' : 'none';
            if (!showHUD)
                return;
            if (a) {
                hud.textContent = a.def.emoji;
                hud.title = a.def.name + ' (' + a.def.tier + ')';
            } else {
                hud.textContent = '—';
                hud.title = 'Active Pet';
            }
        } catch (e) {}
    };
    window.renderPetmoji = function () {
        ensurePM();
        const unlocked = state.petmoji.isUnlocked;
        const btn = document.getElementById('tabBtn-petmoji');
        if (btn)
            btn.hidden = !unlocked;
        const hud = document.getElementById('pm_hud');
        const a = active();
        if (hud) {
            if (a) {
                hud.textContent = a.def.emoji;
                hud.title = `${a.def.name} (${a.def.tier})`;
            } else {
                hud.textContent = '—';
                hud.title = 'Active Pet';
            }
        }
        // sync settings checkboxes
        const autoBox = document.getElementById('pm_autoSpend');
        if (autoBox) {
            autoBox.checked = !!state.petmoji.settings.autoSpendShards;
            if (!getComputedStyle(autoBox).getPropertyValue('--_bound')) {
                autoBox.addEventListener('change', e => {
                    state.petmoji.settings.autoSpendShards = !!e.target.checked;
                    save && save();
                });
                autoBox.style.setProperty('--_bound', '1');
            }
        }
        const hudBox = document.getElementById('pm_showHUD');
        if (hudBox) {
            hudBox.checked = !!state.petmoji.settings.showOnHUD;
            if (!getComputedStyle(hudBox).getPropertyValue('--_bound')) {
                hudBox.addEventListener('change', e => {
                    state.petmoji.settings.showOnHUD = !!e.target.checked;
                    renderPetmojiHUD && renderPetmojiHUD();
                    save && save();
                });
                hudBox.style.setProperty('--_bound', '1');
            }
        }
        const totalEl = document.getElementById('pm_totalPassive');
        if (totalEl)
            totalEl.textContent = petmojiPassivePercentWithRoyal().toFixed(2);		 
        const eqLab = document.getElementById('pm_equippedLabel');
        if (eqLab)
            eqLab.textContent = a ? `${a.def.emoji} ${a.def.name}` : 'None';
        const uni = document.getElementById('pm_universal');
        if (uni)
            uni.textContent = String(state.petmoji.universalShards || 0);
        const grid = document.getElementById('pm_grid');
        if (!grid)
            return;
        grid.innerHTML = '';
        if (!unlocked) {
            const lm = document.getElementById('pm_lockedMsg');
            if (lm)
                lm.hidden = false;
            return;
        }
        const lm = document.getElementById('pm_lockedMsg');
        if (lm)
            lm.hidden = true;
        // Locked-tier placeholders by prestige
        const canEpic = (state.prestigeLevel || 0) >= 25;
        const canLegend = (state.prestigeLevel || 0) >= 50;
        const filterSel = document.getElementById('pm_filter');
        const sortSel = document.getElementById('pm_sort');
        const filter = filterSel ? filterSel.value : 'all';
        const sort = sortSel ? sortSel.value : 'rarity';
        if (filterSel && !filterSel.onchange)
            filterSel.onchange = () => renderPetmoji();
        if (sortSel && !sortSel.onchange)
            sortSel.onchange = () => renderPetmoji();
        let list = PM_PETS.slice();
        if (filter !== 'all')
            list = list.filter(p => p.tier === filter);
        list = list.filter(p => (p.tier !== 'epic' || canEpic) && (p.tier !== 'legendary' || canLegend));
        // Defer placeholders for locked rarities; append after cards
        const showEpicNote = !canEpic && (filter === 'all' || filter === 'epic');
        const showLegendNote = !canLegend && (filter === 'all' || filter === 'legendary');

        list.sort((a, b) => {
            const order = t => PM_TIERS.indexOf(t);
            if (sort === 'name')
                return a.name.localeCompare(b.name);
            if (sort === 'rank') {
                const ra = state.petmoji.pets[a.id].rank || 0;
                const rb = state.petmoji.pets[b.id].rank || 0;
                return rb - ra || a.name.localeCompare(b.name);
            }
            return order(a.tier) - order(b.tier) || a.name.localeCompare(b.name);
        });

        // Special effect descriptions
        const SPECIAL_DESC = {
            // Rare
            keen_eye: 'Small chance to duplicate Petmoji shard gains while active.',
            momentum: 'Gradually ramps up Ji/sec bonus while active.',
            pouch: 'Occasionally converts merge actions into universal shards.',
            // Epic
            lucky_surge: 'Periodic surge that boosts Ji/sec for a short duration.',
            focus: 'Temporarily increases chance for shard drops on manual merges.',
            collector: 'Higher odds that shards target pets below rank 5.',
            overclock: 'Burst of +5% Ji/sec while active.',
            // Legendary
            royal_decree: 'All passive pet bonuses gain +10% while active.',
            ascendant: 'Shard and emoji core procs are slightly more frequent.',
            arcane_funnel: 'Improves high-tier shard targeting at higher prestiges.'
        };

        list.forEach(def => {
            const ps = state.petmoji.pets[def.id];
            const card = document.createElement('div');
            card.className = 'pet-card';
            const head = document.createElement('div');
            head.className = 'pet-head';
            const left = document.createElement('div');
            left.className = 'pet-left';
            const em = document.createElement('div');
            em.className = 'pet-emoji';
            em.textContent = def.emoji;
            const ttl = document.createElement('div');
            ttl.innerHTML = `<strong>${def.name}</strong><div class="pet-small">Rank ${ps.rank}/${PM_MAX_RANK}</div>`;
            left.appendChild(em);
            left.appendChild(ttl);
            const badge = document.createElement('div');
            badge.className = 'pet-badge ' + def.tier;
            badge.textContent = def.tier;
            head.appendChild(left);
            head.appendChild(badge);
            const passive = PM_PER_RANK[def.tier] * ps.rank;
            const line = document.createElement('div');
            line.className = 'pet-small';
            const spec = (def.special ? ` • Special (active): ${def.special.replace(/\_/g, ' ')}` : '');
            line.textContent = `Passive: +${passive}% Ji (${PM_PER_RANK[def.tier]}%/rank)` + spec;

            // New description line for special effects
            const effectLine = def.special ? (() => {
                const l = document.createElement('div');
                l.className = 'pet-small special-line';
                const code = def.special.replace(/_/g, ' ');
                const desc = SPECIAL_DESC[def.special] || '';
                l.textContent = `Special (active): ${code}${desc ? ' — ' + desc : ''}`;
                return l;
            })() : null;

            const next = fibCost(ps.rank);
            const progWrap = document.createElement('div');
            progWrap.className = 'pet-progress';
            const prog = document.createElement('div');
            prog.style.width = (ps.rank >= PM_MAX_RANK ? 100 : Math.min(100, (ps.shards / next) * 100)) + '%';
            progWrap.appendChild(prog);
            const progText = document.createElement('div');
            progText.className = 'pet-small';
            progText.textContent = (ps.rank >= PM_MAX_RANK) ? 'Max rank' : `Shards ${ps.shards}/${next} to Rank ${ps.rank + 1}`;
            const row = document.createElement('div');
            row.className = 'pet-row';
            const equip = document.createElement('button');
            equip.className = 'pet-btn equip';
            equip.textContent = 'Equip';
            equip.disabled = ps.rank < 1;
            equip.onclick = () => {
                state.petmoji.equippedPetId = def.id;
                renderPetmoji();
                save();
            };
            const apply = document.createElement('button');
            apply.className = 'pet-btn';
            apply.textContent = 'Apply Shards';
            apply.disabled = (ps.shards < 1 || ps.rank >= PM_MAX_RANK);
            apply.onclick = () => {
                autoSpend(def.id);
                renderPetmoji();
                save();
            };
            const useUni = document.createElement('button');
            useUni.className = 'pet-btn';
            useUni.textContent = 'Use Universal';
            useUni.disabled = ((state.petmoji.universalShards || 0) < 1 || ps.rank >= PM_MAX_RANK);
            useUni.onclick = () => {
                if ((state.petmoji.universalShards || 0) > 0) {
                    state.petmoji.universalShards--;
                    ps.shards++;
                    autoSpend(def.id);
                    renderPetmoji();
                    save();
                }
            };
            row.appendChild(equip);
            row.appendChild(apply);
            row.appendChild(useUni);
            card.appendChild(head);
            card.appendChild(line);
            if (effectLine)
                card.appendChild(effectLine);
            card.appendChild(progWrap);
            card.appendChild(progText);
            card.appendChild(row);
            grid.appendChild(card);
        });

        // Append unlock notes at the end
        if (showEpicNote) {
            const ph = document.createElement('div');
            ph.className = 'banner';
            ph.textContent = 'Epic Petmoji unlock at Prestige 25';
            grid.appendChild(ph);
        }
        if (showLegendNote) {
            const ph = document.createElement('div');
            ph.className = 'banner';
            ph.textContent = 'Legendary Petmoji unlock at Prestige 50';
            grid.appendChild(ph);
        }

    };
})();
