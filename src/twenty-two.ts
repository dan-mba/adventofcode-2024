import { setCartesian } from "mathjs";
import { open } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

let fh;
interface CacheRecord {
  [key: string] : number
}
const sequenceCache:CacheRecord = {};
let max = 0;
let maxSequence = "";

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

function mergeCache(tempCache:CacheRecord): void {
  for (const key in tempCache) {
    if (sequenceCache[key]) {
      sequenceCache[key] += (tempCache[key] ?? 0);
    } else {
      sequenceCache[key] = (tempCache[key] ?? 0);
    }
    if (sequenceCache[key] > max) {
      maxSequence = key;
      max = sequenceCache[key];
    }
  }
}

function twoThousandDigits(secret:number): number[] {
  const digits = [secret%10];
  let next = secret;
  for (let i = 0; i< 2000; i++) {
    next = calculateNext(next);
    digits.push(next%10);
  }

  return digits
}

function findDiffs(digits: number[]):number[] {
  const diffs:number[] = [];
  for(let i = 1; i < digits.length; i++) {
    diffs.push((digits[i] ?? 0) - (digits[i-1] ?? 0))
  }

  return diffs;
}

function findSequences(digits: number[]): void {
  const diffs = findDiffs(digits);
  const tempCache:CacheRecord = {};
 
  for(let i = 4; i < digits.length; i++) {
    if ((digits[i] ?? 0) > 0) {
      const sequence = diffs.slice(i-4,i).join(",");
      if (!tempCache[sequence]) {
        tempCache[sequence] = (digits[i] ?? 0);
      }
    }
  }

  mergeCache(tempCache);
}

try {
  fh = await open(join(cwd(),"input/twenty-two.txt"), "r");
  const data = await fh.readFile({encoding: "utf-8"});
  const secrets = data.split("\n").slice(0,-1);
  const secretNums = secrets.map(x => Number(x));

  let sum = 0;
  for (const secret of secretNums) {
    const next = twoThousandSecret(secret);
    sum += next;
  }
  console.log("sum: ", sum);


  for (const secret of secretNums) {
    findSequences(twoThousandDigits(secret));
  }

  console.log(max, maxSequence);
} finally {
  await fh?.close()
}