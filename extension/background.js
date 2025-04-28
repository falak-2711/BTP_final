const tabResults = {}; // Stores results per tabId

chrome.action.onClicked.addListener((tab) => {
  const tabId = tab.id;
  const url = tab.url;

  if (!url) return;

  chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
    if (!dataUrl) return;

    // Show loading/fetching indicator
    chrome.action.setBadgeText({ text: "..." });
    chrome.action.setBadgeBackgroundColor({ color: "#808080" });

    uploadScreenshot(dataUrl, url, tabId);
  });
});

function uploadScreenshot(dataUrl, url, tabId) {
  fetch("http://localhost:3001/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: dataUrl, url }),
  })
    .then((res) => res.json())
    .then((result) => {
      const isGenuine = result.verification_result;
      const badgeText = isGenuine ? "✔" : "⚠";
      const badgeColor = isGenuine ? "#00cc66" : "#cc0000";

      tabResults[tabId] = { url, badgeText, badgeColor };

      chrome.action.setBadgeText({ text: badgeText });
      chrome.action.setBadgeBackgroundColor({ color: badgeColor });

      console.log("Server response:", result);
    })
    .catch((error) => {
      console.error("Error uploading screenshot:", error);
      chrome.action.setBadgeText({ text: "X" });
      chrome.action.setBadgeBackgroundColor({ color: "#ff0000" });
    });
}

// ✅ When tab is switched, check if we have a stored result
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    const currentUrl = tab.url;

    const result = tabResults[tabId];

    if (result && result.url === currentUrl) {
      // Restore previous badge
      chrome.action.setBadgeText({ text: result.badgeText });
      chrome.action.setBadgeBackgroundColor({ color: result.badgeColor });
    } else {
      // Unknown or new tab, reset
      chrome.action.setBadgeText({ text: "" });
    }
  });
});

// 🧠 Optional: also handle URL changes in the same tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    // Reset because URL changed
    chrome.action.setBadgeText({ text: "" });
    delete tabResults[tabId];
  }
});