import { open } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

let fh;
let registersObject = {
  a: 0,
  b: 0,
  c: 0
};
let initialRegisters = structuredClone(registersObject);

let program:number[] = [];
let output:number[] = [];
let instructionPointer = 0;

function getProgram(sections: string[]): void {
  if (sections.length < 2) return;

  const registers = sections[0]?.split("\n");
  if (registers) {
    registers.forEach(r => {
      const reg = r.split(":");
      switch(reg[0]?.slice(-1)) {
        case "A":
          registersObject.a = Number(reg[1]);
          break;
        case "B":
          registersObject.b = Number(reg[1]);
          break;
        case "C":
          registersObject.c = Number(reg[1]);
          break;
      }
    })
    initialRegisters = structuredClone(registersObject)
  }

  const p = sections[1]?.split(": ")[1];
  program = p?.split(",").map(x => Number(x)) ?? [];
}

function getCombo(operand:number):number {
  if(operand < 0 || operand > 6) return 0;
  switch (operand) {
    case 4:
      return registersObject.a;
    case 5:
      return registersObject.b;
    case 6:
      return registersObject.c;
  }
  return operand
}

function runOp(opcode: number, operand:number):void {
  switch(opcode) {
    case 0:
      const d = Math.pow(2, getCombo(operand));
      registersObject.a = Math.floor(registersObject.a / d);
      return;
    case 1:
      registersObject.b = registersObject.b ^ operand;
      return;
    case 2:
      registersObject.b = getCombo(operand) % 8;
      return;
    case 3:
      if (registersObject.a === 0) return;
      instructionPointer = operand;
      return;
    case 4:
      registersObject.b = registersObject.b ^ registersObject.c;
      return;
    case 5:
      output.push(getCombo(operand) % 8);
      return;
    case 6:
      const d2 = Math.pow(2, getCombo(operand));
      registersObject.b = Math.floor(registersObject.a / d2);
      return;
    case 7:
      const d3 = Math.pow(2, getCombo(operand));
      registersObject.c = Math.floor(registersObject.a / d3);
      return;
  }
}

function checkA(aValue: number, currentOutput: string): boolean {
  registersObject = structuredClone(initialRegisters);
  registersObject.a = aValue;
  instructionPointer = 0;
  output = [];

  while (program.length - instructionPointer >= 2) {
    const opcode = program[instructionPointer] ?? 8;
    const operand = program[instructionPointer + 1] ?? 8;
    instructionPointer += 2;
    runOp(opcode, operand)
  }

  const outputString = output?.join(",")
  return (outputString.localeCompare(currentOutput) === 0);
}

function nextBit(startA: string): number[] {
  const bits = []
  const aVal = parseInt(startA, 8);
  const currentString = program.slice(-1*(startA.length)).join(",");
  for (let a = 0; a < 8; a++) {
    if (checkA(aVal + a, currentString)) {
      bits.push(a);
    }
  }

  return bits;
}

try {
  fh = await open(join(cwd(),"input/seventeen.txt"), "r");
  const data = await fh.readFile({encoding: "utf-8"});
  const sections = data.split("\n\n");

  getProgram(sections);

  while (program.length - instructionPointer >= 2) {
    const opcode = program[instructionPointer] ?? 8;
    const operand = program[instructionPointer + 1] ?? 8;
    instructionPointer += 2;
    runOp(opcode, operand)
  }

  console.log(output?.join(","));

  let aValue = "";
  let allBits:number[][] = [];
  let currentBits = [];
  const programString = program.join(",");
  currentBits = nextBit("0");
  while (currentBits.length > 0) {
    console.log(currentBits)
    console.log(aValue)
    const bitZero = currentBits[0] ?? 0;
    currentBits = currentBits.slice(1);
    if(program.length === aValue.length + 1) {
      const checkVal = parseInt(aValue + bitZero, 8);
      console.log("checking: ", checkVal);
      const solved = checkA(checkVal, programString);
      if (solved) {
        aValue = aValue + bitZero;
        break;
      }

      while(currentBits.length === 0  && allBits.length > 0) {
        currentBits = allBits.pop() ?? [];
        aValue = aValue.slice(0, -1);
      }
      continue;
    }

    const bits = nextBit(aValue+bitZero+"0");
    if (bits.length > 0) {
      allBits.push(currentBits);
      aValue = aValue + bitZero;
      currentBits = bits;
      continue;
    }

    while(currentBits.length === 0  && allBits.length > 0) {
      currentBits = allBits.pop() ?? [];
      aValue = aValue.slice(0, -1);
    }
  }

  console.log(parseInt(aValue, 8));
} catch(e) {
  console.log(e)
} finally {
  await fh?.close()
}