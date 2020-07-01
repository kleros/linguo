import produce from 'immer';
import { nanoid } from 'nanoid';

const actionIdMiddleware = () => next => action => next(Array.isArray(action) ? action : assignId(action));

export default actionIdMiddleware;

const assignId = produce(action => {
  action.meta = action.meta ?? {};

  const id = nanoid(10);

  if (action.meta.id) {
    action.meta.groupId = action.meta.id;
    action.meta.id = id;
  } else {
    action.meta.groupId = id;
    action.meta.id = id;
  }
});
