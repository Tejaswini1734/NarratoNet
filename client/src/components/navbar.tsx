import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Bell, Menu, User, LogOut, PenTool } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { NotificationWithDetails } from "@shared/schema";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const { data: notifications = [] } = useQuery<NotificationWithDetails[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center cursor-pointer">
                  <BookOpen className="w-6 h-6 mr-2 text-orange-500" />
                  NarratoNet
                </h1>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/">
                  <Button
                    variant="ghost"
                    className={`px-3 py-2 text-sm ${
                      isActive("/") 
                        ? "text-orange-500 font-medium" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Home
                  </Button>
                </Link>
                <Link href="/stories">
                  <Button
                    variant="ghost"
                    className={`px-3 py-2 text-sm ${
                      isActive("/stories") 
                        ? "text-orange-500 font-medium" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Stories
                  </Button>
                </Link>
                <Link href="/notifications">
                  <Button
                    variant="ghost"
                    className={`px-3 py-2 text-sm relative ${
                      isActive("/notifications") 
                        ? "text-orange-500 font-medium" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Bell className="w-4 h-4 mr-1" />
                    Notifications
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0 min-w-0">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              <Button className="bg-orange-500 text-white hover:bg-orange-600">
                <PenTool className="w-4 h-4 mr-2" />
                Write Story
              </Button>
              
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      {user.avatar ? (
                        <img 
                          className="h-8 w-8 rounded-full object-cover" 
                          src={user.avatar} 
                          alt={user.displayName} 
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-semibold text-gray-900">
                      {user.displayName}
                    </div>
                    <div className="px-2 py-1.5 text-xs text-gray-600">
                      @{user.username}
                    </div>
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <PenTool className="mr-2 h-4 w-4" />
                      My Stories
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={() => logoutMutation.mutate()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
