# AI Agent Setup and Request Handling

## Overview

This project simulates the behavior of an AI agent for a business (a fake salon in this case). The AI agent is designed to:

1. Receive a call.
2. Respond with information it knows.
3. Trigger a "request help" event if it doesn't know the answer, which will be handled by a human supervisor.

The project was built using **LiveKit** (Python SDK), and I have completed the following two steps:

1. **AI Agent Setup (First Step)**

   - Set up a basic simulated AI agent using the LiveKit SDK to interact with a fake salon's business data.
   - The agent receives incoming calls, responds with known information, or triggers a "request help" event if it doesn't know the answer.

2. **Human Request Handling**
   - When the AI doesn't know something, it tells the caller, "Let me check with my supervisor and get back to you."
   - A pending help request is created and structured in a database (I have used DynamoDB for quick prototyping).
   - A simulated supervisor request is triggered (log a message) to simulate real-time human intervention.

### What Was Completed

- **Step 1: AI Agent Setup**
  - Implemented a simulated AI agent capable of receiving calls, processing business information for a fake salon, and responding appropriately.
- **Step 2: Human Request Handling**
  - Designed the request-handling logic where the AI triggers a help request if it doesn't know the answer and prompts the caller with a message like, "Let me check with my supervisor."
  - Created a simple structure for storing help requests in DynamoDB.
  - Simulated the supervisor intervention with console logging, which would ideally be a webhook to notify a real supervisor.

### Steps Not Completed

I was not able to fully complete the following steps due to time constraints and the complexity of the system setup:

3. **Supervisor Response Handling**

   - I was unable to implement the UI for the supervisor to view pending requests, submit answers, and track the history of requests. While I researched potential solutions, I encountered challenges in setting up the required infrastructure and UI components in the given timeframe.

4. **Knowledge Base Updates**
   - I didn't manage to fully implement a knowledge base that would allow the AI to save learned answers for future interactions. I encountered technical difficulties with integrating the knowledge base and the process of dynamically updating the AI's knowledge from supervisor responses.

### Apology and Next Steps

I sincerely apologize for not being able to complete these steps. As this was my first time working with LiveKit, I spent considerable time exploring the documentation and troubleshooting the setup, but unfortunately, I was unable to finish the project within the given timeframe. Despite these challenges, I gained valuable insights into working with AI agents and request handling systems, and I am confident that with more time and practice, I can implement these features effectively.

I hope the steps I completed demonstrate my ability to learn quickly, troubleshoot unfamiliar technologies, and structure my solutions efficiently. I would appreciate the opportunity to further discuss how I can continue building on this project and contribute to your team.
