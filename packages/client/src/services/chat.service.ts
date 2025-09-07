import { apiClient } from "../lib/api";

export interface ChatConversation {
  id: string;
  lastMessage: string;
  lastMessageAt: string;
  isBuyerTyping: boolean;
  isSellerTyping: boolean;
  createdAt: string;
  updatedAt: string;
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  listing: {
    id: string;
    title: string;
    price: number;
    carDetail: {
      make: string;
      model: string;
      year: number;
      images: Array<{
        id: string;
        url: string;
      }>;
    };
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  type: "text" | "image" | "system";
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ConversationWithMessages {
  conversation: ChatConversation;
  messages: ChatMessage[];
}

export class ChatService {
  static async startConversation(
    listingId: string
  ): Promise<ConversationWithMessages> {
    const response = await apiClient.post(`/chat/start/${listingId}`);
    return (response as any).data;
  }

  static async sendMessage(
    conversationId: string,
    content: string,
    type: "text" | "image" | "system" = "text"
  ): Promise<ChatMessage> {
    const response = await apiClient.post(`/chat/${conversationId}/messages`, {
      content,
      type,
    });
    return (response as any).data;
  }

  static async getConversation(
    conversationId: string
  ): Promise<ConversationWithMessages> {
    const response = await apiClient.get(`/chat/${conversationId}`);
    return (response as any).data;
  }

  static async getUserConversations(): Promise<ChatConversation[]> {
    const response = await apiClient.get("/chat");
    return (response as any).data;
  }

  static async markAsRead(
    conversationId: string
  ): Promise<{ message: string }> {
    const response = await apiClient.post(`/chat/${conversationId}/read`);
    return (response as any).data;
  }
}
