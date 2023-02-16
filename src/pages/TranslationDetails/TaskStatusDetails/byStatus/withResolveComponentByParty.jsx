import React from 'react';
import useCurrentParty from '~/hooks/useCurrentParty';

const NoContent = () => null;

export default function withResolveComponentByParty(components) {
  return function ResolveComponentsByParty() {
    const party = useCurrentParty();
    const Component = components[party] || NoContent;

    return <Component />;
  };
}
