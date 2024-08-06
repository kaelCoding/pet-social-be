export interface IServiceNotificationRes {
  id: number;
  action: string;
  content: string;
  from_id?: number | undefined | null;
  profile_id: number;
  created_at: Date;
  to_id?: number | undefined | null;
}

export interface IServiceNotificationReq {
  action: string;
  content: string;
  from_id?: number;
  profile_id: number;
  to_id?: number;
}
