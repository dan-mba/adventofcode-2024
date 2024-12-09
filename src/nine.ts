import { open } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

let fh;
let empty = 0;

function countBack(blocks:number[], index:number):number {
  const val = blocks[index];
  let i = index;
  while (blocks[i] === val) {
    i--;
  }
  return i+1;
}

function countForward(blocks:number[], index:number):number {
  const val = blocks[index];
  let i = index;
  while (blocks[i] === val) {
    i++;
  }
  return i-1;
}

function findEmpty(blocks:number[], length: number, end:number): number {
  let i = 0;
  while ((i = blocks.indexOf(-1, i)) >= 0 && i < end) {
    const l = countForward(blocks, i);
    if (l-i+1 >= length) return i;
    i = l + 1;
  }
  return -1;
}

function makeBlocks(index:number, count:number):number[] {
  const val = new Array(count);
  if (index % 2 === 0) {
    val.fill(index/2)
  } else {
    empty += count;
    val.fill(-1)
  }
  return val
}

function getChecksum(blocks:number[]):number {
  let checksum = 0;
  blocks.forEach((x,i) => checksum += x>0 ?  x*i : 0);
  return checksum;
}


try {
  fh = await open(join(cwd(),"input/nine.txt"), "r");
  const data = await fh.readFile({encoding: "utf-8"});
  const blocks = data.split("");
  const files = blocks.flatMap((x, i) => makeBlocks(i, Number(x)));
  let twoFiles = files.slice(0);
  while  (empty > 0) {
    const temp = files.pop();
    const move = files.indexOf(-1);
    files[move] = temp ?? 0;
    empty--;
  }

  const cs = getChecksum(files)
  console.log(cs);
  
  let twoIndex = twoFiles.length - 1;
  while (twoIndex > 0) {
    const l = countBack(twoFiles, twoIndex);
    const length = twoIndex - l + 1;
    const val = twoFiles[twoIndex] ?? 0;
    if (val !== -1){
      const x = findEmpty(twoFiles, length, twoIndex);
      
      if (x >= 0) {
        twoFiles.fill(val, x, x + length).fill(-1, twoIndex-length+1, twoIndex+1);
      }
    }
    twoIndex -= length;
  }
  
  const twoCs = getChecksum(twoFiles);
  console.log(twoCs);
} finally {
  await fh?.close()
}