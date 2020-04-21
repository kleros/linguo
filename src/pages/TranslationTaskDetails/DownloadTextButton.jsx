import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import Button from '~/components/Button';

const JumboButton = styled(Button)`
  font-size: ${p => p.theme.fontSize.xxl};
  height: 6rem;
  border-radius: 0.75rem;
  padding: 0 2rem;
  border: 5px solid ${p => p.theme.color.border.default};

  &.ant-btn {
    :hover,
    :focus {
      border-color: ${p => p.theme.color.border.default};
    }
  }
`;

function DownloadTextButton({ ID, text }) {
  const [href, setHref] = React.useState('data:text/plain,');

  React.useEffect(() => {
    const blob = new Blob([text], { type: 'text/plain' });
    const dataUrl = URL.createObjectURL(blob);
    setHref(dataUrl);

    return () => {
      URL.revokeObjectURL(dataUrl);
    };
  }, [text]);

  return (
    <a href={href} download={`linguo-translation-text-${ID}.txt`}>
      <JumboButton>Download the Translation Text</JumboButton>
    </a>
  );
}

DownloadTextButton.propTypes = {
  ID: t.number.isRequired,
  text: t.string.isRequired,
};

export default DownloadTextButton;
