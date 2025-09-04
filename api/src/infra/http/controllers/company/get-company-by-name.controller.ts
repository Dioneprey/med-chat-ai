import {
  Controller,
  Query,
  HttpCode,
  BadRequestException,
  Get,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { Public } from 'src/infra/auth/public';
import { ResourceNotFoundError } from 'src/domain/chat/application/use-cases/@errors/resource-not-found.error';
import { GetCompanyByNameUseCase } from 'src/domain/chat/application/use-cases/company/get-company-by-name';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

const getCompanyByNameQuerySchema = z.object({
  name: z.string(),
});

type GetCompanyByNameQuerySchema = z.infer<typeof getCompanyByNameQuerySchema>;
const queryValidationPipe = new ZodValidationPipe(getCompanyByNameQuerySchema);

@ApiTags('company')
@Controller('/company')
@Public()
export class GetCompanyByNameController {
  constructor(private getCompanyByName: GetCompanyByNameUseCase) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get company by name',
    description: 'Busca uma empresa pelo nome e retorna seus dados básicos.',
  })
  @ApiQuery({ name: 'name', description: 'Nome da empresa', required: true })
  @ApiResponse({
    status: 200,
    description: 'Retorna a empresa se encontrada, ou null caso não exista',
    schema: {
      oneOf: [
        { example: { company: 'Minha Empresa' } },
        { example: { company: null } },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de requisição',
    schema: {
      example: { message: 'Bad request' },
    },
  })
  async handle(@Query(queryValidationPipe) query: GetCompanyByNameQuerySchema) {
    const { name } = query;

    const result = await this.getCompanyByName.execute({
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
