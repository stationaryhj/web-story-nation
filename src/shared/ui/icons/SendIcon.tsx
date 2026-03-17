interface SendIconProps {
  className?: string;
  onClick?: () => void;
  size?: number;
}

const SendIcon = ({ className = 'text-white', onClick, size = 24 }: SendIconProps) => {
  return (
    <svg
      aria-label='Send Icon'
      role='img'
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      className={className}
      onClick={onClick}
    >
      <path
        d='M4.4 19.425C4.06667 19.5583 3.75 19.5291 3.45 19.3375C3.15 19.1458 3 18.8666 3 18.5V14L11 12L3 9.99997V5.49997C3 5.1333 3.15 4.85414 3.45 4.66247C3.75 4.4708 4.06667 4.44164 4.4 4.57497L19.8 11.075C20.2167 11.2583 20.425 11.5666 20.425 12C20.425 12.4333 20.2167 12.7416 19.8 12.925L4.4 19.425Z'
        fill='currentColor'
      />
      <defs>
        <linearGradient
          id='paint0_linear_307_1801'
          x1='20.425'
          y1='19.507'
          x2='2.84517'
          y2='17.9082'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#6853FF' />
          <stop offset='1' stopColor='#5842FF' />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SendIcon;
