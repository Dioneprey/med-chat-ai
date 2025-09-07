export interface UserCreatedMessage {
  id: string;
  name: string;
  companyId: string;
  role: 'ADMIN' | 'USER';
}
