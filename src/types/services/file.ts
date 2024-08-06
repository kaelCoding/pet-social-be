export interface IServiceFileRes {
  id: string;
  name: string;
  type: string;
  size: number;
  created_at: Date;
}

export interface IServiceFileConnectRes {
  id: number;
  type: string;
  connect_id: number;
  connect_unique: string;
  file_id: string;
}
