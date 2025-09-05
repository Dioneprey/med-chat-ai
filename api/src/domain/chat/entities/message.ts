import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Optional } from 'src/core/types/optional';

export enum MessageType {
  USER = 'USER',
  AI = 'AI',
}

export interface MessageProps {
  chatId: UniqueEntityID;
  content: string;
  type: MessageType;
  createdAt: Date;
}

export class Message extends Entity<MessageProps> {
  get chatId() {
    return this.props.chatId;
  }

  set chatId(chatId: UniqueEntityID) {
    this.props.chatId = chatId;
  }

  get content() {
    return this.props.content;
  }

  set content(content: string) {
    this.props.content = content;
  }

  get type() {
    return this.props.type;
  }

  set type(type: MessageType) {
    this.props.type = type;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  static create(
    props: Optional<MessageProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const message = new Message(
      {
        ...props,
        createdAt: new Date(),
      },
      id,
    );

    return message;
  }
}
