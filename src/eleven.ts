//const stonesInit = "0 1 10 99 999";
//const stonesInit = "125 17";
const stonesInit = "814 1183689 0 1 766231 4091 93836 46";

interface Cache {
  [key: string]: number;
}

const stonesCache:Cache = {};

function addCache(stone:number, blinks:number, count:number):void {
  const key = `${stone} ${blinks}`
  stonesCache[key] = count;
}

function getCache(stone:number, blinks:number):number|undefined {
  const key = `${stone} ${blinks}`
  return stonesCache[key];
}

function blink (stone: number, blinks: number): number {
  if(blinks === 0) return 1;
  const cStone = getCache(stone, blinks);
  if (cStone) return cStone;
  if (stone === 0) {
      return blink(1, blinks-1)
  }
  const sString = stone.toString();
  if ((sString.length % 2) === 0) {
    const splitVal = (
      blink(Number(sString.slice(0,sString.length/2)), blinks-1) +
      blink(Number(sString.slice(sString.length/2)), blinks-1)
    );
    addCache(stone, blinks, splitVal);
    return splitVal;
  }
  const mulVal = blink(stone*2024, blinks-1);
  addCache(stone, blinks, mulVal);
  return mulVal;
}

let stonesNums = stonesInit.split(" ").map(x => Number(x));

const blinkCount = 75;
const stonesCount = stonesNums.reduce((acc, curr) => acc + blink(curr, blinkCount), 0)

console.log(stonesCount);
