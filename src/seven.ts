import { open } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";
import { addSyntheticLeadingComment } from "typescript";

let fh;
let sum = 0;

function operators (a:number, b:number):number[] {
  return [a+b, a*b];
}

try {
  fh = await open(join(cwd(),"input/seven.txt"), "r");
  const data = await fh.readFile({encoding: "utf-8"});
  const lines = data.split("\n");
  const equations = lines.map(l => l.split(": "));

  equations.forEach(eq => {
    if (eq.length !== 2) return;
    const ans = Number(eq[0]);
    const operands = (eq[1] ?? "").split(" ").map(x => Number(x));
    let tries = operators(operands[0] ?? 0, operands[1] ?? 0);
    const nums = operands.slice(2);
    while (nums.length > 0) {
      const n = nums.shift();
      tries = tries.flatMap(x => operators(x, n ?? 0));
    }
    if (tries.includes(ans)) {
      sum += ans;
    }
  })

  console.log(sum);
} finally {
  await fh?.close()
}