import { httpServer } from "./src/http_server/index.js";
import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { wsStream } from './src/webstream.js'

const HTTP_PORT = 8181;
const WS_PORT = 8080;

const wsServer: WebSocket.Server<WebSocket.WebSocket> = new WebSocketServer({ port: WS_PORT });

wsServer.on('connection', (client: WebSocket.WebSocket, msg: IncomingMessage): void => {
  const socketPort: number | undefined = msg.socket.localPort;
  console.log('Client connected on port', socketPort);

  wsStream(client)
});

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);


