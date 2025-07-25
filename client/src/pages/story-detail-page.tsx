import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Clock, Share, UserPlus, ChevronLeft } from "lucide-react";
import { Link } from "wouter";  
import Navbar from "@/components/navbar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StoryWithAuthor, CommentWithAuthor } from "@shared/schema";

export default function StoryDetailPage() {
  const [, params] = useRoute("/story/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const [commentContent, setCommentContent] = useState("");

  const { data: story, isLoading: storyLoading } = useQuery<StoryWithAuthor>({
    queryKey: ["/api/stories", params?.id],
    enabled: !!params?.id,
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery<CommentWithAuthor[]>({
    queryKey: ["/api/stories", params?.id, "comments"],
    enabled: !!params?.id,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (story?.isLiked) {
        await apiRequest("DELETE", `/api/stories/${params?.id}/like`);
      } else {
        await apiRequest("POST", `/api/stories/${params?.id}/like`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories", params?.id] });
      toast({
        title: story?.isLiked ? "Story unliked" : "Story liked",
        description: story?.isLiked ? "Removed from your liked stories" : "Added to your liked stories",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/stories/${params?.id}/comments`, { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories", params?.id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories", params?.id] });
      setCommentContent("");
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error posting comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/users/${story?.author.id}/follow`);
    },
    onSuccess: () => {
      toast({
        title: "Following author",
        description: `You are now following ${story?.author.displayName}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error following author",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    await commentMutation.mutateAsync(commentContent);
  };

  if (storyLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-12 bg-gray-200 rounded mb-6" />
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="h-10 bg-gray-200 rounded w-20" />
                <div className="h-10 bg-gray-200 rounded w-20" />
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Story not found</h1>
            <Link href="/stories">
              <Button variant="outline">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Stories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/stories">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Stories
            </Button>
          </Link>
        </div>

        {/* Story Header */}
        <header className="mb-8">
          <div className="mb-4">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {story.genre}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
            {story.title}
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {story.author.avatar && (
                <img src={story.author.avatar} alt={story.author.displayName} className="w-12 h-12 rounded-full object-cover" />
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{story.author.displayName}</h3>
                <p className="text-sm text-gray-600 flex items-center">
                  {new Date(story.publishedAt).toLocaleDateString()} •{" "}
                  <Clock className="w-4 h-4 ml-1 mr-1" />
                  {story.readTime} min read
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={story.isLiked ? "default" : "outline"}
                size="sm"
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending}
                className={story.isLiked ? "bg-red-500 hover:bg-red-600 text-white" : "text-red-500 border-red-200 hover:bg-red-50"}
              >
                <Heart className={`w-4 h-4 mr-2 ${story.isLiked ? "fill-current" : ""}`} />
                {story.likesCount}
              </Button>
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                {story.commentsCount}
              </Button>
              {user?.id !== story.author.id && (
                <Button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600"
                  size="sm"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Follow Author
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Story Content */}
        <div className="prose prose-lg max-w-none font-serif mb-12">
          {story.coverImage && (
            <img src={story.coverImage} alt={story.title} className="w-full h-64 object-cover rounded-xl mb-8" />
          )}
          
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {story.content}
          </div>
        </div>

        {/* Story Actions */}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex items-center justify-center space-x-6">
            <Button
              variant={story.isLiked ? "default" : "outline"}
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={story.isLiked ? "bg-red-500 hover:bg-red-600 text-white" : "text-red-500 border-red-200 hover:bg-red-50"}
            >
              <Heart className={`w-4 h-4 mr-2 ${story.isLiked ? "fill-current" : ""}`} />
              {story.isLiked ? "Liked" : "Like this story"}
            </Button>
            <Button variant="outline">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            {user?.id !== story.author.id && (
              <Button
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Follow {story.author.displayName}
              </Button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <section className="mt-12" id="comments">
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Comments ({story.commentsCount})
            </h3>
            
            {/* Comment Form */}
            <div className="mb-8">
              <form onSubmit={handleComment} className="flex space-x-3">
                {user?.avatar && (
                  <img src={user.avatar} alt="Your avatar" className="w-10 h-10 rounded-full object-cover" />
                )}
                <div className="flex-1">
                  <Textarea
                    rows={3}
                    placeholder="Add a comment..."
                    className="resize-none"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      type="submit"
                      disabled={commentMutation.isPending || !commentContent.trim()}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {commentMutation.isPending ? "Posting..." : "Post Comment"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Comments List */}
            {commentsLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                        <div className="h-16 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-600">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No comments yet. Be the first to share your thoughts!</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    {comment.author.avatar && (
                      <img src={comment.author.avatar} alt={comment.author.displayName} className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{comment.author.displayName}</h4>
                          <span className="text-sm text-gray-600">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </article>
    </div>
  );
}
