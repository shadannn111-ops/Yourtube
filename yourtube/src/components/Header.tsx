import { Bell, Menu, Mic, Search, User, VideoIcon, Crown, Star, Award } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Channeldialogue from "./channeldialogue";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";

const Header = ({ toggleSidebar }: { toggleSidebar?: () => void }) => {
  const { user, logout } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isdialogeopen, setisdialogeopen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleKeypress = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(e as any); };

  return (
    <header className="flex items-center justify-between px-2 md:px-4 py-2 bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center gap-1 md:gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-gray-900 hover:bg-gray-100">
          <Menu className="w-6 h-6" />
        </Button>
        <Link href="/" className="flex items-center gap-1">
          <div className="bg-red-600 p-1 rounded hidden sm:block">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
          </div>
          <span className="text-xl font-medium hidden sm:block text-gray-900">YourTube</span>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2 flex-1 max-w-2xl mx-4">
        <div className="flex flex-1">
          <Input type="search" placeholder="Search" value={searchQuery} onKeyPress={handleKeypress} onChange={(e) => setSearchQuery(e.target.value)} className="rounded-l-full border-r-0 focus-visible:ring-0 bg-white text-gray-900 border-gray-300" />
          <Button type="submit" className="rounded-r-full px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-l-0 border-gray-300"><Search className="w-5 h-5" /></Button>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full text-gray-900 hover:bg-gray-100"><Mic className="w-5 h-5" /></Button>
      </form>

      <Button variant="ghost" size="icon" className="sm:hidden text-gray-900"><Search className="w-5 h-5" /></Button>

      <div className="flex items-center gap-1 md:gap-2">
        {user ? (
          <>
            <Button variant="ghost" size="icon" className="hidden sm:block text-gray-900 hover:bg-gray-100"><VideoIcon className="w-6 h-6" /></Button>
            {user?.subscriptionPlan && user.subscriptionPlan !== "free" && (
              <Link href="/subscription">
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition hover:scale-105 ${user.subscriptionPlan === "bronze" ? "bg-orange-100 text-orange-700 border border-orange-400" : user.subscriptionPlan === "silver" ? "bg-gray-200 text-gray-800 border border-gray-400" : user.subscriptionPlan === "gold" ? "bg-yellow-100 text-yellow-800 border border-yellow-500" : ""}`} title={`${user.subscriptionPlan.toUpperCase()} Plan`}>
                  {user.subscriptionPlan === "bronze" && <Award className="w-3 h-3" />}
                  {user.subscriptionPlan === "silver" && <Star className="w-3 h-3" />}
                  {user.subscriptionPlan === "gold" && <Crown className="w-3 h-3" />}
                  <span>{user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1)}</span>
                </div>
              </Link>
            )}
            <Button variant="ghost" size="icon" className="hidden sm:block text-gray-900 hover:bg-gray-100"><Bell className="w-6 h-6" /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" className="relative h-8 w-8 rounded-full"><Avatar className="h-8 w-8"><AvatarImage src={user.image} /><AvatarFallback className="bg-gray-200 text-gray-800">{user.name?.[0] || "U"}</AvatarFallback></Avatar></Button></DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white border-gray-200 text-gray-900" align="end" forceMount>
                {user?.channelname ? <DropdownMenuItem asChild><Link href={`/channel/${user?._id}`}>Your channel</Link></DropdownMenuItem> : <div className="px-2 py-1.5"><Button variant="secondary" size="sm" className="w-full" onClick={() => setisdialogeopen(true)}>Create Channel</Button></div>}
                <DropdownMenuItem asChild><Link href="/history">History</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/liked">Liked videos</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/watch-later">Watch later</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/subscription">Manage Subscription</Link></DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem onClick={logout} className="text-red-600">Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Link href="/login"><Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1"><User className="w-4 h-4" /> <span className="hidden sm:block">Sign in</span></Button></Link>
        )}
      </div>
      <Channeldialogue isopen={isdialogeopen} onclose={() => setisdialogeopen(false)} mode="create" />
    </header>
  );
};

export default Header;
