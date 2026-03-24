const GITHUB_API_URL = "https://api.github.com/repos/Axthauvin/better-zeus/releases/latest";
const ZEUS_URL = "https://zeus.ionis-it.com/home";

// ---
// 1. Handle clicking on the extension icon
// ---

// Chrome uses chrome.action in MV3, Firefox uses browserAction or action
const actionApi = chrome.action || chrome.browserAction;

if (actionApi) {
  actionApi.onClicked.addListener(() => {
    chrome.tabs.create({ url: ZEUS_URL });
  });
}

// ---
// 2. Check for updates from GitHub Releases
// ---

async function checkForUpdates() {
  try {
    const result = await new Promise(resolve => chrome.storage.local.get(['lastUpdateCheck', 'latestVersionCache'], resolve));
    let latestVersion = result.latestVersionCache;
    const now = Date.now();

    // Fetch from GitHub only if cache is missing or older than 1 hour (3600000 ms)
    if (!result.lastUpdateCheck || (now - result.lastUpdateCheck > 3600000) || !latestVersion) {
      const response = await fetch(GITHUB_API_URL);
      if (!response.ok) return;

      const data = await response.json();
      const latestTag = data.tag_name; // e.g., "v1.1.0" or "1.1.0"
      
      latestVersion = latestTag.startsWith('v') ? latestTag.substring(1) : latestTag;
      chrome.storage.local.set({ 
        lastUpdateCheck: now,
        latestVersionCache: latestVersion
      });
    }
    
    const currentVersion = chrome.runtime.getManifest().version;
    
    if (isNewerVersion(currentVersion, latestVersion)) {
      showUpdateNotification(latestVersion);
    }
  } catch (error) {
    console.error("Failed to check for Better Zeus updates:", error.message || error);
  }
}

function isNewerVersion(current, latest) {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const curr = currentParts[i] || 0;
    const lat = latestParts[i] || 0;
    
    if (lat > curr) return true;
    if (lat < curr) return false;
  }
  return false;
}

function showUpdateNotification(version) {
  const notificationId = `better-zeus-update-${version}-${Date.now()}`;
  
  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('src/icons/128x128.png'), 
    title: 'Mise à jour disponible !',
    message: `La version ${version} de Better Zeus est disponible. Cliquez pour voir les nouveautés.`,
    isClickable: true
  });
}

// Handle notification click to open the release page
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId.startsWith('better-zeus-update-')) {
    chrome.tabs.create({ url: "https://github.com/Axthauvin/better-zeus/releases/latest" });
    chrome.notifications.clear(notificationId);
  }
});

// Detect when the user opens the Zeus website
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes("zeus.ionis-it.com")) {
    checkForUpdates();
  }
});

// Run once when the background script starts up
checkForUpdates();

// Check periodically in the background
chrome.alarms.create("checkBetterZeusUpdates", { delayInMinutes: 60, periodInMinutes: 1440 }); // Check daily
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkBetterZeusUpdates") {
    checkForUpdates();
  }
});
