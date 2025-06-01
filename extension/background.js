const tabResults = {}; // Stores results per tabId

// Automatically take screenshot when page is fully loaded
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active && tab.url.startsWith("http")) {
    // Automatically capture screenshot once page is fully loaded
    setTimeout(() => {
      captureAndUpload(tabId, tab.url);
    }, 2000);
  }

  if (changeInfo.url) {
    // URL changed, reset any badge
    chrome.action.setBadgeText({ text: "" });
    delete tabResults[tabId];
  }
});

// Also keep manual action (if still needed)
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.id !== undefined) {
    captureAndUpload(tab.id, tab.url);
  }
});

function captureAndUpload(tabId, url) {
  chrome.tabs.get(tabId, (tab) => {
    if (!tab) return;

    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (!dataUrl) return;

      // Show loading indicator
      chrome.action.setBadgeText({ text: "..." });
      chrome.action.setBadgeBackgroundColor({ color: "#808080" });

      uploadScreenshot(dataUrl, url, tabId);
    });
  });
}

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

// Restore badge on tab switch
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    const currentUrl = tab.url;
    const result = tabResults[tabId];

    if (result && result.url === currentUrl) {
      chrome.action.setBadgeText({ text: result.badgeText });
      chrome.action.setBadgeBackgroundColor({ color: result.badgeColor });
    } else {
      chrome.action.setBadgeText({ text: "" });
    }
  });
});
