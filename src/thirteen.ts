import { open } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

let fh;

type Game = {
  a:number[],
  b:number[],
  p:number[]
}

function parseGame(input:string):Game {
  const lines = input.split("\n");

  const a = lines[0]?.split("A: ")[1]?.split(", ").map(x => Number(x.split("+")[1]));
  const b = lines[1]?.split("B: ")[1]?.split(", ").map(x => Number(x.split("+")[1]));
  const p = lines[2]?.split(": ")[1]?.split(", ").map(x => Number(x.split("=")[1]));
  return {
    a: a ?? [-1,-1],
    b: b ?? [-1,-1],
    p: p ?? [-1.-1]
  }
}

function solveGame(game:Game):number {
  const px = game?.p[0] ?? 0;
  const py = game?.p[1] ?? 0;
  const ax = game?.a[0] ?? 0;
  const ay = game?.a[1] ?? 0;
  const bx = game?.b[0] ?? 0;
  const by = game?.b[1] ?? 0;
  const aMax = Math.floor(Math.min(px/ax, py/ay, 100));
  const bMax = Math.floor(Math.min(px/bx, py/by, 100));
  

  let solutions:number[][] = [];
  for (let a = aMax; a>=0; a--) {
    for (let b = bMax; b>=0; b--) {
      const diffX = px - (a*ax) - (b*bx);
      const diffY = py - (a*ay) - (b*by);
      if (diffX === 0 && diffY === 0) solutions.push([a,b])
    }
  }

  console.log(solutions)


  return solutions.reduce((min, x) => {
    const total = ((x[0] ?? 0) * 3) + (x[1] ?? 0);
    return Math.min(min, total)
  }, 150000)
}

function solveGame2(game:Game):number {
  const px = (game?.p[0] ?? 0);
  const py = (game?.p[1] ?? 0);
  const ax = game?.a[0] ?? 0;
  const ay = game?.a[1] ?? 0;
  const bx = game?.b[0] ?? 0;
  const by = game?.b[1] ?? 0;
  const aMax = Math.floor(Math.min(px/ax, py/ay, 100));
  

  let solutions:number[][] = [];
  for (let a = aMax; a>=0; a--) {
    const b1 = (px - (a * ax))/bx;
    const b2 = (py - (a * ay))/by;
    if (b1 === b2 &&Math.floor(b1) === b1 && b1 >= 0 && b1 <= 100) {
      solutions.push([a,b1])
    }
  }

  console.log(solutions)


  return solutions.reduce((min, x) => {
    const total = ((x[0] ?? 0) * 3) + (x[1] ?? 0);
    return Math.min(min, total)
  }, 150000)
}

try {
  fh = await open(join(cwd(),"input/thirteen.practice.txt"), "r");
  const data = await fh.readFile({encoding: "utf-8"});
  const games = data.split("\n\n");
  const gameObjects = games.map(g => parseGame(g)).filter(g => g.a[0] !== -1);

  const solved = gameObjects.map(g => solveGame(g)).filter(s => s !== 150000);
  const solved2 = gameObjects.map(g => solveGame2(g)).filter(s => s !== 150000);
  //const solved2 = gameObjects.map(g => solveGame2(g)).filter(s => s !== 150000);

  const sum = solved.reduce((s,c) => s+c, 0)
  const sum2 = solved2.reduce((s,c) => s+c, 0)
  
  console.log(sum);
  console.log(sum2);
} finally {
  await fh?.close()
}