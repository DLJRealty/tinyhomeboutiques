/* tinyhomeboutiques.com -> Hospitable widget attribution. Staged 2026-09-10 (Marketing). NOT LIVE.
   MEASURED FACT (cdn.hsptb.com widget-loader.prod.js, 4995 bytes, read 2026-09-10 23:45 ET): the loader copies
   window.location.search of OUR page into its iframe src, but only these names:
     checkin checkout adults children infants pets locale source utm_source utm_medium utm_campaign utm_term utm_content theme
   gclid / fbclid / _gl (GA4 linker) are DROPPED. data-* cannot extend the list (closed).
   So: (1) persist inbound campaign params for this tab, (2) re-apply them to the URL BEFORE the loader reads it,
   (3) always tag the widget with source=tinyhomeboutiques.com so a booking made through our pages is
   distinguishable from one made on Hospitable's own hosted page. Same values re-applied in-session = no GA4 distortion. */
(function () {
  try {
    var KEEP = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    var KEY = "thb_attr";
    var q = new URLSearchParams(location.search);
    var stored = {};
    try { stored = JSON.parse(sessionStorage.getItem(KEY) || "{}") || {}; } catch (e) { stored = {}; }
    var inbound = {};
    KEEP.forEach(function (k) { var v = q.get(k); if (v) inbound[k] = v; });
    // Click-ids are not forwarded by the loader; keep the CHANNEL as a utm pair when no utm_source came with them.
    // INFERRED, NOT MEASURED (CEO 2026-09-11 00:01): a channel derived from a click-id is tagged utm_term=inferred-<clickid>
    // so a later report can say "N measured, M inferred" instead of one blended number. A measured campaign never gets this tag.
    if (!inbound.utm_source) {
      var inferred = null;
      if (q.get("gclid"))       { inbound.utm_source = "google";   inbound.utm_medium = inbound.utm_medium || "cpc";    inferred = "gclid"; }
      else if (q.get("fbclid")) { inbound.utm_source = "facebook"; inbound.utm_medium = inbound.utm_medium || "social"; inferred = "fbclid"; }
      else if (q.get("ttclid")) { inbound.utm_source = "tiktok";   inbound.utm_medium = inbound.utm_medium || "social"; inferred = "ttclid"; }
      if (inferred && !inbound.utm_term) inbound.utm_term = "inferred-" + inferred;
    }
    var slug = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
    var attr = inbound.utm_source ? inbound : stored;      // latest campaign touch in this tab wins
    if (attr.utm_source && !attr.utm_content) attr.utm_content = slug;   // landing page, only when a campaign exists
    if (attr.utm_source) { try { sessionStorage.setItem(KEY, JSON.stringify(attr)); } catch (e) {} }
    var changed = false;
    Object.keys(attr).forEach(function (k) { if (!q.has(k)) { q.set(k, attr[k]); changed = true; } });
    if (!q.has("source")) { q.set("source", "tinyhomeboutiques.com"); changed = true; }
    if (changed && window.history && history.replaceState) {
      history.replaceState(history.state, "", location.pathname + "?" + q.toString() + location.hash);
    }
  } catch (e) { /* attribution must never break the page */ }
})();
