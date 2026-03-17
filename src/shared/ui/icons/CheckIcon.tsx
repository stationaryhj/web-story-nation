import { cn } from '../../lib/utils/cn'

interface CheckIconProps {
  className?: string
  onClick?: () => void
  size?: number
}

const CheckIcon = ({ className, onClick, size = 24 }: CheckIconProps) => {
  return (
    <svg
      aria-label="Check Icon"
      className={cn('text-v2-gray-600', className)}
      onClick={onClick}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M6.36679 9.96437L11.9451 4.38604C12.097 4.23415 12.2751 4.1582 12.4795 4.1582C12.6838 4.1582 12.862 4.23415 13.014 4.38604C13.1658 4.53804 13.2418 4.71831 13.2418 4.92687C13.2418 5.13543 13.1658 5.3157 13.014 5.4677L6.90129 11.593C6.74929 11.7449 6.57112 11.8209 6.36679 11.8209C6.16246 11.8209 5.98429 11.7449 5.83229 11.593L2.97362 8.73437C2.82174 8.58237 2.7479 8.40209 2.75212 8.19354C2.75635 7.98498 2.8344 7.8047 2.98629 7.6527C3.13829 7.50081 3.31857 7.42487 3.52712 7.42487C3.73568 7.42487 3.91596 7.50081 4.06796 7.6527L6.36679 9.96437Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default CheckIcon
