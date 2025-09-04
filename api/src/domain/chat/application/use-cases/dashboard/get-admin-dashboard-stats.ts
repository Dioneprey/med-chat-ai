import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import { UserRepository } from '../../repositories/user.repository';
import { ForbiddenError } from '../@errors/forbidden.error';
import {
  ChatRepository,
  QuestionsByDay,
  TopUsersQuestions,
} from '../../repositories/chat.repository';

interface GetAdminDashboardStatsUseCaseRequest {
  userId: string;
  companyId: string;
  from: Date;
  to: Date;
}

type GetAdminDashboardStatsUseCaseResponse = Either<
  ForbiddenError,
  {
    totalUsersQuestions: number;
    totalUsersInPeriod: number;
    totalUsers: number;
    topUsersByQuestions: TopUsersQuestions[];
    questionsByDay: QuestionsByDay[];
  }
>;

@Injectable()
export class GetAdminDashboardStatsUseCase {
  constructor(
    private userRepository: UserRepository,
    private chatRepository: ChatRepository,
  ) {}

  async execute({
    userId,
    companyId,
    from,
    to = new Date(),
  }: GetAdminDashboardStatsUseCaseRequest): Promise<GetAdminDashboardStatsUseCaseResponse> {
    const userExists = await this.userRepository.findByUniqueField({
      key: 'id',
      value: userId,
    });

    if (!userExists) {
      return left(new ResourceNotFoundError(`User with id: ${userId}`));
    }

    const canManageCompany = userExists.role === 'ADMIN';

    if (!canManageCompany) {
      return left(new ForbiddenError());
    }

    const [
      totalUsersQuestions,
      totalUsersInPeriod,
      totalUsers,
      topUsersByQuestions,
      questionsByDay,
    ] = await Promise.all([
      this.chatRepository.getMessagesCount({
        companyId,
        from,
        to,
        type: ['USER'],
      }),
      this.userRepository.count({ companyId, from, to }),
      this.userRepository.count({ companyId }),
      this.chatRepository.getTopUsersByQuestions({
        companyId,
        from,
        to,
        limit: 5,
      }),
      this.chatRepository.getQuestionsByDay({
        companyId,
        from,
        to,
        type: ['USER'],
      }),
    ]);

    return right({
      totalUsersQuestions,
      totalUsersInPeriod,
      totalUsers,
      topUsersByQuestions,
      questionsByDay,
    });
  }
}
