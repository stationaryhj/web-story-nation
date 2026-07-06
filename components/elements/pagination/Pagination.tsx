'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  // 표시할 페이지 버튼 계산
  const getPageButtons = () => {
    const pages = [];
    const maxButtons = 5; // 한 번에 표시할 페이지 버튼 수

    // 항상 현재 페이지를 중심으로 버튼을 표시
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);

    // 끝 페이지 조정
    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // 첫 페이지 버튼 (1페이지가 아닐 때만)
    if (startPage > 1) {
      pages.push(
        <motion.button
          key='first'
          onClick={() => onPageChange(1)}
          className='flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-text-muted shadow-sm transition-all hover:bg-brand/10 hover:text-brand hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/20'
          aria-label='첫 페이지'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className='sr-only'>첫 페이지</span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M11 19l-7-7 7-7m8 14l-7-7 7-7'
            />
          </svg>
        </motion.button>
      );
    }

    // 이전 페이지 버튼
    if (currentPage > 1) {
      pages.push(
        <motion.button
          key='prev'
          onClick={() => onPageChange(currentPage - 1)}
          className='flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-text-muted shadow-sm transition-all hover:bg-brand/10 hover:text-brand hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/20'
          aria-label='이전 페이지'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className='sr-only'>이전 페이지</span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
        </motion.button>
      );
    }

    // 페이지 번호 버튼
    for (let i = startPage; i <= endPage; i++) {
      const isCurrentPage = i === currentPage;
      pages.push(
        <motion.button
          key={i}
          onClick={() => onPageChange(i)}
          className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-all focus:outline-none focus:ring-2 ${
            isCurrentPage
              ? 'bg-brand font-bold text-text-inverse shadow-md'
              : 'bg-surface-elevated text-text-muted hover:bg-brand/10 hover:text-brand hover:shadow-md focus:ring-brand/20'
          }`}
          aria-label={`${i} 페이지`}
          aria-current={isCurrentPage ? 'page' : undefined}
          whileHover={!isCurrentPage ? { scale: 1.05 } : {}}
          whileTap={!isCurrentPage ? { scale: 0.95 } : {}}
          animate={isCurrentPage ? { scale: [1, 1.08, 1] } : {}}
          transition={isCurrentPage ? { duration: 0.3 } : { duration: 0.2 }}
        >
          {i}
        </motion.button>
      );
    }

    // 다음 페이지 버튼
    if (currentPage < totalPages) {
      pages.push(
        <motion.button
          key='next'
          onClick={() => onPageChange(currentPage + 1)}
          className='flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-text-muted shadow-sm transition-all hover:bg-brand/10 hover:text-brand hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/20'
          aria-label='다음 페이지'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className='sr-only'>다음 페이지</span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
          </svg>
        </motion.button>
      );
    }

    // 마지막 페이지 버튼 (마지막 페이지가 아닐 때만)
    if (endPage < totalPages) {
      pages.push(
        <motion.button
          key='last'
          onClick={() => onPageChange(totalPages)}
          className='flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-text-muted shadow-sm transition-all hover:bg-brand/10 hover:text-brand hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/20'
          aria-label='마지막 페이지'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className='sr-only'>마지막 페이지</span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 5l7 7-7 7M5 5l7 7-7 7'
            />
          </svg>
        </motion.button>
      );
    }

    return pages;
  };

  // 총 페이지가 1개 이하면 페이지네이션 표시하지 않음
  if (totalPages <= 1) return null;

  return (
    <motion.div
      className={`flex items-center justify-center gap-3 my-12 px-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {getPageButtons()}
    </motion.div>
  );
}
