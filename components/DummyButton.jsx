import React from 'react';

const DummyButton = ({ onClick, children }) => {
  return (
    <button onClick={onClick}>
      {children || 'Dummy Button'}
    </button>
  );
};

export default DummyButton; 