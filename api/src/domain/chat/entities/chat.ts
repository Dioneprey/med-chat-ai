import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Message } from './message';
import { Optional } from 'src/core/types/optional';

export interface ChatProps {
  userId: UniqueEntityID;
  companyId: UniqueEntityID;
  messages?: Message[];
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Chat extends Entity<ChatProps> {
  get userId() {
    return this.props.userId;
  }

  set userId(userId: UniqueEntityID) {
    this.props.userId = userId;
    this.touch();
  }

  get companyId() {
    return this.props.companyId;
  }

  set companyId(companyId: UniqueEntityID) {
    this.props.companyId = companyId;
    this.touch();
  }

  get messages() {
    return this.props.messages;
  }

  set messages(messages: Message[] | undefined) {
    this.props.messages = messages;
    this.touch();
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(props: Optional<ChatProps, 'createdAt'>, id?: UniqueEntityID) {
    const chat = new Chat(
      {
        ...props,
        createdAt: new Date(),
      },
      id,
    );

    return chat;
  }
}
