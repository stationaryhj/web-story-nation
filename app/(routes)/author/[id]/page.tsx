'use client';

import Header from '@/components/common/header';
import AuthorDetailPage from '@/views/author/detail';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <div className='flex min-h-screen flex-col'>
      <Header />
      <AuthorDetailPage params={resolvedParams} />
    </div>
  );
}
