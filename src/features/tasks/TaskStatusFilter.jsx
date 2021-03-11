import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Badge, Select } from 'antd';
import theme from '~/features/ui/theme';

export default function TaskStatusFilter({ fullWidth, onChange, defaultValue }) {
  return (
    <StyledSelect
      filterOption={false}
      size="large"
      listHeight={368}
      dropdownRender={menu => <StyledItemWrapper>{menu}</StyledItemWrapper>}
      $fullWidth={fullWidth}
      onChange={onChange}
      defaultValue={defaultValue}
      options={filterOptions}
    />
  );
}

TaskStatusFilter.propTypes = {
  onChange: t.func,
  defaultValue: t.string,
  fullWidth: t.bool,
};

TaskStatusFilter.defaultProps = {
  onChange: () => {},
  defaultValue: 'all',
  fullWidth: false,
};

const filterOptions = [
  {
    value: 'all',
    label: <Badge color={theme.color.text.default} text="All Status" />,
  },
  {
    value: 'open',
    label: <Badge color={theme.color.status.open} text="Open Task" />,
  },
  {
    value: 'inProgress',
    label: <Badge color={theme.color.status.inProgress} text="In Progress" />,
  },
  {
    value: 'inReview',
    label: <Badge color={theme.color.status.inReview} text="In Review" />,
  },
  {
    value: 'inDispute',
    label: <Badge color={theme.color.status.inDispute} text="In Dispute" />,
  },
  {
    value: 'finished',
    label: <Badge color={theme.color.status.finished} text="Finished" />,
  },
  {
    value: 'incomplete',
    label: <Badge color={theme.color.status.incomplete} text="Incomplete" />,
  },
];

const StyledSelect = styled(Select)`
  && {
    ${p => (p.$fullWidth ? 'width: 100%' : '')}
  }
`;

const StyledItemWrapper = styled.div`
  && {
    .ant-select-item {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }

    .ant-select-item-option-selected {
      border-left: 3px solid ${p => p.theme.color.secondary.default};
      padding-left: 9px; // Default value is 12px, so we set to 9px to account for the border
    }

    .ant-select-item-option-selected,
    .ant-select-item-option-active {
      &:not(.ant-select-item-option-disabled) {
        background-color: ${p => p.theme.hexToRgba(p.theme.color.secondary.default, 0.06)};
      }
    }
  }
`;
