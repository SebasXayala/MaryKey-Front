import { ProductDetail } from "@/app/(site)/producto/[slug]/product-detail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <ProductDetail slug={slug} />
    </div>
  );
}
