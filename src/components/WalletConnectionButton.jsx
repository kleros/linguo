import React from 'react';
import { Badge } from 'antd';
import { useWeb3React } from '~/app/web3React';
import { useSettings, WEB3_PROVIDER } from '~/app/settings';
import Button from '~/components/Button';
import WalletConnectionModal from '~/components/WalletConnectionModal';

const connectionButtonStateMachine = {
  initial: 'disconnected',
  states: {
    disconnected: {
      on: {
        CONNECT: 'connecting',
        SUCCESS: 'connected',
      },
    },
    connecting: {
      on: {
        ABORT: 'disconnected',
        SUCCESS: 'connected',
      },
    },
    connected: {
      on: {
        DISCONNECT: 'disconnected',
      },
    },
  },
};

const connectionButtonStateReducer = (state, action) => {
  return connectionButtonStateMachine.states[state]?.on?.[action] || state;
};

const stateToPropsMap = {
  connecting: {
    color: 'orange',
    text: 'Connecting to wallet...',
  },
  connected: {
    color: 'green',
    text: 'Disconnect',
  },
  disconnected: {
    color: 'red',
    text: 'Connect to wallet',
  },
};

function WalletConnectionButton(props) {
  const [state, send] = React.useReducer(connectionButtonStateReducer, connectionButtonStateMachine.initial);

  const { active, account, error, activatingConnector, deactivate } = useWeb3React();
  React.useEffect(() => {
    const isActivatingConnector = !!activatingConnector;
    if (isActivatingConnector) {
      send('CONNECT');
    }
    if (error) {
      send('ABORT');
    }
    const isConnectedToWallet = !!(active && account);
    if (isConnectedToWallet) {
      send('SUCCESS');
    }
  }, [active, account, error, activatingConnector]);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [_, setWeb3ProviderSettings] = useSettings(WEB3_PROVIDER);

  const handleButtonClick = async () => {
    if (state === 'disconnected') {
      setModalVisible(true);
    } else {
      deactivate();
      setWeb3ProviderSettings({
        allowEagerConnection: false,
        connectorName: undefined,
      });
      send('DISCONNECT');
    }
  };

  const handleModalCancel = () => {
    send('ABORT');
  };

  return (
    <>
      <Button {...props} disabled={state === 'connecting'} onClick={handleButtonClick}>
        <Badge color={stateToPropsMap[state].color} /> {stateToPropsMap[state].text}
      </Button>
      <WalletConnectionModal visible={modalVisible} setVisible={setModalVisible} onCancel={handleModalCancel} />
    </>
  );
}

export default WalletConnectionButton;
