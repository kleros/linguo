import React from 'react';
import { Row, Col } from 'antd';
import Card from '~/components/Card';
import { useWeb3React } from '~/app/web3React';
import { useLinguoContract } from '~/api/linguo';
import RemainingTaskTime from '~/components/RemainingTaskTime';
import MultiCardLayout from '../layouts/MultiCardLayout';
import CardTitle from './CardTitle';

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
        {tasks.map(({ ID, status, lastInteraction, submissionTimeout, sourceLanguage, targetLanguage, ...rest }) => {
          console.log({ ID, status, lastInteraction, submissionTimeout, sourceLanguage, targetLanguage, ...rest });
          return (
            <Col key={ID} xs={24} sm={24} md={16} lg={8}>
              <Card title={<CardTitle sourceLanguage={sourceLanguage} targetLanguage={targetLanguage} />}>
                <RemainingTaskTime
                  status={status}
                  lastInteraction={lastInteraction}
                  submissionTimeout={submissionTimeout}
                />
              </Card>
            </Col>
          );
        })}
      </Row>
    </MultiCardLayout>
  );
}

export default TranslationDashboard;
