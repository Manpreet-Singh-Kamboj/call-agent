import { type JobContext, WorkerOptions, cli, defineAgent, llm, multimodal } from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { Question } from './models/question.model';
import { notifySupervisor, supervisorResponseEmitter } from './supervisorChannel';
import { LearnedAnswer, systemInstructions } from './systemInstructions';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env.local');
dotenv.config({ path: envPath });

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    console.log('waiting for participant');
    const participant = await ctx.waitForParticipant();
    console.log(`starting assistant example agent for ${participant.identity}`);

    let initialChatText = 'Hello! Welcome to Stellar Salon. How can I help you today?';

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
          await Question.create({
            questionId,
            questionText: question,
          });
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
                {
                  status: 'answered',
                  answer,
                  answeredAt: new Date(),
                },
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
    //@ts-ignore
    session.conversation.item.create({ content: initialChatText, role: 'assistant' });
    session.response.create();
  },
});

cli.runApp(
  new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: 'human-in-the-loop-agent',
  }),
);
