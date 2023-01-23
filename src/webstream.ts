import { mouse, Point } from "@nut-tree/nut-js";
import WebSocket, { createWebSocketStream } from "ws";
import internal from "stream";
import { cmdList } from './model.js';
import { drawSquare } from "./square.js";
import { drawRectangle } from "./rect.js";

export const wsStream = (client: WebSocket.WebSocket) => {
  const stream: internal.Duplex = createWebSocketStream(client, { encoding: 'utf-8', decodeStrings: false });

  stream.on('readable', async (): Promise<void> => {
    const input: string | null = stream.read();
    const scrollPosition: Point = await mouse.getPosition();

    if (input !== null) {
      const [cmd, ...args] = input.split(' ');
      const [x, y = 0] = args.map(i => +i);

      const moveScroll = async (cords: Point, side: string): Promise<void> => {
        side === cmdList.LEFT ? await mouse.setPosition({ x: cords.x - x, y: cords.y }) :
          side === cmdList.RIGHT ? await mouse.setPosition({ x: cords.x + x, y: cords.y }) :
            side === cmdList.UP ? await mouse.setPosition({ x: cords.x, y: cords.y - x }) :
              await mouse.setPosition({ x: cords.x, y: cords.y + x });

        console.log(`${side} {${cords.y} px}`);
        stream.write(`${side}_{${cords.y}px}`);
      }

      switch (cmd) {
        case (cmdList.LEFT): {
          moveScroll(scrollPosition, cmdList.LEFT);
          break;
        }
        case (cmdList.RIGHT): {
          moveScroll(scrollPosition, cmdList.RIGHT);
          break;
        }
        case (cmdList.UP): {
          moveScroll(scrollPosition, cmdList.UP);
          break;
        }
        case (cmdList.DOWN): {
          moveScroll(scrollPosition, cmdList.DOWN);
          break;
        };
        case (cmdList.POSITION): {
          console.log(cmdList.POSITION, scrollPosition);
          stream.write(`${cmdList.POSITION}_{x:${scrollPosition.x};y:${scrollPosition.y}}`);
          break;
        }
        case (cmdList.SQUARE): {
          drawSquare(stream, x);
          break;
        }
        case (cmdList.RECTANGLE): {
          drawRectangle(stream, x, y);
          break;
        }
        case (cmdList.CIRCLE): {
          console.log('Dunno how to draw circle :(');
          stream.write(`${cmdList.CIRCLE}_{x:${x}}`);
          break;
        }
        case (cmdList.SCREEN): {
          console.log('Dunno how to make printscreen :(');
          stream.write(cmdList.SCREEN);
        }
      };
    };
  });
};