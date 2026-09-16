'use client';

import dynamic from 'next/dynamic';

const BuilderEditor = dynamic(() => import('@/components/builder/BuilderEditor'), {
  ssr: false,
});

export default function BuilderPage({ params }) {
  return <BuilderEditor pageId={params.id} />;
}
