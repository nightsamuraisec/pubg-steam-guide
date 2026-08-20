/**
 * PUBG Steam — care package / world drop guide (local data only).
 * Images: official PUBG item/care-package icons + real Vikendi Lab Camp screenshots.
 */
window.DROPS_GUIDE = {
  filters: ["all", "care", "flare", "vikendi", "world", "missing"],

  /** Weapons that typically come from care packages (airdrop crates). */
  careWeapons: [
    { id: "AWM", ammo: ".300 Magnum", type: "sr", inApp: true, tip: "dropAwm" },
    { id: "AUG", ammo: "5.56mm", type: "ar", inApp: true, tip: "dropAug" },
    { id: "Groza", ammo: "7.62mm", type: "ar", inApp: true, tip: "dropGroza" },
    { id: "Mk14", ammo: "7.62mm", type: "dmr", inApp: true, tip: "dropMk14" },
    { id: "MG3", ammo: "7.62mm", type: "lmg", inApp: true, tip: "dropMg3" },
    { id: "P90", ammo: "5.7mm", type: "smg", inApp: true, tip: "dropP90" },
    { id: "Lynx AMR", ammo: ".50", type: "sr", inApp: true, tip: "dropLynx" },
  ],

  /** Extra loot often found with crate weapons — real in-game item art. */
  careExtras: [
    {
      id: "lvl3Gear",
      title: "extraLvl3",
      tip: "dropLvl3",
      image: "images/equipment/helmet-3.png",
    },
    {
      id: "crateAmmo",
      title: "extraAmmo",
      tip: "dropCrateAmmo",
      image: "images/ammo/300-magnum.png",
    },
    {
      id: "ghillie",
      title: "extraGhillie",
      tip: "dropGhillie",
      image: "images/drops/CarePackage_Open.png",
    },
    {
      id: "meds",
      title: "extraMeds",
      tip: "dropMeds",
      image: "images/health/med-kit.png",
    },
  ],

  flare: {
    caller: "Flare Gun",
    tip: "dropFlareCall",
    notes: ["dropFlareNote1", "dropFlareNote2"],
    image: "images/drops/CarePackage_Flying.png",
  },

  /**
   * Vikendi Lab Camp — clustered colored supply crates (toplu drop).
   * Photos: real in-game Lab Camp / supply-crate screenshots.
   */
  vikendi: {
    title: "vikendiTitle",
    hint: "vikendiHint",
    crates: [
      {
        id: "yellow",
        title: "vikYellow",
        tip: "vikYellowTip",
        image: "images/drops/vikendi-supply-info.jpg",
        lootImage: "images/weapons/m79.webp",
        color: "yellow",
      },
      {
        id: "red",
        title: "vikRed",
        tip: "vikRedTip",
        image: "images/drops/vikendi-lab-crates.jpg",
        lootImage: "images/weapons/awm.png",
        color: "red",
      },
      {
        id: "blue",
        title: "vikBlue",
        tip: "vikBlueTip",
        image: "images/drops/vikendi-alarm.jpg",
        lootImage: "images/attachments/red-dot.png",
        color: "blue",
      },
      {
        id: "bear",
        title: "vikBear",
        tip: "vikBearTip",
        image: "images/drops/CarePackage_Normal.png",
        lootImage: "images/weapons/groza.png",
        color: "bear",
      },
    ],
    notes: ["vikNoteAlarm", "vikNoteKey", "vikNoteGuide"],
  },

  worldNotes: [
    {
      id: "hotDrop",
      title: "worldHot",
      tip: "dropWorldHot",
      image: "images/drops/CarePackage_Flying.png",
    },
    {
      id: "dmrPool",
      title: "worldDmr",
      tip: "dropWorldDmr",
      image: "images/weapons/sks.png",
    },
    {
      id: "boltPool",
      title: "worldBolt",
      tip: "dropWorldBolt",
      image: "images/weapons/kar98k.png",
    },
    {
      id: "smgPool",
      title: "worldSmg",
      tip: "dropWorldSmg",
      image: "images/weapons/vector.png",
    },
    {
      id: "shotPool",
      title: "worldSg",
      tip: "dropWorldSg",
      image: "images/weapons/s12k.png",
    },
    {
      id: "rareWorld",
      title: "worldRare",
      tip: "dropWorldRare",
      image: "images/weapons/g36c.png",
    },
  ],

  missingWeapons: [],
};
