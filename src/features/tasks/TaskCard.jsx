import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Tooltip, Typography } from 'antd';

import * as r from '~/app/routes';
import Card from '~/shared/Card';
import FormattedNumber from '~/shared/FormattedNumber';
import useInterval from '~/shared/useInterval';
import Spacer from '~/shared/Spacer';
import EthFiatValue from '~/features/tokens/EthFiatValue';

import TaskCardFooter from './TaskCardFooter';
import TaskInfoGrid from './TaskInfoGrid';
import TaskLanguages from './TaskLanguages';
import TaskPrice from './TaskPrice';

import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';

import Task from '~/utils/task';
import taskStatus from '~/consts/taskStatus';
import { _1_MINUTE_MS } from '~/consts/time';
import { taskStatusToProps } from '~/utils/task/taskStatusToProps';
import { getAddressByLanguageAndChain } from '~/utils/getAddressByLanguage';
import { useWeb3 } from '~/hooks/useWeb3';

const getTaskDetailsRoute = r.withParamSubtitution(r.TRANSLATION_TASK_DETAILS);

export default function TaskCard({ data, metadata, footerProps }) {
  const { chainId } = useWeb3();
  const { title, sourceLanguage, targetLanguage, wordCount, expectedQuality } = metadata;
  const {
    minPrice,
    maxPrice,
    lang,
    lastInteraction,
    requesterDeposit,
    submissionTimeout,
    status,
    taskID,
    translation,
  } = data;

  const [currentPrice, setCurrentPrice] = React.useState(
    Task.getCurrentPrice(requesterDeposit, minPrice, maxPrice, lastInteraction, submissionTimeout, status)
  );

  const updateCurrentPrice = React.useCallback(() => {
    if (requesterDeposit) {
      setCurrentPrice(requesterDeposit);
    } else {
      const value = Task.getCurrentPrice(
        requesterDeposit,
        minPrice,
        maxPrice,
        lastInteraction,
        submissionTimeout,
        status
      );
      setCurrentPrice(value);
    }
  }, [lastInteraction, maxPrice, minPrice, status, requesterDeposit, submissionTimeout]);

  const interval = requesterDeposit === undefined ? _1_MINUTE_MS : null;
  useInterval(updateCurrentPrice, interval);

  const actualPrice = status === taskStatus.Assigned ? requesterDeposit : currentPrice;
  const pricePerWord = Task.getCurrentPricePerWord(actualPrice, wordCount);
  const { name = '', requiredLevel = '' } = translationQualityTiers[expectedQuality] || {};
  const isIncomplete = Task.isIncomplete(status, translation, lastInteraction, submissionTimeout);
  const taskInfo = [
    {
      title: 'Price per Word',
      content: <TaskPrice showTooltip value={pricePerWord} />,
      footer: <EthFiatValue amount={pricePerWord} render={({ formattedValue }) => `(${formattedValue})`} />,
    },
    {
      title: 'Word Count',
      content: <FormattedNumber value={wordCount} />,
    },
    {
      title: 'Total Price',
      content: (
        <TaskPrice showTooltip showFootnoteMark={status === taskStatus.Created && !isIncomplete} value={currentPrice} />
      ),
      footer: <EthFiatValue amount={currentPrice} render={({ formattedValue }) => `(${formattedValue})`} />,
    },
    {
      title: 'Quality Tier',
      content: name,
      footer: `(${requiredLevel === 'C2' ? 'C2' : requiredLevel + '+'})`,
    },
  ];

  const cardProps = isIncomplete ? taskStatusToProps.incomplete : taskStatusToProps[status];

  const address = getAddressByLanguageAndChain(lang, chainId);
  const url = getTaskDetailsRoute({ id: `${address}/${taskID}` });

  return (
    <StyledTaskCard
      $colorKey={cardProps.colorKey}
      title={cardProps.title}
      titleLevel={2}
      footer={<TaskCardFooter data={data} contractAddress={address} {...footerProps} />}
    >
      <MainLink href={url}>See More</MainLink>
      <TaskLanguages fullWidth source={sourceLanguage} target={targetLanguage} />
      <Spacer />
      <Tooltip title={title} placement="top" mouseEnterDelay={0.5} arrowPointAtCenter>
        <div
          css={`
            cursor: help;
            position: relative;
            z-index: 2;
          `}
        >
          <StyledTaskTitle level={3}>{title}</StyledTaskTitle>
        </div>
      </Tooltip>
      <TaskInfoGrid size="small" data={taskInfo} />
    </StyledTaskCard>
  );
}

TaskCard.propTypes = {
  data: t.shape({
    deadline: t.string.isRequired,
    lang: t.string.isRequired,
    lastInteraction: t.string.isRequired,
    minPrice: t.string.isRequired,
    maxPrice: t.string.isRequired,
    requester: t.string.isRequired,
    requesterDeposit: t.string.isRequired,
    submissionTimeout: t.string.isRequired,
    status: t.oneOf(Object.values(taskStatus)).isRequired,
    taskID: t.string.isRequired,
    translation: t.string.isRequired,
  }),
  metadata: t.shape({
    title: t.string.isRequired,
    sourceLanguage: t.string.isRequired,
    targetLanguage: t.string.isRequired,
    wordCount: t.number.isRequired,
    expectedQuality: t.string.isRequired,
  }),
  footerProps: t.object,
};

TaskCard.defaultProps = {
  footerProps: {},
};

const MainLink = styled.a`
  display: block;
  text-indent: -9999px;
  height: 0;

  ::after {
    content: '';
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
`;

const StyledTaskCard = styled(Card)`
  && {
    overflow: hidden;
    position: relative;
    height: 100%;
    border-radius: 3px;
    transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);
    z-index: 1;

    @media (hover: hover) and (min-width: 576px) {
      :active,
      :hover {
        transform: scale(1.025);
        z-index: 2;
        box-shadow: 0 4px 6px 2px ${props => props.theme.color.shadow.default};
      }
    }

    @media (hover: none) {
      ::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 10;
        pointer-events: none;
        background: radial-gradient(
            circle,
            ${p => p.theme.hexToRgba(p.theme.color.secondary.default, 0.25)} 1%,
            transparent 1%
          )
          center/25000% no-repeat;
        transform: scale(2, 2);
        opacity: 0;
        transition: all 0.5s;
      }

      :active {
        ::after {
          background-size: 0%;
          transform: scale(0, 0);
          opacity: 1;
          transition: none;
        }
      }
    }

    // Interactive elements
    a:not(${MainLink}),
    details,
    button {
      position: relative;
      z-index: 2;
    }

    .card-header {
      background-color: ${p => p.theme.hexToRgba(p.theme.color.status[p.$colorKey], '0.06')};
      color: ${p => p.theme.color.status[p.$colorKey]};
      border: none;
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
      border-top: 5px solid;
      padding-top: calc(1rem - 2.5px);
    }

    @media (max-width: 575.98px) {
      border-radius: 0;

      .card-header {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      }
    }

    .ant-badge-status-dot {
      background-color: ${p => p.theme.color.status[p.$colorKey]};
    }

    .ant-badge-status-text,
    .card-header-title {
      font-size: ${p => p.theme.fontSize.md};
      font-weight: ${p => p.theme.fontWeight.regular};
      color: inherit;
      text-align: left;
    }

    .card-header-title {
      display: flex;
      justify-content: space-between;
      align-items: center;

      svg {
        fill: currentColor;
      }
    }
  }
`;

const StyledTaskTitle = styled(Typography.Title)`
  && {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${props => props.theme.color.text.lighter};
    font-size: ${props => props.theme.fontSize.md};
    font-weight: ${p => p.theme.fontWeight.regular};
    margin-bottom: 1rem;
  }
`;
