export const PAIR_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'getReserves',
    outputs: [
      {
        name: 'reserve0',
        type: 'uint112',
      },
      {
        name: 'reserve1',
        type: 'uint112',
      },
      {
        name: 'blockTimestampLast',
        type: 'uint32',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  // ... 다른 함수들도 있음
];
