import { setCartesian } from "mathjs";
import { open } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

let fh;

function mix(secret:number, value:number):number {
  return Number(BigInt(secret) ^ BigInt(value));
}

function prune(secret:number):number {
  return secret % 16777216;
}

function calculateNext(secret:number) {
  let next =  prune(mix(secret, secret*64));
  next = prune(mix(next, Math.floor(next/32)));
  return prune(mix(next, next*2048));
}

function twoThousandSecret(secret:number): number {
  let next = secret;
  for (let i = 0; i< 2000; i++) {
    next = calculateNext(next);
  }
  return next;
}

try {
  fh = await open(join(cwd(),"input/twenty-two.txt"), "r");
  const data = await fh.readFile({encoding: "utf-8"});
  const secrets = data.split("\n").slice(0,-1);
  const secretNums = secrets.map(x => Number(x));

  let sum = 0;
  for (const secret of secretNums) {
    const next = twoThousandSecret(secret);
    console.log(next);
    sum += next;
  }

  console.log("sum: ", sum);
} finally {
  await fh?.close()
}