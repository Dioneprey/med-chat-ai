import {
  Controller,
  Query,
  HttpCode,
  BadRequestException,
  NotFoundException,
  Get,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { Public } from 'src/infra/auth/public';
import { ResourceNotFoundError } from 'src/domain/chat/application/use-cases/@errors/resource-not-found.error';
import { GetCompanyByNameUseCase } from 'src/domain/chat/application/use-cases/company/get-company-by-name';

const GetCompanyByNameQuerySchema = z.object({
  name: z.string(),
});

type GetCompanyByNameQuerySchema = z.infer<typeof GetCompanyByNameQuerySchema>;
const queryValidationPipe = new ZodValidationPipe(GetCompanyByNameQuerySchema);

@Controller('/company')
@Public()
export class GetCompanyByNameController {
  constructor(private GetCompanyByName: GetCompanyByNameUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(@Query(queryValidationPipe) query: GetCompanyByNameQuerySchema) {
    const { name } = query;

    const result = await this.GetCompanyByName.execute({
      name,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          return { company: null };
        default:
          return new BadRequestException(error.message);
      }
    }

    const company = result.value.company;

    return { company: company.name };
  }
}
