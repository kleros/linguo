import React from 'react';
import styled from 'styled-components';
import Button from '~/components/Button';
import TaskContext from './TaskContext';

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

  @media (max-width: 575.98px) {
    display: block;
    width: 100%;
    font-size: ${p => p.theme.fontSize.xl};
  }
`;

const StyledLink = styled.a`
  text-decoration: none !important;

  @media (max-width: 575.98px) {
    display: block;
    width: 100%;
  }
`;

const useObjectUrlForText = text => {
  const [url, setUrl] = React.useState('data:text/plain,');
  React.useEffect(() => {
    const blob = new Blob([text], { type: 'text/plain' });
    const dataUrl = URL.createObjectURL(blob);
    setUrl(dataUrl);

    return () => {
      URL.revokeObjectURL(dataUrl);
    };
  }, [text]);

  return url;
};

function DownloadTextButton() {
  const { ID, text } = React.useContext(TaskContext);
  const href = useObjectUrlForText(text);

  return (
    <StyledLink href={href} download={`linguo-translation-text-${ID}.txt`}>
      <JumboButton>Download the Original Text</JumboButton>
    </StyledLink>
  );
}

export default DownloadTextButton;
