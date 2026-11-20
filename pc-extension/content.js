(() => {
  if (window.__formPilotInstalled) return;
  window.__formPilotInstalled = true;

  const norm = s => (s || "").toLowerCase().replace(/\s+/g, " ").trim();
  // These patient-specific / per-visit fields are intentionally never autofilled.
  const ALWAYS_LEAVE_BLANK = ["patient name", "name of patient", "uhid", "uhid no", "uhid number", "age", "sex", "gender", "department", "name of department"];
  const mustLeaveBlank = label => {
    const q = norm(label).replace(/[^a-z0-9 ]/g, "").trim();
    return ALWAYS_LEAVE_BLANK.some(term => q === term || q.startsWith(term + " ") || q.includes(" " + term + " "));
  };

  function questionBlocks() {
    // Google Forms commonly marks each question as a role=listitem.
    const blocks = [...document.querySelectorAll('[role="listitem"]')];
    return blocks.filter(el => el.querySelector('input, textarea, [role="radio"], [role="checkbox"], [role="listbox"]'));
  }

  function questionLabel(block) {
    const candidates = [
      block.querySelector('[role="heading"]'),
      block.querySelector('.M7eMe'),
      block.querySelector('[data-params]'),
      block
    ].filter(Boolean);
    for (const el of candidates) {
      const text = (el.innerText || el.getAttribute("aria-label") || "").trim();
      if (text) return text.split("\n").map(x => x.trim()).filter(Boolean)[0] || text;
    }
    return "";
  }

  function findAnswer(label, profile) {
    const q = norm(label);
    const entries = Object.entries(profile || {});
    // Prefer exact match, then key contained in question or vice versa.
    let hit = entries.find(([k]) => norm(k) === q);
    if (!hit) hit = entries.find(([k]) => q.includes(norm(k)) || norm(k).includes(q));
    return hit ? hit[1] : undefined;
  }

  function setNativeValue(el, value) {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) setter.call(el, String(value));
    else el.value = String(value);
    el.dispatchEvent(new Event("input", {bubbles: true}));
    el.dispatchEvent(new Event("change", {bubbles: true}));
  }

  function fillBlock(block, answer) {
    if (answer === undefined || answer === null) return false;
    const text = String(answer);
    const input = block.querySelector('input:not([type="radio"]):not([type="checkbox"]), textarea');
    if (input) {
      setNativeValue(input, text);
      return true;
    }

    const radios = [...block.querySelectorAll('[role="radio"]')];
    if (radios.length) {
      const match = radios.find(el => norm(el.innerText || el.getAttribute("aria-label")) === norm(text));
      if (match) { match.click(); return true; }
      return false;
    }

    const checks = [...block.querySelectorAll('[role="checkbox"]')];
    if (checks.length) {
      const wanted = Array.isArray(answer) ? answer.map(norm) : [norm(text)];
      let changed = false;
      for (const el of checks) {
        const label = norm(el.innerText || el.getAttribute("aria-label"));
        const shouldCheck = wanted.includes(label);
        const checked = el.getAttribute("aria-checked") === "true";
        if (shouldCheck !== checked) { el.click(); changed = true; }
      }
      return changed;
    }

    const listbox = block.querySelector('[role="listbox"]');
    if (listbox) {
      listbox.click();
      const option = [...document.querySelectorAll('[role="option"]')]
        .find(el => norm(el.innerText) === norm(text));
      if (option) { option.click(); return true; }
    }
    return false;
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type !== "FORMPILOT_FILL") return;
    const blocks = questionBlocks();
    let filled = 0, unmatched = 0;
    for (const block of blocks) {
      const label = questionLabel(block);
      if (mustLeaveBlank(label)) { unmatched++; continue; }
      const answer = findAnswer(label, msg.profile);
      if (answer === undefined) { unmatched++; continue; }
      if (fillBlock(block, answer)) filled++;
      else unmatched++;
    }
    sendResponse({message: `Filled ${filled} question(s). ${unmatched} unmatched or unsupported. Review every answer before submitting.`});
  });
})();
