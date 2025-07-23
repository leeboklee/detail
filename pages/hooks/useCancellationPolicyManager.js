import { useState, useEffect } from 'react';

function isArrayEqual(a, b) {
  return Array.isArray(a) && Array.isArray(b) && JSON.stringify(a) === JSON.stringify(b);
}

export default function useCancellationPolicyManager(initialData = [], onChange) {
  const [policies, setPolicies] = useState(Array.isArray(initialData) ? initialData : []);

  useEffect(() => {
    if (Array.isArray(initialData)) {
      if (!isArrayEqual(initialData, policies)) {
        setPolicies(initialData);
      }
    } else if (policies.length !== 0) {
      setPolicies([]);
    }
    // eslint-disable-next-line
  }, [initialData]);

  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange(policies);
    }
  }, [policies, onChange]);

  const handleAddPolicy = () => {
    setPolicies([...policies, { content: '' }]);
  };

  const handleRemovePolicy = (index) => {
    setPolicies(policies.filter((_, i) => i !== index));
  };

  const handleUpdatePolicy = (index, value) => {
    const updated = [...policies];
    updated[index] = { ...updated[index], content: value };
    setPolicies(updated);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddPolicy();
      e.preventDefault();
    }
  };

  return {
    policies,
    setPolicies,
    handleAddPolicy,
    handleRemovePolicy,
    handleUpdatePolicy,
    handleKeyPress
  };
} 