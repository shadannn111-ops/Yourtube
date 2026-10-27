import React, { useEffect, useState } from "react";
import Videocard from "./videocard";
import axiosInstance from "@/lib/axiosinstance";

const categories = [
  { id: "All", label: "All" }, { id: "Gaming", label: "Gaming" }, { id: "Sports", label: "Sports" },
  { id: "Technology", label: "Technology" }, { id: "Comedy", label: "Comedy" }, { id: "Education", label: "Education" },
  { id: "Science", label: "Science" }, { id: "Travel", label: "Travel" }, { id: "Food", label: "Food" }, { id: "Nature", label: "Nature" },
];

const Videogrid = () => {
  const [videos, setvideo] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchvideo = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");
        const videosData = Array.isArray(res.data) ? res.data : [res.data];
        setvideo(videosData);
      } catch (error) { console.log("Fetch error:", error); setvideo([]); } 
      finally { setloading(false); }
    };
    fetchvideo();
  }, []);

  const filteredVideos = activeCategory === "All" ? videos : videos.filter((v: any) => v.category === activeCategory);

  return (
    <div className="space-y-8 p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 sticky top-0 bg-gray-50/90 backdrop-blur-md z-10 pt-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md ${
              activeCategory === category.id
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>
        ) : filteredVideos.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xl font-bold text-gray-800 mb-2">No videos in this category</p>
            <p className="text-gray-500">Upload videos in "{activeCategory}" to see them here.</p>
          </div>
        ) : (
          filteredVideos.map((video: any) => (
            <div key={video._id} className="transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl rounded-2xl bg-white p-2">
              <Videocard video={video} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Videogrid;
