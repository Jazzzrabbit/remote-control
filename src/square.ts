import { Button, down, left, mouse, Point, right, up } from "@nut-tree/nut-js";
import internal from "stream";
import { cmdList } from './model.js';

export const drawSquare = async (stream: internal.Duplex, x: number): Promise<void> => {
  console.log(cmdList.SQUARE, `{ x:${x} }`);
  stream.write(`${cmdList.SQUARE}_${x}`);

  await mouse.pressButton(Button.LEFT);
  await mouse.move(right(x));
  await mouse.move(down(x));
  await mouse.move(left(x));
  await mouse.move(up(x));
  await mouse.releaseButton(Button.LEFT);
};