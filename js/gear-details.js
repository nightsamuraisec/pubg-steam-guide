/**
 * Extra combat detail for weapons & attachments (local approximate guide values).
 * Merges into WEAPON_GUIDE / ATTACH_GUIDE — no network.
 */
(() => {
  const W = window.WEAPON_GUIDE || {};
  const A = window.ATTACH_GUIDE || {};

  /** Shared detail patch: headDmg, speed m/s, recoil/control 1–5, effRange m, reload s, hits (≈ L2 vest body) */
  const weaponExtra = {
    AKM: { headDmg: 115, speed: 715, recoil: 4, control: 2, effRange: 100, reload: 2.9, hits: 4, sound: "loud", role: "powerAr" },
    M416: { headDmg: 96, speed: 880, recoil: 2, control: 5, effRange: 120, reload: 2.2, hits: 5, sound: "loud", role: "flexAr" },
    "SCAR-L": { headDmg: 96, speed: 870, recoil: 2, control: 4, effRange: 110, reload: 2.3, hits: 5, sound: "loud", role: "stableAr" },
    "Beryl M762": { headDmg: 110, speed: 780, recoil: 5, control: 3, effRange: 110, reload: 2.5, hits: 4, sound: "loud", role: "sprayAr" },
    AUG: { headDmg: 96, speed: 940, recoil: 2, control: 5, effRange: 130, reload: 2.4, hits: 5, sound: "loud", role: "crateAr" },
    Groza: { headDmg: 115, speed: 715, recoil: 3, control: 4, effRange: 100, reload: 2.8, hits: 4, sound: "loud", role: "crateAr" },
    G36C: { headDmg: 96, speed: 880, recoil: 2, control: 4, effRange: 110, reload: 2.3, hits: 5, sound: "loud", role: "flexAr" },
    M16A4: { headDmg: 96, speed: 900, recoil: 2, control: 4, effRange: 140, reload: 2.3, hits: 5, sound: "loud", role: "tapAr" },
    ACE32: { headDmg: 101, speed: 800, recoil: 3, control: 4, effRange: 120, reload: 2.4, hits: 4, sound: "loud", role: "flexAr" },
    Mk47: { headDmg: 115, speed: 760, recoil: 3, control: 4, effRange: 130, reload: 2.6, hits: 4, sound: "loud", role: "tapAr" },
    QBZ: { headDmg: 96, speed: 870, recoil: 2, control: 4, effRange: 110, reload: 2.3, hits: 5, sound: "loud", role: "flexAr" },
    FAMAS: { headDmg: 92, speed: 900, recoil: 3, control: 3, effRange: 90, reload: 2.5, hits: 5, sound: "loud", role: "burstAr" },
    K2: { headDmg: 96, speed: 880, recoil: 2, control: 4, effRange: 110, reload: 2.3, hits: 5, sound: "loud", role: "flexAr" },

    Kar98k: { headDmg: 197, speed: 760, recoil: 3, control: 3, effRange: 300, reload: 4.0, hits: 2, sound: "loud", role: "boltSr" },
    M24: { headDmg: 197, speed: 790, recoil: 3, control: 4, effRange: 350, reload: 4.2, hits: 2, sound: "loud", role: "boltSr" },
    AWM: { headDmg: 262, speed: 910, recoil: 4, control: 3, effRange: 400, reload: 4.5, hits: 1, sound: "loud", role: "crateSr" },
    Mosin: { headDmg: 197, speed: 760, recoil: 3, control: 3, effRange: 300, reload: 4.0, hits: 2, sound: "loud", role: "boltSr" },
    Win94: { headDmg: 155, speed: 760, recoil: 2, control: 3, effRange: 150, reload: 3.5, hits: 2, sound: "loud", role: "leverSr" },
    "Lynx AMR": { headDmg: 350, speed: 900, recoil: 5, control: 2, effRange: 450, reload: 5.0, hits: 1, sound: "loud", role: "crateSr" },

    SKS: { headDmg: 129, speed: 800, recoil: 4, control: 3, effRange: 250, reload: 2.8, hits: 3, sound: "loud", role: "dmr" },
    Mini14: { headDmg: 108, speed: 990, recoil: 2, control: 4, effRange: 280, reload: 2.6, hits: 3, sound: "loud", role: "dmrFast" },
    SLR: { headDmg: 131, speed: 840, recoil: 4, control: 3, effRange: 280, reload: 2.9, hits: 3, sound: "loud", role: "dmr" },
    VSS: { headDmg: 96, speed: 330, recoil: 1, control: 4, effRange: 100, reload: 2.5, hits: 5, sound: "quiet", role: "silentDmr" },
    Dragunov: { headDmg: 141, speed: 830, recoil: 4, control: 3, effRange: 300, reload: 2.9, hits: 3, sound: "loud", role: "dmr" },
    Mk12: { headDmg: 112, speed: 940, recoil: 2, control: 4, effRange: 280, reload: 2.5, hits: 3, sound: "loud", role: "dmrFast" },
    Mk14: { headDmg: 143, speed: 850, recoil: 4, control: 3, effRange: 300, reload: 3.2, hits: 3, sound: "loud", role: "crateDmr" },

    UZI: { headDmg: 59, speed: 350, recoil: 2, control: 4, effRange: 40, reload: 2.0, hits: 7, sound: "loud", role: "cqcSmg" },
    Vector: { headDmg: 73, speed: 350, recoil: 3, control: 4, effRange: 50, reload: 2.1, hits: 6, sound: "loud", role: "cqcSmg" },
    UMP45: { headDmg: 92, speed: 400, recoil: 2, control: 5, effRange: 70, reload: 2.3, hits: 5, sound: "loud", role: "flexSmg" },
    Bizon: { headDmg: 82, speed: 380, recoil: 2, control: 4, effRange: 60, reload: 2.8, hits: 6, sound: "loud", role: "magSmg" },
    MP5K: { headDmg: 78, speed: 400, recoil: 2, control: 5, effRange: 60, reload: 2.2, hits: 6, sound: "loud", role: "flexSmg" },
    P90: { headDmg: 85, speed: 715, recoil: 2, control: 5, effRange: 70, reload: 2.7, hits: 5, sound: "loud", role: "crateSmg" },
    "Tommy Gun": { headDmg: 94, speed: 280, recoil: 3, control: 3, effRange: 50, reload: 2.5, hits: 5, sound: "loud", role: "cqcSmg" },
    MP9: { headDmg: 73, speed: 400, recoil: 2, control: 5, effRange: 55, reload: 2.1, hits: 6, sound: "loud", role: "flexSmg" },
    JS9: { headDmg: 80, speed: 400, recoil: 2, control: 4, effRange: 60, reload: 2.2, hits: 6, sound: "loud", role: "flexSmg" },

    S1897: { headDmg: 216, speed: 360, recoil: 3, control: 3, effRange: 25, reload: 0.6, hits: 1, sound: "loud", role: "pumpSg" },
    S12K: { headDmg: 198, speed: 350, recoil: 4, control: 2, effRange: 30, reload: 2.8, hits: 1, sound: "loud", role: "autoSg" },
    DBS: { headDmg: 216, speed: 370, recoil: 4, control: 3, effRange: 30, reload: 3.0, hits: 1, sound: "loud", role: "dblSg" },
    O12: { headDmg: 59, speed: 400, recoil: 3, control: 3, effRange: 40, reload: 2.5, hits: 6, sound: "loud", role: "slugSg" },
    S686: { headDmg: 216, speed: 370, recoil: 4, control: 3, effRange: 25, reload: 2.5, hits: 1, sound: "loud", role: "dblSg" },
    "Sawed-off": { headDmg: 160, speed: 350, recoil: 4, control: 2, effRange: 15, reload: 2.0, hits: 1, sound: "loud", role: "dblSg" },

    "DP-28": { headDmg: 120, speed: 840, recoil: 3, control: 3, effRange: 150, reload: 4.5, hits: 4, sound: "loud", role: "lmg" },
    M249: { headDmg: 103, speed: 915, recoil: 3, control: 3, effRange: 150, reload: 8.0, hits: 5, sound: "loud", role: "lmg" },
    MG3: { headDmg: 99, speed: 820, recoil: 4, control: 3, effRange: 160, reload: 7.5, hits: 5, sound: "loud", role: "crateLmg" },
    RPD: { headDmg: 112, speed: 735, recoil: 4, control: 4, effRange: 170, reload: 6.2, hits: 5, sound: "loud", role: "lmg" },

    P92: { headDmg: 80, speed: 380, recoil: 1, control: 4, effRange: 30, reload: 1.8, hits: 6, sound: "loud", role: "sidearm" },
    P1911: { headDmg: 96, speed: 250, recoil: 2, control: 3, effRange: 30, reload: 1.9, hits: 5, sound: "loud", role: "sidearm" },
    Deagle: { headDmg: 146, speed: 450, recoil: 4, control: 2, effRange: 50, reload: 2.2, hits: 3, sound: "loud", role: "sidearm" },
    Skorpion: { headDmg: 52, speed: 320, recoil: 2, control: 4, effRange: 25, reload: 2.0, hits: 8, sound: "loud", role: "sidearm" },
    P18C: { headDmg: 54, speed: 375, recoil: 3, control: 3, effRange: 25, reload: 2.0, hits: 8, sound: "loud", role: "sidearm" },
    R1895: { headDmg: 129, speed: 330, recoil: 3, control: 2, effRange: 40, reload: 3.5, hits: 3, sound: "loud", role: "sidearm" },
    "Flare Gun": { headDmg: 0, speed: 80, recoil: 1, control: 5, effRange: 200, reload: 3.0, hits: 0, sound: "loud", role: "utility" },
    Crossbow: { headDmg: 247, speed: 160, recoil: 1, control: 4, effRange: 80, reload: 3.5, hits: 1, sound: "quiet", role: "stealth" },
    M79: { headDmg: 100, speed: 76, recoil: 3, control: 3, effRange: 80, reload: 3.0, hits: 1, sound: "loud", role: "utility" },
    Mortar: { headDmg: 120, speed: 120, recoil: 2, control: 2, effRange: 200, reload: 4.0, hits: 1, sound: "loud", role: "utility" },
    Panzerfaust: { headDmg: 200, speed: 100, recoil: 4, control: 2, effRange: 120, reload: 4.0, hits: 1, sound: "loud", role: "utility" },
    "Stun Gun": { headDmg: 1, speed: 50, recoil: 1, control: 5, effRange: 15, reload: 2.5, hits: 1, sound: "quiet", role: "utility" },
    Pan: { headDmg: 80, speed: 0, recoil: 1, control: 5, effRange: 2, reload: 0, hits: 2, sound: "quiet", role: "melee" },
    Machete: { headDmg: 60, speed: 0, recoil: 1, control: 5, effRange: 2, reload: 0, hits: 3, sound: "quiet", role: "melee" },
    Crowbar: { headDmg: 60, speed: 0, recoil: 1, control: 5, effRange: 2, reload: 0, hits: 3, sound: "quiet", role: "melee" },
    Sickle: { headDmg: 60, speed: 0, recoil: 1, control: 5, effRange: 2, reload: 0, hits: 3, sound: "quiet", role: "melee" },
    Pickaxe: { headDmg: 60, speed: 0, recoil: 1, control: 5, effRange: 2, reload: 0, hits: 3, sound: "quiet", role: "melee" },
  };

  for (const [id, extra] of Object.entries(weaponExtra)) {
    if (!W[id]) continue;
    Object.assign(W[id], extra);
  }

  const attachExtra = {
    Compensator: {
      tip: "compDetail",
      bestFor: "compBest",
      tradeoff: "compTrade",
      effects: [
        { k: "vertRecoil", v: "−15%" },
        { k: "horizRecoil", v: "−10%" },
        { k: "pattern", v: "−25%" },
        { k: "spread", v: "−10%" },
      ],
    },
    "Flash Hider": {
      tip: "flashDetail",
      bestFor: "flashBest",
      tradeoff: "flashTrade",
      effects: [
        { k: "horizRecoil", v: "−10%" },
        { k: "flashHide", v: "✓" },
        { k: "mapReveal", v: "↓" },
      ],
    },
    Suppressor: {
      tip: "suppDetail",
      bestFor: "suppBest",
      tradeoff: "suppTrade",
      effects: [
        { k: "silent", v: "✓" },
        { k: "muzzleFlash", v: "off" },
        { k: "bulletSpeed", v: "−≈10%" },
        { k: "dirReveal", v: "↓" },
      ],
    },
    Choke: {
      tip: "chokeDetail",
      bestFor: "chokeBest",
      tradeoff: "chokeTrade",
      effects: [
        { k: "pelletSpread", v: "−25%" },
        { k: "sgTight", v: "✓" },
        { k: "effRange", v: "+" },
      ],
    },
    "Vertical Grip": {
      tip: "vertDetail",
      bestFor: "vertBest",
      tradeoff: "vertTrade",
      effects: [
        { k: "vertRecoil", v: "−15%" },
        { k: "pattern", v: "−20%" },
      ],
    },
    "Angled Grip": {
      tip: "angDetail",
      bestFor: "angBest",
      tradeoff: "angTrade",
      effects: [
        { k: "horizRecoil", v: "−20%" },
        { k: "adsSpeed", v: "+≈15%" },
      ],
    },
    "Half Grip": {
      tip: "halfDetail",
      bestFor: "halfBest",
      tradeoff: "halfTrade",
      effects: [
        { k: "vertRecoil", v: "−20%" },
        { k: "horizRecoil", v: "−20%" },
        { k: "recoilRecovery", v: "−" },
      ],
    },
    "Thumb Grip": {
      tip: "thumbDetail",
      bestFor: "thumbBest",
      tradeoff: "thumbTrade",
      effects: [
        { k: "vertRecoil", v: "−10%" },
        { k: "horizRecoil", v: "−15%" },
        { k: "adsSpeed", v: "+" },
      ],
    },
    "Light Grip": {
      tip: "lightDetail",
      bestFor: "lightBest",
      tradeoff: "lightTrade",
      effects: [
        { k: "firstShot", v: "−20%" },
        { k: "recoilRecovery", v: "+" },
        { k: "vertRecoil", v: "+10%" },
        { k: "horizRecoil", v: "+10%" },
      ],
    },
    "Laser Sight": {
      tip: "laserDetail",
      bestFor: "laserBest",
      tradeoff: "laserTrade",
      effects: [
        { k: "hipfire", v: "+≈20%" },
        { k: "adsSpeed", v: "+" },
      ],
    },
    "Extended Mag": {
      tip: "extMagDetail",
      bestFor: "extMagBest",
      tradeoff: "extMagTrade",
      effects: [
        { k: "magSize", v: "+10–20" },
        { k: "reload", v: "same" },
      ],
    },
    "Quickdraw Mag": {
      tip: "qdMagDetail",
      bestFor: "qdMagBest",
      tradeoff: "qdMagTrade",
      effects: [
        { k: "reload", v: "+≈30%" },
        { k: "magSize", v: "same" },
      ],
    },
    "Ext. Quickdraw Mag": {
      tip: "exQdDetail",
      bestFor: "exQdBest",
      tradeoff: "exQdTrade",
      effects: [
        { k: "magSize", v: "+10–20" },
        { k: "reload", v: "+≈30%" },
      ],
    },
    "Tactical Stock": {
      tip: "tacStockDetail",
      bestFor: "tacStockBest",
      tradeoff: "tacStockTrade",
      effects: [
        { k: "recoilAnim", v: "−" },
        { k: "stability", v: "+" },
        { k: "adsSpeed", v: "slight+" },
      ],
    },
    "Cheek Pad": {
      tip: "cheekDetail",
      bestFor: "cheekBest",
      tradeoff: "cheekTrade",
      effects: [
        { k: "recoilAnim", v: "−" },
        { k: "sway", v: "−" },
      ],
    },
    "Bullet Loops": {
      tip: "loopsDetail",
      bestFor: "loopsBest",
      tradeoff: "loopsTrade",
      effects: [{ k: "reload", v: "+" }],
    },
    Quiver: {
      tip: "quiverDetail",
      bestFor: "quiverBest",
      tradeoff: "quiverTrade",
      effects: [{ k: "reload", v: "+" }],
    },
    "Red Dot": {
      tip: "redDotDetail",
      bestFor: "redDotBest",
      tradeoff: "redDotTrade",
      effects: [
        { k: "zoom", v: "1×" },
        { k: "cqcAim", v: "✓" },
        { k: "adsClarity", v: "clean" },
      ],
    },
    Holo: {
      tip: "holoDetail",
      bestFor: "holoBest",
      tradeoff: "holoTrade",
      effects: [
        { k: "zoom", v: "1×" },
        { k: "cqcAim", v: "✓" },
        { k: "adsClarity", v: "wide" },
      ],
    },
    "Canted Sight": {
      tip: "cantedDetail",
      bestFor: "cantedBest",
      tradeoff: "cantedTrade",
      effects: [{ k: "cantedSwap", v: "✓" }],
    },
    "2x Scope": {
      tip: "scope2Detail",
      bestFor: "scope2Best",
      tradeoff: "scope2Trade",
      effects: [{ k: "zoom", v: "2×" }],
    },
    "3x Scope": {
      tip: "scope3Detail",
      bestFor: "scope3Best",
      tradeoff: "scope3Trade",
      effects: [{ k: "zoom", v: "3×" }],
    },
    "4x Scope": {
      tip: "scope4Detail",
      bestFor: "scope4Best",
      tradeoff: "scope4Trade",
      effects: [{ k: "zoom", v: "4×" }],
    },
    "6x Scope": {
      tip: "scope6Detail",
      bestFor: "scope6Best",
      tradeoff: "scope6Trade",
      effects: [
        { k: "zoom", v: "3–6×" },
        { k: "variableZoom", v: "✓" },
      ],
    },
    "8x Scope": {
      tip: "scope8Detail",
      bestFor: "scope8Best",
      tradeoff: "scope8Trade",
      effects: [{ k: "zoom", v: "8×" }],
    },
    "15x Scope": {
      tip: "scope15Detail",
      bestFor: "scope15Best",
      tradeoff: "scope15Trade",
      effects: [{ k: "zoom", v: "15×" }],
    },
  };

  for (const [id, extra] of Object.entries(attachExtra)) {
    A[id] = { ...(A[id] || {}), ...extra, slot: (A[id] && A[id].slot) || extra.slot };
  }

  window.WEAPON_GUIDE = W;
  window.ATTACH_GUIDE = A;
})();
