import React from 'react';
import styled from 'styled-components';
import { Titled } from 'react-titled';
import Hero from './Hero';
import Sash from './Sash';
import Pricing from './Pricing';
import Requesters from './Requesters';
import Translators from './Translators';

export default function Home() {
  return (
    <Titled title={() => 'Linguo by Kleros'}>
      <Container>
        <Hero />
        <Sash />
        <Pricing />
        <Requesters />
        <Translators />
      </Container>
    </Titled>
  );
}

const Container = styled.div`
  width: 100%;
  background-color: ${props => props.theme.color.landing.lightBackground};
  display: flex;
  flex-direction: column;
  align-items: center;
`;
