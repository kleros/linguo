import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import clsx from 'clsx';
import { useParams } from 'react-router';
import { Typography } from 'antd';
import { PlusOutlined, MinusOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import scrollIntoView from 'scroll-into-view-if-needed';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import Button from '~/shared/Button';
import Spacer from '~/shared/Spacer';
import { selectByTaskId as selectDispute } from '~/features/disputes/disputesSlice';
import { DisputeStatus } from '~/features/disputes';
import EvidenceFetcher from './EvidenceFetcher';
import EvidenceTimeline from './EvidenceTimeline';

export default function Evidences() {
  const [isOpen, setIsOpen] = React.useState(false);
  const handleToggleOpen = React.useCallback(() => {
    setIsOpen(open => !open);
  }, []);

  const icon = isOpen ? <MinusOutlined /> : <PlusOutlined />;

  return (
    <StyledDetails>
      <StyledSummary tabIndex={100} onClick={handleToggleOpen} className={clsx({ open: isOpen, closed: !isOpen })}>
        <Typography.Title level={3}>Evidence</Typography.Title>
        {icon}
      </StyledSummary>
      <EvidencesContent isOpen={isOpen} />
    </StyledDetails>
  );
}

function EvidencesContent({ isOpen }) {
  const { id: taskId } = useParams();
  const dispute = useShallowEqualSelector(selectDispute(taskId));
  const isOngoing = dispute.status === DisputeStatus.Waiting;

  const firstItemRef = React.useRef();
  const lastItemRef = React.useRef();

  const handleScrollToFirstClick = ref => evt => {
    evt.preventDefault();

    if (ref.current) {
      scrollIntoView(ref.current, {
        scrollMode: 'if-needed',
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  };

  return (
    <StyledContent>
      <StyledActionsContainer>
        <Button disabled={!isOngoing}>Submit New Evidence</Button>
        <StyledScrollAnchor href="#" onClick={handleScrollToFirstClick(firstItemRef)}>
          <ArrowDownOutlined /> Scroll to 1st evidence
        </StyledScrollAnchor>
      </StyledActionsContainer>
      <Spacer size={2.5} />
      {isOpen && (
        <EvidenceFetcher
          render={data => <EvidenceTimeline data={data} firstItemRef={firstItemRef} lastItemRef={lastItemRef} />}
        />
      )}
      <Spacer size={2.5} />
      <StyledActionsContainer>
        <StyledScrollAnchor href="#" onClick={handleScrollToFirstClick(lastItemRef)}>
          <ArrowUpOutlined /> Scroll to latest evidence
        </StyledScrollAnchor>
      </StyledActionsContainer>
    </StyledContent>
  );
}

EvidencesContent.propTypes = {
  isOpen: t.bool.isRequired,
};

const StyledDetails = styled.details`
  border-radius: 0.1875rem;
  background-color: ${p => p.theme.color.background.default};
`;

const StyledSummary = styled.summary`
  background-color: ${p => p.theme.color.primary.default};
  height: 3rem;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${p => p.theme.color.text.inverted};
  cursor: pointer;

  &.open {
    border-top-left-radius: 0.1875rem;
    border-top-right-radius: 0.1875rem;
  }

  &.closed {
    border-radius: 0.1875rem;
  }

  .ant-typography {
    color: inherit;
    font-size: ${p => p.theme.fontSize.sm};
    font-weight: 500;
    margin: 0;
    padding: 0;
  }

  ::marker {
    content: '';
    display: none;
  }
`;

const StyledContent = styled.article`
  padding: 2rem;
`;

const StyledActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledScrollAnchor = styled.a`
  margin-left: auto;
`;
