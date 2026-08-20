/**
 * Compatible attachments per weapon (PUBG Steam-oriented).
 * Uses the app's simplified attachment names.
 */
(() => {
  const OPTICS_AR = [
    "Red Dot",
    "Holo",
    "Canted Sight",
    "2x Scope",
    "3x Scope",
    "4x Scope",
    "6x Scope",
  ];
  const OPTICS_LONG = [...OPTICS_AR, "8x Scope", "15x Scope"];
  const OPTICS_SMG = ["Red Dot", "Holo", "Canted Sight", "2x Scope", "3x Scope", "4x Scope", "6x Scope"];
  const OPTICS_SG = ["Red Dot", "Holo", "Canted Sight", "2x Scope", "3x Scope", "4x Scope"];
  const OPTICS_PISTOL = ["Red Dot", "Holo"];
  const OPTICS_XBOW = ["Red Dot", "Holo", "2x Scope", "4x Scope"];

  const GRIPS = ["Vertical Grip", "Angled Grip", "Thumb Grip", "Half Grip", "Light Grip", "Laser Sight"];
  const MUZZLE_AR = ["Compensator", "Flash Hider", "Suppressor"];
  const MUZZLE_SMG = ["Compensator", "Flash Hider", "Suppressor"];
  const MUZZLE_SG = ["Choke", "Compensator", "Flash Hider", "Suppressor"];
  const MUZZLE_SR = ["Compensator", "Flash Hider", "Suppressor"];
  const MAG = ["Extended Mag", "Quickdraw Mag", "Ext. Quickdraw Mag"];
  const STOCK_TAC = ["Tactical Stock"];
  const STOCK_SR = ["Cheek Pad", "Bullet Loops"];
  const STOCK_SG = ["Bullet Loops"];

  const uniq = (arr) => [...new Set(arr)];

  const map = {
    // AR
    AKM: uniq([...MUZZLE_AR, ...MAG, ...OPTICS_AR]),
    M416: uniq([...MUZZLE_AR, ...MAG, ...OPTICS_AR, ...GRIPS, ...STOCK_TAC]),
    "SCAR-L": uniq([...MUZZLE_AR, ...MAG, ...OPTICS_AR, ...GRIPS]),
    "Beryl M762": uniq([...MUZZLE_AR, ...MAG, ...OPTICS_AR, ...GRIPS]),
    AUG: uniq([...MUZZLE_AR, ...MAG, ...OPTICS_AR]),
    Groza: uniq([...MUZZLE_AR, ...MAG, ...OPTICS_AR]),
    G36C: uniq([...MUZZLE_AR, ...MAG, ...OPTICS_AR, ...GRIPS]),
    M16A4: uniq([...MUZZLE_AR, ...MAG, ...OPTICS_AR, ...GRIPS]),
    ACE32: uniq([...MUZZLE_AR, ...MAG, ...OPTICS_AR, ...GRIPS, ...STOCK_TAC]),
    Mk47: uniq([...MUZZLE_AR, ...MAG, ...OPTICS_AR, ...GRIPS, ...STOCK_TAC]),
    QBZ: uniq([...MUZZLE_AR, ...MAG, ...OPTICS_AR, ...GRIPS]),
    FAMAS: uniq([...MUZZLE_AR, ...MAG, ...OPTICS_AR]),
    K2: uniq([...MUZZLE_AR, ...MAG, ...OPTICS_AR, ...GRIPS]),

    // DMR
    SKS: uniq([...MUZZLE_SR, ...MAG, ...OPTICS_LONG, "Cheek Pad", ...GRIPS.filter((g) => g !== "Laser Sight"), "Laser Sight"]),
    Mini14: uniq([...MUZZLE_SR, ...MAG, ...OPTICS_LONG]),
    SLR: uniq([...MUZZLE_SR, ...MAG, ...OPTICS_LONG, "Cheek Pad"]),
    VSS: uniq([...MAG, ...OPTICS_LONG]),
    Dragunov: uniq([...MUZZLE_SR, ...MAG, ...OPTICS_LONG, "Cheek Pad"]),
    Mk12: uniq([...MUZZLE_SR, ...MAG, ...OPTICS_LONG, ...GRIPS.filter((g) => g !== "Laser Sight")]),
    Mk14: uniq([...MUZZLE_SR, ...MAG, ...OPTICS_LONG, "Cheek Pad"]),

    // SR
    Kar98k: uniq([...MUZZLE_SR, ...OPTICS_LONG, ...STOCK_SR]),
    M24: uniq([...MUZZLE_SR, ...MAG, ...OPTICS_LONG, "Cheek Pad"]),
    AWM: uniq([...MUZZLE_SR, ...MAG, ...OPTICS_LONG, "Cheek Pad"]),
    Mosin: uniq([...MUZZLE_SR, ...OPTICS_LONG, ...STOCK_SR]),
    Win94: uniq(["Bullet Loops", "Red Dot", "Holo", "2x Scope", "4x Scope"]),
    "Lynx AMR": [],

    // SMG
    UZI: uniq([...MUZZLE_SMG, ...MAG, ...OPTICS_SMG, ...STOCK_TAC]),
    Vector: uniq([...MUZZLE_SMG, ...MAG, ...OPTICS_SMG, ...GRIPS, ...STOCK_TAC]),
    UMP45: uniq([...MUZZLE_SMG, ...MAG, ...OPTICS_SMG, ...GRIPS]),
    Bizon: uniq([...MUZZLE_SMG, ...OPTICS_SMG]),
    MP5K: uniq([...MUZZLE_SMG, ...MAG, ...OPTICS_SMG, ...GRIPS, ...STOCK_TAC]),
    P90: uniq([...MUZZLE_SMG, ...OPTICS_SMG]),
    "Tommy Gun": uniq([...MUZZLE_SMG, ...MAG, ...OPTICS_SMG]),
    MP9: uniq([...MUZZLE_SMG, ...MAG, ...OPTICS_SMG]),
    JS9: uniq([...MUZZLE_SMG, ...MAG, ...OPTICS_SMG]),

    // Shotgun
    S1897: uniq(["Choke", ...STOCK_SG]),
    S12K: uniq([...MUZZLE_AR, ...MAG, ...OPTICS_SG, "Choke"]),
    DBS: uniq(["Choke", ...OPTICS_SG]),
    O12: uniq([...MUZZLE_AR, ...OPTICS_SG, ...MAG]),
    S686: uniq(["Choke"]),
    "Sawed-off": [],

    // LMG
    "DP-28": uniq([...OPTICS_AR]),
    M249: uniq([...MUZZLE_AR, ...MAG, ...OPTICS_AR, ...STOCK_TAC]),
    MG3: uniq([...MUZZLE_AR, ...MAG, ...OPTICS_AR]),
    RPD: uniq([...MUZZLE_AR, ...MAG, ...OPTICS_AR]),

    // Pistol
    P92: uniq(["Suppressor", ...MAG, ...OPTICS_PISTOL]),
    P1911: uniq(["Suppressor", ...MAG, ...OPTICS_PISTOL]),
    Deagle: uniq(["Suppressor", ...MAG, ...OPTICS_PISTOL]),
    Skorpion: uniq(["Suppressor", ...MAG, ...OPTICS_PISTOL, ...STOCK_TAC]),
    P18C: uniq(["Suppressor", ...MAG, ...OPTICS_PISTOL]),
    R1895: uniq(["Suppressor"]),
    "Flare Gun": [],

    // Other
    Crossbow: uniq([...OPTICS_XBOW, "Quiver"]),
    M79: [],
    Mortar: [],
    Panzerfaust: [],
    "Stun Gun": [],
    Pan: [],
    Machete: [],
    Crowbar: [],
    Sickle: [],
    Pickaxe: [],
  };

  window.WEAPON_ATTACHMENTS = map;

  window.getCompatibleAttachments = function getCompatibleAttachments(weaponId) {
    return map[weaponId] ? [...map[weaponId]] : [];
  };
})();
