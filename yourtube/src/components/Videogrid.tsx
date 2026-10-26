import React, { useEffect, useState } from "react";
import Videocard from "./videocard";
import axiosInstance from "@/lib/axiosinstance";

const categories = [
  { id: "All", label: "All" },
  { id: "Gaming", label: "Gaming" },
  { id: "Sports", label: "Sports" },
  { id: "Technology", label: "Technology" },
  { id: "Comedy", label: "Comedy" },
  { id: "Education", label: "Education" },
  { id: "Science", label: "Science" },
  { id: "Travel", label: "Travel" },
  { id: "Food", label: "Food" },
  { id: "Nature", label: "Nature" },
];

const Videogrid = () => {
  const [videos, setvideo] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchvideo = async () => {
      try {
        // ✅ AxiosInstance use ho raha hai
        const res = await axiosInstance.get("/video/getall");
        const videosData = Array.isArray(res.data) ? res.data : [res.data];
        setvideo(videosData);
      } catch (error) {
        console.log("Fetch error:", error);
        setvideo([]);
      } finally {
        setloading(false);
      }
    };
    fetchvideo();
  }, []);

  const filteredVideos =
    activeCategory === "All"
      ? videos
      : videos.filter((v: any) => v.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 sticky top-0 bg-white z-10 pt-2 px-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
              activeCategory === category.id
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-2">
        {loading ? (
          <div className="col-span-full text-center py-10 text-gray-500">Loading videos...</div>
        ) : filteredVideos.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            <p className="text-lg font-medium mb-2">No videos in this category</p>
            <p className="text-sm">Upload videos in "{activeCategory}" to see them here.</p>
          </div>
        ) : (
          filteredVideos.map((video: any) => (
            <Videocard key={video._id} video={video} />
          ))
        )}
      </div>
    </div>
  );
};

export default Videogrid;
