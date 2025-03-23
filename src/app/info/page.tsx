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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem; /* Padding for the outer container */
`;

const ContentWrapper = styled.div`
  background: #fff; /* White background for the content */
  border-radius: 12px; /* Rounded corners */
  padding: clamp(1.5rem, 5vw, 3rem); /* Responsive padding */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  width: 100%;
  max-width: 1200px; /* Max width for the content */
  margin: 0 auto; /* Center the wrapper horizontally */
  box-sizing: border-box; /* Ensure padding is included in width */
`;

const Title = styled.h1`
  font-size: clamp(2rem, 6vw, 4rem); /* Responsive title size */
  font-weight: 700;
  letter-spacing: -0.02em; /* Slight tightening for elegance */
  margin-bottom: clamp(1.5rem, 4vw, 3rem);
  color: #1a1a1a;
  text-transform: uppercase; /* Fashion-forward uppercase */
  line-height: 1.1;
  text-align: center; /* Ensure title is centered */
`;

const Section = styled.section`
  max-width: 900px; /* Slightly wider for a luxurious feel */
  margin: 0 auto clamp(2rem, 5vw, 4rem); /* Center sections and add bottom margin */
  text-align: center; /* Center text within sections */
`;

const Subtitle = styled.h2`
  font-size: clamp(1.5rem, 4vw, 2.5rem); /* Responsive subtitle size */
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: clamp(1rem, 2vw, 1.5rem);
  letter-spacing: -0.01em;
  text-transform: uppercase;
  text-align: center; /* Ensure subtitles are centered */
`;

const Text = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.5rem); /* Responsive text size */
  color: #333; /* Softer black for body text */
  line-height: 1.5;
  max-width: 700px;
  margin: 0 auto; /* Center text paragraphs */
  text-align: center; /* Center text within paragraphs */
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  text-align: center;
  margin: 0 auto;
  max-width: 700px;
`;

const ListItem = styled.li`
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  color: #333;
  margin-bottom: clamp(0.75rem, 1.5vw, 1.25rem);
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
  title: "Velkommen til \n LåneLageret",
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
      <ContentWrapper>
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
      </ContentWrapper>
    </Container>
  );
};

export default Info;