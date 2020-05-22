import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Redirect } from 'react-router-dom';
import { Row, Col, Typography, Alert } from 'antd';
import { InfoIcon } from '~/components/icons';
import * as r from '~/app/routes';
import TaskListContext from './TaskListContext';
import TaskCard from './TaskCard';
import filters, { useFilterName, getFilter } from './filters';
import { getComparator } from './sorting';

function TaskList() {
  const data = React.useContext(TaskListContext);
  const shouldRedirect = data.length === 0;

  const [filterName] = useFilterName();

  const displayableData = React.useMemo(() => sort(filter(data, getFilter(filterName)), getComparator(filterName)), [
    data,
    filterName,
  ]);
  const showFootnote = [filters.open].includes(filterName) && displayableData.length > 0;
  const showFilterDescription = displayableData.length > 0;

  return shouldRedirect ? (
    <Redirect
      to={{
        pathname: r.TRANSLATION_REQUEST,
        state: {
          message: 'You have no translation requests yet! You can create one here.',
        },
      }}
    />
  ) : (
    <>
      {showFilterDescription && filterDescriptionMap[filterName]}
      <DisplayableTaskList data={displayableData} showFootnote={showFootnote} />
    </>
  );
}

TaskList.propTypes = {};

export default TaskList;

const sort = (data, comparator) => [...data].sort(comparator);
const filter = (data, predicate) => data.filter(predicate);

const filterDescriptionMap = {
  [filters.incomplete]: (
    <Alert
      showIcon
      css={`
        margin-bottom: 1rem;
      `}
      icon={<InfoIcon />}
      type="info"
      message="Incomplete taks are those which were not assigned to any translator or whose translator did not submit the translated text within the specified deadline."
    />
  ),
};

function DisplayableTaskList({ data, showFootnote }) {
  return data.length === 0 ? (
    <StyledEmptyListText>Wow, such empty! There are currently no tasks.</StyledEmptyListText>
  ) : (
    <>
      <StyledTaskCountText>
        Total of {data.length} {pluralize(data.length, { single: 'task', many: 'tasks' })}
      </StyledTaskCountText>
      <StyledListWrapper>
        <StyledRow
          gutter={[
            { xs: 0, sm: 32 },
            { xs: 16, sm: 32 },
          ]}
        >
          {data.map(task => {
            return (
              <Col key={task.ID} xs={24} sm={24} md={12} lg={8}>
                <TaskCard {...task} />
              </Col>
            );
          })}
        </StyledRow>
      </StyledListWrapper>
      {showFootnote && (
        <StyledFootnote>
          <sup>*</sup>Approximate value: the actual price is defined when a translator is assigned to the task.
        </StyledFootnote>
      )}
    </>
  );
}

DisplayableTaskList.propTypes = {
  data: t.arrayOf(t.object).isRequired,
  showFootnote: t.bool,
};

DisplayableTaskList.defaultProps = {
  showFootnote: false,
};

const pluralize = (quantity, { single, many }) => (quantity === 1 ? single : many);

const StyledListWrapper = styled.div`
  @media (max-width: 575.98px) {
    margin: 0 -1.5rem;
  }
`;

const StyledRow = styled(Row)`
  // make cards in the same row to have the same height
  align-items: stretch;
`;

const StyledFootnote = styled(Typography.Paragraph)`
  && {
    margin: 0;
    font-size: ${props => props.theme.fontSize.sm};

    @media (max-width: 575.98px) {
      margin: 1rem 0 2rem;
    }
  }
`;

const StyledEmptyListText = styled(Typography.Paragraph)`
  && {
    font-size: ${props => props.theme.fontSize.xl};
    text-align: center;
    margin: 2rem 0;
  }
`;

const StyledTaskCountText = styled(Typography.Paragraph)`
  && {
    font-size: ${props => props.theme.fontSize.sm};
    text-align: right;
    margin: 0 0 1rem;
  }
`;
