import React, { useState, useEffect,useRef } from "react";
import FeedCard from "./FeedCard/FeedCard";
import UserSearch from "../UserSearch/UserSearch";

const Feed = ({ newPost, updateNewPost }) => {
    const API_URL =`https://instagram-41d8.onrender.com`
    const [feeds, setFeeds] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [page, setPage] = useState(1);
    const prevScrollTop = useRef(0);
    useEffect(() => {
        const fetchFeeds = async () => {
            try {
                const response = await fetch(`${API_URL}/api/posts/getAll?page=${page}&limit=2`);
                if (!response.ok) {
                    throw new Error("Networt Response is not Ok")
                };
                const data = await response.json();
                console.log(data);
                setFeeds(prevPosts => [...prevPosts, ...data.posts])

            } catch (error) {

            }
        }
        const fetchUserId = () => {
            const userId = localStorage.getItem("id");
            setCurrentUserId(parseInt(userId))
        }
        fetchFeeds()
        fetchUserId()
    }, [newPost, page])

    const likePost = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/posts/like`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({ postId: id })
            });
            const result = await response.json();
            console.log(result);
            // Optimistically update the UI
            setFeeds(prevFeeds =>
                prevFeeds.map(feed =>
                    feed.id === id
                        ? { ...feed, isLiked: true, likeCount: feed.likeCount + 1, likedByUserIds: [...feed.likedByUserIds, currentUserId] }
                        : feed
                )
            );

        } catch (err) {
            console.log(err)
        }
    }

    const unlikePost = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/posts/unlike`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({ postId: id })
            });
            const result = await response.json();
            console.log(result);
            // Optimistically update the UI
            setFeeds(prevFeeds =>
                prevFeeds.map(feed =>
                    feed.id === id
                        ? { ...feed, isLiked: false, likeCount: feed.likeCount - 1, likedByUserIds: feed.likedByUserIds.filter(userId => userId !== currentUserId) }
                        : feed
                )
            );

        } catch (err) {
            console.log(err)
        }
    }
    const handleScroll = () => {
        const currentScrollTop = window.scrollY;
        const isScrollingDown = currentScrollTop > prevScrollTop.current;
        const bottomReached = window.innerHeight + currentScrollTop >= document.documentElement.scrollHeight;
        
        if (bottomReached && isScrollingDown) {
            setPage(prevPage => prevPage + 1); // Load next page
        } else if (currentScrollTop < prevScrollTop.current && page > 1) {
            // If scrolling up and not on the first page, decrease the page number
            setPage(prevPage => prevPage - 1);
        }
        
        prevScrollTop.current = currentScrollTop;
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [page])

    const getUniqueFeeds = (feeds) => {
        const seenIds = new Set();
        return feeds.filter(feed => {
            if (seenIds.has(feed.id)) {
                return false; // Ignore duplicates
            } else {
                seenIds.add(feed.id);
                return true; // Keep unique items
            }
        });
    };

    const uniqueFeeds = getUniqueFeeds(feeds);
    return (
        <div className="w-full min-h-screen lg:py-7 sm:py-3 flex flex-col items-start gap-x-20 mt-5 pt-5 mb-5">
            <div className="w-full hidden md:block lg:block">
                <UserSearch></UserSearch>
            </div>
            <div className="w-full lg:w-[70%] h-auto relative">
                <div className="w-full h-auto flex items-center justify-center mt-6 mb-6">
                    <div className="w-full lg:w-[73%] md:w-[73%] sm:w-[80%]">
                        {feeds && uniqueFeeds.map((feed) => (
                            <FeedCard key={feed.id} updateNewPost={updateNewPost} feed={feed} onLike={likePost} onUnlike={unlikePost} currentUserId={currentUserId}></FeedCard>
                        ))

                        }


                    </div>

                </div>

            </div>
            <div className="w-full lg:w-[25%] h-auto lg:block hidden"></div>
        </div>
    )
}
export default Feed