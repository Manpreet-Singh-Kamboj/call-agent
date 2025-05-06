import cors from 'cors';
import { EventEmitter } from 'events';
import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { connectToDB } from './config/connectToDB';
import { Question } from './models/question.model';
import adminSocketManager from './socketManager';
import { supervisorResponseEmitter } from './supervisorChannel';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 4000;

app.use(cors());
app.use(express.json());

connectToDB();

type SupervisorResponseMessage = {
  type: 'supervisor-response';
  questionId: string;
  answer: string;
};

type IncomingMessage = SupervisorResponseMessage;

app.post('/api/help/webhook', async (req, res) => {
  const { questionId, questionText } = req.body;
  await Question.create({
    questionId,
    questionText,
  });
  adminSocketManager.getAdminSocket()?.send(
    JSON.stringify({
      type: 'supervisor-question',
      questionId,
      questionText,
    }),
  );
  res.status(200).send('Question sent to supervisor');
});

wss.on('connection', (ws: WebSocket, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const role = url.searchParams.get('role');
  console.log('role', role);
  if (role === 'supervisor') {
    console.log('Supervisor connected via WebSocket');
    adminSocketManager.setAdminSocket(ws);
  } else {
    console.log('Agent connected via WebSocket');
    adminSocketManager.setAgentSocket(ws);
  }

  ws.on('message', (message: string | Buffer) => {
    try {
      const data = JSON.parse(message.toString()) as IncomingMessage;
      console.log('Received message:', message.toString());
      if (data.type === 'supervisor-response') {
        const agentSocket = adminSocketManager.getAgentSocket();
        if (agentSocket && agentSocket.readyState === WebSocket.OPEN) {
          const responseMessage = {
            type: 'supervisor-response',
            questionId: data.questionId,
            answer: data.answer,
          };
          agentSocket.send(JSON.stringify(responseMessage));
          console.log('Sent supervisor response to agent:', responseMessage);
        } else {
          console.error('Agent WebSocket is not connected or open');
        }
      }
    } catch (err) {
      console.error('Invalid WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    console.log('Supervisor disconnected');
    adminSocketManager.setAdminSocket(null);
  });
});

export function startServer() {
  server.listen(PORT, () => {
    console.log(`Server + WebSocket running at http://localhost:${PORT}`);
  });
}

startServer();
