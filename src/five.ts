import { open } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

let fh;
const fails:string[][] = [];

function pageRules(page: string, rules:string[][]):string[] {
  const match = rules.filter(r => r[0] === page);
  if (match.length === 0) return [];

  const matches = match.map(r => r[1] ? r[1] : '');
  return matches;
}

function checkRules(pages:string[], rules:string[][]):number {
  for(let i=1; i<pages.length; i++) {
    const r = pageRules(pages[i] ?? '', rules);
    if (r.length === 0) continue;
    if (r.some(x => pages.slice(0,i).includes(x))) return 0;
  }
  return Number(pages[Math.floor(pages.length/2)]);
}

function fixRules(pages:string[], rules:string[][]):number {
  let list = pages.slice(0);

  for(let i=1; i<list.length; i++) {
    const page = list[i];
    const r = pageRules(page ?? '', rules);
    if (r.length === 0) continue;

    const indexes = r.map(x => list.indexOf(x)).filter(x => x<i && x>= 0);
    if (indexes.length === 0) continue;

    indexes.sort((a, b) => a-b);
    const swap = indexes[0];

    const temp = list.toSpliced(i, 1);
    list = [...temp.slice(0,swap), page ?? '', ...temp.slice(swap) ];
    i--;
  }
  return Number(list[Math.floor(list.length/2)]);
}

try {
  fh = await open(join(cwd(),"input/five.txt"), "r");
  const data = await fh.readFile({encoding: "utf-8"});
  const pages = data.split('\n\n');
  const rules = pages[0]?.split("\n").map(x => x.split("|")) ?? [[]];
  const prints = pages[1]?.split("\n").slice(0,-1).map(x => x.split(",")) ?? [[]];

  const mid = prints.reduce((sum, p) => {
    const m = checkRules(p, rules);
    if (m === 0 ) fails.push(p);
    return sum + m;
  }, 0);
  console.log(mid);
  const midFixed = fails.reduce((sum, p) => sum + fixRules(p, rules), 0);
  console.log(midFixed)
} finally {
  await fh?.close()
}