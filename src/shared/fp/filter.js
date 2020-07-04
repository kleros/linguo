import curry from './curry';

const allowAll = () => true;

const filter = (pred, arr) => (arr ?? []).filter(pred ?? allowAll);

export default curry(filter);
