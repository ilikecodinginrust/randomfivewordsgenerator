const wordEl = document.getElementById("word");
const copyBtn = document.getElementById("copy");
const nextBtn = document.getElementById("next");
const labelEl = copyBtn.querySelector(".label");
const checkEl = copyBtn.querySelector(".check");

// Resolved once at startup. Only IPv4 can be carried: five words hold 44 bits.
const IP_SOURCES = [
  { url: "https://ipv4.icanhazip.com", type: "text" },
  { url: "https://api.ipify.org?format=json", type: "json" },
  { url: "https://ipwho.is/?fields=ip", type: "json" },
];
const IP_TIMEOUT = 4000;

let current = [];
let lastKey = "";
let swapTimer = null;
let copyTimer = null;
let clientIp = "";
let nonce = Math.floor(Math.random() * 64);

function fetchIp() {
  return (async () => {
    for (const source of IP_SOURCES) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), IP_TIMEOUT);

      try {
        const response = await fetch(source.url, {
          signal: controller.signal,
          cache: "no-store",
          credentials: "omit",
        });
        if (!response.ok) continue;

        const address =
          source.type === "json"
            ? (await response.json()).ip
            : (await response.text()).trim();

        if (typeof address === "string" && parseIpv4(address.trim())) {
          return address.trim();
        }
      } catch {
        /* try the next source */
      } finally {
        clearTimeout(timer);
      }
    }

    return "";
  })();
}

// Fallback for visitors with no IPv4 at all: still five words, just random.
function pickWords() {
  const pool = WORDS.slice();
  const picked = [];

  for (let i = 0; i < PICK && pool.length; i++) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }

  return picked;
}

function wordsForDisplay() {
  if (clientIp) {
    const encoded = encodeWords(clientIp, nonce);
    if (encoded) return encoded.words;
  }

  return pickWords();
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
    words = wordsForDisplay();
    key = words.join(" ");
  } while (key === lastKey && WORDS.length > PICK);

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

  const ok = await writeClipboard(current.join(" "));
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
nextBtn.addEventListener("click", () => {
  nonce = (nonce + 1) % 64;
  showWords(true);
});

wordEl.addEventListener("click", () => showWords(true));
wordEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    showWords(true);
  }
});

showWords(false);

// Nothing on the page uses this; it is here so the encoding can be checked from
// the console without the clipboard.
window.fiveWords = {
  get ip() {
    return clientIp;
  },
  get nonce() {
    return nonce;
  },
  get words() {
    return current.slice();
  },
  get code() {
    return clientIp ? codeFor(parseIpv4(clientIp), nonce) : null;
  },
  decode(text = current.join(" ")) {
    return decodeWords(parseWords(text));
  },
};

fetchIp().then((ip) => {
  clientIp = ip;
  if (!ip) {
    console.warn("[five-words] no IPv4 source reachable; words stay random");
    return;
  }
  showWords(false);
});
