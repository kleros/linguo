import React from 'react';
import t from 'prop-types';
import styled, { css } from 'styled-components';
import VisibilitySensor from 'react-visibility-sensor';

export default function AffixContainer({ children, position, wrapperCss, className }) {
  const [isVisible, setVisible] = React.useState(true);
  const [scrollDirection, setScrollDirection] = React.useState(position);

  const showAffix = !isVisible && scrollDirection === position;

  const lastScrollPosRef = React.useRef(0);

  React.useEffect(() => {
    const listener = () => {
      if (window.scrollY > lastScrollPosRef.current) {
        setScrollDirection('bottom');
      }
      if (window.scrollY < lastScrollPosRef.current) {
        setScrollDirection('top');
      }

      lastScrollPosRef.current = window.scrollY;
    };

    window.addEventListener('scroll', listener, true);

    return () => window.removeEventListener('scroll', listener);
  }, []);

  const positioningStyles =
    position === 'bottom'
      ? css`
          bottom: 0;
        `
      : css`
          top: 0;
        `;
  const displayStyles = showAffix
    ? css`
        opacity: 1;
      `
    : css`
        opacity: 0;
        pointer-events: none;
      `;

  return (
    <>
      <VisibilitySensor onChange={setVisible}>{children}</VisibilitySensor>
      <div
        className={className}
        css={`
          position: fixed;
          transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);
          ${displayStyles}
          ${positioningStyles}
          left: 0;
          right: 0;
          z-index: 10;
          background-color: ${p => p.theme.color.background.light};
          padding: 1rem;
          box-shadow: -4px 0 4px ${p => p.theme.color.shadow.ui};
        `}
      >
        <StyledWrapper css={wrapperCss}>{children}</StyledWrapper>
      </div>
    </>
  );
}

AffixContainer.propTypes = {
  children: t.node,
  position: t.oneOf(['bottom', 'top']),
  wrapperCss: t.arrayOf(t.string),
  className: t.string,
};

AffixContainer.defaultProps = {
  children: null,
  position: 'bottom',
  wrapperCss: [],
  className: '',
};

const StyledWrapper = styled.div`
  margin: 0 auto;
  max-width: 74rem;
  padding: 0 8rem;

  @media (max-width: 767.98px) {
    padding: 0 6rem;
  }

  @media (max-width: 575.98px) {
    padding: 0 1rem;
  }
`;
