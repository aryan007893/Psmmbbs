const profileBox = document.getElementById("profile");
const status = document.getElementById("status");

chrome.storage.local.get(["profile"], ({profile}) => {
  profileBox.value = JSON.stringify(profile || {}, null, 2);
});

document.getElementById("save").addEventListener("click", async () => {
  try {
    const profile = JSON.parse(profileBox.value || "{}");
    if (!profile || Array.isArray(profile) || typeof profile !== "object") throw new Error("Profile must be a JSON object.");
    await chrome.storage.local.set({profile});
    status.textContent = "Profile saved locally.";
  } catch (e) {
    status.textContent = "Invalid JSON: " + e.message;
  }
});

document.getElementById("fill").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  if (!tab?.url?.startsWith("https://docs.google.com/forms/")) {
    status.textContent = "Open a Google Form first.";
    return;
  }
  const {profile = {}} = await chrome.storage.local.get(["profile"]);
  chrome.tabs.sendMessage(tab.id, {type: "FORMPILOT_FILL", profile}, response => {
    if (chrome.runtime.lastError) status.textContent = "Refresh the form tab and try again.";
    else status.textContent = response?.message || "Fill request sent.";
  });
});
