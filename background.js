import { cocUrl } from "./dhis2.js";

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== "show-cocs") return;
  if (!tab) [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = cocUrl(tab?.url);
  if (url) {
    chrome.windows.create({ url, type: "normal" });
  } else {
    chrome.action.setBadgeText({ text: "?", tabId: tab?.id });
    chrome.action.setBadgeBackgroundColor({ color: "#b3261e", tabId: tab?.id });
    setTimeout(() => chrome.action.setBadgeText({ text: "", tabId: tab?.id }), 2000);
  }
});
