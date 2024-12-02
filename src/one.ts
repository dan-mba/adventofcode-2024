import { open } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

let fh;

try {
  fh = await open(join(cwd(),"input/one.txt"), "r");
  const data = await fh.readFile({encoding: "utf-8"});
  console.log(data.length)
} finally {
  await fh?.close()
}