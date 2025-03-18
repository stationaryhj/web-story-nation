export interface Provider {
  id: string;
  name: string;
  logo: string;
  amount: string;
  networkFee: string;
  tag: 'Best' | 'Fastest' | '-0.01%';
  afterNetworkFee: string;
  route: Array<string>;
}
