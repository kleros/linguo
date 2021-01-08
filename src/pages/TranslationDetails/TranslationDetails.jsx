import React from 'react';
import { Titled } from 'react-titled';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import TopLoadingBar from '~/shared/TopLoadingBar';
import { selectIsLoadingById } from '~/features/tasks/tasksSlice';
import { selectIsLoadingByTaskId } from '~/features/disputes/disputesSlice';
import RequiredWalletGateway from '~/features/web3/RequiredWalletGateway';
import SingleCardLayout from '../layouts/SingleCardLayout';
import TaskFetcher from './TaskFetcher';

function TranslationDetails() {
  const { id } = useParams();
  const isTaskLoading = useSelector(selectIsLoadingById(id));
  const isDisputeLoading = useSelector(selectIsLoadingByTaskId(id));
  const isLoading = isTaskLoading || isDisputeLoading;

  return (
    <Titled title={title => `Translation Details | ${title}`}>
      <SingleCardLayout title="Translation Task Details" beforeContent={<TopLoadingBar show={isLoading} />}>
        <RequiredWalletGateway message="To view the details of this translation task you need an Ethereum Wallet.">
          <TaskFetcher />
        </RequiredWalletGateway>
      </SingleCardLayout>
    </Titled>
  );
}

export default TranslationDetails;
