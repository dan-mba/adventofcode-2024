import { open } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

let fh;

function getSum(data:string):number {
  let tokens:Array<string | undefined> = data.split("mul(");
  tokens.splice(0,1); // remove string data before first mul
  tokens = tokens.map(s => s?.split(")")[0]);
  tokens = tokens.filter(t => t?.match(/^\d+[,]\d+$/))

  const sum = tokens.reduce((s,v) => {
    const vals = v?.split(",");
    if (vals?.length !== 2) return s;
    return s + (Number(vals[0]) * Number(vals[1]))
  }, 0);

  return sum;
}

try {
  fh = await open(join(cwd(),"input/three.txt"), "r");
  const data = await fh.readFile({encoding: "utf-8"});
  const sum = getSum(data);

  const donts =  data.split("don't()");
  const dos = [donts[0]];
  donts.splice(0,1);
  donts.forEach(s => {
    const d = s.split("do()");
    if(d?.length > 1) {
      d.splice(0,1);
      dos.push(d.join(""));
    }
  });

  const doSum = dos.reduce ((s, v) => {
    if (!v) return s;
    return s + getSum(v);
  }, 0)

  console.log("sum: ", sum)
  console.log("do() sum: ", doSum)
} finally {
  await fh?.close()
}