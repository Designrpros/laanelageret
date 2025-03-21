"use client";

import { useState, useEffect, useRef } from "react";

export const useVideoPlayer = (videoPlaylist: string[]) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [nextVideoIndex, setNextVideoIndex] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const nextVideoRef = useRef<HTMLVideoElement | null>(null);

  // Handle video end and transition
  const handleVideoEnd = () => {
    setOpacity(0); // Fade out
    setTimeout(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videoPlaylist.length);
      setNextVideoIndex((prev) => (prev + 1) % videoPlaylist.length);
      setOpacity(1); // Fade in
    }, 500);
  };

  // Preload next video
  useEffect(() => {
    if (nextVideoRef.current) {
      nextVideoRef.current.load();
      nextVideoRef.current.preload = "auto";
    }
  }, [nextVideoIndex]);

  // Add event listener for video end
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener("ended", handleVideoEnd);
      return () => video.removeEventListener("ended", handleVideoEnd);
    }
  }, []);

  // Play video when index changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch((err) => console.log("Playback failed:", err));
    }
  }, [currentVideoIndex]);

  // Playback controls
  const play = () => videoRef.current?.play();
  const pause = () => videoRef.current?.pause();
  const setVideo = (index: number) => {
    setCurrentVideoIndex(index % videoPlaylist.length);
    setNextVideoIndex((index + 1) % videoPlaylist.length);
  };

  return {
    currentVideoIndex,
    nextVideoIndex,
    opacity,
    videoRef,
    nextVideoRef,
    play,
    pause,
    setVideo,
  };
};