import React from 'react';

import { useTabContext } from './Tab';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  value: string;
}

const Panel: React.FC<PanelProps> = ({ children, className, value }) => {
  const { selectedTab } = useTabContext();

  if (selectedTab !== value) return null;

  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default Panel;
