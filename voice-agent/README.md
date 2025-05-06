# Install dependencies

Step 1. Run `pnpm install`
Step 2: Environment Configuration
Copy the example environment file and configure your API keys:
bash# Copy the example environment file
cp .env.example .env.local
Edit .env.local and add the following required API keys:

```bash
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
LIVEKIT_URL=
OPENAI_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

Step 3: Build the Project
Compile the TypeScript code:

```bash
pnpm build
```

Step 4: Fix the \_\_dirname Issue
After building, you need to fix an issue in the generated `dist/agent.js` file:

Open dist/agent.js
Find the line (around line 13) that contains:

```javascript
const `${process.platform === 'win32' ? '' : '/'}${/file:\/{2,3}(.+)\/[^/]/.exec(import.meta.url)[1]}` = path.dirname(fileURLToPath(import.meta.url));
```

Replace it with:

```javascript
const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

Save the file

Step 5: Start the Server and Agent
Run these commands in separate terminal windows:
Terminal 1: Start the server

```bash
node dist/server.js
```

# Terminal 2: Start the agent

```bash
node dist/agent.js
```

Step 6: Start Frontend
Go to client folder and run the following command:

```bash
npm install
npm run dev
```
