import React from 'react';
import styled from 'styled-components';
import { Row, Col } from 'antd';
import { useWeb3React } from '~/app/web3React';
import { useLinguoContract } from '~/api/linguo';
import MultiCardLayout from '../layouts/MultiCardLayout';
import TaskCard from './TaskCard';

const StyledRow = styled(Row)`
  align-items: stretch;
`;

function TranslationDashboard() {
  const { library: web3, chainId, account } = useWeb3React();
  const linguo = useLinguoContract({ web3, chainId });

  const [tasks, setTasks] = React.useState([]);

  const fetchTasks = React.useCallback(async () => {
    setTasks(await linguo.api.getOwnTasks(account));
  }, [linguo.api, account]);

  React.useEffect(() => {
    if (linguo.isReady) {
      fetchTasks();
    }
  }, [linguo.isReady, fetchTasks]);

  return (
    <MultiCardLayout>
      <StyledRow gutter={[32, { xs: 0, sm: 32 }]}>
        {tasks.map(task => {
          return (
            <Col key={task.ID} xs={24} sm={24} md={12} lg={8}>
              <TaskCard {...task} />
            </Col>
          );
        })}
      </StyledRow>
    </MultiCardLayout>
  );
}

export default TranslationDashboard;
