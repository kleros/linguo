import React from 'react';
import t from 'prop-types';
import VisibilitySensor from 'react-visibility-sensor';

export default function OverlayFooter({ children }) {
  const [isVisible, setVisible] = React.useState(true);
  return (
    <>
      <VisibilitySensor onChange={setVisible}>{children}</VisibilitySensor>
      <div
        css={`
          display: ${!isVisible ? 'block' : 'none'};
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 10;
          background-color: ${p => p.theme.color.background.light};
          padding: 1rem;
          box-shadow: -4px 0 4px ${p => p.theme.color.shadow.ui};
        `}
      >
        <div
          css={`
            margin: 0 auto;
            max-width: 74rem;
            padding: 0 8rem;

            @media (max-width: 767.98px) {
              padding: 0 6rem;
            }

            @media (max-width: 575.98px) {
              padding: 0 1rem;
            }
          `}
        >
          {children}
        </div>
      </div>
    </>
  );
}

OverlayFooter.propTypes = {
  children: t.node,
};

OverlayFooter.defaultProps = {
  children: null,
};
