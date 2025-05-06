import EventEmitter from 'events';
import adminSocketManager from './socketManager';

export const supervisorResponseEmitter = new EventEmitter();

type SupervisorQuestionMessage = {
  type: 'supervisor-question';
  questionId: string;
  questionText: string;
};

export function notifySupervisor(questionId: string, questionText: string): void {
  const msg: SupervisorQuestionMessage = {
    type: 'supervisor-question',
    questionId,
    questionText,
  };

  if (adminSocketManager.getAdminSocket() != null && adminSocketManager.isAdminSocketOpen()) {
    adminSocketManager.getAdminSocket()?.send(JSON.stringify(msg));
  }
}
