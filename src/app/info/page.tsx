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
  background: #fff; /* White background */
  min-height: 100vh;
  padding: clamp(2rem, 6vw, 6rem); /* Generous, responsive padding */
  color: #1a1a1a; /* Deep black for text */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const Title = styled.h1`
  font-size: clamp(2.5rem, 6vw, 5rem); /* Large, bold title */
  font-weight: 700;
  letter-spacing: -0.02em; /* Slight tightening for elegance */
  margin-bottom: clamp(2rem, 4vw, 4rem);
  color: #1a1a1a;
  text-transform: uppercase; /* Fashion-forward uppercase */
  line-height: 1.1;
`;

const Section = styled.section`
  max-width: 900px; /* Slightly wider for a luxurious feel */
  margin-bottom: clamp(3rem, 5vw, 5rem);
`;

const Subtitle = styled.h2`
  font-size: clamp(1.75rem, 4vw, 3rem); /* Large subtitles */
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: clamp(1rem, 2vw, 2rem);
  letter-spacing: -0.01em;
  text-transform: uppercase;
`;

const Text = styled.p`
  font-size: clamp(1.25rem, 2.5vw, 1.75rem); /* Larger, readable text */
  color: #333; /* Softer black for body text */
  line-height: 1.5;
  max-width: 700px;
  margin: 0 auto;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  text-align: left;
  margin: 0 auto;
  max-width: 700px;
`;

const ListItem = styled.li`
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  color: #333;
  margin-bottom: clamp(0.75rem, 1.5vw, 1.5rem);
  position: relative;
  padding-left: 2rem;

  &:before {
    content: "—"; /* Em dash for a sleek, minimal bullet */
    color: #1a1a1a;
    position: absolute;
    left: 0;
    font-weight: 700;
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
  contact: "Kontakt oss på post@lanehuset.no eller besøk oss på Hovedgaten 123.",
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