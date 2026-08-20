(() => {
  const STORAGE = {
    items: "pubg-backpack-items",
    level: "pubg-backpack-level",
    vest: "pubg-backpack-vest",
    lang: "pubg-backpack-lang",
    view: "pubg-app-view",
    profiles: "pubg-squad-profiles",
  };

  const TABS = ["Health", "Equipment", "Weapons", "Attachments", "Utility", "Ammo", "Other"];
  const MAX_PROFILES = 6;
  const MAP_ZOOM_MIN = 1;
  const MAP_ZOOM_MAX = 40;

  const PIXEL_ICONS = new Set([
    "Bandage", "First Aid Kit", "Med Kit", "Energy Drink", "Painkiller", "Adrenaline",
    "Frag Grenade", "Smoke Grenade", "Stun Grenade", "Molotov", "BZ Grenade", "C4", "Cover Flare",
    "9mm", ".45 ACP", "5.56mm", "7.62mm", "12 Gauge", ".300 Magnum",
    "E Pickup", "Gas Can", "Bicycle", "Folded Shield", "Cable", "Basement Key", "Security Keycard", "Blue Chip",
  ]);

  function uid() {
    return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  function makeProfile(name, data = {}) {
    return {
      id: data.id || uid(),
      name: name || "P1",
      inventory: data.inventory && typeof data.inventory === "object" ? { ...data.inventory } : {},
      level: [1, 2, 3].includes(data.level) ? data.level : 3,
      vest: !!data.vest,
    };
  }

  function loadLegacyBag() {
    let inventory = {};
    try {
      const raw = localStorage.getItem(STORAGE.items);
      if (raw) inventory = JSON.parse(raw) || {};
    } catch (_) {
      inventory = {};
    }
    const savedLevel = Number(localStorage.getItem(STORAGE.level));
    return {
      inventory,
      level: [1, 2, 3].includes(savedLevel) ? savedLevel : 3,
      vest: localStorage.getItem(STORAGE.vest) === "true",
    };
  }

  function loadProfiles() {
    try {
      const raw = localStorage.getItem(STORAGE.profiles);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.list?.length) {
          const list = parsed.list.map((p, i) =>
            makeProfile(p.name || `P${i + 1}`, {
              id: p.id,
              inventory: p.inventory,
              level: p.level,
              vest: p.vest,
            })
          );
          const activeId = list.some((p) => p.id === parsed.activeId) ? parsed.activeId : list[0].id;
          return { list, activeId };
        }
      }
    } catch (_) {}

    const legacy = loadLegacyBag();
    const first = makeProfile("P1", legacy);
    return { list: [first], activeId: first.id };
  }

  function loadLang() {
    const savedLang = localStorage.getItem(STORAGE.lang);
    return savedLang === "en" || savedLang === "tr" ? savedLang : "tr";
  }

  const profilesState = loadProfiles();
  const state = {
    lang: loadLang(),
    get profile() {
      return profilesState.list.find((p) => p.id === profilesState.activeId) || profilesState.list[0];
    },
    get inventory() {
      return this.profile.inventory;
    },
    set inventory(v) {
      this.profile.inventory = v;
    },
    get level() {
      return this.profile.level;
    },
    set level(v) {
      this.profile.level = v;
    },
    get vest() {
      return this.profile.vest;
    },
    set vest(v) {
      this.profile.vest = v;
    },
  };

  let activeTab = "Health";
  let attachFilterWeapon = "";
  let activeView = ["maps", "vehicles", "original", "drops", "tips"].includes(localStorage.getItem(STORAGE.view))
    ? localStorage.getItem(STORAGE.view)
    : "bag";
  let activeSecretMap = "erangel";
  let activeOriginalMap = localStorage.getItem("pubg_original_map") || "erangel";
  let activePinId = "";
  let activeVehicleFilter = localStorage.getItem("pubg_vehicle_filter") || "all";
  let fuelCalcVehicle = localStorage.getItem("pubg_fuel_vehicle") || "dacia";
  let fuelCalcKm = Number(localStorage.getItem("pubg_fuel_km") || 3);
  let fuelCalcTerrain = localStorage.getItem("pubg_fuel_terrain") || "road";
  let measureMode = false;
  let measurePoints = []; // free-draw [{x,y} percent] up to 2
  let mapGestureMoved = false;
  let compareWeaponA = localStorage.getItem("pubg_compare_a") || "M416";
  let compareWeaponB = localStorage.getItem("pubg_compare_b") || "Beryl M762";
  /** secrets | all | gas | vehicle | garage | glider | boat */
  let activeMapCategory = localStorage.getItem("pubg_map_category") || "secrets";
  const MAP_SERVICE_KINDS = ["gas", "vehicle", "garage", "glider", "boat"];
  const MAP_CATEGORIES = ["secrets", "all", ...MAP_SERVICE_KINDS];
  if (!MAP_CATEGORIES.includes(activeMapCategory)) activeMapCategory = "secrets";
  const VEHICLE_FILTERS = ["all", ...(window.VEHICLE_TYPE_ORDER || [])];
  if (!VEHICLE_FILTERS.includes(activeVehicleFilter)) activeVehicleFilter = "all";
  let activeDropFilter = localStorage.getItem("pubg_drop_filter") || "all";
  const DROP_FILTERS = window.DROPS_GUIDE?.filters || ["all", "care", "flare", "vikendi", "world", "missing"];
  if (!DROP_FILTERS.includes(activeDropFilter)) activeDropFilter = "all";
  let activeTipFilter = localStorage.getItem("pubg_tip_filter") || "all";
  const TIP_FILTERS = window.TIPS_GUIDE?.filters || ["all", "chip", "vehicles", "steam", "settings", "utility"];
  if (!TIP_FILTERS.includes(activeTipFilter)) activeTipFilter = "all";
  let mapZoom = 1;
  let mapOriginX = 50;
  let mapOriginY = 50;
  let mapPanX = 0;
  let mapPanY = 0;
  let toastTimer = null;
  let wasOver = false;
  let mapInteractAbort = null;

  const els = {
    title: document.getElementById("title"),
    subtitle: document.getElementById("subtitle"),
    vestBtn: document.getElementById("vestBtn"),
    weightText: document.getElementById("weightText"),
    capacityBreakdown: document.getElementById("capacityBreakdown"),
    ammoAdvise: document.getElementById("ammoAdvise"),
    barFill: document.getElementById("barFill"),
    inventoryTitle: document.getElementById("inventoryTitle"),
    inventoryGrid: document.getElementById("inventoryGrid"),
    catalogTitle: document.getElementById("catalogTitle"),
    catalogHint: document.getElementById("catalogHint"),
    catalogGrid: document.getElementById("catalogGrid"),
    attachFilter: document.getElementById("attachFilter"),
    tabs: document.getElementById("tabs"),
    clearBtn: document.getElementById("clearBtn"),
    toast: document.getElementById("toast"),
    mapsTitle: document.getElementById("mapsTitle"),
    mapsHint: document.getElementById("mapsHint"),
    mapsArea: document.getElementById("mapsArea"),
    viewBag: document.getElementById("view-bag"),
    viewMaps: document.getElementById("view-maps"),
    viewOriginal: document.getElementById("view-original"),
    viewVehicles: document.getElementById("view-vehicles"),
    viewDrops: document.getElementById("view-drops"),
    viewTips: document.getElementById("view-tips"),
    viewRank: document.getElementById("view-rank"),
    originalTitle: document.getElementById("originalTitle"),
    originalHint: document.getElementById("originalHint"),
    originalArea: document.getElementById("originalArea"),
    vehiclesTitle: document.getElementById("vehiclesTitle"),
    vehiclesHint: document.getElementById("vehiclesHint"),
    vehiclesFuelNote: document.getElementById("vehiclesFuelNote"),
    vehiclesArea: document.getElementById("vehiclesArea"),
    dropsTitle: document.getElementById("dropsTitle"),
    dropsHint: document.getElementById("dropsHint"),
    dropsIntro: document.getElementById("dropsIntro"),
    dropsArea: document.getElementById("dropsArea"),
    tipsTitle: document.getElementById("tipsTitle"),
    tipsHint: document.getElementById("tipsHint"),
    tipsIntro: document.getElementById("tipsIntro"),
    tipsArea: document.getElementById("tipsArea"),
    mainRankArea: document.getElementById("mainRankArea"),
    mainRankedArea: document.getElementById("mainRankedArea"),
    viewRanked: document.getElementById("view-ranked"),
    fuelCalcArea: document.getElementById("fuelCalcArea"),
    fuelCalcTitle: document.getElementById("fuelCalcTitle"),
    fuelCalcHint: document.getElementById("fuelCalcHint"),
    weaponCompareRoom: document.getElementById("weaponCompareRoom"),
    weaponCompareArea: document.getElementById("weaponCompareArea"),
    weaponCompareTitle: document.getElementById("weaponCompareTitle"),
    weaponCompareHint: document.getElementById("weaponCompareHint"),
    navBagLabel: document.getElementById("navBagLabel"),
    navMapsLabel: document.getElementById("navMapsLabel"),
    navOriginalLabel: document.getElementById("navOriginalLabel"),
    navVehiclesLabel: document.getElementById("navVehiclesLabel"),
    navDropsLabel: document.getElementById("navDropsLabel"),
    navTipsLabel: document.getElementById("navTipsLabel"),
    navRankLabel: document.getElementById("navRankLabel"),
    navRankedLabel: document.getElementById("navRankedLabel"),
    navButtons: [...document.querySelectorAll(".top-nav [data-view]")],
    levelButtons: [...document.querySelectorAll("[data-level]")],
    langButtons: [...document.querySelectorAll("[data-lang]")],
    squadTitle: document.getElementById("squadTitle"),
    squadHint: document.getElementById("squadHint"),
    profileBar: document.getElementById("profileBar"),
    shareLinkBtn: document.getElementById("shareLinkBtn"),
    shareCodeBtn: document.getElementById("shareCodeBtn"),
    importBagBtn: document.getElementById("importBagBtn"),
    importPanel: document.getElementById("importPanel"),
    importInput: document.getElementById("importInput"),
    importLabel: document.getElementById("importLabel"),
    importConfirmBtn: document.getElementById("importConfirmBtn"),
    importCancelBtn: document.getElementById("importCancelBtn"),
  };

  function t(key) {
    const dict = window.I18N?.[state.lang] || window.I18N?.tr || window.I18N?.en;
    if (!dict) return key;
    const parts = key.split(".");
    let cur = dict;
    for (const p of parts) {
      if (cur == null || (typeof cur !== "object" && typeof cur !== "function")) return key;
      cur = cur[p];
    }
    return typeof cur === "string" || typeof cur === "number" ? String(cur) : key;
  }

  function itemName(id) {
    return window.I18N[state.lang].items[id] || id;
  }

  function itemCategory(id) {
    for (const [cat, items] of Object.entries(window.PUBG_ITEMS)) {
      if (id in items) return cat;
    }
    return "Other";
  }

  function itemWeight(id) {
    for (const cat of Object.values(window.PUBG_ITEMS)) {
      if (id in cat) return cat[id];
    }
    return 0;
  }

  function isAmmo(id) {
    return id in window.PUBG_ITEMS.Ammo;
  }

  function itemImage(id) {
    const file = window.ITEM_IMAGES[id];
    return file ? `images/${file}` : "";
  }

  function iconHtml(id, sizeClass = "") {
    const src = itemImage(id);
    const name = itemName(id);
    if (!src) {
      return `<div class="item-icon fallback ${sizeClass}" aria-hidden="true">${name.slice(0, 2)}</div>`;
    }
    const kind = PIXEL_ICONS.has(id)
      ? "pixel"
      : src.endsWith(".svg")
        ? "vector"
        : "photo";
    return `<span class="icon-frame ${kind} ${sizeClass}"><img src="${src}" alt="${name}" loading="lazy" decoding="async" /></span>`;
  }

  function capacity() {
    return (
      window.BASE_CAPACITY +
      window.BACKPACK_CAPACITY[state.level] +
      (state.vest ? window.VEST_CAPACITY : 0)
    );
  }

  function usedWeight() {
    return Object.entries(state.inventory).reduce(
      (sum, [id, qty]) => sum + itemWeight(id) * qty,
      0
    );
  }

  function persist() {
    localStorage.setItem(
      STORAGE.profiles,
      JSON.stringify({
        activeId: profilesState.activeId,
        list: profilesState.list,
      })
    );
    // Keep legacy keys in sync for safety
    localStorage.setItem(STORAGE.items, JSON.stringify(state.inventory));
    localStorage.setItem(STORAGE.level, String(state.level));
    localStorage.setItem(STORAGE.vest, String(state.vest));
    localStorage.setItem(STORAGE.lang, state.lang);
  }

  function showToast(message, type = "warn") {
    els.toast.textContent = message;
    els.toast.className = `toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 1600);
  }

  function toBase64Url(str) {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  function fromBase64Url(str) {
    const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
    return decodeURIComponent(escape(atob(b64)));
  }

  function encodeLoadout(profile = state.profile) {
    const items = Object.entries(profile.inventory || {})
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => [id, qty]);
    const payload = {
      v: 1,
      n: profile.name || "",
      l: profile.level || 3,
      s: profile.vest ? 1 : 0,
      i: items,
    };
    return toBase64Url(JSON.stringify(payload));
  }

  function decodeLoadout(raw) {
    if (!raw || typeof raw !== "string") return null;
    let code = raw.trim();
    try {
      if (code.includes("bag=")) {
        const u = new URL(code, location.href);
        code = u.searchParams.get("bag") || code;
      }
      const hash = code.match(/[#?&]bag=([^&]+)/);
      if (hash) code = decodeURIComponent(hash[1]);
      code = code.replace(/^bag=/i, "").trim();

      const data = JSON.parse(fromBase64Url(code));
      if (!data || data.v !== 1 || !Array.isArray(data.i)) return null;
      const inventory = {};
      for (const row of data.i) {
        if (!Array.isArray(row) || row.length < 2) continue;
        const id = String(row[0]);
        const qty = Number(row[1]);
        if (!id || !(qty > 0) || !itemWeight(id)) continue;
        inventory[id] = Math.min(999, Math.floor(qty));
      }
      return {
        name: String(data.n || "").slice(0, 24),
        level: [1, 2, 3].includes(Number(data.l)) ? Number(data.l) : 3,
        vest: !!data.s,
        inventory,
      };
    } catch (_) {
      return null;
    }
  }

  function shareUrl() {
    const url = new URL(location.href);
    url.searchParams.set("bag", encodeLoadout());
    url.hash = "";
    return url.toString();
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  function applyLoadoutToActive(data, { rename = false } = {}) {
    if (!data) return false;
    state.inventory = { ...data.inventory };
    state.level = data.level;
    state.vest = data.vest;
    if (rename && data.name) state.profile.name = data.name;
    persist();
    return true;
  }

  function switchProfile(id) {
    if (!profilesState.list.some((p) => p.id === id)) return;
    profilesState.activeId = id;
    wasOver = false;
    persist();
    render();
  }

  function addProfile() {
    if (profilesState.list.length >= MAX_PROFILES) {
      showToast(t("profileLimit"), "warn");
      return;
    }
    const n = profilesState.list.length + 1;
    const name = `${t("profileDefault")} ${n}`;
    const p = makeProfile(name);
    profilesState.list.push(p);
    profilesState.activeId = p.id;
    wasOver = false;
    persist();
    render();
  }

  function renameActiveProfile() {
    const current = state.profile.name;
    const next = window.prompt(t("profileNamePrompt"), current);
    if (next == null) return;
    const cleaned = next.trim().slice(0, 24);
    if (!cleaned) return;
    state.profile.name = cleaned;
    persist();
    render();
  }

  function deleteActiveProfile() {
    if (profilesState.list.length <= 1) {
      showToast(t("profileNeedOne"), "warn");
      return;
    }
    const id = profilesState.activeId;
    profilesState.list = profilesState.list.filter((p) => p.id !== id);
    profilesState.activeId = profilesState.list[0].id;
    wasOver = false;
    persist();
    render();
  }

  function renderProfiles() {
    if (!els.profileBar) return;
    const chips = profilesState.list
      .map((p) => {
        const active = p.id === profilesState.activeId ? "active" : "";
        const count = Object.values(p.inventory || {}).reduce((s, n) => s + n, 0);
        return `
          <button type="button" class="profile-chip ${active}" data-profile="${p.id}" role="tab" aria-selected="${active ? "true" : "false"}">
            <strong>${p.name}</strong>
            <small>Lv${p.level}${p.vest ? " · V" : ""} · ${count}</small>
          </button>`;
      })
      .join("");
    els.profileBar.innerHTML = `
      ${chips}
      <button type="button" class="profile-chip add" data-profile-add title="${t("profileAdd")}">+</button>
      <button type="button" class="profile-tool" data-profile-rename title="${t("profileRename")}">Aa</button>
      <button type="button" class="profile-tool danger" data-profile-delete title="${t("profileDelete")}">×</button>`;
  }

  function setImportOpen(open) {
    if (!els.importPanel) return;
    els.importPanel.classList.toggle("hidden", !open);
    if (open) {
      els.importInput.value = "";
      els.importInput.focus();
    }
  }

  function tryImportFromUrl() {
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get("bag");
    const fromHash = (location.hash || "").match(/bag=([^&]+)/);
    const code = fromQuery || (fromHash ? decodeURIComponent(fromHash[1]) : "");
    if (!code) return;
    const data = decodeLoadout(code);
    if (!data) {
      showToast(t("importBad"), "warn");
      return;
    }
    applyLoadoutToActive(data, { rename: !!data.name });
    showToast(t("importOk"), "warn");
    // Clean URL so refresh doesn't re-import
    try {
      const clean = new URL(location.href);
      clean.searchParams.delete("bag");
      clean.hash = "";
      history.replaceState(null, "", clean.pathname + clean.search);
    } catch (_) {}
  }

  function zoomAtCenter(nextZoom) {
    mapZoom = clampZoom(nextZoom);
    mapPanX = 0;
    mapPanY = 0;
    if (mapZoom <= MAP_ZOOM_MIN) {
      mapZoom = MAP_ZOOM_MIN;
      mapOriginX = 50;
      mapOriginY = 50;
    }
    applyMapTransform();
  }

  function addItem(id, amount) {
    const unit = itemWeight(id);
    const free = capacity() - usedWeight();
    const maxAdd = Math.floor((free + 1e-9) / unit);
    if (maxAdd <= 0) {
      showToast(t("noSpace"), "warn");
      return;
    }
    const toAdd = Math.min(amount, maxAdd);
    state.inventory[id] = (state.inventory[id] || 0) + toAdd;
    if (toAdd < amount) showToast(t("noSpace"), "warn");
    persist();
    render();
  }

  function removeItem(id, amount) {
    if (!state.inventory[id]) return;
    state.inventory[id] -= amount;
    if (state.inventory[id] <= 0) delete state.inventory[id];
    persist();
    render();
  }

  function itemNote(id) {
    const meta = window.ITEM_META?.[id];
    if (!meta) return "";
    let text = t(meta.noteKey);
    if (meta.bonus != null) text = text.replace("{n}", String(meta.bonus));
    return text;
  }

  function weaponCountryLabel(id) {
    const g = window.WEAPON_GUIDE?.[id];
    if (!g?.country) return "";
    return t(`countries.${g.country}`);
  }

  function fireModeLabel(mode) {
    return t(`fireModes.${mode || "auto"}`);
  }

  function rpmLabel(g) {
    if (!g) return "";
    if (!g.rpm || g.mode === "melee") return fireModeLabel(g.mode);
    if (g.mode === "bolt" || g.mode === "pump" || g.mode === "lever" || g.mode === "special") {
      return `${fireModeLabel(g.mode)}${g.rpm ? ` · ${g.rpm} ${t("wpnRpmUnit")}` : ""}`;
    }
    return `${g.rpm} ${t("wpnRpmUnit")}`;
  }

  function ratingDots(n, max = 5) {
    const v = Math.max(0, Math.min(max, Number(n) || 0));
    let html = `<span class="rating-dots" aria-label="${v}/${max}">`;
    for (let i = 1; i <= max; i++) {
      html += `<i class="${i <= v ? "on" : ""}"></i>`;
    }
    return `${html}</span>`;
  }

  function weaponStatsHtml(g) {
    if (!g || g.dmg == null) return "";
    const bits = [
      `${t("wpnDmg")}: <strong>${g.dmg}</strong>`,
      `${t("wpnRpm")}: <strong>${rpmLabel(g)}</strong>`,
      `${t("wpnRange")}: <strong>${t(`rangeBands.${g.range || "mid"}`)}</strong>`,
    ];
    if (g.mag) bits.push(`${t("wpnMag")}: <strong>${g.mag}</strong>`);
    if (g.mode) bits.push(`${t("wpnMode")}: <strong>${fireModeLabel(g.mode)}</strong>`);
    if (g.headDmg) bits.push(`${t("wpnHead")}: <strong>${g.headDmg}</strong>`);
    if (g.speed) bits.push(`${t("wpnSpeed")}: <strong>${g.speed} ${t("wpnSpeedUnit")}</strong>`);

    const rows = [];
    if (g.headDmg != null) rows.push([t("wpnHead"), String(g.headDmg)]);
    if (g.speed) rows.push([t("wpnSpeed"), `${g.speed} ${t("wpnSpeedUnit")}`]);
    if (g.effRange) rows.push([t("wpnEffRange"), `${g.effRange} ${t("wpnMeter")}`]);
    if (g.reload) rows.push([t("wpnReload"), `${g.reload} ${t("wpnSec")}`]);
    if (g.hits) rows.push([t("wpnHits"), `≈${g.hits}`]);
    if (g.recoil) rows.push([t("wpnRecoil"), ratingDots(g.recoil)]);
    if (g.control) rows.push([t("wpnControl"), ratingDots(g.control)]);
    if (g.sound) rows.push([t("wpnSound"), t(`soundLevels.${g.sound}`)]);
    if (g.role) rows.push([t("wpnRole"), t(`weaponRoles.${g.role}`)]);
    if (g.ammo) rows.push([t("wpnAmmo"), g.ammo]);
    if (g.slots != null) rows.push([t("wpnSlots"), String(g.slots)]);
    if (g.tier) rows.push([t("wpnTier"), g.tier]);

    const detail =
      rows.length > 0
        ? `<details class="gear-detail">
            <summary>${t("wpnMoreDetail")}</summary>
            <ul class="gear-detail-list">${rows
              .map(([k, v]) => `<li><span>${k}</span><strong>${v}</strong></li>`)
              .join("")}</ul>
            <p class="gear-detail-note">${t("wpnDetailNote")}</p>
          </details>`
        : "";

    return `<div class="stat-chip-row">${bits.map((b) => `<span class="stat-chip">${b}</span>`).join("")}</div>${detail}`;
  }

  function attachStatsHtml(id) {
    const a = window.ATTACH_GUIDE?.[id];
    if (!a) return "";
    const slot = a.slot ? `<span class="stat-chip slot">${t(`attachSlots.${a.slot}`)}</span>` : "";
    const fx = (a.effects || [])
      .map((e) => `<span class="stat-chip fx"><em>${t(`attachStat.${e.k}`)}</em> <strong>${e.v}</strong></span>`)
      .join("");
    const tip = a.tip ? `<p class="attach-detail-tip">${t(`attachDetail.${a.tip}`)}</p>` : "";
    const best = a.bestFor
      ? `<li><span>${t("attachBestFor")}</span><strong>${t(`attachDetail.${a.bestFor}`)}</strong></li>`
      : "";
    const trade = a.tradeoff
      ? `<li><span>${t("attachTradeoff")}</span><strong>${t(`attachDetail.${a.tradeoff}`)}</strong></li>`
      : "";
    const fxRows = (a.effects || [])
      .map((e) => `<li><span>${t(`attachStat.${e.k}`)}</span><strong>${e.v}</strong></li>`)
      .join("");
    const detail =
      tip || best || trade || fxRows
        ? `<details class="gear-detail">
            <summary>${t("wpnMoreDetail")}</summary>
            ${tip}
            <ul class="gear-detail-list">${best}${trade}${fxRows}</ul>
            <p class="gear-detail-note">${t("attachDetailNote")}</p>
          </details>`
        : "";
    return `<div class="stat-chip-row">${slot}${fx}</div>${detail}`;
  }

  function catalogCard(id) {
    const weight = itemWeight(id);
    const note = itemNote(id);
    const country = activeTab === "Weapons" ? weaponCountryLabel(id) : "";
    const g = activeTab === "Weapons" ? window.WEAPON_GUIDE?.[id] : null;
    const tip =
      g?.tip && activeTab === "Weapons" ? `<p class="meta-note weapon-tip">${t(`weaponTips.${g.tip}`)}</p>` : "";
    const crateChip =
      g && /crate/i.test(g.role || "")
        ? `<span class="stat-chip slot">${t("wpnCrate")}</span>`
        : "";
    const stats =
      activeTab === "Weapons"
        ? `${weaponStatsHtml(g)}${crateChip ? `<div class="stat-chip-row">${crateChip}</div>` : ""}`
        : activeTab === "Attachments"
          ? attachStatsHtml(id)
          : "";
    const ammoExtra = isAmmo(id)
      ? `<button type="button" class="add-btn" data-add="${id}" data-amount="30">+30</button>`
      : "";
    const compatBtn =
      activeTab === "Weapons" && window.WEAPON_ATTACHMENTS
        ? `<button type="button" class="add-btn compat-btn" data-compat="${id}">${t("compatibleBtn")}</button>`
        : "";
    const kitBtn =
      activeTab === "Weapons" && window.WEAPON_BEST_KITS?.[id]?.length
        ? `<button type="button" class="add-btn kit-btn" data-best-kit="${id}">${t("bestKitBtn")}</button>`
        : "";
    const compareBtn =
      activeTab === "Weapons"
        ? `<button type="button" class="add-btn compare-pick-btn" data-compare-pick="${id}">${t("comparePick")}</button>`
        : "";
    return `
      <article class="item-card catalog">
        ${iconHtml(id)}
        <div class="card-copy">
          <h3 title="${itemName(id)}">${itemName(id)}</h3>
          ${country ? `<p class="weapon-country">${country}</p>` : ""}
          ${stats}
          <p>${t("weight")}: <strong>${weight}</strong></p>
          ${tip}
          ${note ? `<p class="meta-note">${note}</p>` : ""}
        </div>
        <div class="item-actions">
          <button type="button" class="add-btn primary" data-add="${id}" data-amount="1">+1</button>
          ${ammoExtra}
          ${kitBtn}
          ${compatBtn}
          ${compareBtn}
        </div>
      </article>`;
  }

  function weaponOptionsHtml() {
    const weapons = Object.keys(window.PUBG_ITEMS.Weapons);
    const opts = weapons
      .map(
        (id) =>
          `<option value="${id}" ${attachFilterWeapon === id ? "selected" : ""}>${itemName(id)}</option>`
      )
      .join("");
    return `
      <label class="filter-label" for="weaponFilterSelect">${t("filterWeapon")}</label>
      <select id="weaponFilterSelect" class="weapon-filter-select">
        <option value="">${t("filterAll")}</option>
        ${opts}
      </select>
      ${
        attachFilterWeapon
          ? `<button type="button" class="clear-filter" id="clearAttachFilter">x</button>`
          : ""
      }`;
  }

  function renderAttachFilter() {
    if (!els.attachFilter) return;
    if (activeTab !== "Attachments") {
      els.attachFilter.classList.add("hidden");
      els.attachFilter.innerHTML = "";
      return;
    }
    els.attachFilter.classList.remove("hidden");
    els.attachFilter.innerHTML = weaponOptionsHtml();
  }

  function clampZoom(z) {
    return Math.min(MAP_ZOOM_MAX, Math.max(MAP_ZOOM_MIN, +Number(z).toFixed(2)));
  }

  function getMapRoot() {
    if (activeView === "original") return els.originalArea;
    return els.mapsArea;
  }

  function setActiveView(view, { refresh = true } = {}) {
    activeView = ["maps", "vehicles", "original", "drops", "tips", "rank", "ranked"].includes(view) ? view : "bag";
    localStorage.setItem(STORAGE.view, activeView);
    document.body.dataset.view = activeView;
    if (els.viewBag) {
      els.viewBag.hidden = activeView !== "bag";
      els.viewBag.classList.toggle("active", activeView === "bag");
    }
    if (els.viewMaps) {
      els.viewMaps.hidden = activeView !== "maps";
      els.viewMaps.classList.toggle("active", activeView === "maps");
    }
    if (els.viewOriginal) {
      els.viewOriginal.hidden = activeView !== "original";
      els.viewOriginal.classList.toggle("active", activeView === "original");
    }
    if (els.viewVehicles) {
      els.viewVehicles.hidden = activeView !== "vehicles";
      els.viewVehicles.classList.toggle("active", activeView === "vehicles");
    }
    if (els.viewDrops) {
      els.viewDrops.hidden = activeView !== "drops";
      els.viewDrops.classList.toggle("active", activeView === "drops");
    }
    if (els.viewTips) {
      els.viewTips.hidden = activeView !== "tips";
      els.viewTips.classList.toggle("active", activeView === "tips");
    }
    if (els.viewRank) {
      els.viewRank.hidden = activeView !== "rank";
      els.viewRank.classList.toggle("active", activeView === "rank");
    }
    if (els.viewRanked) {
      els.viewRanked.hidden = activeView !== "ranked";
      els.viewRanked.classList.toggle("active", activeView === "ranked");
    }
    els.navButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === activeView);
    });
    if (!refresh) return;
    if (activeView === "maps") {
      measureMode = false;
      measurePoints = [];
      resetMapView();
      renderMaps();
      requestAnimationFrame(() => {
        applyMapTransform();
        requestAnimationFrame(() => applyMapTransform());
      });
    }
    if (activeView === "original") {
      measureMode = true;
      measurePoints = [];
      resetMapView();
      renderOriginalMaps();
      requestAnimationFrame(() => {
        applyMapTransform();
        requestAnimationFrame(() => applyMapTransform());
      });
    }
    if (activeView === "vehicles") renderVehicles();
    if (activeView === "drops") renderDrops();
    if (activeView === "tips") renderTips();
    if (activeView === "rank") renderMainRank();
    if (activeView === "ranked") renderMainRanked();
  }

  function renderLang() {
    document.documentElement.lang = state.lang;
    els.title.textContent = t("title");
    els.subtitle.textContent = t("subtitle");
    document.title = `${t("title")} — ${t("navBag")} · ${t("navMaps")} · ${t("navOriginal")} · ${t("navVehicles")} · ${t("navDrops")} · ${t("navTips")}`;
    els.inventoryTitle.textContent = t("inventory");
    els.catalogTitle.textContent = t("addItems");
    els.clearBtn.textContent = t("clear");
    if (els.mapsTitle) {
      els.mapsTitle.textContent = t(categoryTitleKey());
    }
    if (els.mapsHint) {
      els.mapsHint.textContent = t(categoryHintKey());
    }
    if (els.originalTitle) els.originalTitle.textContent = t("originalTitle");
    if (els.originalHint) els.originalHint.textContent = t("originalHint");
    if (els.navBagLabel) els.navBagLabel.textContent = t("navBag");
    if (els.navMapsLabel) els.navMapsLabel.textContent = t("navMaps");
    if (els.navOriginalLabel) els.navOriginalLabel.textContent = t("navOriginal");
    if (els.navVehiclesLabel) els.navVehiclesLabel.textContent = t("navVehicles");
    if (els.navDropsLabel) els.navDropsLabel.textContent = t("navDrops");
    if (els.navTipsLabel) els.navTipsLabel.textContent = t("navTips");
    if (els.vehiclesTitle) els.vehiclesTitle.textContent = t("vehiclesTitle");
    if (els.vehiclesHint) els.vehiclesHint.textContent = t("vehiclesHint");
    if (els.dropsTitle) els.dropsTitle.textContent = t("dropsTitle");
    if (els.dropsHint) els.dropsHint.textContent = t("dropsHint");
    if (els.dropsIntro) els.dropsIntro.textContent = t("dropsIntro");
    if (els.tipsTitle) els.tipsTitle.textContent = t("tipsTitle");
    if (els.tipsHint) els.tipsHint.textContent = t("tipsHint");
    if (els.tipsIntro) els.tipsIntro.textContent = t("tipsIntro");
    if (els.squadTitle) els.squadTitle.textContent = t("squadTitle");
    if (els.squadHint) els.squadHint.textContent = `${t("squadHint")} · ${t("keysHint")}`;
    if (els.shareLinkBtn) els.shareLinkBtn.textContent = t("shareLink");
    if (els.shareCodeBtn) els.shareCodeBtn.textContent = t("shareCode");
    if (els.importBagBtn) els.importBagBtn.textContent = t("importBag");
    if (els.importLabel) els.importLabel.textContent = t("importLabel");
    if (els.importConfirmBtn) els.importConfirmBtn.textContent = t("importConfirm");
    if (els.importCancelBtn) els.importCancelBtn.textContent = t("importCancel");
    if (els.importInput) els.importInput.placeholder = t("importLabel");
    els.langButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === state.lang);
    });
  }

  function renderLevels() {
    els.levelButtons.forEach((btn) => {
      const lvl = Number(btn.dataset.level);
      btn.classList.toggle("active", lvl === state.level);
      btn.querySelector(".lvl-label").textContent = `${t("lvl")} ${lvl}`;
    });
  }

  function renderVest() {
    els.vestBtn.textContent = state.vest ? t("vestOn") : t("vestOff");
    els.vestBtn.classList.toggle("active", state.vest);
    els.vestBtn.setAttribute("aria-pressed", String(state.vest));
  }

  function renderCapacity() {
    const used = usedWeight();
    const max = capacity();
    const pct = Math.min(100, (used / max) * 100);
    const over = used > max + 1e-9;

    els.weightText.textContent = `${used.toFixed(1)} / ${max} ${t("totalWeight")}`;
    els.capacityBreakdown.textContent = `${t("base")}: ${window.BASE_CAPACITY}   -   ${t("backpack")}: ${window.BACKPACK_CAPACITY[state.level]}   -   ${t("vest")}: ${state.vest ? window.VEST_CAPACITY : 0}`;

    els.barFill.style.width = `${pct}%`;
    els.barFill.classList.toggle("over", over);
    els.barFill.classList.toggle("warn", !over && pct >= 85);

    if (over && !wasOver) showToast(t("overCapacity"), "danger");
    wasOver = over;
  }

  function ammoPlan() {
    const recommend = window.AMMO_RECOMMEND || {};
    const guide = window.WEAPON_GUIDE || {};
    const byAmmo = {};
    const weapons = [];

    for (const [id, qty] of Object.entries(state.inventory)) {
      if (itemCategory(id) !== "Weapons") continue;
      const g = guide[id];
      if (!g || !g.ammo || g.ammo === "-" || !isAmmo(g.ammo)) continue;
      const per = recommend[g.type] || 0;
      if (per <= 0) continue;
      const need = per * qty;
      weapons.push({ id, qty, ammo: g.ammo, type: g.type, per, need });
      if (!byAmmo[g.ammo]) byAmmo[g.ammo] = { ammo: g.ammo, need: 0, weapons: [] };
      byAmmo[g.ammo].need += need;
      byAmmo[g.ammo].weapons.push({ id, qty, per });
    }

    const rows = Object.values(byAmmo).map((row) => {
      const have = state.inventory[row.ammo] || 0;
      const missing = Math.max(0, row.need - have);
      const unit = itemWeight(row.ammo);
      const weight = missing * unit;
      return { ...row, have, missing, unit, weight };
    });

    const totalMissingWeight = rows.reduce((s, r) => s + r.weight, 0);
    const free = Math.max(0, capacity() - usedWeight());
    return { weapons, rows, totalMissingWeight, free, short: totalMissingWeight > free + 1e-9 };
  }

  function renderAmmoAdvise() {
    if (!els.ammoAdvise) return;
    const plan = ammoPlan();
    if (!plan.weapons.length) {
      els.ammoAdvise.hidden = true;
      els.ammoAdvise.innerHTML = "";
      return;
    }

    els.ammoAdvise.hidden = false;
    const rowsHtml = plan.rows
      .map((row) => {
        const ok = row.missing <= 0;
        const status = ok
          ? `<span class="ammo-status ok">${t("ammoOk")}</span>`
          : `<button type="button" class="qty-btn ammo-add-btn" data-add="${row.ammo}" data-amount="${row.missing}">${t("ammoAdd")} +${row.missing}</button>`;
        const weapons = row.weapons
          .map((w) => `${itemName(w.id)}${w.qty > 1 ? ` ×${w.qty}` : ""} (${w.per})`)
          .join(", ");
        return `
          <div class="ammo-row ${ok ? "ok" : "need"}">
            <div class="ammo-row-main">
              ${iconHtml(row.ammo, "sm")}
              <div class="ammo-meta">
                <strong>${itemName(row.ammo)}</strong>
                <small>${weapons}</small>
                <p>${t("ammoHave")}: ${row.have} · ${t("ammoNeed")}: ${row.need}${
                  row.missing
                    ? ` · +${row.missing} (${row.weight.toFixed(1)})`
                    : ""
                }</p>
              </div>
            </div>
            <div class="ammo-row-actions">${status}</div>
          </div>`;
      })
      .join("");

    const warn = plan.short
      ? `<p class="ammo-cap-warn">${t("ammoCapWarn")
          .replace("{w}", plan.totalMissingWeight.toFixed(1))
          .replace("{f}", plan.free.toFixed(1))}</p>`
      : "";

    els.ammoAdvise.innerHTML = `
      <div class="ammo-advise-head">
        <strong>${t("ammoAdviseTitle")}</strong>
        <span>${t("ammoAdviseHint")}</span>
      </div>
      ${warn}
      <div class="ammo-rows">${rowsHtml}</div>`;
  }

  function renderInventory() {
    const entries = Object.entries(state.inventory);
    if (!entries.length) {
      els.inventoryGrid.innerHTML = `<p class="empty">${t("empty")}</p>`;
      return;
    }

    const order = TABS;
    const grouped = {};
    for (const [id, qty] of entries) {
      const cat = itemCategory(id);
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push([id, qty]);
    }

    els.inventoryGrid.innerHTML = order
      .filter((cat) => grouped[cat]?.length)
      .map((cat) => {
        const cards = grouped[cat]
          .map(([id, qty]) => {
            const unit = itemWeight(id);
            const ammoBtns = isAmmo(id)
              ? `<button type="button" class="qty-btn" data-remove="${id}" data-amount="30">-30</button>`
              : "";
            return `
              <article class="item-card in-bag">
                ${iconHtml(id, "sm")}
                <div class="item-meta">
                  <h3>${itemName(id)}</h3>
                  <p>${t("qty")}: ${qty}  -  ${t("weight")}: ${(unit * qty).toFixed(1)}</p>
                </div>
                <div class="item-actions">
                  ${ammoBtns}
                  <button type="button" class="qty-btn" data-remove="${id}" data-amount="1">-1</button>
                </div>
              </article>`;
          })
          .join("");
        return `
          <div class="bag-group">
            <h3 class="group-title">${t(cat)}</h3>
            <div class="bag-list">${cards}</div>
          </div>`;
      })
      .join("");
  }

  function renderTabs() {
    els.tabs.innerHTML = TABS.map((cat) => {
      const special =
        cat === "Weapons" || cat === "Attachments" || cat === "Equipment" ? "tab-special" : "";
      return `
        <button type="button" class="tab ${special} ${cat === activeTab ? "active" : ""}" data-tab="${cat}">
          ${t(cat)}
        </button>`;
    }).join("");
  }

  function renderCatalog() {
    if (activeTab === "Weapons") {
      els.catalogHint.textContent = t("weaponsHint");
    } else if (activeTab === "Attachments") {
      els.catalogHint.textContent = attachFilterWeapon
        ? `${t("compatibleFor")}: ${itemName(attachFilterWeapon)}`
        : t("attachmentsHint");
    } else if (activeTab === "Equipment") {
      els.catalogHint.textContent = t("equipmentHint");
    } else {
      els.catalogHint.textContent = "";
    }

    renderAttachFilter();
    renderWeaponCompare();

    if (activeTab === "Attachments" && attachFilterWeapon) {
      const compatible = window.getCompatibleAttachments(attachFilterWeapon) || [];
      if (!compatible.length) {
        els.catalogGrid.innerHTML = `<p class="empty">${t("noCompatible")}</p>`;
        return;
      }
      const allowed = new Set(compatible);
      const groups = window.ITEM_GROUPS.Attachments.map((group) => ({
        ...group,
        items: group.items.filter((id) => allowed.has(id)),
      })).filter((g) => g.items.length);

      els.catalogGrid.innerHTML = groups
        .map((group) => {
          const cards = group.items.map((id) => catalogCard(id)).join("");
          return `
            <section class="catalog-section">
              <h3 class="group-title">${t(`groups.${group.id}`)}</h3>
              <div class="catalog-grid">${cards}</div>
            </section>`;
        })
        .join("");
      return;
    }

    const groups = window.ITEM_GROUPS[activeTab];
    if (groups) {
      els.catalogGrid.innerHTML = groups
        .map((group) => {
          const cards = group.items.map((id) => catalogCard(id)).join("");
          return `
            <section class="catalog-section">
              <h3 class="group-title">${t(`groups.${group.id}`)}</h3>
              <div class="catalog-grid">${cards}</div>
            </section>`;
        })
        .join("");
      return;
    }

    const items = Object.keys(window.PUBG_ITEMS[activeTab] || {});
    els.catalogGrid.innerHTML = `
      <section class="catalog-section">
        <div class="catalog-grid">${items.map((id) => catalogCard(id)).join("")}</div>
      </section>`;
  }

  function mapName(id) {
    return t(`mapNames.${id}`) || id;
  }

  function locName(loc) {
    return t(`locNames.${loc}`) || loc;
  }

  function isSecretsCategory() {
    return activeMapCategory === "secrets";
  }

  function isAllServicesCategory() {
    return activeMapCategory === "all";
  }

  function isServicesView() {
    return !isSecretsCategory();
  }

  function categoryTitleKey() {
    if (isSecretsCategory()) return "mapsTitle";
    return `categoryTitles.${activeMapCategory}`;
  }

  function categoryHintKey() {
    if (isSecretsCategory()) return "mapsHint";
    return `categoryHints.${activeMapCategory}`;
  }

  function categorySectionHintKey() {
    if (isSecretsCategory()) return "secretHint";
    return "servicesSectionHint";
  }

  function getMapDataset() {
    if (isSecretsCategory()) return window.SECRET_BASEMENTS_2026 || [];
    const all = window.MAP_SERVICES_2026 || [];
    if (isAllServicesCategory()) {
      return all
        .filter((m) => (m.pins || []).length > 0)
        .map((m) => ({
          ...m,
          pins: [...(m.pins || [])].sort((a, b) => {
            const ka = MAP_SERVICE_KINDS.indexOf(a.kind);
            const kb = MAP_SERVICE_KINDS.indexOf(b.kind);
            if (ka !== kb) return (ka < 0 ? 99 : ka) - (kb < 0 ? 99 : kb);
            return a.y - b.y || a.x - b.x;
          }),
        }));
    }
    return all
      .map((m) => ({
        ...m,
        pins: (m.pins || []).filter((p) => p.kind === activeMapCategory),
      }))
      .filter((m) => (m.pins || []).length > 0);
  }

  function getSecretMap(mapId) {
    return getMapDataset().find((s) => s.mapId === mapId);
  }

  function serviceKindLabel(kind) {
    return t(`serviceKinds.${kind}`) || kind;
  }

  function legendKindSwitcherHtml(mapId) {
    if (!mapId) return "";
    const secretMap = (window.SECRET_BASEMENTS_2026 || []).find((m) => m.mapId === mapId);
    const secretCount = secretMap?.pins?.length || 0;
    const raw = (window.MAP_SERVICES_2026 || []).find((m) => m.mapId === mapId);
    const allPins = raw?.pins || [];
    const total = allPins.length;

    const chips = [];
    if (secretCount > 0) {
      chips.push({
        cat: "secrets",
        label: t("layerSecrets"),
        count: secretCount,
      });
    }
    if (total > 0) {
      chips.push({
        cat: "all",
        label: t("layerAll"),
        count: total,
      });
      for (const kind of MAP_SERVICE_KINDS) {
        const count = allPins.filter((p) => p.kind === kind).length;
        if (count > 0) {
          chips.push({
            cat: kind,
            label: serviceKindLabel(kind),
            count,
          });
        }
      }
    }
    if (!chips.length) return "";

    return `
      <div class="legend-kind-switcher" role="toolbar" aria-label="${t("jumpToKind")}">
        ${chips
          .map(
            (c) => `
          <button type="button"
            class="legend-kind-chip cat-${c.cat} ${activeMapCategory === c.cat ? "active" : ""}"
            data-map-category="${c.cat}">
            <span class="legend-kind-chip-label">${c.label}</span>
            <span class="legend-kind-chip-count">${c.count}</span>
          </button>`
          )
          .join("")}
      </div>`;
  }

  function categoryLabel(cat) {
    if (cat === "secrets") return t("layerSecrets");
    if (cat === "all") return t("layerAll");
    return t(`serviceKinds.${cat}`) || cat;
  }

  function categoryAvailable(cat) {
    if (cat === "secrets") return (window.SECRET_BASEMENTS_2026 || []).length > 0;
    if (cat === "all") return (window.MAP_SERVICES_2026 || []).some((m) => (m.pins || []).length > 0);
    return (window.MAP_SERVICES_2026 || []).some((m) =>
      (m.pins || []).some((p) => p.kind === cat)
    );
  }

  function setMapCategory(cat) {
    if (!MAP_CATEGORIES.includes(cat)) return;
    activeMapCategory = cat;
    localStorage.setItem("pubg_map_category", cat);
    activePinId = "";
    measurePoints = [];
    resetMapView();
  }

  const mapImageCache = new Map();

  function loadMapImage(src) {
    if (mapImageCache.has(src)) return mapImageCache.get(src);
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    mapImageCache.set(src, promise);
    return promise;
  }

  function focusPin(pin) {
    if (!pin) return;
    activePinId = pin.id;
    // Primorsk-style framing: town + coast readable, not a blurry pixel
    mapZoom = 8;
    mapOriginX = pin.x;
    mapOriginY = pin.y;
    mapPanX = 0;
    mapPanY = 0;
  }

  /** Resolve overlapping hit-targets by picking the nearest pin to the click. */
  function pickNearestPinAt(clientX, clientY) {
    const layer = getMapRoot()?.querySelector(".map-zoom-layer");
    const current = getSecretMap(activeSecretMap);
    const pins = current?.pins || [];
    if (!layer || !pins.length) return null;
    const rect = layer.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return null;
    const xPct = ((clientX - rect.left) / rect.width) * 100;
    const yPct = ((clientY - rect.top) / rect.height) * 100;
    if (xPct < -2 || xPct > 102 || yPct < -2 || yPct > 102) return null;

    let best = null;
    let bestD = Infinity;
    for (const p of pins) {
      const d = (p.x - xPct) ** 2 + (p.y - yPct) ** 2;
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    // ~2.8% of map ≈ small icon footprint
    const maxD = isAllServicesCategory() ? 2.2 * 2.2 : 3.2 * 3.2;
    return best && bestD <= maxD ? best : null;
  }

  function pinDetailHtml(current, selected) {
    const useLiveCloseup =
      !!selected &&
      !selected.closeup &&
      current.pinCloseup !== false &&
      !!current.builtInMarkers;
    const staticCloseup = selected?.closeup
      ? `<figure class="building-ref-block guide-crop pin-closeup-block">
           <img class="building-ref pin-closeup" src="${selected.closeup}" alt="${t("guideOnMap")}" decoding="async" />
           <figcaption class="crop-caption">${t("guideOnMap")}</figcaption>
         </figure>`
      : "";
    const liveCloseup = useLiveCloseup
      ? `<figure class="building-ref-block guide-crop pin-closeup-block">
           <img class="building-ref pin-closeup" data-pin-closeup alt="${t("guideOnMap")}" decoding="async" hidden />
           <figcaption class="crop-caption">${t("guideOnMap")}</figcaption>
         </figure>`
      : "";

    if (!selected) {
      return `<div class="pin-detail empty-detail">
          <p>${t(isSecretsCategory() ? "clickPinHint" : "clickServiceHint")}</p>
         </div>`;
    }

    const pinIndex = (current.pins || []).findIndex((p) => p.id === selected.id) + 1;
    if (isServicesView()) {
      return `
      <div class="pin-detail">
        <h4>${t("selectedPin")} #${pinIndex}</h4>
        <p class="detail-name">${locName(selected.loc)}</p>
        ${staticCloseup || liveCloseup}
        <p><span>${t("serviceType")}:</span> <strong>${serviceKindLabel(selected.kind)}</strong></p>
        <p><span>${t("region")}:</span> <strong>${t(`areas.${selected.area}`)}</strong></p>
      </div>`;
    }

    return `
      <div class="pin-detail">
        <h4>${t("selectedPin")} #${pinIndex}</h4>
        <p class="detail-name">${locName(selected.loc)}</p>
        ${staticCloseup || liveCloseup}
        <p><span>${t("region")}:</span> <strong>${t(`areas.${selected.area}`)}</strong></p>
        <p><span>${t("building")}:</span> <strong>${t(`buildings.${selected.building}`)}</strong></p>
        <p><span>${t("howEnter")}:</span> <strong>${t(`tips.${selected.tip}`)}</strong></p>
      </div>`;
  }

  /** Crop the guide map around the selected pin (shows the real red/green/purple mark). */
  function paintPinCloseup(pin) {
    if (!pin || pin.closeup) return; // static closeup already in markup
    const photo = els.mapsArea?.querySelector(".map-photo");
    const target = els.mapsArea?.querySelector("[data-pin-closeup]");
    if (!photo || !target) return;

    const draw = () => {
      const w = photo.naturalWidth;
      const h = photo.naturalHeight;
      if (!w || !h) return;
      const pad = Math.min(w, h) * 0.028;
      const cx = (pin.x / 100) * w;
      const cy = (pin.y / 100) * h;
      const side = Math.max(Math.ceil(pad * 2), 64);
      const x0 = Math.max(0, Math.min(w - side, Math.floor(cx - side / 2)));
      const y0 = Math.max(0, Math.min(h - side, Math.floor(cy - side / 2)));
      const size = 512;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#0a0e09";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(photo, x0, y0, side, side, 0, 0, size, size);
      target.src = canvas.toDataURL("image/jpeg", 0.92);
      target.hidden = false;
    };

    if (photo.complete && photo.naturalWidth) draw();
    else photo.addEventListener("load", draw, { once: true });
  }

  /** Update selection without rebuilding the map (prevents shrink/jump). */
  function updateMapSelection() {
    const current = getSecretMap(activeSecretMap);
    if (!current || !els.mapsArea) return;
    const selected = (current.pins || []).find((p) => p.id === activePinId) || null;

    els.mapsArea.querySelectorAll(".map-pin[data-pin]").forEach((el) => {
      el.classList.toggle("active", el.dataset.pin === activePinId);
    });
    els.mapsArea.querySelectorAll(".legend-item[data-pin]").forEach((el) => {
      el.classList.toggle("active", el.dataset.pin === activePinId);
    });

    const legend = els.mapsArea.querySelector(".map-legend");
    if (legend) {
      const oldDetail = legend.querySelector(".pin-detail");
      const wrap = document.createElement("div");
      wrap.innerHTML = pinDetailHtml(current, selected).trim();
      const next = wrap.firstElementChild;
      if (oldDetail && next) oldDetail.replaceWith(next);
      else if (next && !oldDetail) legend.prepend(next);
    }

    if (selected) paintPinCloseup(selected);
    applyMapTransform();
  }

  function resetMapView() {
    mapZoom = 1;
    mapOriginX = 50;
    mapOriginY = 50;
    mapPanX = 0;
    mapPanY = 0;
  }

  function mapLayerAspect(layer) {
    const photo = layer?.querySelector(".map-photo");
    if (photo?.naturalWidth > 0 && photo.naturalHeight > 0) {
      return photo.naturalWidth / photo.naturalHeight;
    }
    return 1;
  }

  /** Keep the map covering the stage — no black side gutters when zoomed. */
  function clampMapPan(sw, sh, sizeW, sizeH) {
    const ox = mapOriginX / 100;
    const oy = mapOriginY / 100;

    if (sizeW <= sw + 0.5) {
      mapPanX = ox * sizeW - sizeW / 2;
    } else {
      const minPanX = ox * sizeW - sizeW + sw / 2;
      const maxPanX = ox * sizeW - sw / 2;
      mapPanX = Math.min(maxPanX, Math.max(minPanX, mapPanX));
    }

    if (sizeH <= sh + 0.5) {
      mapPanY = oy * sizeH - sizeH / 2;
    } else {
      const minPanY = oy * sizeH - sizeH + sh / 2;
      const maxPanY = oy * sizeH - sh / 2;
      mapPanY = Math.min(maxPanY, Math.max(minPanY, mapPanY));
    }
  }

  function mapFitMode() {
    // Always fit the full map in view (like the screenshot) — zoom in to inspect.
    return "contain";
  }

  /** Layer keeps map aspect; cover = no black bars, contain = full map visible. */
  function applyMapTransform() {
    const root = getMapRoot();
    const stage = root?.querySelector(".map-stage");
    const layer = root?.querySelector(".map-zoom-layer");
    if (!stage || !layer) return;

    const sw = stage.clientWidth || stage.offsetWidth || root.clientWidth || 320;
    const sh = stage.clientHeight || stage.offsetHeight || sw;
    if (sw < 2 || sh < 2) return;

    const aspect = mapLayerAspect(layer);
    const fit = mapFitMode();
    const baseW = fit === "cover" ? Math.max(sw, sh * aspect) : Math.min(sw, sh * aspect);
    const sizeW = Math.max(1, baseW * mapZoom);
    const sizeH = Math.max(1, sizeW / aspect);
    clampMapPan(sw, sh, sizeW, sizeH);

    let left = sw / 2 - (mapOriginX / 100) * sizeW + mapPanX;
    let top = sh / 2 - (mapOriginY / 100) * sizeH + mapPanY;
    // Letterbox centering (contain at 1×)
    if (sizeW <= sw + 0.5) left = (sw - sizeW) / 2;
    if (sizeH <= sh + 0.5) top = (sh - sizeH) / 2;

    layer.style.width = `${sizeW}px`;
    layer.style.height = `${sizeH}px`;
    layer.style.left = `${left}px`;
    layer.style.top = `${top}px`;
    layer.style.transform = "none";
    layer.style.setProperty("--map-zoom", String(mapZoom));

    root.querySelectorAll(".map-pin").forEach((pin) => {
      pin.classList.toggle("zoomed", mapZoom >= 2.2);
      pin.classList.toggle("closeup", mapZoom >= 4.5);
    });
    stage.classList.toggle("is-zoomed", mapZoom > 1.05);

    const zoomLabel = root.querySelector("[data-zoom-label]");
    if (zoomLabel) zoomLabel.textContent = `${Math.round(mapZoom * 100)}%`;
  }

  function mapPointFromClient(stage, layer, clientX, clientY) {
    const rect = stage.getBoundingClientRect();
    const sizeW = parseFloat(layer.style.width) || stage.clientWidth;
    const sizeH = parseFloat(layer.style.height) || stage.clientHeight || sizeW;
    const left = parseFloat(layer.style.left) || 0;
    const top = parseFloat(layer.style.top) || 0;
    const x = ((clientX - rect.left - left) / sizeW) * 100;
    const y = ((clientY - rect.top - top) / sizeH) * 100;
    return {
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    };
  }


  function bindMapInteractions() {
    const root = getMapRoot();
    const stage = root?.querySelector(".map-stage");
    const layer = root?.querySelector(".map-zoom-layer");
    if (!stage || !layer) return;

    if (mapInteractAbort) mapInteractAbort.abort();
    mapInteractAbort = new AbortController();
    const { signal } = mapInteractAbort;

    requestAnimationFrame(() => applyMapTransform());

    const photo = layer.querySelector(".map-photo");
    if (photo && !photo.complete) {
      photo.addEventListener("load", () => applyMapTransform(), { once: true, signal });
    }
    if (photo?.src) loadMapImage(photo.src);

    const pointers = new Map();
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let pinchStartDist = 0;
    let pinchStartZoom = 1;
    let pinchOriginX = 50;
    let pinchOriginY = 50;
    let lastTapAt = 0;
    let lastTapX = 0;
    let lastTapY = 0;
    let moved = false;

    const zoomAtClient = (clientX, clientY, nextZoom) => {
      const point = mapPointFromClient(stage, layer, clientX, clientY);
      mapOriginX = point.x;
      mapOriginY = point.y;
      mapPanX = 0;
      mapPanY = 0;
      mapZoom = clampZoom(nextZoom);
      if (mapZoom <= MAP_ZOOM_MIN + 0.02) {
        mapZoom = MAP_ZOOM_MIN;
        mapOriginX = 50;
        mapOriginY = 50;
        mapPanX = 0;
        mapPanY = 0;
      }
      applyMapTransform();
    };

    stage.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        // Ignore sideways trackpad flicks (they felt like the map "jumping" left/right)
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        // Multiplicative zoom: smooth from 1× to 40×
        const factor = e.deltaY > 0 ? 1 / 1.12 : 1.12;
        zoomAtClient(e.clientX, e.clientY, mapZoom * factor);
      },
      { passive: false, signal }
    );

    stage.addEventListener(
      "pointerdown",
      (e) => {
        if (e.target.closest(".map-pin") || e.target.closest(".zoom-controls") || e.target.closest(".fs-measure-bar")) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        // Measuring on original map: keep taps clean (no drag steal)
        if (measureMode && activeView === "original" && pointers.size === 0) {
          pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
          moved = false;
          mapGestureMoved = false;
          return;
        }
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        moved = false;
        mapGestureMoved = false;
        try {
          stage.setPointerCapture(e.pointerId);
        } catch (_) {}

        if (pointers.size === 2) {
          dragging = false;
          const pts = [...pointers.values()];
          pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
          pinchStartZoom = mapZoom;
          const midX = (pts[0].x + pts[1].x) / 2;
          const midY = (pts[0].y + pts[1].y) / 2;
          const mid = mapPointFromClient(stage, layer, midX, midY);
          // Lock origin for the whole pinch — updating it every move caused left/right jumps
          pinchOriginX = mid.x;
          pinchOriginY = mid.y;
          mapOriginX = pinchOriginX;
          mapOriginY = pinchOriginY;
          mapPanX = 0;
          mapPanY = 0;
          stage.classList.add("pinching");
          return;
        }

        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        stage.classList.add("dragging");
      },
      { signal }
    );

    stage.addEventListener(
      "pointermove",
      (e) => {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pointers.size >= 2) {
          const pts = [...pointers.values()];
          const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
          mapOriginX = pinchOriginX;
          mapOriginY = pinchOriginY;
          mapPanX = 0;
          mapPanY = 0;
          mapZoom = clampZoom(pinchStartZoom * (dist / pinchStartDist));
          if (mapZoom <= MAP_ZOOM_MIN + 0.02) {
            mapZoom = MAP_ZOOM_MIN;
            mapOriginX = 50;
            mapOriginY = 50;
            mapPanX = 0;
            mapPanY = 0;
          }
          moved = true;
          applyMapTransform();
          return;
        }

        if (!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
        if (moved) mapGestureMoved = true;
        if (mapZoom <= MAP_ZOOM_MIN + 0.02) return;
        mapPanX += dx;
        mapPanY += dy;
        lastX = e.clientX;
        lastY = e.clientY;
        applyMapTransform();
      },
      { signal }
    );

    const endPointer = (e) => {
      const wasPinch = pointers.size >= 2;
      pointers.delete(e.pointerId);
      if (pointers.size < 2) stage.classList.remove("pinching");
      if (pointers.size === 0) {
        dragging = false;
        stage.classList.remove("dragging");
        if (!wasPinch && !moved && e.type === "pointerup") {
          const now = Date.now();
          const dt = now - lastTapAt;
          const dist = Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY);
          if (dt < 320 && dist < 28) {
            if (mapZoom > 1.4) {
              resetMapView();
              activePinId = "";
              updateMapSelection();
            } else {
              zoomAtClient(e.clientX, e.clientY, 8);
            }
            lastTapAt = 0;
          } else {
            lastTapAt = now;
            lastTapX = e.clientX;
            lastTapY = e.clientY;
          }
        }
      }
      try {
        stage.releasePointerCapture(e.pointerId);
      } catch (_) {}
    };
    stage.addEventListener("pointerup", endPointer, { signal });
    stage.addEventListener("pointercancel", endPointer, { signal });
  }

  function renderMaps() {
    if (!els.mapsArea) return;

    const dataset = getMapDataset();
    if (!dataset.some((s) => s.mapId === activeSecretMap) && dataset[0]) {
      activeSecretMap = dataset[0].mapId;
    }
    const current = getSecretMap(activeSecretMap);
    const layerTabs = `
      <div class="map-layer-tabs map-category-tabs" role="tablist" aria-label="${t("mapCategories")}">
        ${MAP_CATEGORIES.filter(categoryAvailable)
          .map(
            (cat) => `
          <button type="button" class="map-layer-tab cat-${cat} ${activeMapCategory === cat ? "active" : ""}" data-map-category="${cat}">
            ${categoryLabel(cat)}
          </button>`
          )
          .join("")}
      </div>`;
    const tabs = dataset
      .map(
        (s) => `
        <button type="button" class="map-tab ${s.mapId === activeSecretMap ? "active" : ""}" data-secret-map="${s.mapId}">
          ${mapName(s.mapId)} <small class="map-tab-count">${(s.pins || []).length}</small>
        </button>`
      )
      .join("");

    let viewer = "";
    if (current) {
      const keyWeight = itemWeight(current.keyId);
      const note = current.noteKey ? t(`mapNotes.${current.noteKey}`) : "";
      const selected = (current.pins || []).find((p) => p.id === activePinId);
      const builtIn = !!current.builtInMarkers;
      const isSecrets = isSecretsCategory();
      const isAll = isAllServicesCategory();
      const visiblePins = current.pins || [];

      const pins = visiblePins
        .map((pin, i) => {
          const n = i + 1;
          const active = pin.id === activePinId ? "active" : "";
          const mode = builtIn ? "hit-target" : "";
          const kindClass = pin.kind ? `pin-${pin.kind}` : isSecrets ? "pin-secret" : "";
          const dense = isAll ? "pin-dense" : "";
          const measureClass = "";
          const kindBadge =
            pin.kind === "garage"
              ? `<span class="pin-kind-tag garage" title="${serviceKindLabel("garage")}">G</span>`
              : pin.kind === "vehicle"
                ? `<span class="pin-kind-tag vehicle" title="${serviceKindLabel("vehicle")}">%100</span>`
                : "";
          const title = isSecrets
            ? `#${n} ${locName(pin.loc)}`
            : `#${n} ${serviceKindLabel(pin.kind)} · ${locName(pin.loc)}`;
          return `
            <button type="button" class="map-pin ${mode} ${kindClass} ${dense} ${measureClass} ${active}" style="left:${pin.x}%;top:${pin.y}%;z-index:${10 + i}" data-pin="${pin.id}" title="${title}">
              <span class="pin-ring" aria-hidden="true"></span>
              ${kindBadge}
              ${builtIn ? "" : `<span class="pin-dot"><span class="pin-num">${n}</span></span>`}
              <span class="pin-label">${n}. ${isSecrets ? locName(pin.loc) : serviceKindLabel(pin.kind)}</span>
            </button>`;
        })
        .join("");

      let legend = "";
      const pinIndex = new Map(visiblePins.map((p, i) => [p.id, i + 1]));
      if (isAll) {
        legend = MAP_SERVICE_KINDS.map((kind) => {
          const kindPins = visiblePins.filter((p) => p.kind === kind);
          const items = kindPins
            .map((pin) => {
              const n = pinIndex.get(pin.id);
              const active = pin.id === activePinId ? "active" : "";
              return `
                  <button type="button" class="legend-item ${active}" data-pin="${pin.id}">
                    <span class="legend-num">${n}</span>
                    <span class="legend-text">
                      <strong>#${n} ${serviceKindLabel(pin.kind)}</strong>
                      <small>${t(`areas.${pin.area}`)}</small>
                    </span>
                  </button>`;
            })
            .join("");
          if (!items) return "";
          return `
              <div class="legend-region legend-kind-${kind}">
                <button type="button" class="legend-region-title legend-kind-jump" data-map-category="${kind}" title="${t("jumpToKind")}">
                  <span>${serviceKindLabel(kind)} (${kindPins.length})</span>
                  <span class="legend-kind-jump-go" aria-hidden="true">→</span>
                </button>
                <div class="legend-region-list">${items}</div>
              </div>`;
        }).join("");
      } else {
        const areaOrder = [
          "north", "northWest", "northEast", "northMid", "west", "center", "east",
          "southWest", "south", "southEast",
        ];
        const grouped = {};
        for (const pin of visiblePins) {
          const key = pin.area || "center";
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(pin);
        }
        const areas = Object.keys(grouped).sort((a, b) => {
          const ia = areaOrder.indexOf(a);
          const ib = areaOrder.indexOf(b);
          return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
        });
        legend = areas
          .map((areaKey) => {
            const items = grouped[areaKey]
              .slice()
              .sort((a, b) => locName(a.loc).localeCompare(locName(b.loc), state.lang))
              .map((pin) => {
                const n = pinIndex.get(pin.id);
                const active = pin.id === activePinId ? "active" : "";
                return `
                  <button type="button" class="legend-item ${active}" data-pin="${pin.id}">
                    <span class="legend-num">${n}</span>
                    <span class="legend-text">
                      <strong>${locName(pin.loc)}</strong>
                      <small>${t(`areas.${pin.area}`)}${!isSecrets ? ` · ${serviceKindLabel(pin.kind)}` : ""}</small>
                    </span>
                  </button>`;
              })
              .join("");
            return `
              <div class="legend-region">
                <h5 class="legend-region-title">${t(`areas.${areaKey}`)}</h5>
                <div class="legend-region-list">${items}</div>
              </div>`;
          })
          .join("");
      }

      const detail = pinDetailHtml(current, selected);
      const keyBtn =
        isSecrets && current.keyId
          ? `<button type="button" class="add-btn primary key-add-btn" data-add="${current.keyId}" data-amount="1">
              ${t("addKey")} — ${itemName(current.keyId)} (${keyWeight})
            </button>`
          : "";
      const keyNote =
        isSecrets && current.keyId
          ? `<p class="hint key-hint">${t("secretKeyHint")}</p>`
          : "";
      const hintLine = isSecrets
        ? `<p class="hint">${t(`entrances.${current.entrance}`)}${note ? `  —  ${note}` : ""}</p>
           <p class="hint zoom-hint">${t("guideMapsNote")}</p>`
        : `<p class="hint">${t(`categoryHints.${activeMapCategory}`)}</p>`;
      const measureToggle = `
        <button type="button" class="share-btn measure-toggle ${measureMode ? "primary active" : ""}" data-measure-toggle>
          ${measureMode ? t("measureOn") : t("measureTitle")}
        </button>`;

      viewer = `
        <div class="secret-viewer">
          <div class="secret-toolbar">
            ${layerTabs}
            <div class="map-tabs">${tabs}</div>
            ${keyBtn}
            ${measureToggle}
          </div>
          ${keyNote}
          ${hintLine}
          <p class="hint zoom-hint">${t("zoomHint")}</p>
          <div class="secret-layout">
            <div class="map-stage ${measureMode ? "measure-mode" : ""}" tabindex="0">
              <div class="map-zoom-layer" style="--map-zoom:1">
                <img class="map-photo" src="${current.image}" alt="${mapName(current.mapId)}" decoding="async" draggable="false" />
                <div class="map-pins">${pins}</div>
                ${measureOverlayHtml(current.mapId)}
              </div>
              <div class="zoom-controls">
                <button type="button" data-zoom="in" title="${t("zoomIn")}">+</button>
                <span data-zoom-label>100%</span>
                <button type="button" data-zoom="out" title="${t("zoomOut")}">-</button>
                <button type="button" data-zoom="reset" title="${t("zoomReset")}">0</button>
              </div>
            </div>
            <aside class="map-legend">
              ${measureSummaryHtml(current)}
              ${detail}
              <h4>${categoryLabel(activeMapCategory)} — ${mapName(current.mapId)} (${visiblePins.length})</h4>
              ${legendKindSwitcherHtml(current.mapId)}
              <div class="legend-list">${legend}</div>
            </aside>
          </div>
        </div>`;
    } else {
      viewer = `
        <div class="secret-viewer">
          <div class="secret-toolbar">
            ${layerTabs}
            <div class="map-tabs">${tabs}</div>
          </div>
          <p class="empty">${t("categoryEmpty")}</p>
        </div>`;
    }

    els.mapsArea.innerHTML = `
      <section class="catalog-section secret-section maps-only">
        <p class="hint secret-section-hint">${t(categorySectionHintKey())}</p>
        ${viewer || layerTabs}
      </section>`;

    bindMapInteractions();
  }

  function render() {
    renderLang();
    renderProfiles();
    renderLevels();
    renderVest();
    renderCapacity();
    renderAmmoAdvise();
    renderInventory();
    renderTabs();
    renderCatalog();
    if (activeView === "maps") renderMaps();
    if (activeView === "original") renderOriginalMaps();
    if (activeView === "vehicles") renderVehicles();
    if (activeView === "drops") renderDrops();
    if (activeView === "tips") renderTips();
  }

  function getOriginalMap(mapId) {
    return (window.ORIGINAL_MAPS || []).find((m) => m.mapId === mapId) || null;
  }

  function renderOriginalMaps() {
    if (!els.originalArea) return;
    const list = window.ORIGINAL_MAPS || [];
    if (!list.some((m) => m.mapId === activeOriginalMap) && list[0]) {
      activeOriginalMap = list[0].mapId;
    }
    const current = getOriginalMap(activeOriginalMap);
    if (!current) {
      els.originalArea.innerHTML = `<p class="empty">${t("originalEmpty")}</p>`;
      return;
    }
    const sizeLabel = current.size || mapSizeKm(current.mapId) + "x" + mapSizeKm(current.mapId);
    const tabs = list
      .map(
        (m) =>
          `<button type="button" class="map-tab ${m.mapId === activeOriginalMap ? "active" : ""}" data-original-map="${m.mapId}">
            ${mapName(m.mapId)}
            <small>${m.size || ""}</small>
          </button>`
      )
      .join("");

    els.originalArea.innerHTML = `
      <section class="catalog-section secret-section maps-only original-section">
        <p class="hint secret-section-hint">${t("originalSectionHint")}</p>
        <div class="secret-viewer original-viewer">
          <div class="secret-toolbar">
            <div class="map-tabs">${tabs}</div>
            <button type="button" class="share-btn measure-toggle ${measureMode ? "primary active" : ""}" data-measure-toggle>
              ${measureMode ? t("measureOn") : t("measureTitle")}
            </button>
            <button type="button" class="share-btn original-fs-btn" data-original-fs>${t("originalFullscreen")}</button>
          </div>
          <div class="secret-layout original-layout">
            <div class="map-stage original-stage ${measureMode ? "measure-mode" : ""}" tabindex="0">
              <div class="map-zoom-layer" style="--map-zoom:1">
                <img class="map-photo" src="${current.image}" alt="${mapName(current.mapId)}" decoding="async" draggable="false" />
                ${measureOverlayHtml(current.mapId)}
              </div>
              <div class="zoom-controls">
                <button type="button" data-zoom="in" title="${t("zoomIn")}">+</button>
                <span data-zoom-label>100%</span>
                <button type="button" data-zoom="out" title="${t("zoomOut")}">-</button>
                <button type="button" data-zoom="reset" title="${t("zoomReset")}">0</button>
              </div>
              <div class="fs-measure-bar">
                <button type="button" class="share-btn measure-toggle ${measureMode ? "primary active" : ""}" data-measure-toggle>
                  ${measureMode ? t("measureOn") : t("measureTitle")}
                </button>
                <span class="fs-measure-readout" data-measure-readout>${measureReadoutText(current.mapId)}</span>
                <button type="button" class="share-btn" data-measure-clear>${t("measureClear")}</button>
              </div>
            </div>
            <aside class="map-legend" data-original-legend>
              ${measureSummaryHtml(current)}
              <h4>${mapName(current.mapId)} · ${sizeLabel}</h4>
              <p class="hint">${t("originalLegendHint")}</p>
            </aside>
          </div>
        </div>
      </section>`;

    bindMapInteractions();
  }

  function measureReadoutText(mapId) {
    if (!measureMode) return t("measureTitle");
    const a = measurePoints[0];
    const b = measurePoints[1];
    if (a && b) {
      const m = pinDistanceMeters(a, b, mapId);
      return t("measureResult").replace("{m}", String(m)).replace("{km}", (m / 1000).toFixed(2));
    }
    if (a) return t("measurePickSecond");
    return t("measureHint");
  }

  /** Update measure UI without rebuilding the map (keeps fullscreen). */
  function refreshOriginalMeasureUi() {
    const root = els.originalArea;
    if (!root || activeView !== "original") return;
    const current = getOriginalMap(activeOriginalMap);
    if (!current) return;
    const stage = root.querySelector(".map-stage");
    const layer = root.querySelector(".map-zoom-layer");
    if (layer) {
      layer.querySelector(".measure-overlay")?.remove();
      layer.insertAdjacentHTML("beforeend", measureOverlayHtml(current.mapId));
    }
    stage?.classList.toggle("measure-mode", measureMode);
    root.querySelectorAll("[data-measure-toggle]").forEach((btn) => {
      btn.classList.toggle("primary", measureMode);
      btn.classList.toggle("active", measureMode);
      btn.textContent = measureMode ? t("measureOn") : t("measureTitle");
    });
    root.querySelectorAll("[data-measure-readout]").forEach((el) => {
      el.textContent = measureReadoutText(current.mapId);
    });
    const legend = root.querySelector("[data-original-legend]");
    if (legend) {
      const sizeLabel = current.size || mapSizeKm(current.mapId) + "x" + mapSizeKm(current.mapId);
      legend.innerHTML = `
        ${measureSummaryHtml(current)}
        <h4>${mapName(current.mapId)} · ${sizeLabel}</h4>
        <p class="hint">${t("originalLegendHint")}</p>`;
    }
  }

  function cansToFill(fuel) {
    const notes = window.VEHICLE_FUEL_NOTES || {};
    const fill = notes.gasCanFillApprox || 20;
    return Math.max(1, Math.ceil(fuel / fill));
  }

  function rangeEstimateKm(v) {
    if (!v.burn || v.burn <= 0) return "—";
    const mins = v.fuel / v.burn;
    const km = Math.round((v.speed * 0.65 * mins) / 60);
    return `~${km}`;
  }

  function mapSizeKm(mapId) {
    const m = (window.PUBG_MAPS || []).find((x) => x.id === mapId);
    if (!m?.size) return 8;
    const n = Number(String(m.size).split("x")[0]);
    return Number.isFinite(n) && n > 0 ? n : 8;
  }

  function pinDistanceMeters(a, b, mapId) {
    const km = mapSizeKm(mapId);
    const dx = ((a.x - b.x) / 100) * km;
    const dy = ((a.y - b.y) / 100) * km;
    return Math.round(Math.hypot(dx, dy) * 1000);
  }

  function clientToMapPct(clientX, clientY) {
    const layer = getMapRoot()?.querySelector(".map-zoom-layer");
    if (!layer) return null;
    const rect = layer.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return null;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    if (x < -1 || x > 101 || y < -1 || y > 101) return null;
    return {
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    };
  }

  function measureOverlayHtml(mapId) {
    if (!measureMode || !measurePoints.length) return "";
    const a = measurePoints[0];
    const b = measurePoints[1];
    const dots = measurePoints
      .map(
        (p, i) =>
          `<span class="measure-dot ${i === 0 ? "a" : "b"}" style="left:${p.x}%;top:${p.y}%">${i === 0 ? "A" : "B"}</span>`
      )
      .join("");
    let line = "";
    let label = "";
    if (a && b) {
      const m = pinDistanceMeters(a, b, mapId);
      const km = (m / 1000).toFixed(2);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      line = `<svg class="measure-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" vector-effect="non-scaling-stroke" />
      </svg>`;
      label = `<span class="measure-label" style="left:${mx}%;top:${my}%">${m} m · ${km} km</span>`;
    }
    return `<div class="measure-overlay">${line}${dots}${label}</div>`;
  }

  function pushMeasurePoint(pct) {
    if (!pct) return;
    if (measurePoints.length >= 2) measurePoints = [pct];
    else measurePoints = [...measurePoints, pct];
  }

  function terrainFactor(key) {
    return { road: 1, mixed: 1.25, offroad: 1.5, boost: 1.8 }[key] || 1;
  }

  function computeFuelPlan(vehicleId, km, terrain) {
    const v = (window.VEHICLE_GUIDE || []).find((x) => x.id === vehicleId);
    const notes = window.VEHICLE_FUEL_NOTES || {};
    const fill = notes.gasCanFillApprox || 20;
    if (!v) return null;
    const factor = terrainFactor(terrain);
    const effSpeed = Math.max(20, v.speed * (terrain === "offroad" ? 0.75 : terrain === "mixed" ? 0.9 : 1));
    const hours = km / effSpeed;
    const liters = v.burn * hours * 60 * factor;
    const cansIfEmpty = Math.max(0, Math.ceil(liters / fill));
    const tankCovers = liters <= v.fuel;
    const extraLiters = Math.max(0, liters - v.fuel);
    const cansExtra = Math.ceil(extraLiters / fill);
    return { v, liters, cansIfEmpty, tankCovers, cansExtra, fill, hours };
  }

  function renderFuelCalc() {
    if (!els.fuelCalcArea) return;
    if (els.fuelCalcTitle) els.fuelCalcTitle.textContent = t("fuelCalcTitle");
    if (els.fuelCalcHint) els.fuelCalcHint.textContent = t("fuelCalcHint");
    const list = window.VEHICLE_GUIDE || [];
    if (!list.some((v) => v.id === fuelCalcVehicle) && list[0]) fuelCalcVehicle = list[0].id;
    const plan = computeFuelPlan(fuelCalcVehicle, fuelCalcKm, fuelCalcTerrain);
    const gasId = window.VEHICLE_FUEL_NOTES?.gasCanId || "Gas Can";
    const opts = list
      .map(
        (v) =>
          `<option value="${v.id}" ${v.id === fuelCalcVehicle ? "selected" : ""}>${t(`vehicleNames.${v.id}`)}</option>`
      )
      .join("");
    const terrains = ["road", "mixed", "offroad", "boost"]
      .map(
        (k) =>
          `<option value="${k}" ${fuelCalcTerrain === k ? "selected" : ""}>${t(`fuelTerrain.${k}`)}</option>`
      )
      .join("");
    const result = plan
      ? `<div class="fuel-calc-result">
          <p>${t("fuelNeed").replace("{l}", plan.liters.toFixed(1)).replace("{min}", Math.round(plan.hours * 60))}</p>
          <p><strong>${
            plan.tankCovers
              ? t("fuelTankOk").replace("{fuel}", String(plan.v.fuel))
              : t("fuelNeedCans")
                  .replace("{n}", String(plan.cansExtra))
                  .replace("{extra}", plan.liters - plan.v.fuel > 0 ? (plan.liters - plan.v.fuel).toFixed(1) : "0")
          }</strong></p>
          <p class="hint">${t("fuelEmptyCans").replace("{n}", String(plan.cansIfEmpty))}</p>
          ${
            plan.cansExtra > 0
              ? `<button type="button" class="add-btn primary" data-add="${gasId}" data-amount="${plan.cansExtra}">${t("addGasCan")} ×${plan.cansExtra}</button>`
              : ""
          }
        </div>`
      : "";
    els.fuelCalcArea.innerHTML = `
      <div class="fuel-calc-controls">
        <label>${t("fuelVehicle")}
          <select id="fuelVehicleSelect">${opts}</select>
        </label>
        <label>${t("fuelKm")}
          <input id="fuelKmInput" type="number" min="0.5" max="40" step="0.5" value="${fuelCalcKm}" />
        </label>
        <label>${t("fuelTerrainLabel")}
          <select id="fuelTerrainSelect">${terrains}</select>
        </label>
      </div>
      ${result}`;
  }

  function renderWeaponCompare() {
    if (!els.weaponCompareRoom || !els.weaponCompareArea) return;
    const show = activeTab === "Weapons";
    els.weaponCompareRoom.hidden = !show;
    if (!show) return;
    if (els.weaponCompareTitle) els.weaponCompareTitle.textContent = t("weaponCompareTitle");
    if (els.weaponCompareHint) els.weaponCompareHint.textContent = t("weaponCompareHint");
    const weapons = Object.keys(window.PUBG_ITEMS.Weapons || {});
    const opt = (sel) =>
      weapons
        .map((id) => `<option value="${id}" ${id === sel ? "selected" : ""}>${itemName(id)}</option>`)
        .join("");
    const ga = window.WEAPON_GUIDE?.[compareWeaponA] || {};
    const gb = window.WEAPON_GUIDE?.[compareWeaponB] || {};
    const kitA = window.WEAPON_BEST_KITS?.[compareWeaponA] || [];
    const kitB = window.WEAPON_BEST_KITS?.[compareWeaponB] || [];

    const card = (id, g, kit, side) => `
      <article class="compare-card side-${side}">
        <header class="compare-card-head">
          <span class="compare-side">${side.toUpperCase()}</span>
          <h4>${itemName(id)}</h4>
        </header>
        <ul class="compare-stat-list">
          <li><span>${t("wpnDmg")}</span><strong>${g.dmg ?? "—"}</strong></li>
          <li><span>${t("wpnHead")}</span><strong>${g.headDmg ?? "—"}</strong></li>
          <li><span>${t("wpnRpm")}</span><strong>${rpmLabel(g) || "—"}</strong></li>
          <li><span>${t("wpnMode")}</span><strong>${fireModeLabel(g.mode)}</strong></li>
          <li><span>${t("wpnRange")}</span><strong>${t(`rangeBands.${g.range || "mid"}`)}</strong></li>
          <li><span>${t("wpnEffRange")}</span><strong>${g.effRange ? `${g.effRange} ${t("wpnMeter")}` : "—"}</strong></li>
          <li><span>${t("wpnSpeed")}</span><strong>${g.speed ? `${g.speed} ${t("wpnSpeedUnit")}` : "—"}</strong></li>
          <li><span>${t("wpnReload")}</span><strong>${g.reload ? `${g.reload} ${t("wpnSec")}` : "—"}</strong></li>
          <li><span>${t("wpnHits")}</span><strong>${g.hits ? `≈${g.hits}` : "—"}</strong></li>
          <li><span>${t("wpnRecoil")}</span><strong>${g.recoil ? ratingDots(g.recoil) : "—"}</strong></li>
          <li><span>${t("wpnControl")}</span><strong>${g.control ? ratingDots(g.control) : "—"}</strong></li>
          <li><span>${t("wpnSound")}</span><strong>${g.sound ? t(`soundLevels.${g.sound}`) : "—"}</strong></li>
          <li><span>${t("wpnRole")}</span><strong>${g.role ? t(`weaponRoles.${g.role}`) : "—"}</strong></li>
          <li><span>${t("wpnAmmo")}</span><strong>${g.ammo || "—"}</strong></li>
          <li><span>${t("wpnMag")}</span><strong>${g.mag ?? "—"}</strong></li>
          <li><span>${t("wpnSlots")}</span><strong>${g.slots ?? "—"}</strong></li>
          <li><span>${t("wpnTier")}</span><strong>${g.tier || "—"}</strong></li>
        </ul>
        <div class="compare-kit">
          <span class="compare-kit-label">${t("bestKitBtn")}</span>
          ${
            kit.length
              ? `<ul class="compare-kit-list">${kit.map((x) => `<li>${itemName(x)}</li>`).join("")}</ul>`
              : `<p class="hint">—</p>`
          }
        </div>
        ${
          kit.length
            ? `<button type="button" class="add-btn primary" data-best-kit="${id}">${t("bestKitBtn")} · ${itemName(id)}</button>`
            : ""
        }
      </article>`;

    els.weaponCompareArea.innerHTML = `
      <div class="compare-controls">
        <label><span>A</span><select id="compareSelectA">${opt(compareWeaponA)}</select></label>
        <label><span>B</span><select id="compareSelectB">${opt(compareWeaponB)}</select></label>
      </div>
      <div class="compare-grid">
        ${card(compareWeaponA, ga, kitA, "a")}
        ${card(compareWeaponB, gb, kitB, "b")}
      </div>`;
  }

  function addBestKit(weaponId) {
    const kit = window.WEAPON_BEST_KITS?.[weaponId] || [];
    if (!kit.length) return;
    let added = 0;
    for (const id of kit) {
      const unit = itemWeight(id);
      if (!unit || unit <= 0) continue;
      const free = capacity() - usedWeight();
      if (free + 1e-9 < unit) continue;
      state.inventory[id] = (state.inventory[id] || 0) + 1;
      added += 1;
    }
    persist();
    render();
    showToast(t("bestKitAdded").replace("{n}", String(added)).replace("{w}", itemName(weaponId)), "warn");
  }

  function measureSummaryHtml(current) {
    if (!measureMode) return "";
    const a = measurePoints[0];
    const b = measurePoints[1];
    let body = `<p class="hint">${t("measureHint")}</p>`;
    if (a && b) {
      const m = pinDistanceMeters(a, b, current.mapId);
      body = `<p><strong>${t("measureResult")
        .replace("{m}", String(m))
        .replace("{km}", (m / 1000).toFixed(2))}</strong></p>
        <p class="hint">${t("measureDrawn")}</p>
        <button type="button" class="share-btn" data-measure-clear>${t("measureClear")}</button>`;
    } else if (a) {
      body = `<p class="hint">${t("measurePickSecond")}</p>
        <button type="button" class="share-btn" data-measure-clear>${t("measureClear")}</button>`;
    }
    return `<section class="tool-room measure-room">
      <div class="tool-room-head"><h3>${t("measureTitle")}</h3></div>
      ${body}
    </section>`;
  }

  function renderVehicles() {
    if (!els.vehiclesArea) return;
    const list = window.VEHICLE_GUIDE || [];
    const notes = window.VEHICLE_FUEL_NOTES || {};
    const gasId = notes.gasCanId || "Gas Can";
    const gasW = notes.gasCanWeight ?? itemWeight(gasId);

    if (els.vehiclesFuelNote) {
      const gasImg = notes.gasCanImage || "images/other/gas-can.png";
      els.vehiclesFuelNote.innerHTML = `
        <div class="fuel-note-card">
          <img class="fuel-note-img" src="${gasImg}" alt="${itemName(gasId)}" width="64" height="64" loading="lazy" decoding="async" />
          <div class="fuel-note-text">
            <strong>${t("fuelGuideTitle")}</strong>
            <p>${t("vehicleTips.gasCanTip")}</p>
            <p class="hint">${t("fuelGuideMeta")
              .replace("{w}", String(gasW))
              .replace("{fill}", String(notes.gasCanFillApprox || 20))}</p>
          </div>
          <button type="button" class="add-btn primary" data-add="${gasId}" data-amount="1">
            ${t("addGasCan")} — ${itemName(gasId)} (${gasW})
          </button>
        </div>`;
    }

    renderFuelCalc();

    const filters = `
      <div class="vehicle-filters" role="tablist">
        ${VEHICLE_FILTERS.map((f) => {
          const label = f === "all" ? t("vehicleFilterAll") : t(`vehicleTypes.${f}`);
          return `<button type="button" class="vehicle-filter-btn ${activeVehicleFilter === f ? "active" : ""}" data-vehicle-filter="${f}">${label}</button>`;
        }).join("")}
      </div>`;

    const filtered =
      activeVehicleFilter === "all" ? list : list.filter((v) => v.type === activeVehicleFilter);

    const cards = filtered
      .map((v) => {
        const maps = (v.maps || []).map((m) => mapName(m)).join(" · ");
        const boost = v.boost ? `<span class="veh-badge boost">${t("vehicleBoost")}</span>` : "";
        return `
        <article class="vehicle-card type-${v.type}">
          <div class="vehicle-media">
            <img src="${v.image}" alt="${t(`vehicleNames.${v.id}`)}" loading="lazy" decoding="async" />
            ${boost}
          </div>
          <div class="vehicle-body">
            <h3>${t(`vehicleNames.${v.id}`)}</h3>
            <p class="vehicle-type">${t(`vehicleTypes.${v.type}`)}</p>
            <dl class="vehicle-stats">
              <div><dt>${t("vehSeats")}</dt><dd>${v.seats}</dd></div>
              <div><dt>${t("vehSpeed")}</dt><dd>${v.speed} km/h</dd></div>
              <div><dt>${t("vehHealth")}</dt><dd>${v.health}</dd></div>
              <div><dt>${t("vehFuel")}</dt><dd>${v.fuel} L</dd></div>
              <div><dt>${t("vehBurn")}</dt><dd>${v.burn}/dk</dd></div>
              <div><dt>${t("vehRange")}</dt><dd>${rangeEstimateKm(v)} km</dd></div>
              <div class="span2"><dt>${t("vehCans")}</dt><dd>~${cansToFill(v.fuel)}× ${t("gasCanShort")}</dd></div>
            </dl>
            <p class="vehicle-maps"><span>${t("vehMaps")}:</span> ${maps || "—"}</p>
            <p class="vehicle-tip">${t(`vehicleTips.${v.tip}`)}</p>
          </div>
        </article>`;
      })
      .join("");

    els.vehiclesArea.innerHTML = `
      ${filters}
      <div class="vehicles-grid">${cards || `<p class="empty">${t("vehiclesEmpty")}</p>`}</div>`;
  }

  function dropWeaponTitle(id) {
    const named = itemName(id);
    return named && named !== id ? named : id;
  }

  function dropCardHtml({ title, type, ammo, sourceLabel, badge, tip, img, lootImg }) {
    const media = img
      ? `<img src="${img}" alt="" loading="lazy" decoding="async" />`
      : `<span class="drop-fallback" aria-hidden="true">${String(title).slice(0, 2)}</span>`;
    const loot = lootImg
      ? `<img class="drop-loot-thumb" src="${lootImg}" alt="" loading="lazy" decoding="async" />`
      : "";
    return `
      <article class="drop-card">
        <div class="drop-media">${media}${loot}${badge ? `<span class="drop-badge">${badge}</span>` : ""}</div>
        <div class="drop-body">
          <h3>${title}</h3>
          <dl class="drop-stats">
            ${type ? `<div><dt>${t("dropsType")}</dt><dd>${type}</dd></div>` : ""}
            ${ammo ? `<div><dt>${t("dropsAmmo")}</dt><dd>${ammo}</dd></div>` : ""}
            ${sourceLabel ? `<div class="span2"><dt>${t("dropsSource")}</dt><dd>${sourceLabel}</dd></div>` : ""}
          </dl>
          ${tip ? `<p class="drop-tip">${tip}</p>` : ""}
        </div>
      </article>`;
  }

  function renderDrops() {
    if (!els.dropsArea) return;
    const guide = window.DROPS_GUIDE || {};
    const filterLabels = {
      all: t("dropsFilterAll"),
      care: t("dropsFilterCare"),
      flare: t("dropsFilterFlare"),
      vikendi: t("dropsFilterVikendi"),
      world: t("dropsFilterWorld"),
      missing: t("dropsFilterMissing"),
    };

    const filters = `
      <div class="drop-filters" role="tablist">
        ${DROP_FILTERS.map(
          (f) =>
            `<button type="button" class="drop-filter-btn ${activeDropFilter === f ? "active" : ""}" data-drop-filter="${f}">${
              filterLabels[f] || f
            }</button>`
        ).join("")}
      </div>`;

    const show = (section) => activeDropFilter === "all" || activeDropFilter === section;
    const parts = [];

    if (show("care")) {
      const careCards = (guide.careWeapons || [])
        .map((w) =>
          dropCardHtml({
            title: dropWeaponTitle(w.id),
            type: t(`dropTypes.${w.type}`),
            ammo: w.ammo,
            sourceLabel: t("dropsSourceCare"),
            badge: w.inApp ? t("dropsInApp") : t("dropsNotInApp"),
            tip: t(`dropTips.${w.tip}`),
            img: itemImage(w.id),
          })
        )
        .join("");
      const extraCards = (guide.careExtras || [])
        .map((x) =>
          dropCardHtml({
            title: t(`dropExtraTitles.${x.title}`),
            sourceLabel: t("dropsSourceCare"),
            tip: t(`dropTips.${x.tip}`),
            img: x.image || "",
          })
        )
        .join("");
      parts.push(`
        <section class="drops-section">
          <h3 class="drops-section-title">${t("dropsCareTitle")}</h3>
          <p class="hint">${t("dropsCareHint")}</p>
          <div class="drops-grid">${careCards || `<p class="empty">${t("dropsEmpty")}</p>`}</div>
          <h4 class="drops-section-sub">${t("dropsCareExtrasTitle")}</h4>
          <div class="drops-grid extras">${extraCards}</div>
        </section>`);
    }

    if (show("flare")) {
      const flare = guide.flare || {};
      const notes = (flare.notes || []).map((k) => `<li>${t(`dropTips.${k}`)}</li>`).join("");
      parts.push(`
        <section class="drops-section">
          <h3 class="drops-section-title">${t("dropsFlareTitle")}</h3>
          <div class="drops-grid">
            ${dropCardHtml({
              title: dropWeaponTitle(flare.caller || "Flare Gun"),
              type: t("dropTypes.pistol"),
              ammo: "Flare",
              sourceLabel: t("dropsSourceFlare"),
              badge: t("dropsInApp"),
              tip: t(`dropTips.${flare.tip}`),
              img: itemImage(flare.caller || "Flare Gun") || flare.image || "",
            })}
            ${dropCardHtml({
              title: t("dropsFlareTitle"),
              sourceLabel: t("dropsSourceFlare"),
              tip: t("dropTips.dropFlareNote1"),
              img: flare.image || "images/drops/care-package.svg",
            })}
          </div>
          <ul class="drops-notes">${notes}</ul>
        </section>`);
    }

    if (show("vikendi")) {
      const vik = guide.vikendi || {};
      const crateCards = (vik.crates || [])
        .map((c) =>
          dropCardHtml({
            title: t(`dropExtraTitles.${c.title}`),
            sourceLabel: t("dropsSourceVikendi"),
            tip: t(`dropTips.${c.tip}`),
            img: c.image || "",
            lootImg: c.lootImage || "",
            badge: "",
          })
        )
        .join("");
      const notes = (vik.notes || []).map((k) => `<li>${t(`dropTips.${k}`)}</li>`).join("");
      parts.push(`
        <section class="drops-section">
          <h3 class="drops-section-title">${t("dropsVikendiTitle")}</h3>
          <p class="hint">${t("dropsVikendiHint")}</p>
          <div class="drops-grid">${crateCards || `<p class="empty">${t("dropsEmpty")}</p>`}</div>
          <ul class="drops-notes">${notes}</ul>
        </section>`);
    }

    if (show("world")) {
      const worldCards = (guide.worldNotes || [])
        .map((n) =>
          dropCardHtml({
            title: t(`dropExtraTitles.${n.title}`),
            tip: t(`dropTips.${n.tip}`),
            sourceLabel: t("dropsSourceWorld"),
            img: n.image || "",
          })
        )
        .join("");
      parts.push(`
        <section class="drops-section">
          <h3 class="drops-section-title">${t("dropsWorldTitle")}</h3>
          <div class="drops-grid">${worldCards || `<p class="empty">${t("dropsEmpty")}</p>`}</div>
        </section>`);
    }

    if (show("missing")) {
      const missCards = (guide.missingWeapons || [])
        .map((w) =>
          dropCardHtml({
            title: w.id,
            type: t(`dropTypes.${w.type}`),
            ammo: w.ammo,
            sourceLabel: w.source === "care" ? t("dropsSourceCare") : t("dropsSourceWorld"),
            badge: t("dropsNotInApp"),
            tip: t(`dropTips.${w.tip}`),
          })
        )
        .join("");
      parts.push(`
        <section class="drops-section">
          <h3 class="drops-section-title">${t("dropsMissingTitle")}</h3>
          <p class="hint">${t("dropsMissingHint")}</p>
          <div class="drops-grid">${
            missCards || `<p class="empty">${t("dropsMissingEmpty") || t("dropsEmpty")}</p>`
          }</div>
        </section>`);
    }

    els.dropsArea.innerHTML = `
      ${filters}
      ${parts.join("") || `<p class="empty">${t("dropsEmpty")}</p>`}`;
  }

  function onDropsClick(e) {
    const filterBtn = e.target.closest("[data-drop-filter]");
    if (!filterBtn) return;
    activeDropFilter = filterBtn.dataset.dropFilter;
    localStorage.setItem("pubg_drop_filter", activeDropFilter);
    renderDrops();
  }

  if (els.dropsArea) els.dropsArea.addEventListener("click", onDropsClick);

  function renderTips() {
    if (!els.tipsArea) return;
    const guide = window.TIPS_GUIDE || {};
    const filterLabels = {
      all: t("tipsFilterAll"),
      chip: t("tipsFilterChip"),
      vehicles: t("tipsFilterVehicles"),
      steam: t("tipsFilterSteam"),
      settings: t("tipsFilterSettings"),
      utility: t("tipsFilterUtility"),
    };

    const filters = `
      <div class="drop-filters" role="tablist">
        ${TIP_FILTERS.map(
          (f) =>
            `<button type="button" class="drop-filter-btn ${activeTipFilter === f ? "active" : ""}" data-tip-filter="${f}">${
              filterLabels[f] || f
            }</button>`
        ).join("")}
      </div>`;

    const list = (guide.tips || []).filter(
      (tip) => activeTipFilter === "all" || tip.category === activeTipFilter
    );

    const cards = list
      .map((tip) =>
        dropCardHtml({
          title: t(`tipTitles.${tip.title}`),
          tip: t(`tipBodies.${tip.tip}`),
          sourceLabel: t(`tipsCategories.${tip.category}`),
          img: tip.image || "",
        })
      )
      .join("");

    els.tipsArea.innerHTML = `
      ${filters}
      <section class="drops-section">
        <div class="drops-grid">${cards || `<p class="empty">${t("tipsEmpty")}</p>`}</div>
      </section>`;
  }

  function onTipsClick(e) {
    const filterBtn = e.target.closest("[data-tip-filter]");
    if (!filterBtn) return;
    activeTipFilter = filterBtn.dataset.tipFilter;
    localStorage.setItem("pubg_tip_filter", activeTipFilter);
    renderTips();
  }

  let mainUserLevel = Number(localStorage.getItem("pubg_main_user_level")) || 500;

  function calcMainKademeInfo(level) {
    const lvl = Math.max(1, Math.min(2500, Number(level) || 1));
    const kademeIndex = Math.min(5, Math.floor((lvl - 1) / 500) + 1);
    const startLvl = (kademeIndex - 1) * 500 + 1;
    const currentInTier = lvl - startLvl + 1;
    const pct = Math.min(100, Math.round((currentInTier / 500) * 100));
    const needed = 500 - currentInTier;
    return { lvl, kademeIndex, startLvl, currentInTier, pct, needed };
  }

  function renderMainRank() {
    if (!els.mainRankArea) return;
    const info = calcMainKademeInfo(mainUserLevel);
    const isTr = state.lang === "tr";
    const tierNames = isTr
      ? ["1. Kademe", "2. Kademe", "3. Kademe", "4. Kademe", "5. Kademe"]
      : ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"];
    const tierBadges = isTr
      ? ["1 - 500 Level", "501 - 1000 Level", "1001 - 1500 Level", "1501 - 2000 Level", "2001 - 2500 Level (Max)"]
      : ["Lvl 1 - 500", "Lvl 501 - 1000", "Lvl 1001 - 1500", "Lvl 1501 - 2000", "Lvl 2001 - 2500 (Max)"];
    const tierImages = [
      "images/ui/1.png",
      "images/ui/2.png",
      "images/ui/3.png",
      "images/ui/4.png",
      "images/ui/5.png",
    ];
    const tierDescriptions = isTr
      ? [
          "1. Kademe (Level 1 - 500): Oyuna başlangıç seviyesi. 500 seviye boyunca Bronz çerçeveli simge geçerlidir.",
          "2. Kademe (Level 501 - 1000): 500 seviye tamamlandığında geçilen 2. Kademe. Gümüş baklava çerçeveli simge açılır.",
          "3. Kademe (Level 1001 - 1500): 1000 seviye tamamlandığında geçilen 3. Kademe. Altın kalkan çerçeveli simge açılır.",
          "4. Kademe (Level 1501 - 2000): 1500 seviye tamamlandığında geçilen 4. Kademe. Mavi / Platin altıgen simge açılır.",
          "5. Kademe (Level 2001 - 2500): 2000 seviye tamamlandığında ulaşılan zirve 5. Kademe (Maksimum 2500 Level). Mor / Elmas Üstat simgesi açılır."
        ]
      : [
          "Level 1 (Level 1 - 500): Beginner stage with bronze emblem frame.",
          "Level 2 (Level 501 - 1000): Unlocked after 500 levels with silver diamond frame.",
          "Level 3 (Level 1001 - 1500): Unlocked after 1000 levels with gold shield frame.",
          "Level 4 (Level 1501 - 2000): Unlocked after 1500 levels with platinum blue hexagon frame.",
          "Level 5 (Level 2001 - 2500): Pinnacle Master level unlocked after 2000 levels with purple master frame."
        ];

    const emblemsGridHtml = [1, 2, 3, 4, 5]
      .map((k) => {
        const isActive = k === info.kademeIndex;
        const isDone = k < info.kademeIndex;
        return `
          <div class="kademe-card ${isActive ? "is-active" : isDone ? "is-done" : ""}" data-preset-lvl="${(k - 1) * 500 + 250}" style="cursor: pointer;">
            <div class="kademe-emblem">
              <img src="${tierImages[k - 1]}" alt="${isTr ? `Kademe ${k}` : `Level ${k}`}" loading="lazy" />
            </div>
            <span class="kademe-badge">${isTr ? `Kademe ${k}` : `Level ${k}`}</span>
            <h4 class="kademe-title">${tierNames[k - 1]}</h4>
            <span class="kademe-range">${tierBadges[k - 1]}</span>
            ${isActive ? `<span class="kademe-active-tag">🎯 ${isTr ? "Mevcut Kademeniz" : "Your Current Rank"}</span>` : ""}
          </div>`;
      })
      .join("");

    const detailedCardsHtml = [1, 2, 3, 4, 5]
      .map((k) => {
        const isActive = k === info.kademeIndex;
        return `
          <div class="kademe-detail-card${isActive ? " is-active" : ""}">
            <img class="kademe-detail-emblem" src="${tierImages[k - 1]}" alt="" loading="lazy" />
            <div class="kademe-detail-copy">
              <div class="kademe-detail-head">
                <h4 class="kademe-detail-title">${tierNames[k - 1]} (${tierBadges[k - 1]})</h4>
                ${isActive ? `<span class="kademe-detail-badge">${isTr ? "Şu An Buradasınız" : "Current Rank"}</span>` : ""}
              </div>
              <p class="kademe-detail-desc">${tierDescriptions[k - 1]}</p>
            </div>
          </div>`;
      })
      .join("");

    els.mainRankArea.innerHTML = `
      <div style="margin-bottom: 1rem; text-align: center; border-radius: 14px; overflow: hidden; border: 1px solid rgba(26,34,28,0.15); background: #0e1210;">
        <img src="images/ui/pubg-tiers-banner.png" alt="PUBG Official Tiers Banner" style="width: 100%; max-height: 180px; object-fit: cover; display: block;" />
      </div>

      <div class="rank-calc-box">
        <div class="rank-calc-head">
          <h3>🏆 ${isTr ? "Hayatta Kalma Ustalığı — 5 Kademe Rozetleri" : "Survival Mastery — 5 Level Emblems"}</h3>
          <p class="hint">${
            isTr
              ? "Her 500 seviyede bir yeni Kademe simgesine ve rozetine geçilir. Aşağıdaki kartlara tıklayarak seviye örneği seçebilir veya kendi levelinizi girebilirsiniz."
              : "Every 500 levels unlocks a new Level emblem. Click any level card or enter your level below to see your progress."
          }</p>
        </div>

        <div class="kademe-grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
          ${emblemsGridHtml}
        </div>

        <div class="rank-calc-controls" style="margin-top: 0.5rem;">
          <div class="rank-input-group">
            <label for="mainRankLevelInput">${isTr ? "Seviyenizi Girin (1 - 2500)" : "Enter Your Level (1 - 2500)"}</label>
            <div class="rank-input-row">
              <input type="number" id="mainRankLevelInput" min="1" max="2500" value="${info.lvl}" />
              <button type="button" class="share-btn primary" id="calcMainRankBtn">${isTr ? "Hesapla" : "Calculate"}</button>
            </div>
            <div style="display: flex; gap: 0.35rem; margin-top: 0.5rem; flex-wrap: wrap;">
              <button type="button" class="share-btn" data-preset-lvl="250">Lvl 250</button>
              <button type="button" class="share-btn" data-preset-lvl="750">Lvl 750</button>
              <button type="button" class="share-btn" data-preset-lvl="1250">Lvl 1250</button>
              <button type="button" class="share-btn" data-preset-lvl="1750">Lvl 1750</button>
              <button type="button" class="share-btn" data-preset-lvl="2250">Lvl 2250</button>
            </div>
          </div>

          <div class="rank-result-summary">
            <div class="rank-result-pill">
              <span class="lbl">${isTr ? "Hesaplanan Kademe" : "Calculated Rank"}:</span>
              <strong class="val">${tierNames[info.kademeIndex - 1]} (Level ${info.lvl})</strong>
            </div>
            <div class="rank-progress-wrapper">
              <div class="rank-progress-meta">
                <span>${isTr ? "Kademe İçi İlerleme" : "Progress in Current Level"}: %${info.pct}</span>
                <span>${
                  info.kademeIndex === 5
                    ? isTr
                      ? "Maksimum Kademe (5. Kademe) Ulaşıldı!"
                      : "Max Level 5 Reached!"
                    : isTr
                    ? `Sonraki kademeye ${info.needed} level kaldı`
                    : `${info.needed} levels to next level`
                }</span>
              </div>
              <div class="rank-progress-bar-bg">
                <div class="rank-progress-bar-fill" style="width: ${info.pct}%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rank-info-details">
        <h3>📜 ${
          isTr ? "Kademelerin Detaylı Seviye Açıklamaları" : "Detailed Level Breakdown"
        }</h3>
        ${detailedCardsHtml}
      </div>`;

    const calcBtn = document.getElementById("calcMainRankBtn");
    const input = document.getElementById("mainRankLevelInput");
    if (calcBtn && input) {
      calcBtn.onclick = () => {
        const val = Number(input.value);
        if (val && !isNaN(val)) {
          mainUserLevel = Math.max(1, Math.min(2500, val));
          localStorage.setItem("pubg_main_user_level", String(mainUserLevel));
          renderMainRank();
        }
      };
      input.onkeydown = (e) => {
        if (e.key === "Enter") {
          calcBtn.click();
        }
      };
    }

    els.mainRankArea.querySelectorAll("[data-preset-lvl]").forEach((btn) => {
      btn.onclick = () => {
        const val = Number(btn.dataset.presetLvl);
        if (val && !isNaN(val)) {
          mainUserLevel = val;
          localStorage.setItem("pubg_main_user_level", String(mainUserLevel));
          renderMainRank();
        }
      };
    });
  }

  let userRp = Number(localStorage.getItem("pubg_user_rp")) || 2400;

  function calcRankedInfo(rp) {
    const r = Math.max(0, Math.min(5000, Number(rp) || 0));
    let tierIndex = 0; // 0: Bronz, 1: Gümüş, 2: Altın, 3: Platin, 4: Kristal, 5: Elmas, 6: Usta, 7: Hayatta Kalan
    if (r >= 3400) tierIndex = 6;
    else if (r >= 3000) tierIndex = 5;
    else if (r >= 2600) tierIndex = 4;
    else if (r >= 2200) tierIndex = 3;
    else if (r >= 1800) tierIndex = 2;
    else if (r >= 1400) tierIndex = 1;
    else tierIndex = 0;

    const thresholds = [0, 1400, 1800, 2200, 2600, 3000, 3400, 5000];
    const minRp = thresholds[tierIndex];
    const maxRp = thresholds[tierIndex + 1];
    const currentInTier = r - minRp;
    const rangeSpan = maxRp - minRp;
    const pct = Math.min(100, Math.round((currentInTier / rangeSpan) * 100));
    const needed = maxRp - r;
    return { rp: r, tierIndex, minRp, maxRp, currentInTier, pct, needed };
  }

  function renderMainRanked() {
    if (!els.mainRankedArea) return;
    const info = calcRankedInfo(userRp);
    const isTr = state.lang === "tr";
    const rankedNames = isTr
      ? ["BRONZ", "GÜMÜŞ", "ALTIN", "PLATİN", "KRİSTAL", "ELMAS", "USTA", "HAYATTA KALAN"]
      : ["BRONZE", "SILVER", "GOLD", "PLATINUM", "CRYSTAL", "DIAMOND", "MASTER", "SURVIVOR"];
    const rankedRanges = [
      "1.400 RP VE ALTI",
      "1.400 RP - 1.799 RP",
      "1.800 RP - 2.199 RP",
      "2.200 RP - 2.599 RP",
      "2.600 RP - 2.999 RP",
      "3.000 RP - 3.399 RP",
      "3.400 RP VE ÜZERİ",
      "EN ÜST KADEME (TOP 500)"
    ];
    const rankedBadges = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `images/ui/ranked/${n}.png`);
    const rankedRewards = [
      ["• BRONZ AMBLEM"],
      ["• GÜMÜŞ AMBLEM"],
      ["• ALTIN AMBLEM", "• 42. SEZON ALTIN DERECESİ - AWM", "• 42. SEZON DERECELİ PARAŞÜTÜ"],
      ["• PLATİN AMBLEM", "• 42. SEZON PLATİN DERECESİ - AWM", "• 42. SEZON DERECELİ PARAŞÜTÜ", "• PLATİN MADALYASI"],
      ["• KRİSTAL AMBLEMİ", "• 42. SEZON KRİSTAL DERECESİ - AWM", "• 42. SEZON DERECELİ PARAŞÜTÜ", "• KRİSTAL MADALYA"],
      ["• ELMAS AMBLEM", "• 42. SEZON ELMAS DERECESİ - AWM", "• 42. SEZON DERECELİ PARAŞÜTÜ", "• ELMAS MADALYASI"],
      ["• USTALIK AMBLEMİ", "• USTALIK İSİMLİĞİ", "• 42. SEZON USTA DERECESİ - AWM", "• 42. SEZON DERECELİ PARAŞÜTÜ", "• USTA MADALYASI"],
      ["• HAYATTA KALAN AMBLEMİ", "• HAYATTA KALAN İSİMLİĞİ", "• 42. SEZON HAYATTA KALAN DERECESİ - AWM", "• 42. SEZON DERECELİ PARAŞÜTÜ", "• HAYATTA KALAN MADALYASI"]
    ];

    const cardsHtml = [0, 1, 2, 3, 4, 5, 6, 7].reverse().map((idx) => {
      const isActive = idx === info.tierIndex;
      const rankNum = idx + 1;
      return `
        <div class="ranked-detail-card ranked-tier-${rankNum}${isActive ? " is-active" : ""}" data-ranked-tier="${rankNum}">
          <div class="ranked-detail-emblem-wrap">
            <img class="ranked-detail-emblem" src="${rankedBadges[idx]}" alt="${rankedNames[idx]}" width="96" height="96" loading="lazy" decoding="async" />
          </div>
          <div class="ranked-detail-main">
            <div class="ranked-detail-head">
              <h4 class="ranked-detail-name">${rankedNames[idx]}</h4>
              ${isActive ? `<span class="ranked-detail-badge">${isTr ? "Mevcut Rütbeniz" : "Current Rank"}</span>` : ""}
            </div>
            <p class="ranked-detail-range">${rankedRanges[idx]}</p>
          </div>
          <div class="ranked-detail-rewards">
            <strong>${isTr ? "Ödüller & Derece İtemleri" : "Rewards & Rank Items"}</strong>
            <ul>
              ${rankedRewards[idx].map((r) => `<li>${r.replace(/^•\s*/, "")}</li>`).join("")}
            </ul>
          </div>
        </div>
      `;
    }).join("");

    els.mainRankedArea.innerHTML = `
      <div class="ranked-banner-wrap">
        <img class="ranked-banner" src="images/ui/pubg-ranked-banner.png" alt="" width="1200" height="320" loading="lazy" decoding="async" />
      </div>

      <div class="rank-calc-box">
        <div class="rank-calc-head">
          <h3>🏆 ${isTr ? "Dereceli Mod (Ranked) RP Hesaplayıcı" : "Ranked Mode RP Calculator"}</h3>
          <p class="hint">${isTr ? "Mevcut RP puanınızı girerek veya rütbe butonlarına basarak PUBG Steam Dereceli rütbenizi ve ödüllerinizi görün." : "Enter your RP points or click a rank preset button to view your current Ranked tier and rewards."}</p>
        </div>

        <div class="rank-calc-controls">
          <div class="rank-input-group">
            <label for="mainRpInput">${isTr ? "RP Puanınız (0 - 5000 RP)" : "Your RP Points (0 - 5000 RP)"}</label>
            <div class="rank-input-row">
              <input type="number" id="mainRpInput" min="0" max="5000" value="${info.rp}" />
              <button type="button" class="share-btn primary" id="calcRpBtn">${isTr ? "Hesapla" : "Calculate"}</button>
            </div>
            <div style="display: flex; gap: 0.35rem; margin-top: 0.5rem; flex-wrap: wrap;">
              <button type="button" class="share-btn" data-preset-rp="1200">1200 RP (Bronz)</button>
              <button type="button" class="share-btn" data-preset-rp="1600">1600 RP (Gümüş)</button>
              <button type="button" class="share-btn" data-preset-rp="2000">2000 RP (Altın)</button>
              <button type="button" class="share-btn" data-preset-rp="2400">2400 RP (Platin)</button>
              <button type="button" class="share-btn" data-preset-rp="2800">2800 RP (Kristal)</button>
              <button type="button" class="share-btn" data-preset-rp="3200">3200 RP (Elmas)</button>
              <button type="button" class="share-btn" data-preset-rp="3600">3600 RP (Usta)</button>
            </div>
          </div>

          <div class="rank-result-summary">
            <div class="rank-result-pill">
              <span class="lbl">${isTr ? "Hesaplanan Rütbe" : "Calculated Rank"}:</span>
              <strong class="val">${rankedNames[info.tierIndex]} (${info.rp} RP)</strong>
            </div>
            <div class="rank-progress-wrapper">
              <div class="rank-progress-meta">
                <span>${isTr ? "Rütbe İçi İlerleme" : "Progress in Current Rank"}: %${info.pct}</span>
                <span>${info.tierIndex >= 6 ? (isTr ? "Usta / Top 500 Zirve Rütbe!" : "Top Tier Reached!") : (isTr ? `Sonraki rütbeye ${info.needed} RP kaldı` : `${info.needed} RP to next rank`)}</span>
              </div>
              <div class="rank-progress-bar-bg">
                <div class="rank-progress-bar-fill" style="width: ${info.pct}%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rank-info-details ranked-info-list">
        <h3>📜 ${isTr ? "Dereceli Rütbeleri ve Ödülleri Listesi" : "Ranked Ranks & Rewards List"}</h3>
        ${cardsHtml}
      </div>
    `;

    const calcBtn = document.getElementById("calcRpBtn");
    const input = document.getElementById("mainRpInput");
    if (calcBtn && input) {
      calcBtn.onclick = () => {
        const val = Number(input.value);
        if (!isNaN(val)) {
          userRp = Math.max(0, Math.min(5000, val));
          localStorage.setItem("pubg_user_rp", String(userRp));
          renderMainRanked();
        }
      };
      input.onkeydown = (e) => {
        if (e.key === "Enter") {
          calcBtn.click();
        }
      };
    }

    els.mainRankedArea.querySelectorAll("[data-preset-rp]").forEach((btn) => {
      btn.onclick = () => {
        const val = Number(btn.dataset.presetRp);
        if (!isNaN(val)) {
          userRp = val;
          localStorage.setItem("pubg_user_rp", String(userRp));
          renderMainRanked();
        }
      };
    });
  }

  if (els.tipsArea) els.tipsArea.addEventListener("click", onTipsClick);

  els.levelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.level = Number(btn.dataset.level);
      persist();
      render();
    });
  });

  els.vestBtn.addEventListener("click", () => {
    state.vest = !state.vest;
    persist();
    render();
  });

  els.clearBtn.addEventListener("click", () => {
    state.inventory = {};
    persist();
    render();
  });

  if (els.ammoAdvise) {
    els.ammoAdvise.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add]");
      if (!btn) return;
      addItem(btn.dataset.add, Number(btn.dataset.amount));
    });
  }

  function onVehiclesClick(e) {
    const filterBtn = e.target.closest("[data-vehicle-filter]");
    if (filterBtn) {
      activeVehicleFilter = filterBtn.dataset.vehicleFilter;
      localStorage.setItem("pubg_vehicle_filter", activeVehicleFilter);
      renderVehicles();
      return;
    }
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      addItem(addBtn.dataset.add, Number(addBtn.dataset.amount) || 1);
    }
  }

  if (els.vehiclesArea) els.vehiclesArea.addEventListener("click", onVehiclesClick);
  if (els.vehiclesFuelNote) els.vehiclesFuelNote.addEventListener("click", onVehiclesClick);

  els.langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.lang = btn.dataset.lang;
      persist();
      render();
    });
  });

  els.tabs.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-tab]");
    if (!tab) return;
    activeTab = tab.dataset.tab;
    if (activeTab !== "Attachments") attachFilterWeapon = "";
    render();
  });

  els.attachFilter.addEventListener("change", (e) => {
    const select = e.target.closest("#weaponFilterSelect");
    if (!select) return;
    attachFilterWeapon = select.value;
    render();
  });

  els.attachFilter.addEventListener("click", (e) => {
    if (e.target.closest("#clearAttachFilter")) {
      attachFilterWeapon = "";
      render();
    }
  });

  els.catalogGrid.addEventListener("click", (e) => {
    const compat = e.target.closest("[data-compat]");
    if (compat) {
      attachFilterWeapon = compat.dataset.compat;
      activeTab = "Attachments";
      render();
      return;
    }
    const kit = e.target.closest("[data-best-kit]");
    if (kit) {
      addBestKit(kit.dataset.bestKit);
      return;
    }
    const cmp = e.target.closest("[data-compare-pick]");
    if (cmp) {
      const id = cmp.dataset.comparePick;
      compareWeaponB = compareWeaponA;
      compareWeaponA = id;
      localStorage.setItem("pubg_compare_a", compareWeaponA);
      localStorage.setItem("pubg_compare_b", compareWeaponB);
      activeTab = "Weapons";
      renderWeaponCompare();
      showToast(t("comparePicked").replace("{w}", itemName(id)), "warn");
      return;
    }
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    addItem(btn.dataset.add, Number(btn.dataset.amount));
  });

  if (els.weaponCompareArea) {
    els.weaponCompareArea.addEventListener("change", (e) => {
      if (e.target.id === "compareSelectA") {
        compareWeaponA = e.target.value;
        localStorage.setItem("pubg_compare_a", compareWeaponA);
        renderWeaponCompare();
      }
      if (e.target.id === "compareSelectB") {
        compareWeaponB = e.target.value;
        localStorage.setItem("pubg_compare_b", compareWeaponB);
        renderWeaponCompare();
      }
    });
    els.weaponCompareArea.addEventListener("click", (e) => {
      const kit = e.target.closest("[data-best-kit]");
      if (kit) addBestKit(kit.dataset.bestKit);
    });
  }

  if (els.fuelCalcArea) {
    els.fuelCalcArea.addEventListener("change", (e) => {
      if (e.target.id === "fuelVehicleSelect") {
        fuelCalcVehicle = e.target.value;
        localStorage.setItem("pubg_fuel_vehicle", fuelCalcVehicle);
        renderFuelCalc();
      }
      if (e.target.id === "fuelTerrainSelect") {
        fuelCalcTerrain = e.target.value;
        localStorage.setItem("pubg_fuel_terrain", fuelCalcTerrain);
        renderFuelCalc();
      }
      if (e.target.id === "fuelKmInput") {
        fuelCalcKm = Math.max(0.5, Math.min(40, Number(e.target.value) || 1));
        localStorage.setItem("pubg_fuel_km", String(fuelCalcKm));
        renderFuelCalc();
      }
    });
    els.fuelCalcArea.addEventListener("click", (e) => {
      const addBtn = e.target.closest("[data-add]");
      if (addBtn) addItem(addBtn.dataset.add, Number(addBtn.dataset.amount) || 1);
    });
  }

  els.inventoryGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;
    removeItem(btn.dataset.remove, Number(btn.dataset.amount));
  });

  els.navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveView(btn.dataset.view);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  if (els.mapsArea) {
    window.addEventListener(
      "resize",
      () => {
        if (activeView === "maps" || activeView === "original") applyMapTransform();
      },
      { passive: true }
    );

    els.mapsArea.addEventListener("click", (e) => {
      if (mapGestureMoved) {
        mapGestureMoved = false;
        return;
      }
      const layerTab = e.target.closest("[data-map-category]");
      if (layerTab) {
        setMapCategory(layerTab.dataset.mapCategory);
        renderLang();
        renderMaps();
        return;
      }

      const mapTab = e.target.closest("[data-secret-map]");
      if (mapTab) {
        activeSecretMap = mapTab.dataset.secretMap;
        activePinId = "";
        measurePoints = [];
        resetMapView();
        renderMaps();
        return;
      }

      if (e.target.closest("[data-measure-toggle]")) {
        measureMode = !measureMode;
        measurePoints = [];
        renderMaps();
        return;
      }

      if (e.target.closest("[data-measure-clear]")) {
        measurePoints = [];
        renderMaps();
        return;
      }

      const zoomBtn = e.target.closest("[data-zoom]");
      if (zoomBtn) {
        const action = zoomBtn.dataset.zoom;
        if (action === "in") mapZoom = clampZoom(mapZoom * 1.35);
        if (action === "out") mapZoom = clampZoom(mapZoom / 1.35);
        if (action === "reset") {
          activePinId = "";
          resetMapView();
          updateMapSelection();
          return;
        }
        if (mapZoom <= MAP_ZOOM_MIN + 0.02) {
          mapZoom = MAP_ZOOM_MIN;
          mapOriginX = 50;
          mapOriginY = 50;
          mapPanX = 0;
          mapPanY = 0;
        }
        applyMapTransform();
        return;
      }

      // Free-draw distance: click anywhere on the map photo/layer
      if (measureMode && e.target.closest(".map-stage") && !e.target.closest(".zoom-controls")) {
        const pct = clientToMapPct(e.clientX, e.clientY);
        if (pct) {
          pushMeasurePoint(pct);
          renderMaps();
          return;
        }
      }

      const pinBtn = e.target.closest("[data-pin]");
      if (pinBtn) {
        const current = getSecretMap(activeSecretMap);
        let pin = null;
        if (pinBtn.classList.contains("map-pin") || e.target.closest(".map-stage")) {
          pin = pickNearestPinAt(e.clientX, e.clientY);
        }
        if (!pin) pin = (current?.pins || []).find((p) => p.id === pinBtn.dataset.pin);
        if (!pin) return;
        focusPin(pin);
        updateMapSelection();
        return;
      }

      // Click empty map area in All/services → still pick nearest icon
      if (e.target.closest(".map-stage") && isServicesView()) {
        const nearest = pickNearestPinAt(e.clientX, e.clientY);
        if (nearest) {
          focusPin(nearest);
          updateMapSelection();
        }
        return;
      }

      const btn = e.target.closest("[data-add]");
      if (!btn) return;
      addItem(btn.dataset.add, Number(btn.dataset.amount));
    });
  }

  if (els.originalArea) {
    document.addEventListener("fullscreenchange", () => {
      if (activeView === "original") {
        requestAnimationFrame(() => {
          applyMapTransform();
          setTimeout(applyMapTransform, 80);
        });
      }
    });
    els.originalArea.addEventListener("click", (e) => {
      if (mapGestureMoved) {
        mapGestureMoved = false;
        return;
      }
      const mapTab = e.target.closest("[data-original-map]");
      if (mapTab) {
        activeOriginalMap = mapTab.dataset.originalMap;
        localStorage.setItem("pubg_original_map", activeOriginalMap);
        measurePoints = [];
        resetMapView();
        renderOriginalMaps();
        return;
      }
      if (e.target.closest("[data-measure-toggle]")) {
        measureMode = !measureMode;
        measurePoints = [];
        refreshOriginalMeasureUi();
        return;
      }
      if (e.target.closest("[data-measure-clear]")) {
        measurePoints = [];
        refreshOriginalMeasureUi();
        return;
      }
      if (e.target.closest("[data-original-fs]")) {
        const viewer = els.originalArea?.querySelector(".original-viewer") || els.originalArea?.querySelector(".secret-viewer");
        if (!viewer) return;
        const exit = document.fullscreenElement || document.webkitFullscreenElement;
        if (exit) {
          (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
        } else {
          measureMode = true;
          refreshOriginalMeasureUi();
          (viewer.requestFullscreen || viewer.webkitRequestFullscreen)?.call(viewer);
        }
        requestAnimationFrame(() => {
          applyMapTransform();
          setTimeout(applyMapTransform, 120);
        });
        return;
      }
      const zoomBtn = e.target.closest("[data-zoom]");
      if (zoomBtn) {
        const action = zoomBtn.dataset.zoom;
        if (action === "in") mapZoom = clampZoom(mapZoom * 1.35);
        if (action === "out") mapZoom = clampZoom(mapZoom / 1.35);
        if (action === "reset") {
          resetMapView();
          applyMapTransform();
          return;
        }
        if (mapZoom <= MAP_ZOOM_MIN + 0.02) {
          mapZoom = MAP_ZOOM_MIN;
          mapOriginX = 50;
          mapOriginY = 50;
          mapPanX = 0;
          mapPanY = 0;
        }
        applyMapTransform();
        return;
      }
      if (measureMode && e.target.closest(".map-stage") && !e.target.closest(".zoom-controls") && !e.target.closest(".fs-measure-bar")) {
        const pct = clientToMapPct(e.clientX, e.clientY);
        if (pct) {
          pushMeasurePoint(pct);
          refreshOriginalMeasureUi();
        }
      }
    });
  }

  if (els.profileBar) {
    els.profileBar.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-profile]");
      if (chip) {
        switchProfile(chip.dataset.profile);
        return;
      }
      if (e.target.closest("[data-profile-add]")) {
        addProfile();
        return;
      }
      if (e.target.closest("[data-profile-rename]")) {
        renameActiveProfile();
        return;
      }
      if (e.target.closest("[data-profile-delete]")) {
        deleteActiveProfile();
      }
    });
  }

  els.shareLinkBtn?.addEventListener("click", async () => {
    const ok = await copyText(shareUrl());
    showToast(ok ? t("shareCopied") : t("shareFailed"), ok ? "warn" : "danger");
  });

  els.shareCodeBtn?.addEventListener("click", async () => {
    const ok = await copyText(encodeLoadout());
    showToast(ok ? t("shareCopied") : t("shareFailed"), ok ? "warn" : "danger");
  });

  els.importBagBtn?.addEventListener("click", () => setImportOpen(true));
  els.importCancelBtn?.addEventListener("click", () => setImportOpen(false));
  els.importConfirmBtn?.addEventListener("click", () => {
    const data = decodeLoadout(els.importInput?.value || "");
    if (!data) {
      showToast(t("importBad"), "danger");
      return;
    }
    applyLoadoutToActive(data, { rename: !!data.name });
    setImportOpen(false);
    showToast(t("importOk"), "warn");
    render();
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select, [contenteditable='true']")) return;

    if (activeView === "maps" || activeView === "original") {
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomAtCenter(mapZoom * 1.35);
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomAtCenter(mapZoom / 1.35);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (activeView === "original") {
          measurePoints = [];
          resetMapView();
          renderOriginalMaps();
          return;
        }
        activePinId = "";
        resetMapView();
        updateMapSelection();
        return;
      }
    }

    if (e.key === "Escape" && els.importPanel && !els.importPanel.classList.contains("hidden")) {
      setImportOpen(false);
    }
  });

  tryImportFromUrl();
  setActiveView(activeView, { refresh: false });
  render();
})();
