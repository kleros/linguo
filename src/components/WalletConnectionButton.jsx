import React from 'react';
import t from 'prop-types';
import { Badge } from 'antd';
import { useSelector } from 'react-redux';
import { selectState } from '~/features/web3/web3Slice';
import Button from '~/shared/Button';
import WalletConnectionModal from './WalletConnectionModal';
import { useWeb3 } from '~/hooks/useWeb3';
import { useConnect } from '~/hooks/useConnect';

const stateToPropsMap = {
  connecting: {
    color: 'orange',
    text: 'Connecting...',
  },
  connected: {
    color: 'green',
    text: 'Disconnect',
  },
  idle: {
    color: 'red',
    text: 'Connect to Wallet',
  },
  errored: {
    color: 'red',
    text: 'Connect to Wallet',
  },
};

function WalletConnectionButton({ children, ...props }) {
  const { disconnect } = useConnect();

  const { account } = useWeb3();
  const web3State = useSelector(selectState);
  const hasWallet = !!account;
  /**
   * If the user has not selected a wallet yet, the app will connect to
   * the default network-only provider and its state will be `connected`.
   * However, since there is no wallet, the state should still be considered
   * `idle` in what concerns this component
   */
  const buttonState = web3State === 'connected' && !hasWallet ? 'idle' : web3State;

  const [modalVisible, setModalVisible] = React.useState(false);

  const handleButtonClick = React.useCallback(async () => {
    if (buttonState === 'connected') {
      disconnect();
    } else {
      setModalVisible(true);
    }
  }, [buttonState, disconnect]);

  const handleModalCancel = React.useCallback(() => {}, []);

  const { text, color } = stateToPropsMap[buttonState] ?? {};

  return (
    <>
      <Button {...props} disabled={buttonState === 'connecting'} onClick={handleButtonClick}>
        {children ?? (
          <>
            <Badge color={color} /> {text}
          </>
        )}
      </Button>
      <WalletConnectionModal visible={modalVisible} setVisible={setModalVisible} onCancel={handleModalCancel} />
    </>
  );
}

WalletConnectionButton.propTypes = {
  children: t.node,
};

WalletConnectionButton.defaultProps = {
  children: null,
};

export default WalletConnectionButton;
