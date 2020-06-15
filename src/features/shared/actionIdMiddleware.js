import produce from 'immer';
import { nanoid } from 'nanoid';

const actionIdMiddleware = () => next => action => next(Array.isArray(action) ? action : assignId(action));

export default actionIdMiddleware;

const assignId = produce(action => {
  action.meta = action.meta ?? {};
  action.meta.id = action.meta?.id ?? nanoid(10);
});
