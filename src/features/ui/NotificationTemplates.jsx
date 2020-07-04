import React from 'react';
import t from 'prop-types';

export function NotificationWithLink({ url, text }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );
}

NotificationWithLink.propTypes = {
  url: t.string.isRequired,
  text: t.string.isRequired,
};
