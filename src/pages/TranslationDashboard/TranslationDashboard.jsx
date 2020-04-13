import React from 'react';
import RequiredWalletGateway from '~/components/RequiredWalletGateway';
import MultiCardLayout from '../layouts/MultiCardLayout';
import TaskCardList from './TaskCardList';

function TranslationDashboard() {
  // TODO: add filters

  return (
    <MultiCardLayout>
      <RequiredWalletGateway message="To view your requested translation tasks you need an Ethereum wallet.">
        <TaskCardList />
      </RequiredWalletGateway>
    </MultiCardLayout>
  );
}

export default TranslationDashboard;
