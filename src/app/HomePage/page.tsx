"use client";

import React from "react";
import Head from "next/head";
import "./HomePage.css";

const HomePage = () => {
  return (
    <>
      <Head>
        <title>Låne Lageret | Utlån av Utstyr</title>
        <meta name="description" content="Portfolio of cinematographer Halwest Agha" />
      </Head>
      <div className="overlay">
        <div className="text-frame">
          <h1 className="title">Låne Lageret</h1>
          <p className="subtitle">Utlån av Utstyr</p>
        </div>
      </div>
    </>
  );
};

export default HomePage;