import React from 'react';
import { Row, Col } from 'antd';
import { useWeb3React } from '~/app/web3React';
import { useLinguoContract } from '~/api/linguo';
import MultiCardLayout from '../layouts/MultiCardLayout';
import TaskCard from './TaskCard';

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
      <Row gutter={[30, 30]}>
        {tasks.map(task => {
          return (
            <Col key={task.ID} xs={24} sm={24} md={16} lg={8}>
              <TaskCard {...task} />
            </Col>
          );
        })}
      </Row>
    </MultiCardLayout>
  );
}

export default TranslationDashboard;
