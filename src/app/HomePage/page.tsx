"use client";

import React from "react";
import Head from "next/head";
import styled, { createGlobalStyle } from "styled-components";
import { motion } from "framer-motion";

// Global styles (unchanged)
const GlobalStyle = createGlobalStyle`
  body, html {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    height: 100%;
    font-family: "Helvetica", Arial, sans-serif;
    color: white;
  }
`;

// Overlay for text content
const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 2; /* Above the Layout video */
  padding: 2rem;
`;

// Text container
const TextFrame = styled.div`
  background: rgba(0, 0, 0, 0.9);
  padding: 20px 30px;
  border-radius: 10px;
  display: inline-block;
`;

const Title = styled(motion.h1)`
  font-size: 5rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  margin-top: 10px;
  font-weight: 300;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const HomePage = () => {
  return (
    <>
      <Head>
        <title>Låne Lageret | Utlån av Utstyr</title>
        <meta name="description" content="Portfolio of cinematographer Halwest Agha" />
      </Head>
      <GlobalStyle />
      {/* Overlay with Text */}
      <Overlay>
        <TextFrame>
          <Title
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Låne Lageret
          </Title>
          <Subtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Utlån av Utstyr
          </Subtitle>
        </TextFrame>
      </Overlay>
    </>
  );
};

export default HomePage;