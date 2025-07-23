import { useState, useCallback } from 'react';

export default function usePackageManager(packages = [], onPackagesChange) {
  const [newPackage, setNewPackage] = useState({ name: '', description: '', imageUrl: '', price: '', options: [] });
  const [newOption, setNewOption] = useState('');
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(null);

  const triggerChange = (updatedPackages) => {
    if (typeof onPackagesChange === 'function') {
      onPackagesChange(updatedPackages);
    }
  };

  const handleNewPackageChange = useCallback((field, value) => {
    if (field === 'price' && value && !/^[0-9]*\.?[0-9]*$/.test(value)) return;
    setNewPackage(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSelectPackage = useCallback((index) => {
    setSelectedPackageIndex(prev => prev === index ? null : index);
  }, []);

  const handleNewOptionChange = useCallback((e) => {
    setNewOption(e.target.value);
  }, []);

  const handleAddPackage = useCallback(() => {
    if (!newPackage.name || !newPackage.name.trim()) return;
    
    const packageToAdd = {
      id: Date.now().toString(),
      ...newPackage,
      name: newPackage.name.trim(),
      description: (newPackage.description || '').trim(),
      additionalDescription: (newPackage.additionalDescription || '').trim(),
      price: newPackage.price ? Number(newPackage.price) : 0,
      options: Array.isArray(newPackage.options) ? [...newPackage.options] : [],
      imageUrl: newPackage.imageUrl || '',
    };
    
    triggerChange(prevPackages => [...prevPackages, packageToAdd]);
    
    setNewPackage({ name: '', description: '', additionalDescription: '', imageUrl: '', price: '', options: [] });
  }, [newPackage, triggerChange]);

  const handleRemovePackage = useCallback((index) => {
    triggerChange(prevPackages => prevPackages.filter((_, i) => i !== index));
    
    setSelectedPackageIndex(prev => {
      if (prev === index) return null;
      if (prev > index) return prev - 1;
      return prev;
    });
  }, [triggerChange]);

  const handleUpdatePackage = useCallback((index, field, value) => {
    triggerChange(prevPackages => prevPackages.map((pkg, i) => {
      if (i === index) {
        const updatedPackage = { ...pkg };
        if (field === 'price') {
          updatedPackage[field] = value ? Number(value) : 0;
        } else {
          updatedPackage[field] = value;
        }
        return updatedPackage;
      }
      return pkg;
    }));
  }, [triggerChange]);

  const handleAddOption = useCallback(() => {
    if (!newOption.trim() || selectedPackageIndex === null) return;
    
    triggerChange(prevPackages => prevPackages.map((pkg, i) => {
      if (i === selectedPackageIndex) {
        const updatedPackage = { ...pkg };
        if (!Array.isArray(updatedPackage.options)) {
          updatedPackage.options = [];
        }
        updatedPackage.options = [...updatedPackage.options, newOption.trim()];
        return updatedPackage;
      }
      return pkg;
    }));
    
    setNewOption('');
  }, [newOption, selectedPackageIndex, triggerChange]);

  const handleRemoveOption = useCallback((packageIndex, optionIndex) => {
    triggerChange(prevPackages => prevPackages.map((pkg, i) => {
      if (i === packageIndex) {
        const updatedPackage = { ...pkg };
        if (Array.isArray(updatedPackage.options)) {
          updatedPackage.options = updatedPackage.options.filter((_, j) => j !== optionIndex);
        }
        return updatedPackage;
      }
      return pkg;
    }));
  }, [triggerChange]);

  const handleKeyPress = useCallback((e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  }, []);

  return {
    newPackage,
    setNewPackage,
    newOption,
    setNewOption,
    selectedPackageIndex,
    setSelectedPackageIndex,
    handleAddPackage,
    handleRemovePackage,
    handleUpdatePackage,
    handleAddOption,
    handleRemoveOption,
    handleNewPackageChange,
    handleSelectPackage,
    handleNewOptionChange,
    handleKeyPress
  };
} 