import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, User, PlaySquare } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SubscriptionsPage() {
  const { user } = useUser();
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscribedChannels();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubscribedChannels = async () => {
    try {
      const res = await axiosInstance.get(`/subscribe/channels/${user._id || user.id}`);
      setChannels(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <LogIn className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign in to see subscriptions</h2>
          <p className="text-muted-foreground mb-6">Subscribe to channels to see them here</p>
          <Link href="/login"><Button className="bg-red-600 hover:bg-red-700">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-background p-6 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <PlaySquare className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Subscriptions</h1>
        </div>

        {channels.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No subscribed channels yet</h2>
            <p className="text-muted-foreground">Channels you subscribe to will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {channels.map((channel) => (
              <Link
                key={channel._id}
                href={`/channel/${channel._id}`}
                className="flex flex-col items-center bg-card border border-border rounded-2xl p-4 md:p-6 hover:shadow-xl hover:border-red-600/50 transition-all duration-300 group"
              >
                <Avatar className="w-20 h-20 md:w-24 md:h-24 mb-4 ring-2 ring-transparent group-hover:ring-red-600 transition-all">
                  <AvatarImage src={channel.image || ""} />
                  <AvatarFallback className="text-2xl md:text-3xl bg-secondary text-foreground">
                    {(channel.channelname || channel.name || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center w-full">
                  <h3 className="font-bold text-sm md:text-base text-foreground truncate group-hover:text-red-600 transition-colors">
                    {channel.channelname || channel.name || "Unknown Channel"}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 truncate">
                    @{(channel.channelname || channel.name || "user").toLowerCase().replace(/\s+/g, "")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
