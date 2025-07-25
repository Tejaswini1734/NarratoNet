import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, UserPlus, Trophy, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NotificationWithDetails } from "@shared/schema";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return <Heart className="w-5 h-5 text-red-500" />;
    case "comment":
      return <MessageCircle className="w-5 h-5 text-blue-500" />;
    case "follow":
      return <UserPlus className="w-5 h-5 text-green-500" />;
    default:
      return <Trophy className="w-5 h-5 text-yellow-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "like":
      return "bg-red-100";
    case "comment":
      return "bg-blue-100";
    case "follow":
      return "bg-green-100";
    default:
      return "bg-yellow-100";
  }
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: notifications = [], isLoading } = useQuery<NotificationWithDetails[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const followBackMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/users/${userId}/follow`);
    },
    onSuccess: () => {
      toast({
        title: "Following user",
        description: "You are now following this user",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error following user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatNotificationText = (notification: NotificationWithDetails) => {
    const userName = notification.fromUser.displayName;
    const storyTitle = notification.story?.title;

    switch (notification.type) {
      case "like":
        return (
          <>
            <span className="font-semibold">{userName}</span> liked your story{" "}
            <span className="font-semibold text-orange-500">"{storyTitle}"</span>
          </>
        );
      case "comment":
        return (
          <>
            <span className="font-semibold">{userName}</span> commented on your story{" "}
            <span className="font-semibold text-orange-500">"{storyTitle}"</span>
          </>
        );
      case "follow":
        return (
          <>
            <span className="font-semibold">{userName}</span> started following you
          </>
        );
      default:
        return `${userName} interacted with your content`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with your story interactions</p>
        </div>

        {/* Notification Filters */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <Button variant="ghost" className="pb-2 px-1 border-b-2 border-orange-500 text-orange-500">
            All
          </Button>
          <Button variant="ghost" className="pb-2 px-1 text-gray-600 hover:text-gray-900">
            Likes
          </Button>
          <Button variant="ghost" className="pb-2 px-1 text-gray-600 hover:text-gray-900">
            Comments
          </Button>
          <Button variant="ghost" className="pb-2 px-1 text-gray-600 hover:text-gray-900">
            Follows
          </Button>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-600 py-8">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                <p>When someone interacts with your stories, you'll see notifications here.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`hover:shadow-md transition-shadow ${!notification.isRead ? "border-l-4 border-l-orange-500" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-10 h-10 ${getNotificationColor(notification.type)} rounded-full flex items-center justify-center`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {notification.fromUser.avatar && (
                          <img
                            src={notification.fromUser.avatar}
                            alt={notification.fromUser.displayName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <p className="text-sm text-gray-900">
                          {formatNotificationText(notification)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      {notification.type === "follow" && (
                        <Button
                          size="sm"
                          onClick={() => followBackMutation.mutate(notification.fromUserId)}
                          disabled={followBackMutation.isPending}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          Follow Back
                        </Button>
                      )}
                      {notification.story && (
                        <Link href={`/story/${notification.storyId}`}>
                          <Button size="sm" variant="ghost" className="text-orange-500 hover:text-orange-600">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          disabled={markAsReadMutation.isPending}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {notifications.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="ghost" className="text-orange-500 hover:text-orange-600">
              Load More Notifications
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
