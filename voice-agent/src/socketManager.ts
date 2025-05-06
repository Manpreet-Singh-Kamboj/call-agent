import WebSocket from 'ws';

class AdminSocketManager {
  private adminSocket: WebSocket | null;
  private agentSocket: WebSocket | null;

  constructor() {
    this.adminSocket = null;
    this.agentSocket = null;
  }

  setAdminSocket(ws: WebSocket | null): void {
    this.adminSocket = ws;
    console.log('✅ Admin socket set!');
  }

  setAgentSocket(ws: WebSocket | null): void {
    this.agentSocket = ws;
    console.log('✅ Supervisor socket set!');
  }
  getAgentSocket(): WebSocket | null {
    return this.agentSocket;
  }

  isAgentSocketOpen(): boolean {
    return (this.agentSocket && this.agentSocket.readyState === WebSocket.OPEN) || false;
  }

  getAdminSocket(): WebSocket | null {
    return this.adminSocket;
  }

  isAdminSocketOpen(): boolean {
    return (this.adminSocket && this.adminSocket.readyState === WebSocket.OPEN) || false;
  }
}

const adminSocketManager = new AdminSocketManager();
export default adminSocketManager;
