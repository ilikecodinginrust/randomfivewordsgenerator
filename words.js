/*
 * The word list is the codec.
 *
 * Five distinct words, read as digits, are the payload. d0 is the rank of the
 * first word in the full list, d1 the rank of the second among the 511 words
 * left over, and so on, so the code is
 *
 *   ((((d0 * 511) + d1) * 510 + d2) * 509 + d3) * 508 + d4
 *
 * That space is 512 * 511 * 510 * 509 * 508 = 34,501,861,847,040, a shade
 * under 45 bits. It is laid out as
 *
 *   bits  0-31   IPv4 address
 *   bits 32-37   six-bit checksum over the address
 *   bits 38-43   six-bit nonce, so the page can deal a different five words
 *                on every click while still encoding the same address
 *
 * There is nothing hidden in the text itself: no zero-width characters, no
 * invisible ink. The words are the message. Someone who knows this list can
 * decode any five words; someone who does not sees five words.
 */

const WORDS = [
  "adder", "adze", "aerie", "agate", "agave", "alabaster", "alder", "alderfly",
  "amber", "amphora", "anchor", "antler", "anvil", "apron", "apse", "aqueduct",
  "arbor", "arbutus", "arrow", "arroyo", "ash", "asp", "aster", "atlas",
  "auger", "augite", "avalanche", "awning", "axle", "azure", "badger", "balefire",
  "ballast", "balsam", "barque", "barrel", "barrow", "basalt", "basin", "basket",
  "beacon", "beaker", "beck", "beech", "beetle", "bell", "bellows", "bellwether",
  "beryl", "binnacle", "birch", "bison", "bittern", "blizzard", "bloom", "bluebell",
  "bluff", "bobolink", "bog", "bollard", "bolt", "bone", "boneset", "boom",
  "bothy", "bough", "boulder", "bower", "bowline", "boxwood", "bracken", "bramble",
  "brant", "brass", "briar", "brick", "bridle", "brimstone", "brine", "bristle",
  "bronze", "brook", "bulwark", "bunting", "buoy", "burnet", "burr", "burrow",
  "butte", "buttress", "cairn", "cairngorm", "caldera", "camas", "candle", "candlewick",
  "canna", "canvas", "capstan", "caravel", "carbide", "cardamom", "caribou", "carillon",
  "carnelian", "carpel", "cascade", "cask", "catkin", "causeway", "cavern", "cavity",
  "cedar", "celadon", "censer", "chalk", "chamois", "chaparral", "chapel", "chasm",
  "chert", "chipmunk", "chisel", "chord", "cinder", "cirrus", "cistern", "citrine",
  "clapper", "clay", "claymore", "cleat", "cliff", "clinker", "cloak", "cloister",
  "clover", "cobalt", "cobble", "cockle", "coffer", "coil", "colt", "compass",
  "conduit", "confluence", "copal", "copper", "copperas", "coral", "corbel", "cormorant",
  "corncrake", "cote", "cove", "covey", "cowrie", "coyote", "crag", "crane",
  "crater", "creek", "cresset", "crest", "crevasse", "crimson", "crock", "crook",
  "crossing", "crow", "crowfoot", "crucible", "crystal", "cubit", "culvert", "cumulus",
  "cupola", "curlew", "current", "cutlass", "cygnet", "cypress", "davit", "dawn",
  "deer", "delta", "dew", "ditch", "dock", "dove", "drift", "drizzle",
  "dune", "dusk", "echo", "eddy", "egret", "elm", "ember", "emerald",
  "equinox", "escarpment", "estuary", "eve", "falcon", "fathom", "feldspar", "fen",
  "fennel", "fern", "ferret", "ferry", "field", "firth", "fjord", "flare",
  "flint", "foam", "fog", "forge", "fox", "frost", "gale", "garnet",
  "gecko", "geyser", "glacier", "glade", "glass", "glimmer", "gloaming", "glow",
  "gorge", "gorse", "granite", "graphite", "gravel", "grotto", "grove", "gulch",
  "gull", "gully", "gust", "gypsum", "hail", "halyard", "harbor", "hare",
  "harrow", "hawk", "haze", "hazel", "hearth", "heath", "heather", "hemlock",
  "heron", "hillock", "hollow", "holly", "hush", "ibex", "indigo", "ingot",
  "inlet", "iron", "isthmus", "ivory", "ivy", "jackal", "jade", "jasper",
  "jetty", "juniper", "keel", "kelp", "kestrel", "kiln", "kingfisher", "knoll",
  "knot", "lagoon", "lantern", "larch", "lark", "laurel", "lavender", "ledge",
  "leeward", "lemming", "leopard", "lichen", "lilac", "limestone", "linden", "loam",
  "loch", "loon", "lumen", "lynx", "magma", "mallard", "maple", "marble",
  "marl", "marsh", "marten", "mast", "mauve", "meadow", "mere", "merganser",
  "mesa", "mica", "midnight", "mink", "mire", "mist", "mole", "monolith",
  "moon", "moor", "moraine", "moss", "moth", "mussel", "myrtle", "nettle",
  "newt", "nickel", "night", "nimbus", "noon", "north", "null", "oak",
  "obsidian", "ochre", "onyx", "opal", "opossum", "oracle", "orbit", "osprey",
  "otter", "outcrop", "owl", "oxbow", "oyster", "pale", "peak", "peat",
  "pebble", "pelican", "pennant", "periwinkle", "pewter", "pika", "pine", "pinnacle",
  "plateau", "platinum", "plover", "plume", "pond", "pool", "porcelain", "porcupine",
  "prairie", "precipice", "prism", "pumice", "quarry", "quartz", "quay", "quicksand",
  "quiet", "quill", "raccoon", "rain", "rainbow", "raven", "ravine", "redwood",
  "reed", "reef", "resin", "ridge", "rill", "rime", "river", "rook",
  "rowan", "rudder", "rune", "russet", "rust", "saddle", "saffron", "salt",
  "sand", "sandstone", "sapphire", "scarp", "scree", "sedge", "sepia", "sequoia",
  "sextant", "shadow", "shale", "sheen", "shoal", "shrew", "sienna", "silk",
  "silt", "sinkhole", "skink", "skunk", "slate", "slope", "slough", "smoke",
  "snow", "soil", "solstice", "sorrel", "sparrow", "spinney", "spire", "spruce",
  "squall", "squirrel", "starling", "steppe", "stern", "stoat", "stone", "stork",
  "storm", "strait", "stratus", "stream", "sumac", "summit", "surf", "swale",
  "swallow", "swamp", "swan", "swift", "sycamore", "talus", "tamarack", "tansy",
  "tarn", "teal", "tern", "terrace", "thaw", "thicket", "thistle", "thorn",
  "thrush", "thunder", "tide", "tiller", "timber", "toad", "topaz", "torrent",
  "trail", "tributary", "tundra", "twilight", "umber", "umbra", "vale", "valley",
  "vapor", "velvet", "verdigris", "vermilion", "vine", "violet", "viper", "viridian",
  "void", "volcano", "vole", "wadi", "wake", "warbler", "wasp", "watershed",
  "weasel", "wharf", "willow", "wind", "winter", "woad", "wolf", "wolverine",
  "wood", "wren", "yak", "yarrow", "yew", "zebra", "zephyr", "zinc",
];

const PICK = 5;
const WORD_COUNT = WORDS.length;

const RADICES = Array.from({ length: PICK }, (_, i) => WORD_COUNT - i);
const CAPACITY = RADICES.reduce((a, b) => a * b, 1);
const MAX_CODE = 2 ** 44;

const IP_SPACE = 2 ** 32;
const CHECK_SHIFT = 32;
const NONCE_SHIFT = 38;
const NONCE_LIMIT = 64;

function checksum6(n) {
  let h = 0x811c9dc5;
  for (let shift = 24; shift >= 0; shift -= 8) {
    h = Math.imul(h ^ ((n >>> shift) & 0xff), 0x01000193) >>> 0;
  }
  return (h >>> 26) & 0x3f;
}

function parseIpv4(ip) {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return null;
  const parts = ip.split(".").map(Number);
  if (parts.some((p) => p > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function formatIpv4(n) {
  return [n >>> 24, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join(".");
}

function codeFor(ipInt, nonce) {
  return ipInt + checksum6(ipInt) * IP_SPACE + (nonce % NONCE_LIMIT) * 2 ** NONCE_SHIFT;
}

function wordsForCode(code) {
  let rest = code;
  const digits = new Array(PICK);

  for (let i = PICK - 1; i >= 0; i--) {
    digits[i] = rest % RADICES[i];
    rest = Math.floor(rest / RADICES[i]);
  }

  const pool = WORDS.map((_, i) => i);
  const words = [];
  for (const digit of digits) words.push(WORDS[pool.splice(digit, 1)[0]]);
  return words;
}

function ranksForWords(words) {
  const pool = WORDS.map((_, i) => i);
  const digits = [];

  for (const word of words) {
    const index = WORDS.indexOf(word);
    if (index === -1) return { ok: false, reason: `"${word}" is not in the list` };

    const rank = pool.indexOf(index);
    if (rank === -1) return { ok: false, reason: `"${word}" appears twice` };

    digits.push(rank);
    pool.splice(rank, 1);
  }

  return { ok: true, digits };
}

function codeForDigits(digits) {
  let code = digits[0];
  for (let i = 1; i < PICK; i++) code = code * RADICES[i] + digits[i];
  return code;
}

function encodeWords(ip, nonce = 0) {
  const ipInt = parseIpv4(ip);
  if (ipInt === null) return null;

  const code = codeFor(ipInt, nonce);
  return { words: wordsForCode(code), code, ip: formatIpv4(ipInt), nonce: nonce % NONCE_LIMIT };
}

function decodeWords(words) {
  if (!Array.isArray(words) || words.length !== PICK) {
    return { ok: false, reason: `expected ${PICK} words, got ${Array.isArray(words) ? words.length : 0}` };
  }

  const ranks = ranksForWords(words);
  if (!ranks.ok) return ranks;

  const code = codeForDigits(ranks.digits);
  const ipInt = code % IP_SPACE;
  const check = Math.floor(code / IP_SPACE) % 64;
  const nonce = Math.floor(code / 2 ** NONCE_SHIFT);
  const ip = formatIpv4(ipInt);
  const valid = check === checksum6(ipInt);

  return {
    ok: valid,
    ip,
    ipInt,
    check,
    expected: checksum6(ipInt),
    nonce,
    code,
    digits: ranks.digits,
    reason: valid ? "" : "the five words decode, but the checksum does not match",
  };
}

function parseWords(text) {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/^[^a-z]+|[^a-z]+$/g, ""))
    .filter(Boolean);
}

if (MAX_CODE > CAPACITY) throw new Error("word list too small for a 44-bit code");
