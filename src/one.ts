import { open } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

let fh;
let first:number[] = [];
let second:number[] = [];
let sum = 0;

try {
  fh = await open(join(cwd(),"input/one.txt"), "r");
  const data = await fh.readFile({encoding: "utf-8"});
  const lines = data.split("\n");
  lines.forEach(line => {
    const vals = line.split(/\s+/);
    if(vals.length !== 2) {
      return;
    }
    first.push(Number(vals[0]));
    second.push(Number(vals[1]));
  })
  
  first.sort((a,b) => a-b);
  second.sort((a,b) => a-b);
  for (let i=0; i<first.length; i++) {
    sum += Math.abs((first[i] || 0) - (second[i] || 0));
  }

  console.log(sum);
} finally {
  await fh?.close()
}