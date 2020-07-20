import React from 'react';
import styled from 'styled-components';
import { Col, Row } from 'antd';
import PriceDefinition1 from '~/assets/images/price-definition/01.svg';
import PriceDefinition2 from '~/assets/images/price-definition/02.svg';
import PriceDefinition3 from '~/assets/images/price-definition/03.svg';

function PriceDefinitionInfographic() {
  return (
    <Row gutter={[48, 32]}>
      <StyledCol xs={24} sm={24} md={12} lg={8}>
        <PriceDefinition1 />
        <p>The pricing is market based.</p>
      </StyledCol>
      <StyledCol xs={24} sm={24} md={12} lg={8}>
        <PriceDefinition2 />
        <p>The price automatically increases until a translator is found.</p>
      </StyledCol>
      <StyledCol
        xs={{ span: 24, offset: 0 }}
        sm={{ span: 24, offset: 0 }}
        md={{ span: 12, offset: 6 }}
        lg={{ span: 8, offset: 0 }}
      >
        <PriceDefinition3 />
        <p>The more urgent the task, the faster the price goes up.</p>
      </StyledCol>
    </Row>
  );
}

export default PriceDefinitionInfographic;

const StyledCol = styled(Col)`
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;

  svg {
    flex: 50% 1 2;
  }

  p {
    flex: 50% 2 1;
    color: ${p => p.theme.color.text.light};
    font-size: ${p => p.theme.fontSize.sm};
  }

  @media (max-width: 767.98px) {
    gap: 1.5rem;

    svg {
      flex-basis: 30%;
      min-width: 9rem;
      max-width: 12rem;
    }
  }

  @media (min-width: 768px) {
    :not(:first-of-type) {
      ::after {
        background: ${p => p.theme.color.secondary.default};
        content: '';
        position: absolute;
        z-index: 10;
        height: 0.25rem;
        width: 2rem;
        left: -1rem;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }

  @media (min-width: 768px) and (max-width: 1199.98px) {
    flex-direction: column;

    p,
    svg {
      flex: auto;
      max-width: 12rem;
      text-align: center;
    }

    :not(:first-of-type) {
      ::after {
        width: 15%;
        left: -7.5%;
        top: 30%;
      }
    }
  }
`;
