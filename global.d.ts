declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: Array<any> }) => Promise<any>;
      on: (event: string, callback: (...args: Array<any>) => void) => void;
      removeListener: (event: string, callback: (...args: Array<any>) => void) => void;
    };
  }
}
