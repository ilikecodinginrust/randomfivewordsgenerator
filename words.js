/*
 * The word list is the codec.
 *
 * Five distinct words, read as digits, are the payload. d0 is the rank of the
 * first word in the full list, d1 the rank of the second among the 2,047 words
 * left over, and so on, so the code is
 *
 *   ((((d0 * 2047) + d1) * 2046 + d2) * 2045 + d3) * 2044 + d4
 *
 * That space is 2048 * 2047 * 2046 * 2045 * 2044 = 35,853,175,596,564,480, a
 * shade under 55 bits. It is laid out as
 *
 *   bits  0-31   IPv4 address
 *   bits 32-47   sixteen-bit checksum over the address
 *   bits 48-53   six-bit nonce, so the page can deal a different five words
 *                on every click while still encoding the same address
 *
 * Only fifty-four of the fifty-five bits are used: the payload is cut on byte
 * lines, 32 + 16 + 6, which leaves the top bit of the word space idle. Half of
 * all possible five-word strings are therefore never produced by the encoder.
 *
 * There is nothing hidden in the text itself: no zero-width characters, no
 * invisible ink. The words are the message. Someone who knows this list can
 * decode any five words; someone who does not sees five words.
 */

const WORDS = [
  "abacus", "abbey", "abyss", "acacia", "acorn", "acre", "adder", "adit",
  "adze", "aegis", "aeon", "aerie", "agate", "agave", "aglet", "aisle",
  "alabaster", "alcove", "alder", "alderfly", "alfalfa", "alga", "algae", "alkali",
  "alluvium", "almanac", "almond", "aloe", "alp", "alpaca", "altar", "alum",
  "amalgam", "amaranth", "amber", "amethyst", "amphora", "amulet", "anchor", "anemone",
  "angelica", "anise", "anther", "antimony", "antler", "anvil", "aperture", "apex",
  "apogee", "apple", "apricot", "apron", "apse", "aquamarine", "aqueduct", "aragonite",
  "arbor", "arbutus", "arcade", "arch", "archipelago", "arctic", "arena", "argent",
  "aria", "armada", "armory", "aroma", "arrow", "arrowhead", "arroyo", "arsenic",
  "artifact", "ash", "ashen", "ashlar", "asp", "aspen", "asphalt", "aster",
  "astral", "atlas", "atoll", "atrium", "auburn", "auger", "augite", "aurora",
  "autumn", "avalanche", "aviary", "awning", "axis", "axle", "azalea", "azimuth",
  "azure", "azurite", "badger", "bag", "bait", "bale", "balefire", "ballad",
  "ballast", "balsam", "bamboo", "band", "bangle", "banner", "barge", "bark",
  "barley", "barn", "barnacle", "barometer", "barque", "barrel", "barrow", "basalt",
  "basil", "basilica", "basin", "basket", "bass", "bastion", "bat", "bath",
  "bay", "bayou", "beach", "beacon", "bead", "beaker", "beam", "bean",
  "bear", "beard", "beaver", "beck", "bedrock", "beech", "beehive", "beetle",
  "begonia", "belfry", "bell", "bellow", "bellows", "bellwether", "belt", "bench",
  "bent", "berg", "bergamot", "berry", "berth", "beryl", "betony", "bevel",
  "bilberry", "bilge", "billow", "bindweed", "bine", "binnacle", "birch", "bird",
  "bishop", "bison", "bitt", "bittern", "blackberry", "blackbird", "blacksmith", "blade",
  "blast", "blaze", "blizzard", "block", "bloodroot", "bloom", "blossom", "bluebell",
  "blueberry", "bluefish", "bluejay", "bluff", "board", "boat", "bobcat", "bobolink",
  "bog", "bollard", "bolt", "bone", "boneset", "bonfire", "bonnet", "book",
  "boom", "boot", "borage", "border", "borer", "bothy", "bough", "boulder",
  "boundary", "bouquet", "bourne", "bow", "bower", "bowl", "bowline", "box",
  "boxwood", "bracken", "bract", "braid", "brake", "bramble", "branch", "brand",
  "brant", "brass", "brazier", "bread", "bream", "breeze", "briar", "brick",
  "bridge", "bridle", "brim", "brimstone", "brine", "brink", "bristle", "bronze",
  "brook", "broom", "brown", "brush", "bubble", "bucket", "buckeye", "buckthorn",
  "bud", "buffalo", "bugle", "bulb", "bull", "bulrush", "bulwark", "bumblebee",
  "bundle", "bunker", "bunting", "buoy", "bur", "burdock", "burl", "burnet",
  "burr", "burrow", "bush", "butte", "buttercup", "butterfly", "butternut", "button",
  "buttress", "byre", "cabin", "cactus", "cairn", "cairngorm", "calabash", "calcite",
  "caldera", "caliper", "calla", "calyx", "camas", "camellia", "cameo", "campanile",
  "canal", "canary", "candelabra", "candle", "candlewick", "cane", "canna", "canoe",
  "canopy", "canton", "canvas", "canyon", "capstan", "capsule", "carafe", "carapace",
  "caravel", "carbide", "cardamom", "cardinal", "caribou", "carillon", "carnelian", "carob",
  "carousel", "carpel", "carpet", "carriage", "carrot", "cartouche", "cascade", "casement",
  "cashmere", "cask", "cassava", "castle", "catacomb", "catamaran", "cataract", "catfish",
  "cathedral", "catkin", "cattail", "cattle", "cauldron", "causeway", "cavern", "cavity",
  "cedar", "celadon", "celery", "celestine", "cello", "censer", "centaur", "centipede",
  "ceramic", "cerise", "chaffinch", "chalice", "chalk", "chamois", "chandelier", "channel",
  "chanter", "chaparral", "chapel", "charcoal", "chasm", "chateau", "cheetah", "cherry",
  "chert", "chestnut", "chevron", "chickadee", "chime", "chimney", "chinchilla", "chintz",
  "chipmunk", "chisel", "chive", "choir", "chord", "chrysalis", "chrysanthemum", "chute",
  "cicada", "cider", "cinder", "cinnamon", "cipher", "circle", "cirque", "cirrus",
  "cistern", "citadel", "citrine", "citrus", "clam", "clapper", "clarinet", "clay",
  "claymore", "cleat", "cleaver", "clematis", "cliff", "clinker", "clipper", "cloak",
  "clock", "cloister", "cloud", "clove", "clover", "cob", "cobalt", "cobble",
  "cobra", "cockle", "cocoa", "coconut", "cocoon", "coffer", "coil", "colony",
  "colt", "column", "comb", "comet", "compass", "conch", "condor", "conduit",
  "cone", "confluence", "conger", "conifer", "constellation", "copal", "copper", "copperas",
  "copse", "coracle", "coral", "corbel", "coriander", "cork", "corm", "cormorant",
  "corn", "corncrake", "cornel", "cornet", "cornflower", "corona", "corral", "corridor",
  "corundum", "cosmos", "cote", "cottage", "cotton", "cougar", "court", "courtyard",
  "cove", "covey", "cow", "cowl", "cowrie", "coyote", "crab", "cradle",
  "crag", "cranberry", "crane", "crater", "crayfish", "crayon", "creek", "crenel",
  "creosote", "cress", "cresset", "crest", "crevasse", "crevice", "cricket", "crimson",
  "crock", "crocus", "crook", "crossing", "crow", "crowbar", "crowfoot", "crown",
  "crozier", "crucible", "crystal", "cub", "cubit", "cuckoo", "cucumber", "culvert",
  "cumulus", "cupola", "curlew", "current", "curtain", "cushion", "cutlass", "cuttlefish",
  "cygnet", "cylinder", "cymbal", "cypress", "dagger", "dahlia", "daisy", "dam",
  "damask", "damson", "dandelion", "daphne", "dapple", "darnel", "darter", "date",
  "davit", "dawn", "daybreak", "deck", "deer", "dell", "delta", "den",
  "derrick", "desert", "dew", "dewdrop", "dhow", "dial", "diamond", "dike",
  "dill", "dinghy", "diorite", "dipper", "dirge", "dirk", "ditch", "diver",
  "dock", "dodo", "doe", "dogwood", "doily", "dolmen", "dolphin", "dome",
  "domino", "donkey", "dormouse", "dotterel", "dove", "dovecote", "dowel", "dragon",
  "dragonfly", "drake", "dredge", "drift", "drizzle", "dromedary", "droplet", "drought",
  "drover", "druid", "drum", "drumlin", "drupe", "dryad", "duck", "duckling",
  "duffel", "dune", "dungeon", "dunlin", "dunnock", "dusk", "dust", "duvet",
  "eagle", "eaves", "ebony", "echinacea", "echo", "eclipse", "eddy", "edelweiss",
  "edifice", "eel", "eelgrass", "eft", "eggplant", "egret", "eider", "eland",
  "elder", "elderberry", "elegy", "elephant", "elk", "ellipse", "elm", "elver",
  "ember", "emerald", "emery", "empire", "emporium", "emu", "enamel", "endive",
  "enigma", "ensign", "ephedra", "epicenter", "epiphyte", "equinox", "erica", "ermine",
  "escarpment", "escutcheon", "esker", "espalier", "estuary", "ether", "eucalyptus", "euphonium",
  "eve", "ewe", "ewer", "facade", "faience", "falcon", "fang", "fantail",
  "fathom", "fauna", "fawn", "feather", "feldspar", "fell", "felt", "fen",
  "fennel", "fern", "ferret", "ferry", "fescue", "fiddle", "field", "fife",
  "fig", "filbert", "filigree", "finch", "fir", "fire", "firefly", "firth",
  "fish", "fisher", "fissure", "fjord", "flag", "flagon", "flail", "flake",
  "flame", "flannel", "flare", "flask", "flax", "fleece", "flint", "flintlock",
  "floe", "flood", "flora", "floret", "flotilla", "flower", "flume", "flute",
  "flycatcher", "foal", "foam", "fog", "foliage", "folly", "font", "forb",
  "ford", "foreland", "forest", "forge", "fork", "fort", "fossil", "foundry",
  "fountain", "fowl", "fox", "foxglove", "fret", "friary", "frigate", "frith",
  "fritillary", "frog", "frond", "frost", "froth", "fuchsia", "fulcrum", "fulmar",
  "furlong", "furnace", "furrow", "furze", "gable", "gadwall", "gale", "galena",
  "galleon", "gallery", "galley", "gander", "gannet", "gantry", "gardenia", "gargoyle",
  "garland", "garlic", "garnet", "garret", "gasket", "gate", "gauntlet", "gauze",
  "gavel", "gazebo", "gazelle", "gecko", "gem", "gentian", "geode", "geranium",
  "germander", "geyser", "gill", "gimlet", "ginger", "ginkgo", "ginseng", "giraffe",
  "girder", "glacier", "glade", "gladiolus", "glass", "glaze", "glen", "glimmer",
  "gloaming", "globe", "glove", "glow", "gnat", "gneiss", "goat", "goblet",
  "gold", "goldfinch", "goose", "gooseberry", "gopher", "gorge", "gorse", "goshawk",
  "gosling", "gossamer", "gouge", "gourd", "grackle", "grain", "granite", "grape",
  "graphite", "grapnel", "grass", "grasshopper", "gravel", "grebe", "greyhound", "greylag",
  "griffon", "grommet", "grosbeak", "grotto", "groundsel", "grouse", "grove", "gudgeon",
  "guillemot", "guitar", "gulch", "gulf", "gull", "gully", "gum", "gunwale",
  "gust", "gypsum", "gyre", "hail", "hake", "halberd", "hall", "halo",
  "halter", "halyard", "hamlet", "hammer", "hamster", "hangar", "harbor", "hare",
  "harness", "harp", "harpoon", "harrier", "harrow", "hart", "harvest", "hat",
  "hatch", "hatchet", "haven", "hawk", "hawthorn", "hay", "haze", "hazel",
  "headland", "hearth", "heath", "heather", "hedgerow", "heifer", "helix", "helm",
  "helmet", "hemlock", "hemp", "hen", "henbane", "herb", "hermit", "heron",
  "herring", "hickory", "highland", "hill", "hillock", "hilt", "hind", "hoe",
  "hog", "hogshead", "hollow", "holly", "hollyhock", "holster", "homestead", "honey",
  "honeycomb", "honeysuckle", "hood", "hoof", "hook", "hoop", "hop", "horizon",
  "horn", "hornbeam", "hornbill", "horse", "horseshoe", "horst", "hostel", "hound",
  "house", "hovel", "hub", "huckleberry", "hull", "hummingbird", "hummock", "humus",
  "hurdle", "hurricane", "hush", "husk", "hut", "hyacinth", "hydrangea", "hyena",
  "hyssop", "ibex", "ibis", "iceberg", "icicle", "igloo", "iguana", "impala",
  "impatiens", "indigo", "ingot", "ink", "inkwell", "inlay", "inlet", "inn",
  "iris", "iron", "ironstone", "ironwood", "island", "isle", "isthmus", "ivory",
  "ivy", "jackal", "jackdaw", "jade", "jar", "jasmine", "jasper", "javelin",
  "jay", "jellyfish", "jetty", "jewel", "jib", "jigsaw", "joist", "jonquil",
  "jug", "jujube", "julep", "juniper", "junk", "jute", "kale", "kangaroo",
  "kaolin", "karst", "kayak", "keel", "keelson", "kelp", "kennel", "kerchief",
  "kestrel", "kettle", "keystone", "kiln", "kilt", "kimono", "kingcup", "kingfish",
  "kingfisher", "kinglet", "kiosk", "kite", "kiwi", "knapsack", "knife", "knob",
  "knoll", "knot", "koala", "kookaburra", "krill", "kudzu", "kumquat", "laburnum",
  "labyrinth", "ladder", "ladle", "ladybird", "ladybug", "lagoon", "lake", "lamb",
  "lamp", "lamprey", "lance", "lantern", "lapwing", "larch", "lark", "larkspur",
  "lasso", "lathe", "lattice", "laurel", "lava", "lavender", "leaf", "leat",
  "ledge", "lee", "leeward", "lemming", "lemon", "lemur", "lentil", "leopard",
  "lettuce", "levee", "lever", "ley", "liana", "lichen", "lighthouse", "lightning",
  "lilac", "lily", "lime", "limestone", "limpet", "linchpin", "linden", "linen",
  "ling", "lingonberry", "linseed", "lintel", "lion", "lizard", "llama", "loam",
  "loch", "lock", "lodge", "loess", "loft", "log", "loganberry", "loom",
  "loon", "lotus", "louver", "lozenge", "lucerne", "lugger", "lumber", "lumen",
  "lupin", "lute", "lye", "lynx", "lyre", "macaw", "mace", "mackerel",
  "madder", "maelstrom", "magma", "magnet", "magnolia", "magpie", "mahogany", "maize",
  "majolica", "mallard", "mallee", "mallow", "malt", "mammoth", "manatee", "mandolin",
  "mane", "manganese", "mango", "mangrove", "manor", "mantel", "mantis", "mantle",
  "maple", "marble", "mare", "marigold", "marina", "marjoram", "marl", "marmot",
  "marrow", "marsh", "marten", "martin", "martingale", "mason", "mast", "mastiff",
  "mattock", "mauve", "mavis", "mead", "meadow", "meadowlark", "meerschaum", "melon",
  "menagerie", "menhir", "mere", "merganser", "meridian", "mermaid", "mesa", "mesquite",
  "meteor", "mica", "midge", "midnight", "mile", "milk", "milkweed", "mill",
  "millstone", "mimosa", "minaret", "mineral", "mink", "minnow", "mint", "minuet",
  "mirage", "mire", "mirror", "mist", "mistletoe", "mistral", "mitten", "moat",
  "moccasin", "mohair", "mole", "monastery", "monolith", "monsoon", "moon", "moonstone",
  "moor", "moorhen", "moose", "moraine", "morel", "mortar", "mosaic", "moss",
  "moth", "mound", "mount", "mountain", "mouse", "mud", "mule", "mullein",
  "mullet", "mural", "murre", "muscat", "mushroom", "musk", "musket", "muskrat",
  "mussel", "mustang", "mustard", "muzzle", "myrrh", "myrtle", "nail", "narcissus",
  "narwhal", "nasturtium", "nautilus", "nave", "nebula", "nectar", "needle", "neem",
  "nest", "net", "nettle", "newel", "newt", "niche", "nickel", "night",
  "nightfall", "nightjar", "nightshade", "nimbus", "noggin", "nook", "noon", "nopal",
  "north", "nosegay", "notch", "nova", "nozzle", "nugget", "null", "nut",
  "nutcracker", "nuthatch", "nutmeg", "nymph", "oak", "oar", "oasis", "oat",
  "obelisk", "oboe", "observatory", "obsidian", "ocarina", "ocean", "ocelot", "ochre",
  "octopus", "oil", "okapi", "oleander", "olive", "onyx", "opal", "opossum",
  "oracle", "orange", "orbit", "orchard", "orchid", "ore", "organ", "oriel",
  "oriole", "ortolan", "osier", "osprey", "ossuary", "ostrich", "otter", "outcrop",
  "oven", "owl", "ox", "oxbow", "oxeye", "oyster", "ozone", "paddle",
  "paddock", "padlock", "pagoda", "pail", "palace", "pale", "palette", "paling",
  "palm", "palmetto", "palomino", "pan", "pangolin", "panorama", "pansy", "panther",
  "papaya", "paprika", "parakeet", "parasol", "parchment", "parrot", "parsley", "parsnip",
  "partridge", "pastel", "pasture", "patina", "patio", "pavilion", "pawpaw", "peacock",
  "peak", "peanut", "pear", "pearl", "peat", "pebble", "pecan", "pedestal",
  "pediment", "pelican", "pendant", "pendulum", "penknife", "pennant", "penumbra", "peony",
  "pepper", "perch", "peregrine", "periwinkle", "persimmon", "petal", "petrel", "petunia",
  "pew", "pewter", "phalarope", "pheasant", "phlox", "phoenix", "piano", "pier",
  "pigeon", "pika", "pike", "pilaster", "pilgrim", "pillar", "pillow", "pinafore",
  "pincer", "pine", "pineapple", "pinion", "pinnace", "pinnacle", "pinto", "piper",
  "pipit", "piranha", "pistachio", "pistol", "piston", "pitcher", "pitchfork", "pith",
  "piton", "planet", "plank", "plateau", "platinum", "plinth", "plover", "plow",
  "plum", "plumb", "plume", "polecat", "pollen", "pollock", "pomegranate", "pommel",
  "poncho", "pond", "pony", "pool", "poppy", "porcelain", "porch", "porcupine",
  "porpoise", "port", "portal", "portcullis", "portico", "posy", "pottery", "prairie",
  "prawn", "precipice", "primrose", "prism", "privet", "prow", "prune", "puffin",
  "pulley", "pumice", "pumpkin", "pylon", "pyramid", "pyrite", "python", "quail",
  "quarry", "quartz", "quay", "quern", "quicksand", "quiet", "quill", "quilt",
  "quince", "quinine", "quire", "quiver", "quoin", "rabbit", "raccoon", "radish",
  "raft", "rafter", "rail", "rain", "rainbow", "rake", "ram", "rampart",
  "ranch", "rapids", "rapier", "raspberry", "rat", "ratchet", "rattle", "raven",
  "ravine", "ray", "razor", "reaper", "redbreast", "redpoll", "redstart", "redwood",
  "reed", "reef", "regatta", "rein", "reindeer", "relic", "remora", "reservoir",
  "resin", "rhea", "rhinestone", "rhizome", "rhododendron", "rhubarb", "rib", "ribbon",
  "rice", "ridge", "rifle", "rift", "rill", "rime", "ring", "ripple",
  "river", "rivet", "rivulet", "road", "robe", "robin", "rock", "rocket",
  "rod", "roe", "roof", "rook", "rookery", "roost", "root", "rope",
  "rose", "rosemary", "rosette", "rotunda", "rowan", "ruby", "rudder", "rug",
  "rune", "rush", "russet", "rust", "rye", "sable", "saddle", "saffron",
  "sage", "sail", "sailfish", "salamander", "salmon", "salt", "sand", "sandal",
  "sandpiper", "sandstone", "sapling", "sapphire", "sardine", "sardonyx", "sargasso", "satchel",
  "savanna", "saw", "sawfish", "saxifrage", "scallop", "scarab", "scarlet", "scarp",
  "scepter", "schist", "schooner", "sconce", "scorpion", "scow", "scree", "screw",
  "scroll", "scull", "scupper", "scythe", "sea", "seal", "seaweed", "sedge",
  "semaphore", "sepia", "sequin", "sequoia", "serpent", "sextant", "shad", "shade",
  "shadow", "shaft", "shale", "shallot", "shamrock", "shanty", "shard", "shark",
  "shear", "sheath", "sheen", "sheep", "shelf", "shell", "shepherd", "shield",
  "shingle", "ship", "shoal", "shore", "shovel", "shrew", "shrimp", "shrine",
  "shroud", "shrub", "shuttle", "sickle", "sienna", "sierra", "sieve", "signet",
  "silica", "silk", "silo", "silt", "silver", "simoom", "sinew", "sinkhole",
  "siphon", "siren", "sisal", "skate", "skiff", "skink", "skipper", "skua",
  "skunk", "sky", "skylark", "slab", "slate", "sled", "sledge", "sleet",
  "sling", "slipper", "sliver", "sloop", "slope", "sloth", "slough", "slug",
  "sluice", "smelt", "smith", "smithy", "smock", "smoke", "snail", "snake",
  "snare", "snow", "snowdrop", "snowflake", "soap", "socket", "sod", "soil",
  "solstice", "sorghum", "sorrel", "spade", "spaniel", "spar", "spark", "sparrow",
  "spatula", "spear", "spearmint", "speck", "sphinx", "spice", "spider", "spike",
  "spinach", "spindle", "spine", "spinney", "spire", "splint", "sponge", "spray",
  "sprig", "spring", "spruce", "squall", "squash", "squid", "squill", "squire",
  "squirrel", "stag", "stalk", "stall", "stallion", "stamen", "staple", "star",
  "starfish", "starling", "stave", "steel", "steeple", "steer", "stein", "stem",
  "stencil", "steppe", "sterling", "stern", "stevedore", "stile", "stiletto", "stilt",
  "stingray", "stirrup", "stoat", "stoker", "stone", "stork", "storm", "strait",
  "strand", "stratus", "straw", "stream", "stroke", "stubble", "sturgeon", "suede",
  "sugar", "sulfur", "sumac", "summer", "summit", "sundew", "sundial", "sunflower",
  "sunset", "surf", "surge", "swale", "swallow", "swamp", "swan", "swath",
  "swift", "swivel", "sword", "sycamore", "syrup", "table", "tack", "tackle",
  "taffeta", "tail", "tailor", "talc", "talisman", "tallow", "talon", "talus",
  "tamarack", "tamarind", "tambourine", "tanager", "tang", "tangerine", "tank", "tankard",
  "tannery", "tansy", "taper", "tapestry", "tapir", "tar", "tarantula", "tarn",
  "tarp", "tarpon", "tarragon", "tartan", "tassel", "taupe", "tavern", "teak",
  "teal", "telescope", "temple", "tendril", "tenon", "tent", "tern", "terrace",
  "terrain", "terrapin", "terrier", "tessera", "tether", "thatch", "thaw", "thicket",
  "thief", "thimble", "thistle", "thorn", "thread", "thrift", "throne", "thrush",
  "thunder", "thyme", "tiara", "tide", "tiger", "tile", "tiller", "timber",
  "tinder", "tine", "tinker", "tinsel", "tint", "toad", "toadflax", "toadstool",
  "tobacco", "toga", "toggle", "tomb", "tong", "tongue", "tooth", "top",
  "topaz", "topiary", "toque", "torch", "tornado", "torque", "torrent", "tortoise",
  "totem", "towel", "tower", "tractor", "trail", "tram", "transom", "trap",
  "trapeze", "trawl", "tray", "tread", "tree", "trefoil", "trellis", "trench",
  "trestle", "tributary", "trident", "trinket", "tripod", "tropic", "trough", "trout",
  "trove", "trowel", "truffle", "trumpet", "trunk", "truss", "tub", "tuba",
  "tube", "tuber", "tuft", "tug", "tulip", "tulle", "tumbleweed", "tuna",
  "tundra", "tungsten", "tunic", "tunnel", "turban", "turbot", "turf", "turkey",
  "turmeric", "turn", "turnip", "turpentine", "turquoise", "turret", "turtle", "tusk",
  "tussock", "tweed", "twig", "twilight", "twill", "twin", "twine", "twist",
  "typhoon", "udder", "ukulele", "umbel", "umber", "umbra", "umbrella", "undertow",
  "unicorn", "upland", "urchin", "urn", "vale", "valley", "valve", "van",
  "vane", "vanilla", "vapor", "varnish", "vase", "vat", "vault", "veil",
  "vein", "veld", "vellum", "velvet", "veneer", "venom", "vent", "veranda",
  "verbena", "verdigris", "verge", "vermilion", "vesper", "vessel", "vest", "vetch",
  "viaduct", "vial", "villa", "vine", "viol", "viola", "violet", "violin",
  "viper", "vireo", "viridian", "vise", "visor", "vista", "vixen", "void",
  "volcano", "vole", "volute", "vortex", "vulture", "wadi", "wafer", "wagon",
  "wagtail", "wake", "wall", "wallaby", "walnut", "walrus", "wand", "wapiti",
  "warbler", "warren", "warthog", "wasp", "watch", "water", "waterfall", "watershed",
  "wave", "waxwing", "weald", "weasel", "weather", "web", "wedge", "weed",
  "weevil", "weft", "weir", "well", "welt", "whale", "wharf", "wheat",
  "wheel", "whelk", "whelp", "whet", "whetstone", "whey", "whip", "whippet",
  "whisk", "whisker", "whistle", "whiting", "whorl", "wick", "wicker", "wicket",
  "wig", "wigwam", "willow", "winch", "wind", "windlass", "window", "wine",
  "wing", "winnow", "winter", "wisp", "witch", "woad", "wold", "wolf",
  "wolverine", "wood", "woodbine", "woodchuck", "woodcock", "woodlouse", "woodpecker", "woodruff",
  "wool", "worm", "wormwood", "wreath", "wreck", "wren", "wrench", "xylem",
  "xylophone", "yacht", "yak", "yam", "yard", "yarn", "yarrow", "yawl",
  "yeast", "yew", "yoke", "yolk", "yucca", "yule", "yurt", "zebra",
  "zenith", "zephyr", "zeppelin", "zinc", "zinnia", "zircon", "zither", "zucchini",
];

const PICK = 5;
const WORD_COUNT = WORDS.length;

// BigInt, because the code space is wider than 53 bits: 2,048 words in five
// slots is a shade under 2^55, and float arithmetic would quietly drop the low
// bits of the very field that carries the address.
const RADICES = Array.from({ length: PICK }, (_, i) => BigInt(WORD_COUNT - i));
const CAPACITY = RADICES.reduce((a, b) => a * b, 1n);
const MAX_CODE = 1n << 54n;

const IP_SPACE = 1n << 32n;
const CHECK_SPACE = 1n << 16n;
const NONCE_UNIT = 1n << 48n;
const NONCE_LIMIT = 64;

function checksum16(n) {
  let h = 0x811c9dc5;
  for (let shift = 24; shift >= 0; shift -= 8) {
    h = Math.imul(h ^ ((n >>> shift) & 0xff), 0x01000193) >>> 0;
  }
  return (h >>> 16) & 0xffff;
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
  return (
    BigInt(ipInt) +
    BigInt(checksum16(ipInt)) * IP_SPACE +
    BigInt(nonce % NONCE_LIMIT) * NONCE_UNIT
  );
}

function wordsForCode(code) {
  let rest = code;
  const digits = new Array(PICK);

  for (let i = PICK - 1; i >= 0; i--) {
    digits[i] = Number(rest % RADICES[i]);
    rest /= RADICES[i];
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
  let code = BigInt(digits[0]);
  for (let i = 1; i < PICK; i++) code = code * RADICES[i] + BigInt(digits[i]);
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
  const ipInt = Number(code % IP_SPACE);
  const check = Number((code / IP_SPACE) % CHECK_SPACE);
  const nonce = Number(code / NONCE_UNIT);
  const ip = formatIpv4(ipInt);
  const valid = check === checksum16(ipInt);

  return {
    ok: valid,
    ip,
    ipInt,
    check,
    expected: checksum16(ipInt),
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

if (MAX_CODE > CAPACITY) throw new Error("word list too small for a 54-bit code");
