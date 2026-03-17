import React from 'react';

import { useTabContext } from './Tab';

interface ItemProps {
  value: string;
  className?: string;
  children: (props: { isActive: boolean }) => React.ReactNode;
}

const Item: React.FC<ItemProps> = ({ value, className, children }) => {
  const { selectedTab, setSelectedTab, onTabChange } = useTabContext();
  const isActive = selectedTab === value;

  const handleSelectedTab = () => {
    setSelectedTab(value);
    onTabChange?.(value);
  };

  return (
    <button
      type='button'
      className={className}
      data-tab-item='true'
      data-tab-value={value}
      data-active={isActive}
      onClick={handleSelectedTab}
    >
      {children({ isActive })}
    </button>
  );
};

export default Item;
