import WebSocket from 'ws';

interface Message {
  [key: string]: any;
}

class AdminSocketManager {
  private adminSocket: WebSocket | null;

  constructor() {
    this.adminSocket = null;
  }

  setAdminSocket(ws: WebSocket | null): void {
    this.adminSocket = ws;
    console.log('✅ Admin socket set!');
  }

  getAdminSocket(): WebSocket | null {
    return this.adminSocket;
  }

  isAdminSocketOpen(): boolean {
    return (this.adminSocket && this.adminSocket.readyState === WebSocket.OPEN) || false;
  }

  sendMessage(msg: Message): void {
    if (this.isAdminSocketOpen()) {
      this.adminSocket?.send(JSON.stringify(msg));
    }
  }
}

const adminSocketManager = new AdminSocketManager();
export default adminSocketManager;
