import { useState, useEffect } from "react";
import { MessageCircle, ArrowLeft, Clock } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { ChatService } from "../services/chat.service";
import { useAuthStore } from "../store/auth";
import { useNotifications } from "../contexts/NotificationContext";
import toast from "react-hot-toast";
import type { ChatConversation } from "../services/chat.service";

export function ConversationsListPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { clearUnreadCount } = useNotifications();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
      // Clear unread count when viewing conversations
      clearUnreadCount();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await ChatService.getUserConversations();

      setConversations(response);
    } catch (error: any) {
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  const getOtherUser = (conversation: ChatConversation) => {
    return user?.id === conversation.buyer.id
      ? conversation.seller
      : conversation.buyer;
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view your conversations
          </h1>
          <Button onClick={() => (window.location.href = "/login")}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Conversations
        </h1>
        <p className="text-gray-600">
          {conversations.length}{" "}
          {conversations.length === 1 ? "conversation" : "conversations"}
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No conversations yet
          </h2>
          <p className="text-gray-600 mb-6">
            Start a conversation by messaging a seller about their listing!
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            Browse Cars
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            return (
              <Card
                key={conversation.id}
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() =>
                  (window.location.href = `/chat/${conversation.id}`)
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      <Avatar
                        src={
                          user?.id === conversation.buyer.id
                            ? conversation.seller.profileImage
                              ? `http://localhost:3000${conversation.seller.profileImage}`
                              : undefined
                            : conversation.buyer.profileImage
                              ? `http://localhost:3000${conversation.buyer.profileImage}`
                              : undefined
                        }
                        alt={`${otherUser.firstName} ${otherUser.lastName}`}
                        size="md"
                      />
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {otherUser.firstName} {otherUser.lastName}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {conversation.lastMessageAt
                            ? formatRelativeTime(conversation.lastMessageAt)
                            : "No messages"}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 truncate mt-1">
                        About: {conversation.listing.title}
                      </p>

                      <p className="text-sm text-gray-500 truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
