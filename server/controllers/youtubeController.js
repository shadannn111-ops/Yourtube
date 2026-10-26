import axios from "axios";

const YOUTUBE_API_KEY = "AIzaSyBRhQ7bY7cvjSLWNG2ik77CafYbCAX3x4c";

export const getYouTubeVideos = async (req, res) => {
  try {
    const { query = "trending", maxResults = 20, pageToken = "" } = req.query;
    
    let url;
    if (query === "trending") {
      // Trending videos fetch karo
      url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=${maxResults}&regionCode=IN&key=${YOUTUBE_API_KEY}`;
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }
    } else if (query === "all") {
      // Sab categories ke videos fetch karo - randomly mix karne ke liye
      // Pehle trending fetch karo, phir search se diversify karo
      url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=${maxResults}&regionCode=IN&key=${YOUTUBE_API_KEY}`;
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }
    } else {
      // Category ke hisaab se search karo
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&maxResults=${maxResults}&type=video&key=${YOUTUBE_API_KEY}`;
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }
    }

    const response = await axios.get(url);
    
    // Next page token ko store karo
    const nextPageToken = response.data.nextPageToken || null;
    
    const videos = response.data.items.map((item) => {
      const videoId = item.id?.videoId || item.id;
      const snippet = item.snippet || {};
      const statistics = item.statistics || {};
      const contentDetails = item.contentDetails || {};

      return {
        _id: videoId,
        youtubeId: videoId,
        videotitle: snippet.title || "Untitled",
        videochanel: snippet.channelTitle || "Unknown",
        views: parseInt(statistics.viewCount || 0),
        Like: parseInt(statistics.likeCount || 0),
        createdAt: snippet.publishedAt || new Date().toISOString(),
        filepath: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
        duration: contentDetails?.duration || "PT0M",
        description: snippet.description || "",
      };
    });

    return res.status(200).json({
      videos,
      nextPageToken,
    });
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return res.status(500).json({ message: "Failed to fetch YouTube videos" });
  }
};
