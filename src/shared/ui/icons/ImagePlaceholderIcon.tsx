import { cn } from '@/shared/lib/utils/cn'

interface ImagePlaceholderIconProps {
  className?: string
  size?: number
  onClick?: () => void
}

const ImagePlaceholderIcon = ({ className, size = 48, onClick }: ImagePlaceholderIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-label="이미지 자리 표시"
      className={cn('h-full w-full', className)}
      onClick={onClick}
      aria-hidden="true"
    >
      <path
        d="M18 28H38L31.1 19L26.5 25L23.4 21L18 28ZM16 36C14.9 36 13.9583 35.6083 13.175 34.825C12.3917 34.0417 12 33.1 12 32V8C12 6.9 12.3917 5.95833 13.175 5.175C13.9583 4.39167 14.9 4 16 4H40C41.1 4 42.0417 4.39167 42.825 5.175C43.6083 5.95833 44 6.9 44 8V32C44 33.1 43.6083 34.0417 42.825 34.825C42.0417 35.6083 41.1 36 40 36H16ZM8 44C6.9 44 5.95833 43.6083 5.175 42.825C4.39167 42.0417 4 41.1 4 40V12H8V40H36V44H8Z"
        fill="#909090"
      />
    </svg>
  )
}

export default ImagePlaceholderIcon
