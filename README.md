# randomfivewordsgenerator

Five random words, and a copy button. That's the whole page.

Except the words aren't random. They're your address.

## What it actually does

When the page loads it asks a public IP-echo service who you are, then picks the
five words so that **the words themselves encode that address**. No zero-width
characters, no invisible ink, no trailing space, nothing appended to the
clipboard. Copy the text and you copy five ordinary words, all of them visible,
all of them in the dictionary. The information is in *which* five.

Same words, same address. The page deals a fresh set of five on every visit and
on every click of **another**, but the address underneath never changes.

## How the encoding works

The list in `words.js` holds 512 words. Five distinct words, read as digits in a
mixed radix, form one number:

```
code = ((((d0 × 511) + d1) × 510 + d2) × 509 + d3) × 508 + d4
```

`d0` is the rank of the first word in the full 512-word list, `d1` the rank of
the second word among the 511 that are left, and so on — the same walk you take
when picking five words without replacement.

`512 × 511 × 510 × 509 × 508 = 34,501,861,847,040`, about 44.97 bits, which is
just enough to hold:

| bits | contents |
|---|---|
| 0–31 | IPv4 address, big-endian |
| 32–37 | six-bit FNV-1a checksum over the four address bytes |
| 38–43 | six-bit nonce, so each visit can show a different five words |

The checksum is what stops the page from claiming that any five words are a
payload: an unrelated five-word set clears it about once in 64 tries.

## Decoding it yourself

The page exposes the decoder, so you don't have to take any of this on faith.
Open the console on the deployed page:

```js
fiveWords.decode("moss ash tarn larch sycamore")
// { ok: false, reason: "the five words decode, but the checksum does not match", ... }

fiveWords.decode()   // decodes the five words currently on screen
// { ok: true, ip: "203.0.113.42", nonce: 17, code: 4843833946410, digits: [...] }
```

`words.js` is the whole scheme — the list, the mixed-radix walk, the checksum.
Nothing is minified and nothing is hidden.

## Why this instead of invisible characters

Zero-width character tricks are the obvious first move and they're a bad one.
They leave a signature: a run of `Cf` code points sitting in otherwise plain
text, exactly what every "invisible character detector" and paste sanitizer is
built to find, and they die the moment anything normalizes the text.

Words have none of those problems. They survive every clipboard hop, every
editor, every terminal, every plain-text field, and there is nothing to strip,
because nothing was added. The cover text and the carrier are the same object.

What it gives up: capacity. Five words hold 44 bits, which is an IPv4 address
and a checksum and nothing else. An IPv6 address needs 128, so a visitor who
reaches the page over IPv6 only gets five genuinely random words and no payload.
That's the trade — the trick works by having almost no bandwidth at all.

## Privacy, for real

- The address is fetched straight from a public IP-echo endpoint
  (`ipv4.icanhazip.com`, falling back to `api.ipify.org`, then `ipwho.is`). What
  you see in the payload is what those services already see on any request.
- Nothing is sent to this site. There is no backend. It is static files on
  GitHub Pages, and the encoding happens in your browser.
- The page can write to your clipboard when you click; it never reads it.

## The point

A copy button is a trusted interface, and the trust is unexamined. "Copy the
words" implies that what lands on your clipboard is what you saw. It isn't —
not because something was appended, but because the text you saw was already
carrying a message you can't read. Five words that look chosen at random are a
perfectly good 44-bit channel.

The demonstration checker used to prove it — paste the copied words, watch them
decode — is deliberately not published here. The decoder above is not a
substitute for it; the checker shows the arithmetic, the ranks and the checksum
side by side.

## Files

- `index.html` — the page
- `style.css` — styling, respects `prefers-color-scheme`
- `words.js` — the 512-word list and the codec
- `app.js` — IP resolution, word selection, clipboard write

## Run locally

```
python3 -m http.server 8000
```

`http://localhost:8000` — `localhost` so the async clipboard API treats the page
as a secure context.
