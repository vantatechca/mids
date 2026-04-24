"use client";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Bell, LogOut } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground gap-2 w-64 justify-start"
        >
          <Search className="h-4 w-4" />
          <span>Search... (Cmd+K)</span>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">
                {session?.user?.name || "User"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-xs text-muted-foreground">
              {session?.user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-muted-foreground">
              Role: {(session?.user as any)?.role || "member"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
