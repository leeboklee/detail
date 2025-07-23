import React from 'react';

/**
 * Material Design 아이콘을 렌더링하는 컴포넌트
 * @param {Object} props
 * @param {string} props.name - 아이콘 이름
 * @param {string} props.className - 추가 CSS 클래스
 * @param {Object} props.style - 인라인 스타일
 * @returns {JSX.Element}
 */
const Icon = ({ name, className = '', style = {} }) => {
  return (
    <span 
      className={`material-icons ${className}`} 
      style={style}
    >
      {name}
    </span>
  );
};

export default Icon; 