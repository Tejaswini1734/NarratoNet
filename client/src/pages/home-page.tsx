import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Clock, TrendingUp, BookOpen, Wand2, Search, HeartHandshake, Rocket, Skull, Mountain } from "lucide-react";
import Navbar from "@/components/navbar";
import { StoryWithAuthor } from "@shared/schema";

const genres = [
  { name: "Fantasy", icon: Wand2, color: "purple", count: 1234 },
  { name: "Mystery", icon: Search, color: "gray", count: 892 },
  { name: "Romance", icon: HeartHandshake, color: "pink", count: 1567 },
  { name: "Sci-Fi", icon: Rocket, color: "blue", count: 734 },
  { name: "Horror", icon: Skull, color: "red", count: 445 },
  { name: "Adventure", icon: Mountain, color: "green", count: 623 },
];

export default function HomePage() {
  const { data: featuredStories = [], isLoading: featuredLoading } = useQuery<StoryWithAuthor[]>({
    queryKey: ["/api/stories"],
    queryFn: async () => {
      const response = await fetch("/api/stories?limit=3");
      return response.json();
    },
  });

  const { data: trendingStories = [], isLoading: trendingLoading } = useQuery<StoryWithAuthor[]>({
    queryKey: ["/api/stories", "trending"],
    queryFn: async () => {
      const response = await fetch("/api/stories?limit=3&offset=3");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Share Your Stories with the World
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              Join thousands of writers and readers on NarratoNet. Discover amazing stories, connect with authors, and share your own tales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/stories">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg">
                  Start Reading
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg">
                Join as Writer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Stories</h2>
            <p className="text-lg text-gray-600">Handpicked stories from our community</p>
          </div>
          
          {featuredLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="w-full h-48 bg-gray-200 animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-3 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse" />
                    <div className="h-16 bg-gray-200 rounded mb-4 animate-pulse" />
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredStories.map((story) => (
                <Card key={story.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  {story.coverImage && (
                    <img src={story.coverImage} alt={story.title} className="w-full h-48 object-cover" />
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {story.genre}
                      </Badge>
                      <span className="ml-auto text-sm text-gray-600 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {story.readTime} min read
                      </span>
                    </div>
                    <Link href={`/story/${story.id}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-orange-500 cursor-pointer">
                        {story.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-4 line-clamp-3">{story.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {story.author.avatar && (
                          <img src={story.author.avatar} alt={story.author.displayName} className="w-8 h-8 rounded-full object-cover" />
                        )}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {story.author.displayName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-600">
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {story.likesCount}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {story.commentsCount}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Genre Browser Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore Genres</h2>
            <p className="text-lg text-gray-600">Find your next favorite story</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {genres.map((genre) => {
              const Icon = genre.icon;
              return (
                <Link key={genre.name} href={`/stories?genre=${genre.name.toLowerCase()}`}>
                  <div className={`text-center p-6 rounded-xl bg-${genre.color}-50 hover:bg-${genre.color}-100 transition-colors cursor-pointer`}>
                    <Icon className={`mx-auto text-3xl text-${genre.color}-600 mb-3`} />
                    <h3 className="font-semibold text-gray-900">{genre.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{genre.count.toLocaleString()} stories</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Trending This Week</h2>
            <Link href="/stories">
              <Button variant="ghost" className="text-orange-500 hover:text-orange-600">
                View All
              </Button>
            </Link>
          </div>
          
          {trendingLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-6 bg-gray-200 rounded animate-pulse" />
                      <div className="h-16 bg-gray-200 rounded animate-pulse" />
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {trendingStories.map((story, index) => (
                <Card key={story.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {story.genre}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {new Date(story.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Link href={`/story/${story.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-orange-500 cursor-pointer">
                          {story.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{story.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            {story.author.avatar && (
                              <img src={story.author.avatar} alt={story.author.displayName} className="w-6 h-6 rounded-full object-cover" />
                            )}
                            <span className="ml-2 text-sm text-gray-900">{story.author.displayName}</span>
                          </div>
                          <span className="text-sm text-gray-600 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {story.readTime} min read
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-gray-600">
                          <span className="flex items-center text-sm">
                            <Heart className="w-4 h-4 mr-1" />
                            {story.likesCount}
                          </span>
                          <span className="flex items-center text-sm">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {story.commentsCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <BookOpen className="w-6 h-6 mr-2" />
                NarratoNet
              </h3>
              <p className="text-gray-300">Where stories come alive and writers thrive.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Writers</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Write Your Story</a></li>
                <li><a href="#" className="hover:text-white">Publishing Guidelines</a></li>
                <li><a href="#" className="hover:text-white">Writer Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Readers</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/stories" className="hover:text-white">Browse Stories</Link></li>
                <li><a href="#" className="hover:text-white">Popular Authors</a></li>
                <li><a href="#" className="hover:text-white">Reading Lists</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Discord</a></li>
                <li><a href="#" className="hover:text-white">Writing Contests</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 NarratoNet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
