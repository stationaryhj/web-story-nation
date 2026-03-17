import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/utils/cn';

import { useTabContext } from './Tab';

interface ListProps {
  children: React.ReactNode;
  className?: string;
  showIndicator?: boolean;
  indicatorClassName?: string;
}

const List: React.FC<ListProps> = ({
  children,
  className,
  showIndicator = false,
  indicatorClassName,
}) => {
  const { selectedTab } = useTabContext();
  const listRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!listRef.current || !showIndicator) return;

    const items = listRef.current.querySelectorAll('[data-tab-item]');

    items.forEach((item) => {
      const tabValue = item.getAttribute('data-tab-value');
      if (tabValue === selectedTab) {
        const rect = item.getBoundingClientRect();
        const parentRect = listRef.current!.getBoundingClientRect();

        setIndicatorStyle({
          left: rect.left - parentRect.left + listRef.current!.scrollLeft,
          width: rect.width,
        });
      }
    });
  }, [selectedTab, children, showIndicator]);

  return (
    <div ref={listRef} className={cn('relative', className)}>
      {children}
      {showIndicator && (
        <div
          className={cn(
            'absolute bottom-0 z-10 transition-all duration-300 ease-in-out h-0.5 bg-primary-500',
            indicatorClassName
          )}
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />
      )}
    </div>
  );
};

export default List;
