export interface SendMessageProps {
  messages: { role: 'user' | 'assistant'; content: string }[];
}

export abstract class SendMessage {
  abstract send({ messages }: SendMessageProps): Promise<string>;
}
