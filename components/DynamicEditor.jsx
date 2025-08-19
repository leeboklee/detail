import React from 'react';
import Editor from '@monaco-editor/react';

const DynamicEditor = ({ height, value, onChange, onMount }) => {
  return (
    <Editor
      height={height || "calc(100% - 40px)"}
      defaultLanguage="html"
      theme="vs-dark"
      value={value}
      onChange={onChange}
      onMount={onMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        automaticLayout: true,
      }}
    />
  );
};

export default DynamicEditor; 