'use client';

import dynamic from 'next/dynamic';

const BuilderEditor = dynamic(() => import('@/components/builder/BuilderEditor'), {
  ssr: false,
});

import { use } from 'react';

export default function BuilderPage({ params }) {
  const resolvedParams = use(params);
  return <BuilderEditor pageId={resolvedParams.id} />;
}
