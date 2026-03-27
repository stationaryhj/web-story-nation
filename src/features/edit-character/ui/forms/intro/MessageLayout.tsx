import type { ReactNode } from 'react'

interface AIMessageLayoutProps {
  avatar?: ReactNode
  children: ReactNode
}

export const AIMessageLayout = ({ avatar, children }: AIMessageLayoutProps) => {
  return (
    <div className="flex gap-x-2">
      {avatar}
      <div className="flex flex-1">
        <div className={'flex w-full flex-col gap-y-1'}>{children}</div>
      </div>
    </div>
  )
}

interface UserMessageLayoutProps {
  children: ReactNode
}

export const UserMessageLayout = ({ children }: UserMessageLayoutProps) => {
  return <div className={'flex flex-col items-end gap-y-1'}>{children}</div>
}
