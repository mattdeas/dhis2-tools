// Shared helpers for working out the DHIS2 instance from a tab URL.

export const COC_FIELDS = "categoryCombo[categoryOptionCombos[id,name]]";

// Returns { origin, basePath, apiRoot, host } or null if the URL isn't http(s).
export function getInstance(tabUrl) {
  if (!tabUrl) return null;
  let url;
  try { url = new URL(tabUrl); } catch { return null; }
  if (!/^https?:$/.test(url.protocol)) return null;
  // Keep any context path before /dhis-web-..., /api or /dhis-web, e.g. https://host/dhis/...
  let basePath = url.pathname.split(/\/dhis-web-|\/api\//)[0];
  if (!url.pathname.includes("/dhis-web-") && !url.pathname.includes("/api/")) basePath = "";
  basePath = basePath.replace(/\/$/, "");
  return {
    origin: url.origin,
    basePath,
    apiRoot: `${url.origin}${basePath}/api`,
    host: url.hostname,
    looksLikeDhis2: url.pathname.includes("/dhis-web-") || url.pathname.includes("/api/"),
  };
}

// Returns the data element UID from a maintenance-app URL, or null.
export function getDataElementId(tabUrl) {
  if (!tabUrl) return null;
  const m = tabUrl.match(/dataElements?\/([A-Za-z][A-Za-z0-9]{10})(?![A-Za-z0-9])/);
  return m ? m[1] : null;
}

export function cocUrl(tabUrl) {
  const inst = getInstance(tabUrl);
  const id = getDataElementId(tabUrl);
  if (!inst || !id) return null;
  return `${inst.apiRoot}/dataElements/${id}.json?fields=${COC_FIELDS}`;
}

export function exportUrl(tabUrl, resource, fields) {
  const inst = getInstance(tabUrl);
  if (!inst) return null;
  let url = `${inst.apiRoot}/${resource}.csv?paging=false`;
  const f = (fields || "").replace(/\s+/g, "");
  if (f) url += `&fields=${encodeURIComponent(f).replace(/%2C/g, ",")}`;
  return url;
}

export function exportFilename(tabUrl, resource) {
  const inst = getInstance(tabUrl);
  const date = new Date().toISOString().slice(0, 10);
  const host = inst ? inst.host.split(".")[0] : "dhis2";
  return `${host}_${resource}_${date}.csv`;
}
