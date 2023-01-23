import { Button, down, left, mouse, right, up } from "@nut-tree/nut-js";
import internal from "stream";
import { cmdList } from './model.js';

export const drawRectangle = async (stream: internal.Duplex, x: number, y: number): Promise<void> => {
  console.log(cmdList.RECTANGLE, `{ x:${x}, y:${y} }`);
  stream.write(`${cmdList.RECTANGLE}_{x:${x};y:${y}}`);

  await mouse.pressButton(Button.LEFT);
  await mouse.move(right(x));
  await mouse.move(down(y));
  await mouse.move(left(x));
  await mouse.move(up(y));
  await mouse.releaseButton(Button.LEFT);
}