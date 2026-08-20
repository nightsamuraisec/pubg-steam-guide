/** Weapon origin, ammo, slots, combat stats and practical tips (PUBG Steam). */
window.WEAPON_GUIDE = {
  // rpm ≈ rounds/min; mode: auto|burst|semi|bolt|pump|lever|special|melee
  AKM: { country: "ru", type: "ar", ammo: "7.62mm", slots: 3, tier: "A", tip: "akmTip", dmg: 49, range: "mid", rpm: 600, mode: "auto", mag: 30 },
  M416: { country: "de", type: "ar", ammo: "5.56mm", slots: 5, tier: "S", tip: "m416Tip", dmg: 41, range: "mid", rpm: 700, mode: "auto", mag: 30 },
  "SCAR-L": { country: "be", type: "ar", ammo: "5.56mm", slots: 4, tier: "A", tip: "scarTip", dmg: 41, range: "mid", rpm: 650, mode: "auto", mag: 30 },
  "Beryl M762": { country: "pl", type: "ar", ammo: "7.62mm", slots: 4, tier: "S", tip: "berylTip", dmg: 47, range: "mid", rpm: 700, mode: "auto", mag: 30 },
  AUG: { country: "at", type: "ar", ammo: "5.56mm", slots: 3, tier: "S", tip: "augTip", dmg: 41, range: "mid", rpm: 700, mode: "auto", mag: 30 },
  Groza: { country: "ru", type: "ar", ammo: "7.62mm", slots: 3, tier: "S", tip: "grozaTip", dmg: 49, range: "mid", rpm: 750, mode: "auto", mag: 30 },
  G36C: { country: "de", type: "ar", ammo: "5.56mm", slots: 4, tier: "A", tip: "g36Tip", dmg: 41, range: "mid", rpm: 700, mode: "auto", mag: 30 },
  M16A4: { country: "us", type: "ar", ammo: "5.56mm", slots: 4, tier: "B", tip: "m16Tip", dmg: 41, range: "mid", rpm: 700, mode: "burst", mag: 30 },
  ACE32: { country: "il", type: "ar", ammo: "7.62mm", slots: 5, tier: "A", tip: "aceTip", dmg: 43, range: "mid", rpm: 700, mode: "auto", mag: 30 },
  Mk47: { country: "us", type: "ar", ammo: "7.62mm", slots: 5, tier: "A", tip: "mk47Tip", dmg: 49, range: "mid", rpm: 600, mode: "auto", mag: 20 },
  QBZ: { country: "cn", type: "ar", ammo: "5.56mm", slots: 4, tier: "A", tip: "qbzTip", dmg: 41, range: "mid", rpm: 700, mode: "auto", mag: 30 },
  FAMAS: { country: "fr", type: "ar", ammo: "5.56mm", slots: 3, tier: "A", tip: "famasTip", dmg: 39, range: "mid", rpm: 1000, mode: "burst", mag: 25 },
  K2: { country: "kr", type: "ar", ammo: "5.56mm", slots: 4, tier: "A", tip: "k2Tip", dmg: 41, range: "mid", rpm: 700, mode: "auto", mag: 30 },

  Kar98k: { country: "de", type: "sr", ammo: "7.62mm", slots: 3, tier: "A", tip: "k98Tip", dmg: 79, range: "long", rpm: 36, mode: "bolt", mag: 5 },
  M24: { country: "us", type: "sr", ammo: "7.62mm", slots: 4, tier: "S", tip: "m24Tip", dmg: 79, range: "long", rpm: 40, mode: "bolt", mag: 5 },
  AWM: { country: "uk", type: "sr", ammo: ".300 Magnum", slots: 4, tier: "S", tip: "awmTip", dmg: 105, range: "long", rpm: 35, mode: "bolt", mag: 5 },
  Mosin: { country: "ru", type: "sr", ammo: "7.62mm", slots: 3, tier: "A", tip: "mosinTip", dmg: 79, range: "long", rpm: 36, mode: "bolt", mag: 5 },
  Win94: { country: "us", type: "sr", ammo: ".45 ACP", slots: 2, tier: "C", tip: "win94Tip", dmg: 66, range: "mid", rpm: 60, mode: "lever", mag: 8 },
  "Lynx AMR": { country: "hu", type: "sr", ammo: ".50", slots: 0, tier: "S", tip: "lynxTip", dmg: 150, range: "long", rpm: 30, mode: "semi", mag: 10 },

  SKS: { country: "ru", type: "dmr", ammo: "7.62mm", slots: 5, tier: "A", tip: "sksTip", dmg: 55, range: "long", rpm: 650, mode: "semi", mag: 10 },
  Mini14: { country: "us", type: "dmr", ammo: "5.56mm", slots: 3, tier: "A", tip: "miniTip", dmg: 46, range: "long", rpm: 700, mode: "semi", mag: 20 },
  SLR: { country: "uk", type: "dmr", ammo: "7.62mm", slots: 4, tier: "S", tip: "slrTip", dmg: 56, range: "long", rpm: 650, mode: "semi", mag: 10 },
  VSS: { country: "ru", type: "dmr", ammo: "9mm", slots: 2, tier: "B", tip: "vssTip", dmg: 41, range: "mid", rpm: 700, mode: "auto", mag: 10 },
  Dragunov: { country: "ru", type: "dmr", ammo: "7.62mm", slots: 4, tier: "A", tip: "svdTip", dmg: 60, range: "long", rpm: 600, mode: "semi", mag: 10 },
  Mk12: { country: "us", type: "dmr", ammo: "5.56mm", slots: 4, tier: "A", tip: "mk12Tip", dmg: 48, range: "long", rpm: 700, mode: "semi", mag: 20 },
  Mk14: { country: "us", type: "dmr", ammo: "7.62mm", slots: 4, tier: "S", tip: "mk14Tip", dmg: 61, range: "long", rpm: 750, mode: "auto", mag: 20 },

  UZI: { country: "il", type: "smg", ammo: "9mm", slots: 4, tier: "B", tip: "uziTip", dmg: 25, range: "cqc", rpm: 700, mode: "auto", mag: 25 },
  Vector: { country: "us", type: "smg", ammo: "9mm", slots: 5, tier: "S", tip: "vectorTip", dmg: 31, range: "cqc", rpm: 1100, mode: "auto", mag: 19 },
  UMP45: { country: "de", type: "smg", ammo: ".45 ACP", slots: 4, tier: "A", tip: "umpTip", dmg: 39, range: "cqc", rpm: 670, mode: "auto", mag: 25 },
  Bizon: { country: "ru", type: "smg", ammo: "9mm", slots: 2, tier: "B", tip: "bizonTip", dmg: 35, range: "cqc", rpm: 680, mode: "auto", mag: 53 },
  MP5K: { country: "de", type: "smg", ammo: "9mm", slots: 5, tier: "A", tip: "mp5Tip", dmg: 33, range: "cqc", rpm: 900, mode: "auto", mag: 30 },
  P90: { country: "be", type: "smg", ammo: "5.7mm", slots: 2, tier: "S", tip: "p90Tip", dmg: 36, range: "cqc", rpm: 1000, mode: "auto", mag: 50 },
  "Tommy Gun": { country: "us", type: "smg", ammo: ".45 ACP", slots: 2, tier: "B", tip: "tommyTip", dmg: 40, range: "cqc", rpm: 700, mode: "auto", mag: 30 },
  MP9: { country: "ch", type: "smg", ammo: "9mm", slots: 3, tier: "A", tip: "mp9Tip", dmg: 31, range: "cqc", rpm: 900, mode: "auto", mag: 30 },
  JS9: { country: "cn", type: "smg", ammo: "9mm", slots: 3, tier: "A", tip: "js9Tip", dmg: 34, range: "cqc", rpm: 750, mode: "auto", mag: 30 },

  S1897: { country: "us", type: "sg", ammo: "12 Gauge", slots: 2, tier: "B", tip: "s1897Tip", dmg: 216, range: "cqc", rpm: 60, mode: "pump", mag: 5 },
  S12K: { country: "ru", type: "sg", ammo: "12 Gauge", slots: 4, tier: "A", tip: "s12Tip", dmg: 198, range: "cqc", rpm: 240, mode: "auto", mag: 5 },
  DBS: { country: "us", type: "sg", ammo: "12 Gauge", slots: 2, tier: "A", tip: "dbsTip", dmg: 216, range: "cqc", rpm: 120, mode: "semi", mag: 2 },
  O12: { country: "it", type: "sg", ammo: "12 Gauge", slots: 4, tier: "A", tip: "o12Tip", dmg: 25, range: "cqc", rpm: 450, mode: "auto", mag: 20 },
  S686: { country: "it", type: "sg", ammo: "12 Gauge", slots: 1, tier: "B", tip: "s686Tip", dmg: 216, range: "cqc", rpm: 120, mode: "semi", mag: 2 },
  "Sawed-off": { country: "us", type: "sg", ammo: "12 Gauge", slots: 0, tier: "C", tip: "sawedTip", dmg: 160, range: "cqc", rpm: 100, mode: "semi", mag: 2 },

  "DP-28": { country: "ru", type: "lmg", ammo: "7.62mm", slots: 1, tier: "B", tip: "dpTip", dmg: 51, range: "mid", rpm: 550, mode: "auto", mag: 47 },
  M249: { country: "us", type: "lmg", ammo: "5.56mm", slots: 4, tier: "A", tip: "m249Tip", dmg: 44, range: "mid", rpm: 700, mode: "auto", mag: 75 },
  MG3: { country: "de", type: "lmg", ammo: "7.62mm", slots: 3, tier: "S", tip: "mg3Tip", dmg: 42, range: "mid", rpm: 1000, mode: "auto", mag: 75 },
  RPD: { country: "ru", type: "lmg", ammo: "7.62mm", slots: 3, tier: "A", tip: "rpdTip", dmg: 48, range: "mid", rpm: 650, mode: "auto", mag: 100 },

  P92: { country: "it", type: "pistol", ammo: "9mm", slots: 2, tier: "C", tip: "pistolTip", dmg: 34, range: "cqc", rpm: 420, mode: "semi", mag: 15 },
  P1911: { country: "us", type: "pistol", ammo: ".45 ACP", slots: 2, tier: "C", tip: "pistolTip", dmg: 41, range: "cqc", rpm: 420, mode: "semi", mag: 7 },
  Deagle: { country: "us", type: "pistol", ammo: ".45 ACP", slots: 2, tier: "B", tip: "deagleTip", dmg: 62, range: "cqc", rpm: 240, mode: "semi", mag: 7 },
  Skorpion: { country: "cz", type: "pistol", ammo: "9mm", slots: 2, tier: "B", tip: "skorpTip", dmg: 22, range: "cqc", rpm: 850, mode: "auto", mag: 20 },
  P18C: { country: "at", type: "pistol", ammo: "9mm", slots: 2, tier: "B", tip: "p18cTip", dmg: 23, range: "cqc", rpm: 750, mode: "auto", mag: 17 },
  R1895: { country: "ru", type: "pistol", ammo: "7.62mm", slots: 1, tier: "C", tip: "r1895Tip", dmg: 55, range: "cqc", rpm: 150, mode: "semi", mag: 7 },
  "Flare Gun": { country: "us", type: "special", ammo: "Flare", slots: 0, tier: "S", tip: "flareTip", dmg: 0, range: "long", rpm: 20, mode: "special", mag: 1 },
  Crossbow: { country: "cn", type: "special", ammo: "Bolt", slots: 3, tier: "B", tip: "xbowTip", dmg: 105, range: "mid", rpm: 25, mode: "special", mag: 1 },
  M79: { country: "us", type: "special", ammo: "40mm", slots: 0, tier: "A", tip: "m79Tip", dmg: 100, range: "mid", rpm: 20, mode: "special", mag: 1 },
  Mortar: { country: "generic", type: "special", ammo: "Mortar Shell", slots: 0, tier: "A", tip: "mortarTip", dmg: 120, range: "long", rpm: 10, mode: "special", mag: 1 },
  Panzerfaust: { country: "de", type: "special", ammo: "Rocket", slots: 0, tier: "S", tip: "panzerTip", dmg: 200, range: "mid", rpm: 15, mode: "special", mag: 1 },
  "Stun Gun": { country: "generic", type: "special", ammo: "-", slots: 0, tier: "B", tip: "stunGunTip", dmg: 1, range: "cqc", rpm: 30, mode: "special", mag: 1 },
  Pan: { country: "kr", type: "melee", ammo: "-", slots: 0, tier: "A", tip: "panTip", dmg: 80, range: "cqc", rpm: 0, mode: "melee", mag: 0 },
  Machete: { country: "generic", type: "melee", ammo: "-", slots: 0, tier: "C", tip: "meleeTip", dmg: 60, range: "cqc", rpm: 0, mode: "melee", mag: 0 },
  Crowbar: { country: "generic", type: "melee", ammo: "-", slots: 0, tier: "C", tip: "meleeTip", dmg: 60, range: "cqc", rpm: 0, mode: "melee", mag: 0 },
  Sickle: { country: "generic", type: "melee", ammo: "-", slots: 0, tier: "C", tip: "meleeTip", dmg: 60, range: "cqc", rpm: 0, mode: "melee", mag: 0 },
  Pickaxe: { country: "generic", type: "melee", ammo: "-", slots: 0, tier: "C", tip: "meleeTip", dmg: 60, range: "cqc", rpm: 0, mode: "melee", mag: 0 },
};

window.WEAPON_TYPE_ORDER = ["ar", "dmr", "sr", "smg", "sg", "lmg", "pistol", "special", "melee"];

/**
 * Attachment effects (approximate community / wiki values).
 * effects: [{ k: i18n key under attachStat, v: display value }]
 */
window.ATTACH_GUIDE = {
  Compensator: {
    slot: "muzzle",
    effects: [
      { k: "vertRecoil", v: "-15%" },
      { k: "horizRecoil", v: "-10%" },
      { k: "pattern", v: "-25%" },
      { k: "spread", v: "-10%" },
    ],
  },
  "Flash Hider": {
    slot: "muzzle",
    effects: [
      { k: "horizRecoil", v: "-10%" },
      { k: "flashHide", v: "✓" },
    ],
  },
  Suppressor: {
    slot: "muzzle",
    effects: [
      { k: "silent", v: "✓" },
      { k: "muzzleFlash", v: "off" },
      { k: "bulletSpeed", v: "−" },
    ],
  },
  Choke: {
    slot: "muzzle",
    effects: [
      { k: "pelletSpread", v: "-25%" },
      { k: "sgTight", v: "✓" },
    ],
  },
  "Vertical Grip": {
    slot: "grip",
    effects: [
      { k: "vertRecoil", v: "-15%" },
      { k: "pattern", v: "-20%" },
    ],
  },
  "Angled Grip": {
    slot: "grip",
    effects: [
      { k: "horizRecoil", v: "-20%" },
      { k: "adsSpeed", v: "+" },
    ],
  },
  "Half Grip": {
    slot: "grip",
    effects: [
      { k: "vertRecoil", v: "-20%" },
      { k: "horizRecoil", v: "-20%" },
      { k: "recoilRecovery", v: "−" },
    ],
  },
  "Thumb Grip": {
    slot: "grip",
    effects: [
      { k: "vertRecoil", v: "-10%" },
      { k: "horizRecoil", v: "-15%" },
      { k: "adsSpeed", v: "+" },
    ],
  },
  "Light Grip": {
    slot: "grip",
    effects: [
      { k: "firstShot", v: "-20%" },
      { k: "recoilRecovery", v: "+" },
      { k: "vertRecoil", v: "+10%" },
    ],
  },
  "Laser Sight": {
    slot: "grip",
    effects: [
      { k: "hipfire", v: "+" },
      { k: "adsSpeed", v: "+" },
    ],
  },
  "Extended Mag": {
    slot: "mag",
    effects: [{ k: "magSize", v: "+" }],
  },
  "Quickdraw Mag": {
    slot: "mag",
    effects: [{ k: "reload", v: "+" }],
  },
  "Ext. Quickdraw Mag": {
    slot: "mag",
    effects: [
      { k: "magSize", v: "+" },
      { k: "reload", v: "+" },
    ],
  },
  "Tactical Stock": {
    slot: "stock",
    effects: [
      { k: "recoilAnim", v: "−" },
      { k: "stability", v: "+" },
    ],
  },
  "Cheek Pad": {
    slot: "stock",
    effects: [
      { k: "recoilAnim", v: "−" },
      { k: "sway", v: "−" },
    ],
  },
  "Bullet Loops": {
    slot: "stock",
    effects: [{ k: "reload", v: "+" }],
  },
  Quiver: {
    slot: "stock",
    effects: [{ k: "reload", v: "+" }],
  },
  "Red Dot": {
    slot: "optic",
    effects: [
      { k: "adsClarity", v: "1×" },
      { k: "cqcAim", v: "✓" },
    ],
  },
  Holo: {
    slot: "optic",
    effects: [
      { k: "adsClarity", v: "1×" },
      { k: "cqcAim", v: "✓" },
    ],
  },
  "Canted Sight": {
    slot: "optic",
    effects: [{ k: "cantedSwap", v: "✓" }],
  },
  "2x Scope": { slot: "optic", effects: [{ k: "zoom", v: "2×" }] },
  "3x Scope": { slot: "optic", effects: [{ k: "zoom", v: "3×" }] },
  "4x Scope": { slot: "optic", effects: [{ k: "zoom", v: "4×" }] },
  "6x Scope": {
    slot: "optic",
    effects: [
      { k: "zoom", v: "3–6×" },
      { k: "variableZoom", v: "✓" },
    ],
  },
  "8x Scope": { slot: "optic", effects: [{ k: "zoom", v: "8×" }] },
  "15x Scope": { slot: "optic", effects: [{ k: "zoom", v: "15×" }] },
};

window.WEAPON_BEST_KITS = {
  AKM: ["Compensator", "Ext. Quickdraw Mag", "3x Scope"],
  M416: ["Compensator", "Vertical Grip", "Ext. Quickdraw Mag", "Tactical Stock", "3x Scope"],
  "SCAR-L": ["Compensator", "Vertical Grip", "Ext. Quickdraw Mag", "3x Scope"],
  "Beryl M762": ["Compensator", "Half Grip", "Ext. Quickdraw Mag", "3x Scope"],
  AUG: ["Compensator", "Ext. Quickdraw Mag", "3x Scope"],
  Groza: ["Compensator", "Ext. Quickdraw Mag", "3x Scope"],
  G36C: ["Compensator", "Vertical Grip", "Ext. Quickdraw Mag", "3x Scope"],
  M16A4: ["Compensator", "Ext. Quickdraw Mag", "4x Scope"],
  ACE32: ["Compensator", "Vertical Grip", "Ext. Quickdraw Mag", "Tactical Stock", "3x Scope"],
  Mk47: ["Compensator", "Vertical Grip", "Ext. Quickdraw Mag", "Tactical Stock", "3x Scope"],
  QBZ: ["Compensator", "Vertical Grip", "Ext. Quickdraw Mag", "3x Scope"],
  FAMAS: ["Compensator", "Ext. Quickdraw Mag", "3x Scope"],
  SKS: ["Compensator", "Vertical Grip", "Ext. Quickdraw Mag", "Cheek Pad", "6x Scope"],
  Mini14: ["Compensator", "Ext. Quickdraw Mag", "6x Scope"],
  SLR: ["Compensator", "Ext. Quickdraw Mag", "Cheek Pad", "6x Scope"],
  VSS: ["Ext. Quickdraw Mag", "6x Scope"],
  Dragunov: ["Compensator", "Ext. Quickdraw Mag", "Cheek Pad", "6x Scope"],
  Kar98k: ["Suppressor", "Cheek Pad", "8x Scope"],
  M24: ["Suppressor", "Ext. Quickdraw Mag", "Cheek Pad", "8x Scope"],
  AWM: ["Suppressor", "Ext. Quickdraw Mag", "Cheek Pad", "8x Scope"],
  Mosin: ["Suppressor", "Cheek Pad", "8x Scope"],
  Win94: ["Bullet Loops", "2x Scope"],
  UZI: ["Compensator", "Ext. Quickdraw Mag", "Tactical Stock", "Red Dot"],
  Vector: ["Compensator", "Vertical Grip", "Ext. Quickdraw Mag", "Tactical Stock", "Red Dot"],
  UMP45: ["Compensator", "Vertical Grip", "Ext. Quickdraw Mag", "Red Dot"],
  Bizon: ["Compensator", "Red Dot"],
  MP5K: ["Compensator", "Vertical Grip", "Ext. Quickdraw Mag", "Tactical Stock", "Red Dot"],
  P90: ["Compensator", "Red Dot"],
  S1897: ["Choke", "Bullet Loops"],
  S12K: ["Choke", "Ext. Quickdraw Mag", "Red Dot"],
  DBS: ["Choke", "Red Dot"],
  O12: ["Compensator", "Ext. Quickdraw Mag", "Red Dot"],
  "DP-28": ["3x Scope"],
  M249: ["Compensator", "Ext. Quickdraw Mag", "Tactical Stock", "3x Scope"],
  MG3: ["Compensator", "Ext. Quickdraw Mag", "3x Scope"],
  RPD: ["Compensator", "Ext. Quickdraw Mag", "3x Scope"],
  Crossbow: ["Quiver", "4x Scope"],
};

window.ATTACH_TIER = {
  muzzleBest: "Compensator",
  muzzleSilent: "Suppressor",
  gripBest: "Vertical Grip",
  gripSpray: "Half Grip",
  magBest: "Ext. Quickdraw Mag",
  stockBest: "Tactical Stock",
  opticMid: "3x Scope",
  opticLong: "6x Scope",
};
