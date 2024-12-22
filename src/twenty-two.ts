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

function calcuateNext(secret:number) {
  let next =  prune(mix(secret, secret*64));
  next = prune(mix(next, Math.floor(next/32)));
  return prune(mix(next, next*2048))
}

try {
  fh = await open(join(cwd(),"input/twenty-two.practice.txt"), "r");
  const data = await fh.readFile({encoding: "utf-8"});

  
} finally {
  await fh?.close()
}