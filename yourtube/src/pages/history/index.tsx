import HistoryContent from "@/components/HistoryContent";
import { useUser } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import Link from "next/link";
import React, { Suspense } from "react";

const HistoryPage = () => {
  const { user } = useUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <LogIn className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign in to see your watch history</h2>
          <p className="text-gray-600 mb-6">Your watch history will appear here</p>
          <Link href="/login">
            <Button className="bg-red-600 hover:bg-red-700">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Watch history</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <HistoryContent />
        </Suspense>
      </div>
    </main>
  );
};

export default HistoryPage;
