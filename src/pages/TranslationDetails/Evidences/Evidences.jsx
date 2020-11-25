import React from 'react';
import t from 'prop-types';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import scrollIntoView from 'scroll-into-view-if-needed';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import { DisputeStatus } from '~/features/disputes';
import { selectByTaskId as selectDispute } from '~/features/disputes/disputesSlice';
import { selectIsLoadingByTaskId as selectEvidenceIsLoading } from '~/features/evidences/evidencesSlice';
import Button from '~/shared/Button';
import CollapsibleSection from '~/shared/CollapsibleSection';
import Spacer from '~/shared/Spacer';
import TopLoadingBar from '~/shared/TopLoadingBar';
import EvidenceFetcher from './EvidenceFetcher';
import EvidenceTimeline from './EvidenceTimeline';
import SubmitEvidenceModalForm from './SubmitEvidenceModalForm';

export default function Evidences({ open }) {
  const { id: taskId } = useParams();

  const dispute = useShallowEqualSelector(selectDispute(taskId));
  const isOngoingDispute = [DisputeStatus.Waiting, DisputeStatus.Appealable].includes(dispute.status);

  const isLoadingEvidences = useSelector(selectEvidenceIsLoading(taskId));

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
    <CollapsibleSection defaultOpen={open} title="Evidence" titleLevel={3} tabIndex={100}>
      <TopLoadingBar show={isLoadingEvidences} />
      <StyledContent>
        <StyledActionsContainer>
          <SubmitEvidenceModalForm
            trigger={
              <Button
                disabled={!isOngoingDispute}
                css={`
                  flex: auto 0 0;
                `}
              >
                Submit New Evidence
              </Button>
            }
          />
          <StyledScrollAnchor href="#" onClick={handleScrollToFirstClick(firstItemRef)}>
            <ArrowDownOutlined /> Scroll to 1st evidence
          </StyledScrollAnchor>
        </StyledActionsContainer>
        <Spacer size={2.5} />
        <EvidenceFetcher
          render={data => <EvidenceTimeline data={data} firstItemRef={firstItemRef} lastItemRef={lastItemRef} />}
        />
        <Spacer size={2.5} />
        <StyledActionsContainer>
          <StyledScrollAnchor href="#" onClick={handleScrollToFirstClick(lastItemRef)}>
            <ArrowUpOutlined /> Scroll to latest evidence
          </StyledScrollAnchor>
        </StyledActionsContainer>
      </StyledContent>
    </CollapsibleSection>
  );
}

Evidences.propTypes = {
  open: t.bool,
};

Evidences.defaultProps = {
  open: false,
};

const StyledContent = styled.article`
  padding: 2rem;
  background-color: ${p => p.theme.color.background.default};

  @media (max-width: 767.98px) {
    padding: 2rem 0;
    background-color: transparent;
  }
`;

const StyledActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const StyledScrollAnchor = styled.a`
  margin-left: auto;
  text-align: right;
`;
