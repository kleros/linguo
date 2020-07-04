import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';

function DownloadLink({ children, download }) {
  const { content, url } = download;

  if (!url) {
    return <DownloadLinkFromText content={content}>{children}</DownloadLinkFromText>;
  }

  return (
    <StyledLink target="_blank" rel="noreferrer noopener" href={url}>
      {children}
    </StyledLink>
  );
}

DownloadLink.propTypes = {
  children: t.node.isRequired,
  download: t.oneOfType([
    t.shape({
      content: t.string.isRequired,
    }),
    t.shape({
      url: t.string.isRequired,
    }),
  ]).isRequired,
};

export default DownloadLink;

function DownloadLinkFromText({ content, children }) {
  const href = useObjectUrlForContent(content);

  return (
    <StyledLink href={href} target="_blank" rel="noreferrer noopener">
      {children}
    </StyledLink>
  );
}

DownloadLinkFromText.propTypes = {
  children: t.node.isRequired,
  content: t.string.isRequired,
};

const useObjectUrlForContent = content => {
  const [url, setUrl] = React.useState('data:text/plain,');
  React.useEffect(() => {
    /**
     * By prepending '\ufeff' to the content, the text will be displayed with the proper charset.
     * @see { @link https://stackoverflow.com/a/17879474/1798341 }
     */
    const blob = new Blob(['\ufeff', content], { type: 'text/plain;charset=utf-8' });
    const dataUrl = URL.createObjectURL(blob);
    setUrl(dataUrl);

    return () => {
      URL.revokeObjectURL(dataUrl);
    };
  }, [content]);

  return url;
};

const StyledLink = styled.a`
  max-width: 100%;

  @media (max-width: 575.98px) {
    display: block;
    width: 100%;
  }
`;
