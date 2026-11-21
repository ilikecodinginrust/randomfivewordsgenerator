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

The list in `words.js` holds 2,048 words. Five distinct words, read as digits in
a mixed radix, form one number:

```
code = ((((d0 × 2047) + d1) × 2046 + d2) × 2045 + d3) × 2044 + d4
```

`d0` is the rank of the first word in the full 2,048-word list, `d1` the rank of
the second among the 2,047 that are left, and so on — the same walk you take when
picking five words without replacement.

`2048 × 2047 × 2046 × 2045 × 2044 = 35,853,175,596,564,480`, about 54.99 bits,
which is just enough to hold:

| bits | contents |
|---|---|
| 0–31 | IPv4 address, big-endian |
| 32–47 | sixteen-bit FNV-1a checksum over the four address bytes |
| 48–53 | six-bit nonce, so each visit can show a different five words |

The checksum is what stops the page from claiming that any five words are a
payload: an unrelated five-word set clears it about once in 65,536 tries.

The integer is carried as a `BigInt`. At 2,048 words the code space is wider than
a double's 53-bit mantissa, and ordinary floating-point arithmetic would silently
round away the bottom of the address. The mixed-radix division has to be exact
all the way down, so it is done in integers or not at all.

## The vocabulary

2,048 words, lowercase, a–z only, two to thirteen letters: one `ox`, one
`rhododendron`, and everything in between. The register is deliberate — weather,
geology, water, plants, animals, tools, materials, architecture. Nothing that
would look out of place in a poem about a coastline. A random five reads like a
phrase someone chose.

Size is not decoration. Each word is a digit, and the number of digits a word can
stand for is what sets the capacity, so a bigger vocabulary is a denser channel:
at 512 words a word was worth nine bits, at 2,048 it is worth eleven. The first
version of this page had 512 words and a six-bit checksum; this one has four
times the vocabulary, a sixteen-bit checksum, and 54 bits of code.

The list is alphabetized, but order is not what matters — position is. The codec
reads ranks, so inserting one word anywhere shifts the rank of every word after
it and invalidates every five-word string ever produced. The list is the key. A
different list is a different cipher.

## Decoding it yourself

The page exposes the decoder, so you don't have to take any of this on faith.
Open the console on the deployed page:

```js
fiveWords.decode("moss ash tarn larch sycamore")
// { ok: false, reason: "the five words decode, but the checksum does not match",
//   ip: "235.253.87.148", check: 38286, expected: 19065, nonce: 72, ... }

fiveWords.decode("calyx calla epiphyte impala equinox")
// { ok: true, ip: "203.0.113.42", nonce: 17, code: 4956734967804202n,
//   digits: [283, 282, 618, 916, 618], ... }

fiveWords.decode()   // decodes the five words currently on screen
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

What it gives up: capacity. Five words hold 54 bits — an IPv4 address, a
sixteen-bit checksum, and a 64-way nonce, and not a bit more. IPv6 needs 128, so
a visitor who reaches the page over IPv6 only gets five genuinely random words
and no payload; carrying a v6 address would take about twelve words from this
same list. That's the trade — the trick works by having almost no bandwidth at
all.

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
perfectly good 54-bit channel.

The larger the dictionary, the more a word can say, and the less the sentence
gives away. That is the whole direction of travel: the same five ordinary words,
saying more each time, looking more and more like something a person wrote.

The demonstration checker used to prove it — paste the copied words, watch them
decode — is deliberately not published here. The decoder above is not a
substitute for it; the checker shows the arithmetic, the ranks and the checksum
side by side.

## Files

- `index.html` — the page
- `style.css` — styling, respects `prefers-color-scheme`
- `words.js` — the 2,048-word list and the codec
- `app.js` — IP resolution, word selection, clipboard write

## Run locally

```
python3 -m http.server 8000
```

`http://localhost:8000` — `localhost` so the async clipboard API treats the page
as a secure context.
