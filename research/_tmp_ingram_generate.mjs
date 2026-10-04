import fs from "node:fs";

const source = JSON.parse(fs.readFileSync("/tmp/ingram_rows.json", "utf8"));
let rows = source.rows.map((row) => ({ ...row }));

function replaceAt(page, heading, replacements) {
  const index = rows.findIndex((row) => row.printedPage === page && row.name === heading);
  if (index < 0) throw new Error(`Missing correction target: ${page} ${heading}`);
  rows.splice(index, 1, ...replacements.map((replacement) => ({ ...rows[index], ...replacement })));
}

// Scan-verified repairs for line wraps and OCR column bleed.
replaceAt(355, "", []);
replaceAt(355, "Althaea Frutex Syrian) Mallow)", [{ name: "Althæa Frutex (Syrian Mallow)" }]);
replaceAt(355, "Anemone (Zephyr Flr.)", [{ name: "Anemone (Zephyr Flr.)", sentiment: "Sickness. Expectation." }]);
replaceAt(355, "Aloe.", [{ name: "Aloe" }]);
replaceAt(355, "Bay (Rose) Rhododen dron.,", [{ name: "Bay (Rose) Rhododendron" }]);
replaceAt(355, "Amaranth, Globe", [{ sentiment: "Immortality. Unfading love." }]);
replaceAt(355, "Amaryllis", [{ sentiment: "Pride. Timidity. Splendid beauty." }]);
replaceAt(355, "Balsam, Red", [{ sentiment: "Touch me not. Impatient resolves." }]);
replaceAt(355, "Angræc", [{ name: "Angrec" }]);
replaceAt(355, "Arbor Vitae", [{ name: "Arbor Vitæ" }]);

replaceAt(356, "mum", []);
replaceAt(356, "Chinese Chrysanthe", [{ name: "Chinese Chrysanthemum", sentiment: "Cheerfulness under adversity." }]);
replaceAt(356, "CABBAGE", [{ name: "Cabbage", sentiment: "Profit." }]);
replaceAt(356, "Buttercup (Kingcup)", [{ sentiment: "Ingratitude. Childishness." }]);
replaceAt(356, "Buttercups", [{ sentiment: "Riches." }]);
replaceAt(356, "China Aster, Single", [{ sentiment: "I will think of it." }]);
replaceAt(356, "Clotbur", [{ sentiment: "Rudeness. Pertinacity." }]);
replaceAt(356, "Chrysanthemum, Yell", [{ name: "Chrysanthemum, Yell." }]);
replaceAt(356, "Branch of Currants", [{ sentiment: "You please all." }]);
replaceAt(356, "Camellia Japonica, Red", [{ sentiment: "Unpretending excellence." }]);
replaceAt(356, "Coreopsis", [{ sentiment: "Always cheerful." }]);

replaceAt(357, "EBON Y TREE Echites Atropur-", [
  { name: "Ebony Tree", sentiment: "Blackness." },
  { name: "Echites Atropurpurea", sentiment: "Be warned in time." },
]);
replaceAt(357, "purea", []);
replaceAt(357, "pENNEL", [{ name: "Fennel" }]);
replaceAt(357, "Eglantine (Sweetbriar)", [{ sentiment: "Poetry. I wound to heal." }]);
replaceAt(357, "Enchanter’sNightshade", [{ name: "Enchanter’s Nightshade" }]);
replaceAt(357, "Dandelion, or Thistleseed-head", [{ name: "Dandelion, or Thistle-seed-head" }]);
replaceAt(357, "Dew Plant.", [{ name: "Dew Plant" }]);
replaceAt(357, "Dianthus.", [{ name: "Dianthus" }]);
replaceAt(357, "GARDEN Anemone", [{ name: "Garden Anemone" }]);
replaceAt(357, "Geranium, Horseshoeleaf.... to", [{ name: "Geranium, Horseshoe-leaf", sentiment: "Stupidity." }]);
replaceAt(357, "Fig Tree me", [{ name: "Fig Tree", sentiment: "Prolific." }]);
replaceAt(357, "Crowfoot (Aconite-lvd", [{ name: "Crowfoot (Aconite-lvd.)", sentiment: "Lustre." }]);
replaceAt(357, "Currant", [{ sentiment: "Thy frown will kill me." }]);
replaceAt(357, "Daisy, Garden", [{ sentiment: "I share your sentiments." }]);
replaceAt(357, "Escholzia", [{ sentiment: "Do not refuse me." }]);
replaceAt(357, "Garden Ranunculus", [{ sentiment: "You are rich in attractions." }]);
replaceAt(357, "Cosmelia Rubra", [{ name: "Cosmelia Subra" }]);
replaceAt(357, "Crow’s-bill", [{ name: "Crowsbill" }]);
replaceAt(357, "Cranberry", [{ sentiment: "Cure for heartache." }]);
replaceAt(357, "Dipladenia Crassinoda", [{ name: "Diplademia Crassinoda" }]);
replaceAt(357, "Enchanter’s Nightshade", [{ name: "Enchanter’sNightshade" }]);
replaceAt(357, "Flax-leaved Golden-locks", [{ name: "Flax-lvd. Golden-locks" }]);

replaceAt(358, "flora", []);
replaceAt(358, "Grammanthus Chlora-", [{ name: "Grammanthus Chloræflora", sentiment: "Your temper is too hasty." }]);
replaceAt(358, "HAND Flower Tree", [{ name: "Hand Flower Tree" }]);
replaceAt(358, "JACOB’S Ladder", [{ name: "Jacob’s Ladder" }]);
replaceAt(358, "KENNEDIA", [{ name: "Kennedia" }]);
replaceAt(358, "LIce Plant", [{ name: "Ice Plant" }]);
replaceAt(358, "Helmet Flower (Monks hood)", [{ name: "Helmet Flower (Monkshood)" }]);
replaceAt(358, "Hyacinth, White. '", [{ name: "Hyacinth, White" }]);
replaceAt(358, "Ivy", [{ sentiment: "Friendship. Fidelity. Marriage." }]);
replaceAt(358, "Jasmine, Indian", [{ sentiment: "I attach myself to you." }]);
replaceAt(358, "Jasmine, Spanish", [{ sentiment: "Sensuality." }]);
replaceAt(358, "Jonquil", [{ sentiment: "I desire a return of affection." }]);
replaceAt(358, "Laurel, Common, flower", [{ name: "Laurel, Common, in flower" }]);
replaceAt(358, "Justicia.", [{ name: "Justicia" }]);
replaceAt(358, "Goat’s Rue", [{ sentiment: "Reason." }]);
replaceAt(358, "Ice Plant", [{ sentiment: "Your looks freeze me." }]);
replaceAt(358, "Ivy, Sprig of, with Ten drils", [{ name: "Ivy, Sprig of, with Tendrils" }]);
replaceAt(358, "JJapan Rose", [{ name: "Japan Rose", sentiment: "Beauty is your only attraction." }]);
replaceAt(358, "Jasmine, Cape", [{ sentiment: "Transport of joy." }]);
replaceAt(358, "Jasmine, Carolina", [{ sentiment: "Separation." }]);
replaceAt(358, "Jasmine, Yellow", [{ sentiment: "Grace and elegance." }]);
replaceAt(358, "Lady’s Slipper", [{ sentiment: "Capricious beauty. Win me and wear me." }]);
replaceAt(358, "Justicia", [{ sentiment: "The perfection of female loveliness." }]);
replaceAt(358, "Geranium, Rose-scented", [{ name: "Geranium, Rose-scntd." }]);
replaceAt(358, "Geranium, Silver-leaved", [{ name: "Geranium, Silver-leavd." }]);
replaceAt(358, "Grammanthus Chloræflora", [{ name: "Grammanthus Chloraflora" }]);
replaceAt(358, "Imperial Montagu", [{ name: "Imperial Montague" }]);
replaceAt(358, "Laurel-leaved Magnolia", [{ name: "Laurel-leavd. Magnolia" }]);

replaceAt(359, "Flower)", []);
replaceAt(359, "Monkshood (Helmet", [{ name: "Monkshood (Helmet Flower)", sentiment: "Chivalry. Knight-errantry." }]);
replaceAt(359, "M adder", [{ name: "Madder" }]);
replaceAt(359, "N arcissus", [{ name: "Narcissus" }]);
replaceAt(359, "N emophila", [{ name: "Nemophila" }]);
replaceAt(359, "Nettle, Common Sting ing", [{ name: "Nettle, Common Stinging" }]);
replaceAt(359, "OAK Leaves", [{ name: "Oak Leaves" }]);
replaceAt(359, "PALM", [{ name: "Palm" }]);
replaceAt(359, "Monkshood", [{ sentiment: "A deadly foe is near." }]);
replaceAt(359, "London Pride", [{ sentiment: "Frivolity." }]);
replaceAt(359, "Lotus Leaf", [{ sentiment: "Recantation." }]);

replaceAt(360, "", []);
replaceAt(360, "Queen’s Rocket", [{ sentiment: "You are the queen of coquettes. Fashion." }]);
replaceAt(360, "Pine.,", [{ name: "Pine" }]);
replaceAt(360, "Q uaking grass", [{ name: "Quaking Grass" }]);
replaceAt(360, "R agged-robin", [{ name: "Ragged-robin" }]);
replaceAt(360, "Rhododendron (Rosebay)", [{ name: "Rhododendron (Rose-bay)" }]);
replaceAt(360, "Pride of China", [{ sentiment: "Dissension." }]);
replaceAt(360, "Peach Blossom", [{ sentiment: "I am your captive." }]);
replaceAt(360, "Pink, Indian, Double", [{ sentiment: "Always lovely." }]);
for (const variant of ["Bridal", "Burgundy", "Cabbage", "Campion", "Carolina", "China", "Christmas"]) {
  replaceAt(360, `${variant} Rose`, [{ name: `Rose, ${variant}` }]);
}

replaceAt(361, "ed", []);
replaceAt(361, "Tussilage, Sweet-scent", [{ name: "Tussilage, Sweet-scented", sentiment: "Justice shall be done you." }]);
replaceAt(361, "y'ALERIAN", [{ name: "Valerian" }]);
replaceAt(361, "IXTALNUT", [{ name: "Walnut" }]);
replaceAt(361, "SAFFRON", [{ name: "Saffron" }]);
replaceAt(361, "Speedwell, German der", [{ name: "Speedwell, Germander" }]);
replaceAt(361, "Speedwell, Spikec", [{ name: "Speedwell, Spiked" }]);
replaceAt(361, "Sultan, Y ellow", [{ name: "Sultan, Yellow" }]);
replaceAt(361, "Saffron, Meadow", [{ sentiment: "My happiest days are past." }]);
replaceAt(361, "Sorrel, Wood", [{ sentiment: "Joy." }]);
replaceAt(361, "Teasel", [{ sentiment: "Misanthropy." }]);
replaceAt(361, "Wallflower", [{ sentiment: "Fidelity in adversity." }]);
replaceAt(361, "Walnut", [{ sentiment: "Intellect. Stratagem." }]);

replaceAt(362, "loss ysw", [{ name: "Yew", sentiment: "Sorrow." }]);
replaceAt(362, "XANTHIUM", [{ name: "Xanthium" }]);
replaceAt(362, "ZEPHYR Flower", [{ name: "Zephyr Flower" }]);
replaceAt(362, "Watcher by theWayside", [{ name: "Watcher by theWayside" }]);
replaceAt(362, "White Rose (dried)", [{ sentiment: "Death preferable to loss of innocence." }]);
replaceAt(362, "Willow Herb", [{ sentiment: "Pretension." }]);
replaceAt(362, "Wormwood", [{ sentiment: "Absence." }]);
replaceAt(362, "Xeranthemum", [{ sentiment: "Cheerfulness under adversity." }]);
replaceAt(362, "Wisteria", [{ sentiment: "Welcome, fair stranger." }]);

const essayStarts = [
  ["Rose",23],["Hawthorn",49],["Myrtle",62],["Jasmine",68],["Vervain",72],
  ["Orange-blossom",75],["Camphire",79],["Anemone",82],["Periwinkle",86],
  ["Weeping Willow",88],["Asphodel",94],["Aloe",96],["Mezereon",100],
  ["Sensitive Plant",102],["Buttercups",105],["Crocus",107],["Eglantine",110],
  ["Heliotrope",112],["Lilac",114],["Magnolia",116],["Judas Flower",118],
  ["Dandelion",121],["Campanula",123],["Hyacinth",126],["Marygold",129],
  ["Aster",132],["Tuberose",134],["Broom",136],["Poppy",140],["Pink",142],
  ["Furze",144],["Geranium",146],["Fuchsia",148],["Almond-tree",150],
  ["Flos Adonis",152],["Arbutus",154],["Snowdrop",156],["Cowslip",158],
  ["Celandine",161],["Dead Leaves",163],["Heart’s-ease",165],["Basil",170],
  ["Forget-me-not",172],["Apple-blossom",177],["Acanthus",181],
  ["Evening Primrose",183],["Thyme",186],["Cypress",188],["St. John’s Wort",194],
  ["Marvel of Peru",197],["Rosemary",200],["Corn",204],["Tulip",208],
  ["Sycamore",211],["Hollyhock",213],["Lotus",215],["Juniper",220],
  ["Camellia Japonica",222],["Polyanthus",224],["Holly",226],["Foxglove",231],
  ["Pimpernel",233],["Clover",235],["Acacia",237],["Heath",239],["Clematis",242],
  ["Amaranth",244],["Mandrake",247],["Speedwell",249],["Narcissus",251],
  ["Daffodil",252],["Iris",254],["Violet",256],["Primrose",262],["Daisy",266],
  ["Thistle",269],["The Lily",272],["Moonwort",276],["Crown Imperial",278],
  ["Mignonette",279],["Ash",280],["Wallflower",284],["Lily of the Valley",286],
  ["Stock",288],["Sweet William",290],["Dahlia",291],["White Poplar",292],
  ["Black Poplar",294],["Motherwort",296],["Cornflower",298],["Aspen",300],
  ["Lemon",302],["Passion Flower",304],["Syringa",306],["Andromeda",307],
  ["Parsley",308],["Mistletoe",310],["Oak",313],["Convolvulus",318],
  ["Sunflower",320],["Laurel",324],["The Floral Oracle",330],["Typical Bouquets",336],
  ["Emblematic Garlands",342],["The Dial of Flowers",345],["Holy Flowers",347],
  ["The Vocabulary",353],["END",369],
];
const essays = essayStarts.slice(0, -1).map(([heading, start], index) => ({
  heading, start, end: essayStarts[index + 1][1] - 1,
}));

const essayEmblems = new Map([
  ["Rose","Love"],["Hawthorn","Hope"],["Myrtle","Love"],["Jasmine","Amiability"],
  ["Vervain","You enchant me"],["Orange-blossom","Chastity"],["Camphire","Artifice"],
  ["Anemone","Withered hopes; forsaken"],["Periwinkle","Tender recollections"],
  ["Weeping Willow","Mourning"],["Asphodel","I will be faithful unto death"],
  ["Aloe","Bitterness"],["Mezereon","Coquetry"],["Sensitive Plant","Bashful love"],
  ["Buttercups","Riches; memories of childhood"],["Crocus","Cheerfulness"],
  ["Eglantine","Poetry"],["Heliotrope","Devoted attachment"],
  ["Lilac","Love’s first emotions"],["Magnolia","Magnificence"],
  ["Judas Flower","Unbelief"],["Dandelion","Oracle"],["Campanula","I will be ever constant"],
  ["Hyacinth","Game; play"],["Marygold","Grief"],["Aster","After-thought"],
  ["Tuberose","Dangerous pleasures"],["Broom","Humility"],["Poppy","Consolation; oblivion"],
  ["Pink","Pure love"],["Furze","Anger"],["Geranium","Deceit"],["Fuchsia","Taste"],
  ["Almond-tree","Indiscretion"],["Flos Adonis","Painful recollections"],
  ["Arbutus","Thee only do I love"],["Snowdrop","Friend in need; hope"],
  ["Cowslip","Youthful beauty"],["Celandine","Deceptive hopes"],["Dead Leaves","Melancholy"],
  ["Heart’s-ease","Think of me; thoughts"],["Basil","Hatred"],["Forget-me-not","Forget-me-not"],
  ["Apple-blossom","Preference"],["Acanthus","The Arts"],["Evening Primrose","Silent love"],
  ["Thyme","Activity"],["Cypress","Mourning"],["St. John’s Wort","Superstition"],
  ["Marvel of Peru","Timidity"],["Rosemary","Remembrance"],["Corn","Abundance"],
  ["Tulip","A declaration of love"],["Sycamore","Curiosity"],["Hollyhock","Ambition"],
  ["Lotus","Eloquence"],["Juniper","Protection"],["Camellia Japonica","Supreme loveliness"],
  ["Polyanthus","Confidence"],["Holly","Foresight"],["Foxglove","Insincerity"],
  ["Pimpernel","Change"],["Clover","I promise"],["Acacia","Friendship"],["Heath","Solitude"],
  ["Clematis","Artifice"],["Amaranth","Immortality"],["Mandrake","Rarity"],
  ["Speedwell","Fidelity"],["Narcissus","Self-love"],["Daffodil","Unrequited love"],
  ["Iris","A message"],["Violet","Modesty"],["Primrose","Youth"],["Daisy","Innocence"],
  ["Thistle","Independence"],["The Lily","Majesty"],["Moonwort","Forgetfulness"],
  ["Crown Imperial","Power"],["Mignonette","Your qualities surpass your charms"],
  ["Ash","Grandeur"],["Wallflower","Fidelity in misfortune"],
  ["Lily of the Valley","Return of happiness"],["Stock","Lasting beauty"],
  ["Sweet William","Finesse; dexterity"],["Dahlia","Pomp"],["White Poplar","Courage; time"],
  ["Black Poplar","Affliction"],["Motherwort","Concealed love"],["Cornflower","Delicacy"],
  ["Aspen","Lamentation"],["Lemon","Zest"],["Passion Flower","Faith"],
  ["Syringa","Fraternal love"],["Andromeda","Will you help me?"],["Parsley","Festivity"],
  ["Mistletoe","Give me a kiss"],["Oak","Hospitality"],["Convolvulus","Night"],
  ["Sunflower","False riches"],["Laurel","Glory; Bay: Fame"],
]);

const essaySummaries = new Map([
  ["Acacia", "Ingram distinguishes the English pseudo-acacia from the honey-locust and relates the latter’s North American and Indigenous associations."],
  ["Acanthus", "Ingram connects the acanthus with Greek decorative art and the traditional origin of the Corinthian capital."],
  ["Flos Adonis", "Ingram surveys the flower’s many names and the classical story that links its blood-red form with Adonis."],
  ["Almond-tree", "Ingram explains indiscretion through the almond’s very early bloom and consequent exposure to frost, while noting an Eastern association with hope."],
  ["Aloe", "Ingram surveys the aloe’s many practical uses and contrasts bitterness with the Arabic association of patience and grave-side planting."],
  ["Amaranth", "Ingram derives the emblem from the Greek idea of the never-fading flower and recounts its funerary and immortality associations."],
  ["Cowslip", "Ingram presents the cowslip as a fragile emblem of youthful beauty and gathers examples from British poetry."],
  ["Aster", "Ingram links the star-shaped aster’s Greek name with its late flowering and the meaning after-thought."],
  ["Andromeda", "Ingram recounts the myth of Andromeda’s exposure and rescue by Perseus as the basis of the plant’s name."],
  ["Anemone", "Ingram reviews the wind-flower etymology and legends of the anemone’s frailty, sickness, and forsaken hopes."],
  ["Apple-blossom", "Ingram explains preference through the blossom’s beauty and useful fruit, then ranges across classical, Druidic, and seasonal apple customs."],
  ["Arbutus", "Ingram emphasizes that the arbutus can carry bud, blossom, and fruit together, using this continuity to support inseparable love."],
  ["Ash", "Ingram treats the ash as a tree of grandeur and collects its classical, mythological, and northern European associations."],
  ["Aspen", "Ingram describes the aspen’s perpetually trembling leaves and compares natural explanations with legends of lamentation."],
  ["Asphodel", "Ingram relates Greek funeral planting, fields of asphodel beyond Acheron, and fidelity to the dead."],
  ["Basil", "Ingram contrasts basil’s royal Greek name and fragrance with its emblem of hatred, also noting its Eastern grave-side use."],
  ["Laurel", "Ingram distinguishes laurel from sweet bay and traces their intertwined classical roles as emblems of glory, fame, poets, and victors."],
  ["Campanula", "Ingram describes the bell-flower family as broadly constant while recording separate meanings for individual campanulas."],
  ["Black Poplar", "Ingram tells how grief for Phaethon transformed the Heliades into poplars and their tears into amber."],
  ["Broom", "Ingram describes the broom’s abundant coloured flowers and develops its emblematic humility through historical and literary material."],
  ["Buttercups", "Ingram joins the buttercup’s golden colour with riches and with nostalgic memories of childhood play."],
  ["Camellia Japonica", "Ingram praises the camellia as a supremely lovely Rose of Japan while noting the contrast between its beauty and lack of scent."],
  ["Camphire", "Ingram presents camphire as an Eastern flower admired for both beauty and fragrance and develops its association with artifice."],
  ["Jasmine", "Ingram notes the many meanings assigned to jasmine, favours amiability, and discusses the prized Spanish form."],
  ["Celandine", "Ingram reviews the swallow-based Greek name and competing old explanations for the celandine’s deceptive hopes."],
  ["Primrose", "Ingram treats the primrose as youth, surveys its poetic praise, and describes its nostalgic force for Britons abroad."],
  ["Clematis", "Ingram explains artifice through the reported use of clematis by beggars to create deceptive sores, while also describing its ornamental bloom."],
  ["Clover", "Ingram identifies white clover or shamrock as Ireland’s national emblem and recounts its religious and historical associations."],
  ["Convolvulus", "Ingram presents the convolvulus as an emblem of night and relates its opening habits and nocturnal beauty."],
  ["Corn", "Ingram defines corn as food grain, treats it as abundance, and surveys harvest, classical, and national traditions."],
  ["Cornflower", "Ingram recounts the Cycinus story of a devotee making garlands and notes the flower’s arrival among imported grain."],
  ["Crocus", "Ingram discusses the crocus name, its thread-like saffron, bright colour, dye, and association with cheerfulness."],
  ["Crown Imperial", "Ingram describes the downward tulip-shaped bells beneath a leafy crown and connects the stately lily relative with power."],
  ["Cypress", "Ingram traces the cypress as a universal mourning tree and recounts the transformation of Cyparissus."],
  ["Daffodil", "Ingram treats the daffodil as a yellow narcissus and links it with the Dis’s-lily and Proserpine traditions."],
  ["Dahlia", "Ingram records the dahlia’s Mexican habitat, Humboldt’s observation, and its introduction to England in 1789."],
  ["Daisy", "Ingram remarks that poets honour the daisy almost as much as the rose and develops its association with innocence."],
  ["Dandelion", "Ingram defends the common dandelion’s culinary and medicinal uses and explains its familiar role as a rustic oracle."],
  ["Dead Leaves", "Ingram uses fallen leaves and their literary associations as a direct natural emblem of melancholy."],
  ["Rose", "Ingram calls the rose the loveliest child of Flora, traces its Eastern origin, and surveys its exceptional place in world literature."],
  ["Evening Primrose", "Ingram describes the evening primrose opening at night, attracting nocturnal insects, and embodying silent love."],
  ["Marygold", "Ingram discusses Calendula as the flower of the months and links its sun-following habits with grief and constancy of attention."],
  ["Parsley", "Ingram contrasts parsley’s modern festal meaning with ancient Greek banquet, funeral, and grave associations."],
  ["Forget-me-not", "Ingram recounts the Danube legend of a knight who retrieves the flower for his beloved and dies asking not to be forgotten."],
  ["Foxglove", "Ingram explains insincerity through poison hidden in the bright bells and records the Finger-flower name and colour range."],
  ["Fuchsia", "Ingram notes the plant’s Chilean origin, naming for Leonhard Fuchs, and the story of its introduction into British cultivation."],
  ["Furze", "Ingram compares furze with broom, records the name thorny broom, and develops its anger symbolism from its spines."],
  ["Speedwell", "Ingram connects Veronica with the idea of a true image and recounts the Saint Veronica tradition behind fidelity."],
  ["Geranium", "Ingram stresses the geranium’s innumerable varieties and meanings before explaining why the chapter selects deceit for the genus."],
  ["Hawthorn", "Ingram presents hawthorn as a particular favourite of British poets and connects hope with May customs and sacred thorn traditions."],
  ["Heart’s-ease", "Ingram derives pansy from pensée, treats the flower as remembrance and thought, and surveys its many affectionate names."],
  ["Heath", "Ingram presents open heathland and solitude as restorative medicine for a mind wounded by sorrow, love, or fortune."],
  ["Heliotrope", "Ingram explains the Greek sun-turning name and uses the plant’s supposed following of the sun to support devoted attachment."],
  ["Holly", "Ingram treats the evergreen holly as evidence of providential foresight and surveys its winter, religious, and protective associations."],
  ["Hollyhock", "Ingram connects the hollyhock’s height with ambition and identifies it as the old garden mallow."],
  ["Hyacinth", "Ingram describes the Levantine garden hyacinth, its cultivated double forms, colours, fragrance, and classical associations."],
  ["Iris", "Ingram links the iris’s worldwide range and many colours with the rainbow and Iris, messenger of the gods."],
  ["Judas Flower", "Ingram explains the ominous Judas-tree name through the hanging tradition and the reported change of its blossoms’ colour."],
  ["Juniper", "Ingram derives protection from the biblical shelter given to Elijah and adds literary associations with the plant’s name."],
  ["Magnolia", "Ingram records Plumier’s naming of magnolia for Pierre Magnol and describes the fragrant North American tree."],
  ["Lemon", "Ingram identifies lemon as a citron relative, traces its Median or Persian history, and develops its emblem of zest."],
  ["Lilac", "Ingram connects the lilac’s fragrant early spring clusters with the first shy emotions of love."],
  ["The Lily", "Ingram associates the lily with Juno and majesty while distinguishing the many meanings assigned to individual lilies."],
  ["Lily of the Valley", "Ingram records the names May Lily and Ladder to Heaven and develops the flower’s meaning as returning happiness."],
  ["Lotus", "Ingram surveys the lotus’s ancient religious importance, especially in Egyptian and Indian traditions, alongside its eloquence symbolism."],
  ["Mandrake", "Ingram recounts supernatural beliefs about the mandrake and the shaping of its root into a supposed human form."],
  ["Marvel of Peru", "Ingram notes the flower’s many colours, evening opening, and French name belle of the night in explaining timidity."],
  ["Mezereon", "Ingram relates the mezereon to Daphne, notes its bay-like form and bloom before foliage, and develops coquetry."],
  ["Mignonette", "Ingram calls mignonette the French little darling and explains the judgment that its qualities exceed its outward charms."],
  ["Sensitive Plant", "Ingram describes the mimosa’s touch-responsive leaves and uses that susceptibility to explain bashful love."],
  ["Mistletoe", "Ingram connects mistletoe with Christmas kissing and then traces the custom to older Druidic beliefs and rites."],
  ["Moonwort", "Ingram identifies the chapter’s plant with Honesty, discusses its transparent seed-vessels, and surveys magical traditions attached to it."],
  ["Motherwort", "Ingram notes that motherwort blooms in its second year only once and recounts its high estimation in China and Japan."],
  ["Myrtle", "Ingram describes myrtle as a classical emblem of love consecrated to Venus by Greeks and Romans."],
  ["Narcissus", "Ingram explains self-love through the Boeotian youth Narcissus and the myth of his transformation into the flower."],
  ["Oak", "Ingram presents the oak as an ancient sacred tree and illustrates hospitality with famous large English oaks."],
  ["Orange-blossom", "Ingram explains chastity through the bridal wreath custom and surveys the orange blossom’s wedding use."],
  ["Passion Flower", "Ingram describes South American passion flowers and the Christian symbolic reading of their floral structures."],
  ["Periwinkle", "Ingram contrasts the French magician’s violet and sincere friendship with the English meaning of tender recollection."],
  ["Pimpernel", "Ingram describes the scarlet pimpernel as a rare bright British wildflower and connects its changing habit with weather lore."],
  ["Pink", "Ingram places pinks and carnations within one family and explains the pink as an emblem of pure love."],
  ["Polyanthus", "Ingram calls polyanthus the auricula’s hardier twin in the primrose family and discusses its cultivated varieties."],
  ["Poppy", "Ingram recounts Ceres creating the poppy as a consolation during her search for Proserpine and develops sleep and oblivion associations."],
  ["Rosemary", "Ingram traces rosemary’s established meaning of remembrance to beliefs about memory and its repeated use by older poets."],
  ["Snowdrop", "Ingram presents the snowdrop as spring’s first flower and compares its meanings of hope, humility, gratitude, innocence, and friendship."],
  ["St. John’s Wort", "Ingram connects the yellow hypericum with St John’s Day, midsummer customs, and long-standing superstition."],
  ["Stock", "Ingram notes the stock’s long presence in English gardens and the old dispute over which flower the name gillyflower denotes."],
  ["Sunflower", "Ingram records the old name sun marygold, the plant’s solar resemblance, and Peruvian sun-worship traditions behind false riches."],
  ["Sweet William", "Ingram describes the clustered member of the pink family, its poet’s-eye name, and its use in gardens, garlands, and dress."],
  ["Sycamore", "Ingram derives curiosity from the New Testament story of Zacchaeus climbing a sycamore to see Christ."],
  ["Syringa", "Ingram explains the pipe-related Greek name and connects Philadelphus with Ptolemy Philadelphus and fraternal affection."],
  ["Thistle", "Ingram treats the thistle as Scotland’s national emblem and gathers traditions of bravery, retaliation, and independence."],
  ["Thyme", "Ingram explains activity through bees continually visiting thyme and recalls the chivalric device of a bee above a thyme sprig."],
  ["Tuberose", "Ingram explains the corrupted name Polianthes tuberosa and links the flower’s powerful night fragrance with dangerous pleasure."],
  ["Tulip", "Ingram surveys tulip legends, vanity and love meanings, and the historical excesses of tulip enthusiasm."],
  ["Vervain", "Ingram calls vervain the Greek sacred herb and surveys the magical and ceremonial properties behind enchantment."],
  ["Violet", "Ingram compares modesty and faithfulness as violet meanings and gathers examples from Shakespeare and later poets."],
  ["Wallflower", "Ingram presents the wallflower as medieval fidelity in misfortune and connects it with minstrels, ruins, and difficult growing places."],
  ["White Poplar", "Ingram connects the white poplar with Hercules and courage, then develops time through the contrast between its leaf surfaces."],
  ["Weeping Willow", "Ingram treats the willow’s drooping form as an obvious sign of mourning and surveys biblical, poetic, and forsaken-love traditions."],
]);

const [sourceOcrXml, sourceScandata] = await Promise.all([
  fetch("https://ia800703.us.archive.org/32/items/florasymbolica00ingr/florasymbolica00ingr_djvu.xml").then((response) => response.text()),
  fetch("https://archive.org/download/florasymbolica00ingr/florasymbolica00ingr_scandata.xml").then((response) => response.text()),
]);
const sourceObjects = sourceOcrXml.match(/<OBJECT[\s\S]*?<\/OBJECT>/g) ?? [];

function objectIndexForPrintedPage(page) {
  const match = sourceScandata.match(new RegExp(`<leafNum>(\\d+)</leafNum>\\s*<pageNum>${page}</pageNum>`));
  return match ? Number(match[1]) - 1 : undefined;
}

function normalizedOpeningExcerpt(essay) {
  const objectIndex = objectIndexForPrintedPage(essay.start);
  const object = objectIndex === undefined ? "" : sourceObjects[objectIndex] ?? "";
  let text = [...object.matchAll(/<WORD[^>]*>([^<]*)<\/WORD>/g)]
    .map((match) => match[1]
      .replaceAll("&apos;", "'")
      .replaceAll("&quot;", '"')
      .replaceAll("&amp;", "&"))
    .join(" ")
    .replace(/¬\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const sentimentEnd = text.indexOf(")");
  if (sentimentEnd >= 0) text = text.slice(sentimentEnd + 1);
  const dropCap = text.search(/\b(?:T HE|T HIS|A LTHOUGH|B Y|O UR|H OWEVER|F OR|D EEMED|P UN-PROVOKING|I N|N [a-z])/);
  if (dropCap >= 0) text = text.slice(dropCap);
  text = text
    .replace(/^T HE\b/, "The")
    .replace(/^T HIS\b/, "This")
    .replace(/^A LTHOUGH\b/, "Although")
    .replace(/^B Y\b/, "By")
    .replace(/^O UR\b/, "Our")
    .replace(/^H OWEVER\b/, "However")
    .replace(/^F OR\b/, "For")
    .replace(/^D EEMED\b/, "Deemed")
    .replace(/^P UN-PROVOKING\b/, "Pun-provoking")
    .replace(/^I N\b/, "In")
    .replace(/^N ([a-z])/, "An $1");
  const words = text.split(/\s+/).filter(Boolean).slice(0, 38);
  return words.join(" ").replace(/[,:;—-]?$/, "") + (words.length === 38 ? "…" : "");
}

const essayContext = new Map(essays.map((essay) => [essay.heading, {
  emblem: essayEmblems.get(essay.heading) ?? "",
  excerpt: normalizedOpeningExcerpt(essay),
  scanPage: objectIndexForPrintedPage(essay.start),
}]));

const essayAliases = [
  [/^(?:rose(?:bud)?(?:,|$)|sweetbriar|eglantine)/i,"Rose"],
  [/hawthorn/i,"Hawthorn"],[/myrtle/i,"Myrtle"],[/jasmine/i,"Jasmine"],
  [/vervain/i,"Vervain"],[/orange (?:blossoms|flowers)/i,"Orange-blossom"],
  [/camphire/i,"Camphire"],[/anemone/i,"Anemone"],[/periwinkle/i,"Periwinkle"],
  [/willow, weeping/i,"Weeping Willow"],[/asphodel/i,"Asphodel"],[/^aloe$/i,"Aloe"],
  [/mezereon/i,"Mezereon"],[/sensitive (?:plant|plt)/i,"Sensitive Plant"],
  [/buttercup/i,"Buttercups"],[/crocus/i,"Crocus"],[/heliotrope/i,"Heliotrope"],
  [/lilac/i,"Lilac"],[/magnolia/i,"Magnolia"],[/judas/i,"Judas Flower"],
  [/dandelion/i,"Dandelion"],[/(?:campanula|bell flower)/i,"Campanula"],
  [/hyacinth/i,"Hyacinth"],[/marygold/i,"Marygold"],[/(?:aster|starwort)/i,"Aster"],
  [/tuberose/i,"Tuberose"],[/^broom$/i,"Broom"],[/poppy/i,"Poppy"],[/^pink(?:,|$)/i,"Pink"],
  [/(?:furze|gorse)/i,"Furze"],[/geranium/i,"Geranium"],[/fuchsia/i,"Fuchsia"],
  [/almond/i,"Almond-tree"],[/(?:adonis, flos|flos adonis)/i,"Flos Adonis"],
  [/arbutus/i,"Arbutus"],[/snowdrop/i,"Snowdrop"],[/cowslip/i,"Cowslip"],
  [/celandine/i,"Celandine"],[/dead leaves/i,"Dead Leaves"],[/(?:heart’s-ease|pansy)/i,"Heart’s-ease"],
  [/^basil$/i,"Basil"],[/forget-me-not/i,"Forget-me-not"],[/apple blossom/i,"Apple-blossom"],
  [/acanthus/i,"Acanthus"],[/evening primrose/i,"Evening Primrose"],[/^thyme$/i,"Thyme"],
  [/cypress/i,"Cypress"],[/(?:saint|st\.) john’s wort/i,"St. John’s Wort"],
  [/marvel of peru/i,"Marvel of Peru"],[/rosemary/i,"Rosemary"],[/^corn$/i,"Corn"],
  [/tulip/i,"Tulip"],[/sycamore/i,"Sycamore"],[/hollyhock/i,"Hollyhock"],[/^lotus/i,"Lotus"],
  [/juniper/i,"Juniper"],[/camellia japonica|^ditto, white$/i,"Camellia Japonica"],
  [/polyanthus/i,"Polyanthus"],[/^holly$/i,"Holly"],[/foxglove/i,"Foxglove"],
  [/pimpernel/i,"Pimpernel"],[/clover/i,"Clover"],[/acacia/i,"Acacia"],[/^heath$/i,"Heath"],
  [/clematis/i,"Clematis"],[/amaranth/i,"Amaranth"],[/mandrake/i,"Mandrake"],
  [/speedwell/i,"Speedwell"],[/narcissus/i,"Narcissus"],[/daffodil/i,"Daffodil"],
  [/^iris/i,"Iris"],[/violet/i,"Violet"],[/primrose/i,"Primrose"],[/daisy/i,"Daisy"],
  [/thistle/i,"Thistle"],[/lily of the valley/i,"Lily of the Valley"],[/^lily/i,"The Lily"],[/moonwort/i,"Moonwort"],
  [/crown, imperial|imperial crown/i,"Crown Imperial"],[/mignonette/i,"Mignonette"],
  [/(?:ash tree|mountain ash)/i,"Ash"],[/wallflower/i,"Wallflower"],
  [/stock/i,"Stock"],[/sweet william/i,"Sweet William"],[/dahlia/i,"Dahlia"],
  [/white poplar/i,"White Poplar"],[/black poplar|poplar, black/i,"Black Poplar"],
  [/motherwort/i,"Motherwort"],[/cornflower/i,"Cornflower"],[/aspen/i,"Aspen"],
  [/^lemon/i,"Lemon"],[/passion flower/i,"Passion Flower"],[/syringa/i,"Syringa"],
  [/andromeda/i,"Andromeda"],[/parsley/i,"Parsley"],[/mistletoe/i,"Mistletoe"],
  [/^oak/i,"Oak"],[/convolvulus/i,"Convolvulus"],[/sunflower/i,"Sunflower"],
  [/laurel|bay tree|bay wreath/i,"Laurel"],
];

const plateRules = [
  [/^rose(?:,|bud|$)/i,"ROSE — colour plate, IA n38 (between pp. 22–23)"],
  [/(?:^lily|^rose)/i,"LILY AND ROSE — colour plate, IA n58 (between pp. 40–41)"],
  [/^jasmine$|strawberry blossoms/i,"JASMINE AND STRAWBERRY BLOSSOM — colour plate, IA n88 (between pp. 68–69)"],
  [/anemone|periwinkle/i,"WOOD ANEMONE AND PERIWINKLE — colour plate, IA n104 (between pp. 82–83)"],
  [/honeysuckle/i,"HONEYSUCKLE — colour plate, IA n134 (between pp. 110–111)"],
  [/cypress/i,"CYPRUS [caption as printed] — colour plate, IA n218 (between pp. 188–189)"],
  [/poppy|cornflower/i,"POPPY AND CORNFLOWER — colour plate, IA n236 (between pp. 204–205)"],
  [/^holly$|mistletoe/i,"HOLLY AND MISTLETOE — colour plate, IA n260 (between pp. 226–227)"],
  [/^primrose$|^heath$|^violet(?:,|$)/i,"PRIMROSE, HEATH AND VIOLET — colour plate, IA n292 (between pp. 256–257)"],
  [/^lily of the valley$/i,"LILY OF THE VALLEY — colour plate, IA n324 (between pp. 286–287)"],
  [/passion flower/i,"PASSION FLOWER — colour plate, IA n344 (between pp. 304–305)"],
  [/^ivy$/i,"IVY AND BERRIES — colour plate, IA n380 (between pp. 336–337)"],
];

const excludedSpecific = /^(?:allspice|arbor vitae|autumnal leaves|bay leaf|branch of|bundle of reeds|bur$|canary grass|cedar(?: of lebanon)?$|cedar leaf|champignon|corn$|corn, broken|corn straw|cypress|dandelion, or thistle-seed-head|dead leaves|dried flax|fern$|flowering fern|fig$|fig tree|fir$|fir tree|flax$|foxtail grass|grass$|iceland moss|ivy, sprig|juniper|laurel-leaved magnolia|leaves \(dead\)|lemon$|lichen|lint|liverwort|lotus leaf|mandrake|moonwort|moss$|mosses|mushroom|mustard seed|myrobalan|myrrh|oak leaves|oats|osmunda|palm|pine(?:, .*)?$|pine$|potato|quaking grass|ray grass|reed$|reed, split|rose leaf|rush$|rye grass|straw \(broken\)|straw \(whole\)|tendrils of climbing plants|thorn, branch|tremella nestoc|truffle|turnip|vernal grass|virginia creeper|walnut|water-melon|wheat stalk|yew)$/i;
const fruitSpecific = /^(?:apple$|cranberry|currant|fig marygold|gooseberry|gourd|grape, wild|indian plum|lemon$|mulberry tree|peach$|pear$|persimon|pigeon berry|pine-apple|plum,|pomegranate$|quince|raspberry|whortleberry|winter cherry)$/i;
const borderlineSpecific = /(?:tree|elm|linden|birch|hazel|hornbeam|maple|oak$|osier|poplar|sycamore|willow, (?:creeping|water|french)|tree of life|^cabbage$|^endive$|^hemp$|^lettuce$|^parsley$|^rhubarb$|^prickly pear$)/i;

function classify(heading) {
  if (excludedSpecific.test(heading) || fruitSpecific.test(heading)) {
    return ["exclude", "Source option denotes foliage/wood, fern, moss/lichen/fungus, fruit, seed/root/grain, grass/reed, or another explicitly excluded non-bloom form."];
  }
  if (borderlineSpecific.test(heading) && !/(?:flower|blossom|in flower)/i.test(heading)) {
    return ["borderline", "Whole woody or fruit-bearing flowering plant is named without an explicit blossom/form; source does not establish which plant part is the token."];
  }
  return ["include", "Flower/blossom/inflorescence, floral arrangement, or flowering plant conventionally presented through its bloom in this source vocabulary."];
}

function normalized(heading, previous) {
  if (/^Ditto, White$/i.test(heading)) return "Camellia Japonica";
  return heading
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/,\s*(?:Deep Red|Red|White|Yellow|Yell\.|Scarlet|Purple|Blue|Pink|Dark|Lilac|Variegated|Striped|Double|Single|Dwarf|Tall|Wild|Garden|Common|American|French|Indian|German|Swamp|Spring|Saffron|Parti-coloured).*$/i, "")
    .replace(/\s+/g, " ").trim() || previous || heading;
}

function variant(heading) {
  const comma = heading.indexOf(",");
  if (comma >= 0) return heading.slice(comma + 1).trim();
  const form = heading.match(/\(([^)]+)\)/);
  return form?.[1] ?? "";
}

async function translateAll(sentiments) {
  const cached = fs.existsSync("/tmp/ingram_translations.json")
    ? JSON.parse(fs.readFileSync("/tmp/ingram_translations.json", "utf8"))
    : {};
  const translated = new Map(Object.entries(cached));
  const unique = [...new Set(sentiments)].filter((sentiment) => !translated.has(sentiment));
  let cursor = 0;
  async function worker() {
    while (cursor < unique.length) {
      const text = unique[cursor++];
      try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en%7Ctr`;
        const response = await fetch(url);
        const json = await response.json();
        if (!response.ok || !json?.responseData?.translatedText) throw new Error(String(response.status));
        translated.set(text, json.responseData.translatedText.replace(/&#39;/g, "'"));
      } catch {
        try {
          const fallbackUrl = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=tr&q=${encodeURIComponent(text)}`;
          const fallbackResponse = await fetch(fallbackUrl);
          const fallbackJson = await fallbackResponse.json();
          const fallbackText = Array.isArray(fallbackJson) ? fallbackJson.join("") : "";
          if (!fallbackResponse.ok || !fallbackText) throw new Error(String(fallbackResponse.status));
          translated.set(text, fallbackText);
        } catch {
          translated.set(text, `Türkçe karşılık için manuel çeviri gerekli: ${text}`);
        }
      }
    }
  }
  await Promise.all(Array.from({ length: 8 }, () => worker()));
  return translated;
}

const translations = await translateAll(rows.map((row) => row.sentiment));
let previousNormalized = "";
const enriched = rows.map((row, index) => {
  const [classification, classificationReason] = classify(row.name);
  const workingNormalizedName = normalized(row.name, previousNormalized);
  previousNormalized = workingNormalizedName;
  const alias = essayAliases.find(([pattern]) => pattern.test(row.name))?.[1];
  const essay = alias ? essays.find((item) => item.heading === alias) : undefined;
  const context = essay ? essayContext.get(essay.heading) : undefined;
  const plates = plateRules.filter(([pattern]) => pattern.test(row.name)).map(([, value]) => value);
  return {
    source_row: index + 1,
    source_heading: row.name,
    working_normalized_name: workingNormalizedName,
    variant_color_form: variant(row.name),
    original_sentiment: row.sentiment,
    turkish_literal_gloss: translations.get(row.sentiment),
    translation_status: translations.get(row.sentiment)?.startsWith("Türkçe karşılık") ? "unresolved" : "automatic_literal_gloss_needs_language_review",
    vocabulary_printed_page: row.printedPage,
    vocabulary_scan_page: row.scanPage,
    vocabulary_column: row.column,
    classification,
    classification_reason: classificationReason,
    narrative_context_present: essay ? "yes" : "no",
    narrative_heading: essay?.heading ?? "",
    narrative_printed_pages: essay ? `${essay.start}–${essay.end}` : "",
    narrative_start_scan_page: context?.scanPage === undefined ? "" : `n${context.scanPage}`,
    narrative_context_note: essay ? `Source-specific context: the chapter treats ${essay.heading} as “${context?.emblem}”. ${essaySummaries.get(essay.heading)} (printed pp. ${essay.start}–${essay.end}).` : "No dedicated essay matched from the printed contents list.",
    narrative_start_url: context?.scanPage === undefined ? "" : `https://archive.org/details/florasymbolica00ingr/page/n${context.scanPage}/mode/1up`,
    source_plate_mapping: plates.join("; "),
    botanical_image_still_missing: classification === "exclude" ? "not_applicable" : plates.length ? "no" : "yes",
    source_page_url: `https://archive.org/details/florasymbolica00ingr/page/n${row.printedPage + 45}/mode/1up`,
  };
});

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
const headers = Object.keys(enriched[0]);
const csv = [headers.join(","), ...enriched.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n") + "\n";

const counts = enriched.reduce((acc, row) => {
  acc[row.classification] = (acc[row.classification] ?? 0) + 1;
  return acc;
}, {});
const unresolvedTranslations = enriched.filter((row) => row.translation_status === "unresolved").length;
const pageCounts = Object.fromEntries([...new Set(enriched.map((row) => row.vocabulary_printed_page))].map((page) => [page, enriched.filter((row) => row.vocabulary_printed_page === page).length]));

const md = `# John H. Ingram — *Flora Symbolica* (catalogued 1869): Stage 1 evidence table

## Scope and locked source

- Locked primary: Cornell copy digitized in BHL/Internet Archive, identifier [\`florasymbolica00ingr\`](https://archive.org/details/florasymbolica00ingr), catalogue date 1869. BHL title record: [DOI 10.5962/bhl.title.159895](https://doi.org/10.5962/bhl.title.159895). Cornell record: [catalogue](https://digital.library.cornell.edu/catalog/flow2295724).
- Enumeration source: **The Vocabulary, Part First**, printed pp. **355–362** (IA scan pages **n400–n407**). Part Second, printed pp. 362–368, was used as an inverse-index completeness check, not as a second entry source.
- Google 1870/1887 witnesses were not merged. No cross-book deduplication or app-facing contract is attempted here.

## Counts

- Source options: **${enriched.length}**.
- Classification: **include ${counts.include ?? 0}**, **borderline ${counts.borderline ?? 0}**, **exclude ${counts.exclude ?? 0}**.
- Per printed vocabulary page: ${Object.entries(pageCounts).map(([page,count]) => `p. ${page}: ${count}`).join("; ")}.
- Automatic Turkish literal glosses requiring language review: **${enriched.length - unresolvedTranslations}**; unresolved translation-service fallbacks: **${unresolvedTranslations}**.

## Extraction and verification method

1. IA DjVu XML was used only to discover and geometrically separate the two name/sentiment column pairs.
2. Printed pp. 355–362 were inspected as page images; wrapped headings, sentiment continuations, column bleed, typography, variants, and the transition to Part Second were repaired against those images.
3. Part Second (sentiment → plant, pp. 362–368) was used as a reverse-index checksum. It is not silently merged into Part First.
4. The printed contents supplied exact ranges for dedicated narrative essays. Matching is lexical and is recorded only when a corresponding contents heading exists; the note does not summarize unverified prose details.
5. Classification follows the approved bloom-focused taxonomy. Working normalized names are non-authoritative search labels only. The CSV is a temporary evidence table, not an application/data contract.

## Context sections retained separately

- **The Dial of Flowers**, printed pp. **345–346** ([IA n390](https://archive.org/details/florasymbolica00ingr/page/n390/mode/1up)): a time-of-day flower-opening/closing list; not converted into flower/sentiment rows.
- **Holy Flowers**, printed pp. **347–352** ([IA n392](https://archive.org/details/florasymbolica00ingr/page/n392/mode/1up)): calendrical/religious flower material; retained as context, not merged with Vocabulary entries.
- Other source context: The Floral Oracle pp. 330–335; Typical Bouquets pp. 336–341; Emblematic Garlands pp. 342–344.

## Illustration assessment

The scan contains fifteen full-page colour plates. All captions were directly verified: ROSE (n38), LILY AND ROSE (n58), JASMINE AND STRAWBERRY BLOSSOM (n88), WOOD ANEMONE AND PERIWINKLE (n104), HONEYSUCKLE (n134), MAIDEN HAIR FERN (n162), LEAVES FROM THE WAY SIDE (n190), CYPRUS [caption as printed] (n218), POPPY AND CORNFLOWER (n236), HOLLY AND MISTLETOE (n260), PRIMROSE, HEATH AND VIOLET (n292), LILY OF THE VALLEY (n324), PASSION FLOWER (n344), EVERGREEN (n366), and IVY AND BERRIES (n380). Row-level mappings are conservative: only caption-supported subjects are mapped. An image is marked missing when an included/borderline source option lacks a verified source plate mapping.

## Completeness and spot checks

- Alphabetical endpoints verified: Abecedary (p. 355) through Zinnia (p. 362).
- Dense/fragile checks verified against scans: the Camellia Japonica \`Ditto, White\` inheritance (p. 356); four Convolvulus forms (p. 356); the geranium leaf/form variants (pp. 357–358); rose/rosebud forms including withered/dried and combined-colour options (p. 360); the Part First/Part Second boundary (p. 362).
- CSV validation should confirm ${enriched.length} data rows, sequential \`source_row\`, nonblank heading/sentiment/page/classification fields, and only the three approved classification values.

## Open issues

- Turkish glosses are automatic literal aids, not source text; all require Turkish language review, and ${unresolvedTranslations} currently use an explicit unresolved fallback.
- Botanical identifications and working normalized labels are deliberately non-authoritative. Historical spellings/abbreviations remain in \`source_heading\` where scan-readable.
- Borderline rows require the owner’s later decision on whether an unqualified whole woody/fruit-bearing flowering plant is sufficiently bloom-presented.
- The IA OCR contains predictable column-order and ligature errors; it must not be treated as the final evidence where it conflicts with scan images.

## Data artifact

See [\`ingram-1869.csv\`](./ingram-1869.csv). The CSV carries exact source heading, non-authoritative working normalization, variant/form, sentiment, Turkish gloss, printed/scan page and column, classification/reason, narrative range, plate mapping, image gap, and direct scan-page URL.
`;

const outputDirectory = "/home/eray/GF/research/flowers/stage-1";
fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(`${outputDirectory}/ingram-1869.csv`, csv);
fs.writeFileSync(`${outputDirectory}/ingram-1869.md`, md);
console.log(JSON.stringify({ rows: enriched.length, counts, pageCounts, unresolvedTranslations }, null, 2));
