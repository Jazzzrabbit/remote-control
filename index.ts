import { httpServer } from "./src/http_server/index.js";
import { mouse, Point } from "@nut-tree/nut-js";
import WebSocket, { WebSocketServer, createWebSocketStream } from "ws";
import internal from "stream";
import { IncomingMessage } from "http";

const HTTP_PORT = 8181;
const WS_PORT = 8080;

enum sides {
  LEFT = 'mouse_left',
  RIGHT = 'mouse_right',
  UP = 'mouse_up',
  DOWN = 'mouse_down'
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
        side === sides.LEFT ? await mouse.setPosition({ x: cords.x - x, y: cords.y }) :
        side === sides.RIGHT ? await mouse.setPosition({ x: cords.x + x, y: cords.y }) :
        side === sides.UP ? await mouse.setPosition({ x: cords.x, y: cords.y - x }) :
        await mouse.setPosition({ x: cords.x, y: cords.y + x });
        console.log(`${side} {${cords.y} px}`);
        stream.write(`${side}_{${cords.y}px}`);
      }

      switch (cmd) {
        case (sides.LEFT): {
          moveScroll(scrollPosition, sides.LEFT);
          break;
        }
        case (sides.RIGHT): {
          moveScroll(scrollPosition, sides.RIGHT);
          break;
        }
        case (sides.UP): {
          moveScroll(scrollPosition, sides.UP);
          break;
        }
        case (sides.DOWN): {
          moveScroll(scrollPosition, sides.DOWN);
          break;
        };
      };
    };
  });
});

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);


