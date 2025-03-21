// src/app/info/page.tsx
"use client";

import React from "react";
import styled from "styled-components";
import Toolbar from "../components/Toolbar";

export interface InfoContent {
    title: string;
    description: string;
    mission: string;
    features: string[];
    contact: string;
  }

const Container = styled.div`
  font-family: "Helvetica", Arial, sans-serif;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  min-height: 100vh;
  padding: 4vw;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const Title = styled.h1`
  font-size: clamp(32px, 5vw, 48px);
  font-weight: bold;
  margin-bottom: 2vh;
  color: #ffdd00;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Section = styled.section`
  max-width: 800px;
  margin-bottom: 4vh;
`;

const Subtitle = styled.h2`
  font-size: clamp(24px, 3vw, 32px);
  color: #fff;
  margin-bottom: 1vh;
`;

const Text = styled.p`
  font-size: clamp(16px, 2vw, 18px);
  color: #ddd;
  line-height: 1.6;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  text-align: left;
  margin: 0 auto;
  max-width: 600px;
`;

const ListItem = styled.li`
  font-size: clamp(16px, 2vw, 18px);
  color: #ddd;
  margin-bottom: 1vh;
  position: relative;
  padding-left: 1.5em;

  &:before {
    content: "•";
    color: #ffdd00;
    position: absolute;
    left: 0;
  }
`;

const infoContent: InfoContent = {
  title: "Velkommen til Lånehuset",
  description:
    "Lånehuset er din lokale utstyrsentral, inspirert av BUA, hvor du kan låne sports- og friluftsutstyr helt gratis eller til en lav pris. Vi tror på å gjøre aktivitet tilgjengelig for alle!",
  mission:
    "Vår misjon er å fremme bærekraft, redusere forbruk og oppmuntre til en aktiv livsstil i fellesskapet.",
  features: [
    "Lån utstyr som sykler, telt, ski og mer.",
    "Åpent for alle – spesielt familier og ungdom.",
    "Doner utstyr du ikke trenger lenger.",
    "Enkel administrasjon for frivillige og ansatte.",
  ],
  contact: "Kontakt oss på post@lanehuset.no eller besøk oss på hovedgaten 123.",
};

const Info: React.FC = () => {
  return (
    <Container>
      <Toolbar activeTab="info" />
      <Section>
        <Title>{infoContent.title}</Title>
        <Text>{infoContent.description}</Text>
      </Section>
      <Section>
        <Subtitle>Vår misjon</Subtitle>
        <Text>{infoContent.mission}</Text>
      </Section>
      <Section>
        <Subtitle>Hva vi tilbyr</Subtitle>
        <List>
          {infoContent.features.map((feature, index) => (
            <ListItem key={index}>{feature}</ListItem>
          ))}
        </List>
      </Section>
      <Section>
        <Subtitle>Kontakt oss</Subtitle>
        <Text>{infoContent.contact}</Text>
      </Section>
    </Container>
  );
};

export default Info;