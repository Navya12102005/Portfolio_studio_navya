import { K, type Sprite } from "./pixel";

const pal = { G: K.green, D: K.greenD, K: K.ink, R: K.red, W: K.white, Y: K.yellow, O: K.orange };

export const DINO: Sprite = { pal, rows: [
  ".........GGGGG...", "........GGGGGGG..", "........GGKGGGGG.", "........GGGGGGGG.", "........GGGGDDDD.", "........GGGGGGG..",
  "G......GDGDGG....", "GG....GGGGGGGG...", ".GGGGGGGGGGGGG..", "..GGGGGGGGGGGG..", "..GGGGGGGGGGGG..", "...GGGGGGGGG....", "....GG...GG.....", "....DD...DD.....",
] };
export const DINO_OPEN: Sprite = { pal, rows: [
  ".........GGGGG...", "........GGGGGGG..", "........GGKGGGGG.", "........GGWGWGGG.", "........GKRRRRR..", "........GGGGGGG..",
  "G......GDGDGG....", "GG....GGGGGGGG...", ".GGGGGGGGGGGGG..", "..GGGGGGGGGGGG..", "..GGGGGGGGGGGG..", "...GGGGGGGGG....", "....GG...GG.....", "....DD...DD.....",
] };
export const FIREBALL: Sprite = { pal: { Y: K.yellow, O: K.orange, W: K.white, R: K.red }, rows: ["..YYY.", ".YOOOY", "YOWWOR", ".YOOOY", "..YYY."] };

export const MUG: Sprite = { pal: { W: K.white, O: K.orange, G: K.grey }, rows: [".WWWWW..", ".WWWWWW.", ".WOOOWW.", ".WWWWWW.", ".WWWWW..", ".GGGGG.."] };

export const VASE: Sprite = { pal: { B: "#9fe6ff", C: "#2a5a86", P: K.pink, G: K.green, Y: K.yellow }, rows: [
  "...Y...", "..PYP..", "...G...", "...G...", ".BBBBB.", "..BCB..", "..BCB..", ".BCCCB.", "BCCCCCB", "BCCCCCB", "BCCCCCB", ".BCCCB.", "..BBB..",
] };
export const SHARDS: Sprite = { pal: { B: "#9fe6ff", C: "#2a5a86" }, rows: [
  "B..C....B...C.", ".C...B....C...", "..B.C...B..B.C", "C....B.C...C..", ".B.C......B...",
] };

export const PLANT: Sprite = { pal: { G: K.green, D: K.greenD, P: K.orange, Q: "#a5380c" }, rows: [
  "...G.G...", "..GGGGG..", ".GGDGDGG.", "..GGGGG..", "...GDG...", "...GDG...", ".PPPPPPP.", ".PPPPPPP.", "..QQQQQ..", "..QQQQQ..",
] };
export const BLOOM: Sprite = { pal: { F: K.pink, Y: K.yellow, W: K.white }, rows: [
  "..F...F..", ".FYF.FYF.", "..F.W.F..", ".........",
] };

export const CAP: Sprite = { pal: { R: K.red, D: K.redD, W: K.white }, rows: [
  "..RRRRR...", ".RRRRRRR..", "RRRRWRRRR.", "RRRRRRRRRD", "DDDDDDDDD.",
].map((r) => r) };

export const ROBOT: Sprite = { pal: { G: K.grey, D: K.greyD, C: K.cyan, O: K.orange }, rows: [
  "...O....", "...D....", ".GGGGGG.", ".GCGGCG.", ".GGGGGG.", "..DDDD..", ".GGGGGG.", ".GOGGOG.", ".GGGGGG.", "..D..D..",
] };
export const FLOPPY: Sprite = { pal: { B: K.blue, G: K.grey, K: K.ink, W: K.white }, rows: [
  "BBBBBBB", "BGGGGKB", "BGGGGKB", "BBBBBBB", "BWWWWWB", "BWBBBWB", "BWWWWWB",
] };
export const DUCK: Sprite = { pal: { Y: K.yellow, O: K.orange, K: K.ink }, rows: [
  "..YY...", ".YYKY..", ".YYYOO.", "..YYY..", ".YYYYY.", "YYYYYY.", ".YYYY..",
] };
export const CHIP: Sprite = { pal: { K: K.ink, G: K.greyD, O: K.orange, C: K.cyan }, rows: [
  ".G.G.G.G.", "GKKKKKKKG", ".KOKKKCK.", "GKKKKKKKG", ".KCKKKOK.", "GKKKKKKKG", ".KKKKKKK.", "GKKKKKKKG", ".G.G.G.G.",
] };
export const MOON: Sprite = { pal: { W: K.white, Y: "#ffe9a8" }, rows: [
  "..WWWW..", ".WWYY...", "WWY.....", "WWY.....", "WWY.....", "WWY.....", ".WWYY...", "..WWWW..",
] };
