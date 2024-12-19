import { open } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

let fh;
let solved = false;

function tryTowels(towels:string[], combo:string): void {
  if (solved) return

  for (const t of towels) {
    if (combo.includes(t)) {
      const newCombo = combo.replace(t, "-");
      const test = newCombo.replaceAll("-","");
      if (test.length === 0) {
        solved = true;
        break;
      }
      tryTowels(towels, newCombo);
    }
  }
}

function checkCombo(towels:string[], combo:string): boolean {
  solved = false;

  tryTowels(towels, combo);

  return solved
}

try {
  fh = await open(join(cwd(),"input/nineteen.practice.txt"), "r");
  const data = await fh.readFile({encoding: "utf-8"});
  const sections = data.split("\n\n");
  const towels = sections[0]?.split(", ") ?? [];
  towels.sort((a,b) => b.length - a.length);
  const combos = sections[1]?.split("\n").slice(0,-1) ?? [];

  let count = 0;
  for (const combo of combos) {
    console.log(combo);
    if (checkCombo(towels, combo)) {
      count++;
    }
  }

  console.log(count)
  
} finally {
  await fh?.close()
}