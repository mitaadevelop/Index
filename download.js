// Downloadpagina van Index: kiest de juiste installer voor de computer van de bezoeker
// en vult versie en bestandsgrootte aan vanuit de laatste release op GitHub.
// Zonder JavaScript werkt de pagina ook: de knop gaat dan naar de releasepagina en
// de lijst "Alle downloads" heeft vaste links.
(function () {
  "use strict";

  const REPO = "mitaadevelop/Index";
  const LATEST_PAGE = `https://github.com/${REPO}/releases/latest`;
  const DOWNLOAD = `${LATEST_PAGE}/download/`;

  // Vaste bestandsnamen: de release-workflow uploadt elke installer ook zonder versienummer.
  const TARGETS = {
    "mac-arm": {
      file: "index-macos-apple-silicon.dmg",
      button: "Download voor Mac",
      note: "Voor Macs met een Apple-chip (M1 of nieuwer)",
      alt: { text: "Mac met een Intel-processor?", link: "Download de Intel-versie", key: "mac-intel" },
      help: "help-mac",
    },
    "mac-intel": {
      file: "index-macos-intel.dmg",
      button: "Download voor Mac",
      note: "Voor Macs met een Intel-processor",
      alt: { text: "Mac met een Apple-chip?", link: "Download die versie", key: "mac-arm" },
      help: "help-mac",
    },
    win: {
      file: "index-windows-setup.exe",
      button: "Download voor Windows",
      note: "Voor Windows 10 en 11",
      help: "help-win",
    },
    linux: {
      file: "index-linux.AppImage",
      button: "Download voor Linux",
      note: "AppImage, voor de meeste distributies",
      alt: { text: "Debian of Ubuntu?", link: "Download het .deb-pakket", key: "linux-deb" },
      help: "help-linux",
    },
    "linux-deb": { file: "index-linux.deb" },
  };

  const $ = (id) => document.getElementById(id);

  // Welke Mac? Chrome en Edge noemen de architectuur. Safari en Firefox niet, maar daar
  // verraadt de grafische chip het vaak ("Apple M1" of "Intel …"). Lukt beide niet, dan
  // de Apple-chip: de meeste Macs hebben die inmiddels, en de Intel-link staat eronder.
  async function macArch() {
    try {
      const ua = navigator.userAgentData;
      if (ua && ua.getHighEntropyValues) {
        const v = await ua.getHighEntropyValues(["architecture"]);
        if (v.architecture === "arm") return "mac-arm";
        if (v.architecture === "x86") return "mac-intel";
      }
    } catch (e) { /* niet beschikbaar */ }
    try {
      const gl = document.createElement("canvas").getContext("webgl");
      const ext = gl && gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
      if (/Apple M\d/i.test(renderer)) return "mac-arm";
      if (/Intel|AMD|Radeon|NVIDIA|GeForce/i.test(renderer)) return "mac-intel";
    } catch (e) { /* geen WebGL */ }
    return "mac-arm";
  }

  async function detect() {
    const ua = navigator.userAgent || "";
    const data = navigator.userAgentData;
    const platform = (data && data.platform) || navigator.platform || "";
    // iPadOS doet zich in Safari voor als Mac, maar heeft een touchscherm.
    const ipad = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
    if ((data && data.mobile) || ipad || /Android|iPhone|iPad|iPod/i.test(ua)) return "mobile";
    if (/Win/i.test(platform) || /Windows NT/.test(ua)) return "win";
    if (/Mac/i.test(platform) || /Mac OS X/.test(ua)) return macArch();
    if (/CrOS/.test(ua)) return "other";
    if (/Linux|X11/i.test(platform) || /Linux|X11/.test(ua)) return "linux";
    return "other";
  }

  function showDetected(key) {
    const main = $("dl-main");
    const label = $("dl-main-label");
    const note = $("dl-main-note");
    const alt = $("dl-alt");
    const notice = $("dl-notice");
    const t = TARGETS[key];

    if (key === "mobile") {
      main.hidden = true;
      note.hidden = true;
      notice.textContent = "Index is een app voor je computer: macOS, Windows of Linux. Open deze pagina op je computer om hem te downloaden.";
      notice.hidden = false;
      return;
    }
    if (!t) {
      main.href = "#alle-downloads";
      label.textContent = "Kies je systeem";
      note.textContent = "Index is er voor macOS, Windows en Linux";
      return;
    }

    main.href = DOWNLOAD + t.file;
    main.dataset.file = t.file;
    label.textContent = t.button;
    note.textContent = t.note;
    note.dataset.base = t.note;
    if (t.alt) {
      const a = document.createElement("a");
      a.href = DOWNLOAD + TARGETS[t.alt.key].file;
      a.dataset.file = TARGETS[t.alt.key].file;
      a.textContent = t.alt.link;
      alt.replaceChildren(document.createTextNode(t.alt.text + " "), a);
      alt.hidden = false;
    }

    // Markeer de rij in de lijst en klap de juiste uitleg open.
    const row = document.querySelector(`.dl-row[data-key="${key}"]`);
    if (row) {
      row.classList.add("is-match");
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "Jouw systeem";
      row.querySelector(".dl-os").append(badge);
    }
    const help = $(t.help);
    if (help) help.open = true;
  }

  function sizeLabel(bytes) {
    return Math.max(1, Math.round(bytes / (1024 * 1024))) + " MB";
  }

  // Versie, datum en groottes uit de laatste release. Bestaat er nog geen release, dan
  // zeggen we dat eerlijk in plaats van naar een download te linken die niet werkt.
  async function loadRelease() {
    let res;
    try {
      res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
        headers: { Accept: "application/vnd.github+json" },
      });
    } catch (e) {
      return; // offline of geblokkeerd: de vaste links blijven gewoon werken
    }

    if (res.status === 404) {
      document.querySelectorAll("#dl-main, [data-file]").forEach((el) => {
        el.classList.add("is-disabled");
        el.setAttribute("aria-disabled", "true");
        el.removeAttribute("href");
      });
      const notice = $("dl-notice");
      const soon = "De eerste versie verschijnt binnenkort. Kom later nog eens terug.";
      notice.textContent = notice.hidden ? soon : notice.textContent + " " + soon;
      notice.hidden = false;
      return;
    }
    if (!res.ok) return; // bv. te veel verzoeken: de vaste links blijven werken

    const release = await res.json();
    const assets = new Map((release.assets || []).map((a) => [a.name, a]));

    document.querySelectorAll("[data-file]").forEach((el) => {
      const asset = assets.get(el.dataset.file);
      if (!asset) {
        el.href = release.html_url || LATEST_PAGE; // dit bestand ontbreekt: naar de releasepagina
        return;
      }
      const size = el.closest(".dl-row") && el.closest(".dl-row").querySelector(".dl-size");
      if (size) size.textContent = sizeLabel(asset.size);
    });

    const version = String(release.tag_name || "").replace(/^v/, "");
    const main = $("dl-main");
    const note = $("dl-main-note");
    const mainAsset = main.dataset.file && assets.get(main.dataset.file);
    if (version && note.dataset.base) {
      note.textContent = [note.dataset.base, "versie " + version, mainAsset ? sizeLabel(mainAsset.size) : ""]
        .filter(Boolean).join(" · ");
    }

    const line = $("version-line");
    const date = release.published_at
      ? new Date(release.published_at).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
      : "";
    const notes = document.createElement("a");
    notes.href = release.html_url || LATEST_PAGE;
    notes.textContent = "Wat is er nieuw";
    line.replaceChildren(
      document.createTextNode(["Versie " + version, date ? "uitgebracht op " + date : ""].filter(Boolean).join(", ") + " · "),
      notes,
    );
    line.hidden = !version;
  }

  // Eerst de knop kiezen, dan pas de release-info toepassen: anders kan de keuze een
  // knop die net is uitgeschakeld (nog geen release) weer een link geven.
  detect()
    .then(showDetected)
    .catch(() => {})
    .then(loadRelease)
    .catch(() => {});
})();
