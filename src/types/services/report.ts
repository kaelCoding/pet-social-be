export interface IServiceReportRes {
  id: number;
  action: string;
  content: string;
  profile_id: number;
  target_id: number;
  created_at: Date;
}

export interface IServiceReportReq {
  action: string;
  content: string;
  profile_id: number;
  target_id: number;
}
