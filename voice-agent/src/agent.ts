// agent.ts
import { type JobContext, WorkerOptions, cli, defineAgent, llm, multimodal } from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import cors from 'cors';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import WebSocket, { WebSocketServer } from 'ws';
import { z } from 'zod';
import { connectToDB } from './config/connectToDB';
import { Question } from './models/question.model';
import { LearnedAnswer, systemInstructions } from './systemInstructions';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

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
  console.log('✅ Supervisor connected via WebSocket');
  adminSocket = ws;

  ws.on('message', (message: string | Buffer) => {
    try {
      const data = JSON.parse(message.toString()) as IncomingMessage;
      if (data.type === 'supervisor-response') {
        console.log('📩 Received supervisor response:', data.answer);
        supervisorResponseEmitter.emit(data.questionId, data.answer);
      }
    } catch (err) {
      console.error('❌ Invalid WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Supervisor disconnected');
    adminSocket = null;
  });
});

function notifySupervisor(questionId: string, questionText: string): void {
  const msg: SupervisorQuestionMessage = {
    type: 'supervisor-question',
    questionId,
    questionText,
  };

  if (adminSocket?.readyState === WebSocket.OPEN) {
    adminSocket.send(JSON.stringify(msg));
  } else {
    console.warn('⚠️ No active supervisor socket to notify.');
  }
}

function startServer() {
  server.listen(PORT, () => {
    console.log(`🚀 Server + WebSocket running at http://localhost:${PORT}`);
  });
}

// --- LiveKit Agent Logic ---
export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    console.log('🕑 Waiting for participant...');
    const participant = await ctx.waitForParticipant();
    console.log(`👤 Starting agent for ${participant.identity}`);

    const learnedAnswers: LearnedAnswer[] = [];

    const model = new openai.realtime.RealtimeModel({
      instructions: systemInstructions(learnedAnswers),
    });

    const fncCtx: llm.FunctionContext = {
      requestSupervisorHelp: {
        description: "Request help from a supervisor when you don't know the answer",
        parameters: z.object({
          question: z.string().describe('The question that needs supervisor assistance'),
        }),
        execute: async ({ question }) => {
          const questionId = `q_${Date.now()}`;
          await Question.create({ questionId, questionText: question });
          notifySupervisor(questionId, question);

          return await new Promise((resolve) => {
            const timeout = setTimeout(async () => {
              supervisorResponseEmitter.removeAllListeners(questionId);
              await Question.updateOne({ questionId }, { status: 'timeout' });
              resolve('Sorry, our supervisors are currently unavailable.');
            }, 60_000);

            supervisorResponseEmitter.once(questionId, async (answer) => {
              clearTimeout(timeout);
              await Question.updateOne(
                { questionId },
                { status: 'answered', answer, answeredAt: new Date() },
              );
              resolve(answer);
            });
          });
        },
      },
    };

    const agent = new multimodal.MultimodalAgent({ model, fncCtx });
    const session = await agent
      .start(ctx.room, participant)
      .then((session) => session as openai.realtime.RealtimeSession);
    session.conversation.item.create({
      content: 'Hello! Welcome to Stellar Salon. How can I help you today?',
      //@ts-ignore
      role: 'assistant',
    });
    session.response.create();
  },
});

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();

  cli.runApp(
    new WorkerOptions({
      agent: fileURLToPath(import.meta.url),
      agentName: 'human-in-the-loop-agent',
    }),
  );
}
