import { Home, Compass, PlaySquare, Clock, ThumbsUp, History, User, Crown, Download, Shield, Video } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Channeldialogue from "./channeldialogue";
import { useUser } from "@/lib/AuthContext";

const Sidebar = ({ closeSidebar }: { closeSidebar?: () => void }) => {
  const { user } = useUser();
  const [isdialogeopen, setisdialogeopen] = useState(false);

  // Mobile pe click karne par sidebar band ho jaye
  const handleLinkClick = () => { if (closeSidebar) closeSidebar(); };

  return (
    <aside className="w-full h-full overflow-y-auto p-2 pb-20 md:pb-2">
      <nav className="space-y-1">
        <Link href="/" onClick={handleLinkClick}><Button variant="ghost" className="w-full justify-start"><Home className="w-5 h-5 mr-3" />Home</Button></Link>
        <Link href="/explore" onClick={handleLinkClick}><Button variant="ghost" className="w-full justify-start"><Compass className="w-5 h-5 mr-3" />Explore</Button></Link>
        <Link href="/subscriptions" onClick={handleLinkClick}><Button variant="ghost" className="w-full justify-start"><PlaySquare className="w-5 h-5 mr-3" />Subscriptions</Button></Link>
        <Link href="/subscription" onClick={handleLinkClick}><Button variant="ghost" className="w-full justify-start"><Crown className="w-5 h-5 mr-3" />Premium</Button></Link>
        <Link href="/meeting" onClick={handleLinkClick}><Button variant="ghost" className="w-full justify-start"><Video className="w-5 h-5 mr-3" />Meeting</Button></Link>
        <Link href="/downloads" onClick={handleLinkClick}><Button variant="ghost" className="w-full justify-start"><Download className="w-5 h-5 mr-3" />Downloads</Button></Link>
        <Link href="/admin/dashboard" onClick={handleLinkClick}><Button variant="ghost" className="w-full justify-start"><Shield className="w-5 h-5 mr-3" />Admin Panel</Button></Link>

        {user && (
          <>
            <div className="border-t pt-2 mt-2">
              <Link href="/history" onClick={handleLinkClick}><Button variant="ghost" className="w-full justify-start"><History className="w-5 h-5 mr-3" />History</Button></Link>
              <Link href="/liked" onClick={handleLinkClick}><Button variant="ghost" className="w-full justify-start"><ThumbsUp className="w-5 h-5 mr-3" />Liked videos</Button></Link>
              <Link href="/watch-later" onClick={handleLinkClick}><Button variant="ghost" className="w-full justify-start"><Clock className="w-5 h-5 mr-3" />Watch later</Button></Link>
              
              {user?.channelname ? (
                <Link href={`/channel/${user._id}`} onClick={handleLinkClick}><Button variant="ghost" className="w-full justify-start"><User className="w-5 h-5 mr-3" />Your channel</Button></Link>
              ) : (
                <div className="px-2 py-1.5">
                  <Button variant="secondary" size="sm" className="w-full" onClick={() => setisdialogeopen(true)}>Create Channel</Button>
                </div>
              )}
            </div>
          </>
        )}
      </nav>
      <Channeldialogue isopen={isdialogeopen} onclose={() => setisdialogeopen(false)} mode="create" />
    </aside>
  );
};

export default Sidebar;
