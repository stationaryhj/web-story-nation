interface PaidCoinFilledIconProps {
  className?: string;
  size?: number;
  onClick?: () => void;
}

const PaidCoinFilledIcon = ({ className, size = 13, onClick }: PaidCoinFilledIconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 13 13'
      fill='none'
      className={className}
      onClick={onClick}
      aria-hidden='true'
    >
      <path
        d='M4.20135 4.76789C4.0101 4.82194 3.83497 4.92195 3.69122 5.0592C3.54747 5.19644 3.43946 5.36676 3.37661 5.55531L1.6001 10.8846L1.87984 11.1644L4.73836 8.30586C4.68143 8.18665 4.64696 8.05488 4.64696 7.91396C4.64696 7.40913 5.05619 6.9999 5.56102 6.9999C6.06584 6.9999 6.47507 7.40913 6.47507 7.91396C6.47507 8.41879 6.06584 8.82802 5.56102 8.82802C5.4201 8.82802 5.28832 8.79355 5.16911 8.73661L2.31059 11.5951L2.59033 11.8749L7.91967 10.0984C8.10821 10.0355 8.27853 9.92751 8.41578 9.78376C8.55302 9.64001 8.65303 9.46488 8.70709 9.27362L9.52193 6.39053L7.08445 3.95304L4.20135 4.76789ZM11.0823 3.53734L9.93764 2.39267C9.58059 2.03561 9.00149 2.03561 8.64444 2.39267L7.56756 3.46954L10.0054 5.90741L11.0823 4.83054C11.4394 4.47348 11.4394 3.89458 11.0823 3.53734Z'
        fill='currentColor'
      />
    </svg>
  );
};

export default PaidCoinFilledIcon;
