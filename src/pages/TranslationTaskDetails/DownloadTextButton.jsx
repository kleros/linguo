import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import Button from '~/components/Button';

function DownloadTextButton({ children, download, buttonProps }) {
  const { content, url } = download;

  if (!url) {
    return (
      <DownloadTextButtonFromText content={content}>
        <JumboButton {...buttonProps}>{children}</JumboButton>
      </DownloadTextButtonFromText>
    );
  }

  return (
    <StyledLink target="_blank" rel="noreferrer noopener" href={url}>
      <JumboButton {...buttonProps}>{children}</JumboButton>
    </StyledLink>
  );
}

DownloadTextButton.propTypes = {
  children: t.node.isRequired,
  download: t.oneOfType([
    t.shape({
      content: t.string.isRequired,
    }),
    t.shape({
      url: t.string.isRequired,
    }),
  ]).isRequired,
  buttonProps: t.object,
};

export default DownloadTextButton;

function DownloadTextButtonFromText({ content, children }) {
  const href = useObjectUrlForContent(content);

  return (
    <StyledLink href={href} target="_blank" rel="noreferrer noopener">
      {children}
    </StyledLink>
  );
}

DownloadTextButtonFromText.propTypes = {
  children: t.node.isRequired,
  content: t.string.isRequired,
};

const useObjectUrlForContent = content => {
  const [url, setUrl] = React.useState('data:text/plain,');
  React.useEffect(() => {
    const blob = new Blob([content], { type: 'text/plain' });
    const dataUrl = URL.createObjectURL(blob);
    setUrl(dataUrl);

    return () => {
      URL.revokeObjectURL(dataUrl);
    };
  }, [content]);

  return url;
};

const JumboButton = styled(Button)`
  font-size: ${p => p.theme.fontSize.xxl};
  height: 6rem;
  border-radius: 0.75rem;
  padding: 0 2rem;
  border: 5px solid ${p => p.theme.color.border.default};
  max-width: 100%;

  &.ant-btn {
    :hover,
    :focus {
      border-color: ${p => p.theme.color.border.default};
    }
  }

  @media (max-width: 575.98px) {
    display: block;
    width: 100%;
  }
`;

const StyledLink = styled.a`
  max-width: 100%;

  @media (max-width: 575.98px) {
    display: block;
    width: 100%;
  }
`;
