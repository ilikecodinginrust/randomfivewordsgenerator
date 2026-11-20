/*
 * Zero-width carrier codec.
 *
 * Payload = START, then 8 base-4 digits per UTF-16 code unit (2 bits each,
 * most significant pair first), then END. Every character used is a
 * zero-advance code point, so the encoded string renders as nothing at all in
 * any text field it is pasted into.
 */

const ZW_ALPHABET = ["\u200B", "\u200C", "\u200D", "\u2063"]; // ZWSP, ZWNJ, ZWJ, INVISIBLE SEPARATOR
const ZW_START = "\u2060";   // WORD JOINER
const ZW_END = "\u2062";     // INVISIBLE TIMES

// Everything the checker treats as "an invisible character worth reporting".
const INVISIBLE_SET = new Set([
  "\u200B", "\u200C", "\u200D", "\u200E", "\u200F",
  "\u2060", "\u2061", "\u2062", "\u2063", "\u2064",
  "\uFEFF",
]);

function encodeInvisible(text) {
  let out = ZW_START;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    for (let shift = 14; shift >= 0; shift -= 2) {
      out += ZW_ALPHABET[(code >> shift) & 0x3];
    }
  }

  return out + ZW_END;
}

function decodeInvisible(text) {
  const start = text.indexOf(ZW_START);
  if (start === -1) {
    return { ok: false, reason: "no payload marker found" };
  }

  const end = text.indexOf(ZW_END, start + 1);
  if (end === -1) {
    return { ok: false, reason: "payload marker found but never terminated" };
  }

  const body = text.slice(start + 1, end);
  let value = "";
  let acc = 0;
  let bits = 0;

  for (let i = 0; i < body.length; i++) {
    const digit = ZW_ALPHABET.indexOf(body[i]);
    if (digit === -1) {
      const cp = body.codePointAt(i).toString(16).toUpperCase().padStart(4, "0");
      return { ok: false, reason: `unexpected U+${cp} inside the payload` };
    }

    acc = (acc << 2) | digit;
    bits += 2;

    if (bits === 16) {
      value += String.fromCharCode(acc);
      acc = 0;
      bits = 0;
    }
  }

  return {
    ok: true,
    value,
    body,
    start,
    end,
    danglingBits: bits, // 0 for a well-formed payload
  };
}

function invisibleStats(text) {
  const counts = new Map();
  let total = 0;

  for (const ch of text) {
    if (INVISIBLE_SET.has(ch)) {
      total++;
      counts.set(ch, (counts.get(ch) || 0) + 1);
    }
  }

  return { total, counts };
}

// Render a pasted string with each invisible code point replaced by a visible
// token, so a viewer can see exactly where the hidden run sits.
function revealInvisible(text) {
  let out = "";
  for (const ch of text) {
    if (INVISIBLE_SET.has(ch)) {
      const cp = ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
      out += `[U+${cp}]`;
    } else {
      out += ch;
    }
  }
  return out;
}
