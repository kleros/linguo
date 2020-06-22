import { eventChannel, END } from 'redux-saga';

export default function createTtlChannel(ttl, payload) {
  return eventChannel(emit => {
    const handler = setTimeout(() => {
      emit(payload);
      emit(END);
    }, ttl);

    return () => clearTimeout(handler);
  });
}
