import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import scrollIntoView from 'scroll-into-view-if-needed';
import { DisputeStatus } from '~/features/disputes';
import Button from '~/shared/Button';
import CollapsibleSection from '~/shared/CollapsibleSection';
import Spacer from '~/shared/Spacer';
import { LocalTopLoadingBar } from '~/shared/TopLoadingBar';
import EvidenceTimeline from './EvidenceTimeline';
import SubmitEvidenceModalForm from './SubmitEvidenceModalForm';

import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';
import Task from '~/utils/task';
import { useLinguo } from '~/hooks/useLinguo';
import { useEvidencesByTaskQuery } from '~/hooks/queries/useEvidencesByTaskQuery';
import { Spin } from 'antd';
import { Alert } from '~/adapters/antd';

export default function Evidences({ open }) {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);
  const linguo = useLinguo();
  const { evidences, isLoading, error } = useEvidencesByTaskQuery(task.id);

  const { taskID, lastInteraction, status, submissionTimeout, translation } = task;
  const isFinalized = Task.isFinalized(status, translation, lastInteraction, submissionTimeout);

  const disputeStatus = linguo.getDisputeStatus(taskID);
  const hasOngoingDispute = [DisputeStatus.Waiting, DisputeStatus.Appealable].includes(disputeStatus);

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
      <LocalTopLoadingBar show={isLoading} />
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
        <Spin tip="Getting evidences..." spinning={isLoading && !evidences}>
          {error && (
            <>
              <Alert
                type="warning"
                message={error.message}
                description={
                  evidences
                    ? 'You are currently viewing a cached version which not might reflect the current state in the blockchain.'
                    : null
                }
              />
              <Spacer size={2} />
            </>
          )}
          {evidences && <EvidenceTimeline data={evidences} firstItemRef={firstItemRef} lastItemRef={lastItemRef} />}
        </Spin>
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
