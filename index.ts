import { httpServer } from "./src/http_server/index.js";
import { down, left, mouse, Point, right, up } from "@nut-tree/nut-js";
import WebSocket, { WebSocketServer, createWebSocketStream } from "ws";
import internal from "stream";
import { IncomingMessage } from "http";

const HTTP_PORT = 8181;
const WS_PORT = 8080;

enum cmdList {
  LEFT = 'mouse_left',
  RIGHT = 'mouse_right',
  UP = 'mouse_up',
  DOWN = 'mouse_down',
  POSITION = 'mouse_position',
  SQUARE = 'draw_square',
  RECTANGLE = 'draw_rectangle',
};

const wsServer: WebSocket.Server<WebSocket.WebSocket> = new WebSocketServer({ port: WS_PORT });

wsServer.on('connection', (client: WebSocket.WebSocket, msg: IncomingMessage): void => {
  const socketPort: number | undefined = msg.socket.localPort;
  console.log('Client connected on port', socketPort);

  const stream: internal.Duplex = createWebSocketStream(client, { encoding: 'utf-8', decodeStrings: false });

  stream.on('readable', async (): Promise<void> => {
    const input: string | null  = stream.read();
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
          console.log(cmdList.SQUARE, `{ x:${x} }`);
          stream.write(`${cmdList.SQUARE}_${x}`);

          await mouse.pressButton(0);
          await mouse.move(right(x));
          await mouse.move(down(x));
          await mouse.move(left(x));
          await mouse.move(up(x));
          await mouse.releaseButton(0);
          break;
        }

        case (cmdList.RECTANGLE): {
          console.log(cmdList.RECTANGLE, `{ x:${x}, y:${y} }`);
          stream.write(`${cmdList.RECTANGLE}_{x:${x};y:${y}}`);

          await mouse.pressButton(0);
          await mouse.move(right(x));
          await mouse.move(down(y));
          await mouse.move(left(x));
          await mouse.move(up(y));
          await mouse.releaseButton(0);
          break;
        }
      };
    };
  });
});

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);


