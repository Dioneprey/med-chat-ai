import { Role } from '@generated/index';

export interface UserPayload {
  sub: string;
  companyId: string;
  role: Role;
}
