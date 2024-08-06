export interface IServiceMessageRes {
    id: number;
    content: string;
    conversation_id: number;
    profile_id: number;
    created_at: Date;
  }
  
export interface IServiceConversationRes {
    id: number;
    profiles: Array<{id: number}>;
    created_at: Date;
    messages?: Array<IServiceMessageRes>
    name?: string;
    avatar?: string | null;
    id_guest?: number;
}
    
  