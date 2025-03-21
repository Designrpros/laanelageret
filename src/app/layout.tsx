"use client";

import React from "react";
import { useVideoPlayer } from "./useVideoPlayer";
import styled, { createGlobalStyle } from "styled-components";
import Toolbar from "./components/Toolbar";
import { usePathname } from "next/navigation";

const GlobalStyle = createGlobalStyle`
  body, html { margin: 0; padding: 0; overflow-x: hidden; height: 100%; }
`;

const HeroSection = styled.section`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: -1;
`;

const Video = styled.video<{ opacity: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${(props) => props.opacity};
  transition: opacity 0.5s ease-in-out;
  z-index: ${(props) => (props.opacity === 1 ? 1 : 0)};
`;

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const videoPlaylist = [
    "/hero-video.mp4",
    "/hero-video2.mp4",
  ];

  const {
    currentVideoIndex,
    nextVideoIndex,
    opacity,
    videoRef,
    nextVideoRef,
  } = useVideoPlayer(videoPlaylist);

  const activeTab = pathname === "/" ? "Home" : pathname === "/utlaan" ? "utlaan" : "Home";

  return (
    <html lang="en">
      <head />
      <body>
        <GlobalStyle />
        <HeroSection>
          <Video autoPlay muted ref={videoRef} opacity={opacity}>
            <source src={videoPlaylist[currentVideoIndex]} type="video/mp4" />
          </Video>
          <video ref={nextVideoRef} muted style={{ display: "none" }}>
            <source src={videoPlaylist[nextVideoIndex]} type="video/mp4" />
          </video>
        </HeroSection>
        <Toolbar activeTab={activeTab} onTabChange={() => {}} />
        {children}
      </body>
    </html>
  );
}