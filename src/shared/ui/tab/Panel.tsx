import React from 'react';

import { useTabContext } from './Tab';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  value: string;
}

const Panel: React.FC<PanelProps> = ({ children, className, value }) => {
  const { selectedTab } = useTabContext();
  const isActive = selectedTab === value;

  return (
    <div className={`h-full ${className ?? ''}`} hidden={!isActive}>
      {children}
    </div>
  );
};

export default Panel;
