import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import TopLoadingBar from '~/features/shared/TopLoadingBar';
import { selectIsLoadingById } from '~/features/tasks/tasksSlice';
import RequiredWeb3Gateway from '~/features/web3/RequiredWeb3Gateway';
import SingleCardLayout from '../layouts/SingleCardLayout';
import TaskFetcher from './TaskFetcher';

function TranslationDetails() {
  const { id } = useParams();
  const isLoading = useSelector(selectIsLoadingById(id));

  return (
    <SingleCardLayout title="Translation Task Details" beforeContent={<TopLoadingBar show={isLoading} />}>
      <RequiredWeb3Gateway>
        <TaskFetcher />
      </RequiredWeb3Gateway>
    </SingleCardLayout>
  );
}

export default TranslationDetails;
