import React from 'react';
import t from 'prop-types';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import scrollIntoView from 'scroll-into-view-if-needed';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import { Task } from '~/features/tasks';
import { DisputeStatus } from '~/features/disputes';
import { selectByTaskId as selectDispute } from '~/features/disputes/disputesSlice';
import { selectIsLoadingByTaskId as selectEvidenceIsLoading } from '~/features/evidences/evidencesSlice';
import Button from '~/shared/Button';
import CollapsibleSection from '~/shared/CollapsibleSection';
import Spacer from '~/shared/Spacer';
import { LocalTopLoadingBar } from '~/shared/TopLoadingBar';
import useTask from '../useTask';
import EvidenceFetcher from './EvidenceFetcher';
import EvidenceTimeline from './EvidenceTimeline';
import SubmitEvidenceModalForm from './SubmitEvidenceModalForm';

export default function Evidences({ open }) {
  const task = useTask();
  const taskId = task.id;
  const isFinalized = Task.isFinalized(task);

  const dispute = useShallowEqualSelector(selectDispute(taskId));
  const hasOngoingDispute = [DisputeStatus.Waiting, DisputeStatus.Appealable].includes(dispute.status);

  const isLoadingEvidences = useSelector(selectEvidenceIsLoading(taskId));

  const firstItemRef = React.useRef();
  const lastItemRef = React.useRef();

  const handleScrollTo = ref => evt => {
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
    <CollapsibleSection defaultOpen={open} title="Evidences" titleLevel={3} tabIndex={100}>
      <LocalTopLoadingBar show={isLoadingEvidences} />
      <StyledContent>
        <StyledActionsContainer>
          <SubmitEvidenceModalForm
            trigger={
              <Button
                disabled={isFinalized || !hasOngoingDispute}
                css={`
                  flex: auto 0 0;
                `}
              >
                Submit New Evidence
              </Button>
            }
          />
          <StyledScrollAnchor href="#" onClick={handleScrollTo(firstItemRef)}>
            <ArrowDownOutlined /> Scroll to 1st evidence
          </StyledScrollAnchor>
        </StyledActionsContainer>
        <Spacer size={2.5} />
        <EvidenceFetcher
          render={data => <EvidenceTimeline data={data} firstItemRef={firstItemRef} lastItemRef={lastItemRef} />}
        />
        <Spacer size={2.5} />
        <StyledActionsContainer>
          <StyledScrollAnchor href="#" onClick={handleScrollTo(lastItemRef)}>
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

  @media (max-width: 767.98px) {
    padding: 2rem 0;
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
