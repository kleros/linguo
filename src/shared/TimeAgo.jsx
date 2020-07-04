import React from 'react';
import t from 'prop-types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

function TimeAgo({ className, date }) {
  return <span className={className}>{dayjs(date).fromNow()}</span>;
}

TimeAgo.propTypes = {
  className: t.string,
  date: t.oneOfType([t.string, t.instanceOf(Date)]).isRequired,
};

TimeAgo.defaultProps = {
  className: '',
};

export default TimeAgo;
