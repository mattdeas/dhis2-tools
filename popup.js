import { getInstance, getDataElementId, cocUrl, exportUrl, exportFilename } from "./dhis2.js";

const $ = (s) => document.querySelector(s);
const statusEl = $("#status");

function setStatus(text, kind = "") {
  statusEl.textContent = text;
  statusEl.className = "status " + kind;
}

const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
const inst = getInstance(tab?.url);

if (!inst) {
  $("#server").textContent = "No DHIS2 page";
  const n = $("#notice");
  n.hidden = false;
  n.textContent = "Open a page on your DHIS2 server, then click the extension again.";
} else {
  $("#server").textContent = inst.host;
  $("#base").textContent = inst.basePath ? `Path: ${inst.basePath}` : "";
  $("#main").hidden = false;
  if (!inst.looksLikeDhis2) {
    setStatus("This tab may not be a DHIS2 app. Downloads will use this site's /api.", "");
  }

  // Data element / COCs
  const deId = getDataElementId(tab.url);
  const cocBtn = $("#coc-btn");
  if (deId) {
    $("#de-info").innerHTML = `ID <code>${deId}</code>`;
    cocBtn.disabled = false;
    cocBtn.addEventListener("click", () => {
      chrome.windows.create({ url: cocUrl(tab.url), type: "normal" });
      window.close();
    });
  } else {
    $("#de-info").textContent = "Open a data element in the maintenance app to see its COCs.";
  }

  // Exports
  const saved = (await chrome.storage.local.get("fields")).fields || {};
  document.querySelectorAll(".export").forEach((box) => {
    const resource = box.dataset.resource;
    const input = box.querySelector("input");
    const details = box.querySelector("details");
    input.value = saved[resource] || "";
    if (input.value) details.open = true;

    box.querySelector(".suggest").addEventListener("click", () => {
      input.value = box.dataset.suggest;
      input.dispatchEvent(new Event("change"));
    });
    input.addEventListener("change", () => {
      saved[resource] = input.value.trim();
      chrome.storage.local.set({ fields: saved });
    });

    box.querySelector(".dl").addEventListener("click", () => download(resource, input.value));
  });
}

async function download(resource, fields) {
  const url = exportUrl(tab.url, resource, fields);
  const filename = exportFilename(tab.url, resource);
  setStatus(`Downloading ${filename}…`);
  try {
    const id = await chrome.downloads.download({ url, filename, conflictAction: "uniquify" });
    watch(id, filename);
  } catch (e) {
    setStatus(`Download failed: ${e.message}`, "err");
  }
}

function watch(id, filename) {
  const listener = async (delta) => {
    if (delta.id !== id || !delta.state) return;
    if (delta.state.current === "complete") {
      chrome.downloads.onChanged.removeListener(listener);
      const [item] = await chrome.downloads.search({ id });
      if (item?.mime?.includes("html")) {
        setStatus("Saved, but the file looks like a login page. Log in to DHIS2 in this browser and try again.", "err");
      } else {
        setStatus(`Saved ${filename}`, "ok");
      }
    } else if (delta.state.current === "interrupted") {
      chrome.downloads.onChanged.removeListener(listener);
      setStatus(`Download stopped (${delta.error?.current || "unknown error"}).`, "err");
    }
  };
  chrome.downloads.onChanged.addListener(listener);
}
