import { open } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";


function isSorted(list:number[]):boolean {
  let sorted = true;
  const sList = list.toSorted((a,b) => a-b);
  
  sorted = list.every((num, i) => num === sList[i]);
  if (sorted) return true;
  
  sList.reverse();
  sorted = list.every((num, i) => num === sList[i]);

  return sorted;
}

function isSafe(list:number[]):boolean {
  if (!isSorted(list)) return false;
  const val = list.reduce((a,b) => {
    const diff = Math.abs(a-b);
    if (diff > 0  && diff < 4) {
      return b;
    }
    return -10;
  });
  if (val > 0) {
    return true;
  }
  return false;
}

let fh;
let nums:number[][] = [];
let safe=0;
let safeMod=0;

try {
  fh = await open(join(cwd(),"input/two.txt"), "r");
  const data = await fh.readFile({encoding: "utf-8"});
  const lines = data.split("\n");
  lines.forEach(line => {
    const vals = line.split(/\s+/);
    if(vals.length < 2) {
      return;
    }
    const n = vals.map(v => Number(v));
    nums.push(n);
  })

  nums.forEach(list => {
    if (isSafe(list)) {
      safe++;
      return;
    }
    for(let i=0; i<list.length; i++) {
      const modList = list.toSpliced(i,1);
      if(isSafe(modList)) {
        safeMod++;
        return;
      }
    }
  })
  
  console.log("safe: ", safe);
  console.log("safe modified: ", safe + safeMod);
} finally {
  await fh?.close()
}