export interface IServiceUserRes {
  id: number;
  email: string;
  created_at: Date;
  profile_id?: number | undefined;
  role: string; // 'ADMIN' | 'USER'
  avatar?: string | undefined;
}
