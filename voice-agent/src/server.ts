import cors from 'cors';
import { EventEmitter } from 'events';
import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { connectToDB } from './config/connectToDB';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 4000;

app.use(cors());

connectToDB();

let adminSocket: WebSocket | null = null;
export const supervisorResponseEmitter = new EventEmitter();

type SupervisorQuestionMessage = {
  type: 'supervisor-question';
  questionId: string;
  questionText: string;
};

type SupervisorResponseMessage = {
  type: 'supervisor-response';
  questionId: string;
  answer: string;
};

type IncomingMessage = SupervisorResponseMessage;

wss.on('connection', (ws: WebSocket) => {
  console.log('Supervisor connected via WebSocket');
  adminSocket = ws;

  ws.on('message', (message: string | Buffer) => {
    try {
      const data = JSON.parse(message.toString()) as IncomingMessage;

      if (data.type === 'supervisor-response') {
        supervisorResponseEmitter.emit(data.questionId, data.answer);
      }
    } catch (err) {
      console.error('Invalid WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    console.log('Supervisor disconnected');
    adminSocket = null;
  });
});

export function notifySupervisor(questionId: string, questionText: string): void {
  const msg: SupervisorQuestionMessage = {
    type: 'supervisor-question',
    questionId,
    questionText,
  };

  if (adminSocket?.readyState === WebSocket.OPEN) {
    adminSocket.send(JSON.stringify(msg));
  }
}

export function startServer() {
  server.listen(PORT, () => {
    console.log(`Server + WebSocket running at http://localhost:${PORT}`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
