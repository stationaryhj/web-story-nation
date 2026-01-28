import React from 'react';
import Header from '@/components/common/header';
import ShopRecharge from '@/views/shop-recharge/home';

type Props = {};

export default function page({}: Props) {
  return (
    <>
      <Header />
      <ShopRecharge />
    </>
  );
}
