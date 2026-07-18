'use strict';

import { ProductView } from './product-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductView barcode={id} />;
}
