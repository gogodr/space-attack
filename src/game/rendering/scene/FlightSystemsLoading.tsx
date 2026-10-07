import type { CSSProperties } from 'react';

const style: CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 10,
  display: 'grid',
  placeItems: 'center',
  background: '#071522',
  color: '#72e8e4',
  fontSize: 14,
};

export function FlightSystemsLoading() {
  return (
    <div role="status" style={style}>
      Initializing flight systems…
    </div>
  );
}
