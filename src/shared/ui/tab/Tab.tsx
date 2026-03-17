import React, { createContext, type SetStateAction, useContext, useState } from 'react';
import { cn } from '@/shared/lib/utils/cn';
import Item from './Item';
import List from './List';
import Panel from './Panel';

interface TabProps {
  children: React.ReactNode;
  className?: string;
  value?: string;
  defaultValue?: string;
  onTabChange?: (tabValue: string) => void;
}

interface TabContextProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<SetStateAction<string>>;
  onTabChange?: (tabValue: string) => void;
}

interface TabCompoundProps {
  List: typeof List;
  Item: typeof Item;
  Panel: typeof Panel;
}

export const TabContext = createContext<TabContextProps | null>(null);

/**
 * useTabContext 반드시 탭 컴포넌트 내부에서 사용해야 합니다.
 */
export function useTabContext() {
  const ctx = useContext(TabContext);

  if (!ctx) throw new Error('TabContext는 부모 트리에서 사용해주세요');
  return ctx;
}
/**
 *
 * 제어/비제어를 동시에 사용하는 컴포넌트를 목표로 구현을 했습니다.
 * value를 통해 외부의 상태에 의해 activeTab을 제어할 수 있도록 구현.
 */
const Tab: React.FC<TabProps> & TabCompoundProps = ({
  children,
  className,
  value,
  defaultValue = '',
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const isControlled = value !== undefined;

  const selectedTab = isControlled ? value : internalTab;
  const setSelectedTab: React.Dispatch<SetStateAction<string>> = isControlled
    ? (v) => {
        const newValue = typeof v === 'function' ? v(value) : v;
        onTabChange?.(newValue);
      }
    : (v) => {
        setInternalTab(v);
        const newValue = typeof v === 'function' ? v(internalTab) : v;
        onTabChange?.(newValue);
      };

  const contextValue = { selectedTab, setSelectedTab, onTabChange };

  return (
    <TabContext.Provider value={contextValue}>
      <div className={cn(className)}>{children}</div>
    </TabContext.Provider>
  );
};

Tab.List = List;
Tab.Item = Item;
Tab.Panel = Panel;

export default Tab;
