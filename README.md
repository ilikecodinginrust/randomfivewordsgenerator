# randomfivewordsgenerator

Five random words, and a copy button. That's the whole page.

Except the copy button lies a little.

## What it actually does

When the page loads, it asks a public IP-echo service who you are, then encodes
your IP address as **zero-width Unicode characters** and sticks it in front of
the words on the clipboard.

So when you click **copy** and paste somewhere, you get:

```
[100-odd invisible code points][the five words you can see]
```

The words paste normally. The address rides along, invisible, and survives
plain-text paste into a search box, a DM, a form field, a notes app, a
commit message — anywhere text goes.

It is a watermarking demo, not a coincidence.

## How the encoding works

- `U+2060` (word joiner) marks the start, `U+2062` (invisible times) marks the end.
- Between them, each UTF-16 code unit is written as 8 base-4 digits, drawn from
  `U+200B`, `U+200C`, `U+200D` and `U+2063`.
- Every one of those code points has zero advance width, so the payload renders
  as nothing at all. A `1.2.3.4` is 38 invisible characters; a 13-character
  IPv4 is 106.

The markers mean a decoder can find the payload even when it is buried in the
middle of pasted text.

Decode it by scanning for `U+2060`, reading base-4 pairs until `U+2062`, and
reassembling 16-bit units. That is the entire format.

## Privacy, for real

- Your IP is fetched directly from a public IP-echo endpoint (`api.ipify.org`,
  falling back to `ipwho.is` then `ipinfo.io`). What you see in the payload is
  what those services already see on any request.
- Nothing is sent to this site. There is no backend. It is static files on
  GitHub Pages, and the payload is assembled in your browser and handed
  straight to your own clipboard.
- Nobody is collecting anything here. The page cannot read your clipboard, only
  write to it, and only when you click.

## The point

Copy buttons are trusted interfaces. "Copy the words" is a promise that what
lands on your clipboard is what you saw. This page demonstrates that the
promise is not enforced by anything, and that invisible data can travel through
a copy-paste without a single visible sign.

The demonstration checker used to prove it — paste the copied text, watch it
decode — is deliberately not published here.

## Files

- `index.html` — the page
- `style.css` — halo-free minimal styling, respects `prefers-color-scheme`
- `zw.js` — the zero-width codec
- `app.js` — word picking, IP resolution, clipboard write

## Run locally

```
python3 -m http.server 8000
```

`http://localhost:8000` — `localhost` so the async clipboard API treats the page
as a secure context.
