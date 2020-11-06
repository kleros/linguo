import React from 'react';
import t from 'prop-types';

export function PopupNotificationWithLink({ url, text }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );
}

PopupNotificationWithLink.propTypes = {
  url: t.string.isRequired,
  text: t.string.isRequired,
};
