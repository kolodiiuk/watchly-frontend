import type {User} from "../../auth/models/User.ts";

export interface LeaveCommentRequest {
  contentId: number;
  text: string;
  isTitle: boolean;
}

export interface UpdateCommentRequest {
  commentId: number;
  text: string;
}

export interface CommentDto {
  id: number;
  contentId: number;
  isTitle: boolean;
  userId: string;
  updatedAt: string;
  text: string;
  user?: User | null;
}
