'use client'

import { useState } from 'react'
import Footer from './footer'
import Header from './header'
import { useQuery } from '@tanstack/react-query'
import { systemApi } from '@/services/api/systemApi'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface ProvideLayoutProps {
  children: React.ReactNode
}

export default function ProvideLayout({ children }: ProvideLayoutProps) {
  const pathname = usePathname()
  const systemInfo = useQuery({
    queryKey: ['systemInfo'],
    queryFn: () => systemApi.getSystemInfo(),
  })
  const menuItems = [
    { name: 'Swap', path: '/' },
    { name: 'Limit', path: '/' },
    { name: 'Pool', path: '/' },
  ]
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        // network={selectedNetwork}
        // onNetworkChange={setSelectedNetwork}
        // walletConnected={walletConnected}
        // onWalletConnect={() => setWalletConnected(true)}
      />
      <div className="px-2 pt-8">
        <nav className="hidden md:flex items-center space-x-1 justify-center gap-1 w-fit mx-auto bg-white border border-gray-200 px-2 py-2 rounded-lg">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`px-6 py-2 rounded-lg text-sm font-medium
                ${pathname === item.path
                  ? 'text-purple-600 bg-purple-100 border border-purple-600'
                  : 'text-gray-400 bg-white border border-gray-200 hover:text-purple-600 hover:bg-purple-50'
                }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

      </div>
      {/* 컨테이너 */}
      <div className="px-2 pb-10 
        md:px-3
        lg:min-h-[calc(100vh-88px)] lg:px-[calc(50%-480px)]
        xl:px-[calc(50%-624px)]"
      >
        {children}
      </div>

      <Footer />
    </div>
  )
}
