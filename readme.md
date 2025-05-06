# AI Agent Human-in-the-Loop System

## Overview

This project implements a human-in-the-loop system for AI agents, focusing on a simulated salon business. The system allows the AI to handle customer inquiries, escalate unknown questions to human supervisors, and follow up with customers.

## Features

### Completed ✅

1. **AI Agent Setup**

   - Implemented a simulated AI agent using LiveKit Node SDK
   - Created prompt engineering for basic salon business information
   - Configured the agent to receive calls, respond to known questions, and trigger help requests used **TWILIO SIP TRUNK**.

2. **Human Request Handling**

   - Implemented logic for the AI to inform callers when supervisor assistance is needed
   - Designed and implemented a MongoDB structure for storing and tracking help requests
   - Created a simulation system for notifying supervisors about latest request.

3. **Supervisor Response Handling**
   - Built a simple UI for supervisors to view and respond to latest pending request
   - Established the connection between supervisor responses and ai agent getting the response.

### Incomplete Features ⚠️

1. **Real-time Call Follow-up**

   - While the system can process supervisor responses, I wasn't able to implement the functionality for the AI to speak directly back to the caller.

2. **Knowledge Base Updates**
   - The system doesn't yet automatically update the AI's knowledge base with learned answers as i need was not able to complete the real time call follow up.
   - Database structure exists to store question-answer pairs, but integration with the AI's prompt system needs further development.
