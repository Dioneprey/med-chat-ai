import { Chat, Message, MessageType } from '@generated/index';
import { PaginationProps, PaginationResponse } from 'src/core/types/pagination';

export interface QuestionsByDay {
  day: string;
  messages: number;
}

export interface TopUsersQuestions {
  userId: string;
  name: string;
  questionsCount: number;
}

export interface ChatRepositoryGetChatByIdProps {
  chatId: string;
  companyId: string;
  userId: string;
  include?: {
    messages?: boolean;
  };
}

export interface ChatRepositoryGetMessagesCountProps {
  companyId: string;
  type?: MessageType[];
  from: Date;
  to: Date;
}

export interface ChatRepositoryGetTopUsersByQuestionsProps {
  companyId: string;
  limit: number;
  from: Date;
  to: Date;
}

export interface ChatRepositoryGetQuestionsByDayProps {
  companyId: string;
  type?: MessageType[];
  from: Date;
  to: Date;
}

export interface ChatRepositoryGetChatsProps extends PaginationProps<{}> {
  companyId: string;
  userId: string;
}

export interface ChatRepositoryGetMessagesProps extends PaginationProps<{}> {
  chatId: string;
  companyId: string;
}

interface PrismaChatInclude extends Chat {
  messages?: Message[];
}

export abstract class ChatRepository {
  abstract create(userId: string, companyId: string): Promise<Chat>;

  abstract getChatById({
    chatId,
    include,
  }: ChatRepositoryGetChatByIdProps): Promise<PrismaChatInclude | null>;

  abstract getChats({
    pageIndex,
    filters,
  }: ChatRepositoryGetChatsProps): Promise<PaginationResponse<Chat>>;

  abstract addMessage(
    chatId: string,
    type: MessageType,
    content: string,
  ): Promise<Message>;
  abstract countMessages(chatId: string): Promise<number>;

  abstract getMessages({
    chatId,
    pageIndex,
    filters,
  }: ChatRepositoryGetMessagesProps): Promise<PaginationResponse<Message>>;

  abstract getMessagesCount({
    companyId,
    type,
    from,
    to,
  }: ChatRepositoryGetMessagesCountProps): Promise<number>;

  abstract getTopUsersByQuestions({
    companyId,
    limit,
    from,
    to,
  }: ChatRepositoryGetTopUsersByQuestionsProps): Promise<TopUsersQuestions[]>;

  abstract getQuestionsByDay({
    companyId,
    from,
    to,
    type,
  }: ChatRepositoryGetQuestionsByDayProps): Promise<QuestionsByDay[]>;

  abstract getUserChats(userId: string, companyId: string): Promise<Chat[]>;
}
