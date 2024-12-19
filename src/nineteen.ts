import { open } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

interface CacheRecord {
  [key: string] : number
}
let fh;
let cache:CacheRecord = {}

function tryTowels(towels:string[], combo:string): number {
  let count = 0;
  if (cache[combo]) return cache[combo];
  
  for (const t of towels) {
    if (combo.startsWith(t)) {
      const newCombo = combo.slice(t.length)
      if (newCombo.length === 0) {
        count++;
        continue;
      }
      count += tryTowels(towels, newCombo);
    }
  }

  cache[combo] = count;
  return count;
}

try {
  fh = await open(join(cwd(),"input/nineteen.txt"), "r");
  const data = await fh.readFile({encoding: "utf-8"});
  const sections = data.split("\n\n");
  const towels = sections[0]?.split(", ") ?? [];
  towels.sort((a,b) => b.length - a.length);
  const combos = sections[1]?.split("\n").slice(0,-1) ?? [];

  let count = 0;
  let comboCount = 0;
  for (const combo of combos) {
    const tryCount = tryTowels(towels, combo);
    if (tryCount > 0) {
      console.log(combo);
      count++;
      comboCount += tryCount;
    }
  }

  console.log(count)
  console.log(comboCount)
  
} finally {
  await fh?.close()
}