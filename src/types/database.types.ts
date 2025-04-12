export type User = {
  id: string;
  email: string;
  username: string;
  created_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
  likes_count?: number;
}; 