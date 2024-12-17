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

let program = [];
let output:number[] = [];
let instructionPointer = 0;

function getProgram(sections: string[]): number[] {
  if (sections.length < 2) return [];

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

  const program = sections[1]?.split(": ")[1];
  return program?.split(",").map(x => Number(x)) ?? [];
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
      if (registersObject.a ===0) return;
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

function checkA(aValue: number, currentOutput: string, program:number[]): boolean {
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
  if (outputString == currentOutput) {
    return true;
  }
  return false;
}

function nextBit(startA: number, bitsCount: number, program: number[]): number[] {
  const bits = []
  const currentString = program.slice(-1*(bitsCount+1)).join(",");
  for (let a = 0; a < 8; a++) {
    if (checkA(startA + a, currentString, program)) {
      bits.push(a);
    }
  }

  return bits;
}

try {
  fh = await open(join(cwd(),"input/seventeen.practice2.txt"), "r");
  const data = await fh.readFile({encoding: "utf-8"});
  const sections = data.split("\n\n");

  program = getProgram(sections);

  while (program.length - instructionPointer >= 2) {
    const opcode = program[instructionPointer] ?? 8;
    const operand = program[instructionPointer + 1] ?? 8;
    instructionPointer += 2;
    runOp(opcode, operand)
  }

  console.log(output?.join(","));

  let aValue = 0;
  let allBits:number[][] = [];
  let currentBits = [];
  const programString = program.join(",");
  currentBits = nextBit(0, 0, program);
  while (currentBits.length > 0) {
    console.log(currentBits);
    console.log(allBits);
    const bitZero = currentBits[0] ?? 0;
    if(program.length === allBits.length + 1) {
      console.log("checking: ", aValue);
      const solved = checkA(aValue+bitZero, programString, program)
      if (solved) {
        aValue += bitZero;
        break;
      }
      currentBits.shift();
      if(currentBits.length === 0  && allBits.length > 0) {
        while (currentBits.length < 2) {
          currentBits = allBits.pop() ?? [];
          aValue = aValue >>> 3;
        }
        currentBits.shift();
      }
      continue;
    }
    const bits = nextBit((aValue+bitZero) << 3, allBits.length+1, program);
    console.log("bits: ", bits, aValue, bitZero)
    
    if (bits.length > 0) {
      allBits.push(currentBits);
      aValue = (aValue + bitZero) << 3;
      currentBits = bits;
      continue;
    }

    currentBits.shift();
    if(currentBits.length === 0  && allBits.length > 0) {
      while (currentBits.length < 2) {
        currentBits = allBits.pop() ?? [];
        aValue = aValue >>> 3;
      }
      currentBits.shift();
    }
  }

  console.log(aValue);
} finally {
  await fh?.close()
}