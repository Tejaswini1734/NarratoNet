import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StoryWithAuthor } from "@shared/schema";

interface StoryCardProps {
  story: StoryWithAuthor;
}

export default function StoryCard({ story }: StoryCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (story.isLiked) {
        await apiRequest("DELETE", `/api/stories/${story.id}/like`);
      } else {
        await apiRequest("POST", `/api/stories/${story.id}/like`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({
        title: story.isLiked ? "Story unliked" : "Story liked",
        description: story.isLiked ? "Removed from your liked stories" : "Added to your liked stories",
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

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    likeMutation.mutate();
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {story.coverImage && (
        <img src={story.coverImage} alt={story.title} className="w-full h-48 object-cover" />
      )}
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge 
            variant="secondary" 
            className={`
              ${story.genre.toLowerCase() === 'fantasy' ? 'bg-purple-100 text-purple-800' : ''}
              ${story.genre.toLowerCase() === 'romance' ? 'bg-pink-100 text-pink-800' : ''}
              ${story.genre.toLowerCase() === 'mystery' ? 'bg-gray-100 text-gray-800' : ''}
              ${story.genre.toLowerCase() === 'sci-fi' ? 'bg-blue-100 text-blue-800' : ''}
              ${story.genre.toLowerCase() === 'horror' ? 'bg-red-100 text-red-800' : ''}
              ${story.genre.toLowerCase() === 'adventure' ? 'bg-green-100 text-green-800' : ''}
              ${story.genre.toLowerCase() === 'thriller' ? 'bg-yellow-100 text-yellow-800' : ''}
            `}
          >
            {story.genre}
          </Badge>
          <span className="text-sm text-gray-600 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {story.readTime} min read
          </span>
        </div>
        
        <Link href={`/story/${story.id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-orange-500 cursor-pointer transition-colors">
            {story.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 mb-4 line-clamp-3">{story.excerpt}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {story.author.avatar && (
              <img 
                src={story.author.avatar} 
                alt={story.author.displayName} 
                className="w-8 h-8 rounded-full object-cover" 
              />
            )}
            <span className="ml-2 text-sm font-medium text-gray-900">
              {story.author.displayName}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className={`hover:text-red-500 transition-colors ${
                story.isLiked ? "text-red-500" : "text-gray-600"
              }`}
            >
              <Heart className={`w-4 h-4 mr-1 ${story.isLiked ? "fill-current" : ""}`} />
              {story.likesCount}
            </Button>
            <Link href={`/story/${story.id}#comments`}>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-500 transition-colors">
                <MessageCircle className="w-4 h-4 mr-1" />
                {story.commentsCount}
              </Button>
            </Link>
          </div>
        </div>
        
        <Link href={`/story/${story.id}`}>
          <Button className="w-full mt-4 bg-orange-500 text-white hover:bg-orange-600 transition-colors">
            Read Story
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
