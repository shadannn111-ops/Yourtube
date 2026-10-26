import Videogrid from "@/components/Videogrid";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <main className="flex-1 p-4">
      <Suspense fallback={<div>Loading videos...</div>}>
        <Videogrid />
      </Suspense>
    </main>
  );
}