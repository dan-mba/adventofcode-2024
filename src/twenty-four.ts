import { open } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

let fh;
interface WireRecord {
  [key: string] : number
}
const wires:WireRecord = {};

function processGate(op1:number, op2:number, gate: string): number {
  switch(gate) {
    case "AND":
      return op1 & op2;
    case "OR":
      return op1 | op2;
    case "XOR":
      return op1 ^ op2;
  }
  return 0
}

try {
  fh = await open(join(cwd(),"input/twenty-four.txt"), "r");
  const data = await fh.readFile({encoding: "utf-8"});
  const sections = data.split("\n\n");
  const inputs = sections[0]?.split("\n");
  inputs?.forEach(i => {
    const wire = i.split(": ");
    wires[wire[0] ?? "misc"] = Number(wire[1]);
  })

  const diagram = sections[1]?.split("\n");
  while ((diagram?.length ?? 0) > 0) {
    const item = diagram?.shift() ?? "";
    if (!item) continue;
    const operation = item?.split(" -> ") ?? [];
    const inputs = operation[0]?.split(" ");
    const op1 = inputs ? inputs[0] ?? "invalid" : "invalid";
    const op2 = inputs ? inputs[2] ?? "invalid" : "invalid";
    const gate = inputs ? inputs[1] ?? "" : "";

    if (wires?.hasOwnProperty(op1) && wires?.hasOwnProperty(op2)) {
      const output = operation[1] ?? "misc";
      wires[output] = processGate(wires[op1] ?? 0, wires[op2] ?? 0, gate)
    } else {
      diagram?.push(item);
    }
  }

  const zDigits = Object.keys(wires).filter(w => w.startsWith("z")).sort().reverse();
  const xDigits = Object.keys(wires).filter(w => w.startsWith("x")).sort().reverse();
  const yDigits = Object.keys(wires).filter(w => w.startsWith("y")).sort().reverse();
  const z = zDigits.map(d => wires[d]?.toString()).join("");
  const x = xDigits.map(d => wires[d]?.toString()).join("");
  const y = yDigits.map(d => wires[d]?.toString()).join("");
  //const xAndY = (BigInt(`0b${x}`) & BigInt(`0b${y}`)).toString(2);
  const xPlusY = (Number(`0b${x}`) + Number(`0b${y}`)).toString(2);
  

  console.log(z, parseInt(z, 2));
  console.log(xPlusY);
  console.log(x);
  console.log(y);
  
} finally {
  await fh?.close()
}