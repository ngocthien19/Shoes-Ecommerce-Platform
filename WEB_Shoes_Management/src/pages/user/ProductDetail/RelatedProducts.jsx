import { ProductSection } from '~/components/user/ProductSection'

export const RelatedProducts = ({ products }) => {
  if (!products || products.length === 0) return null

  return (
    <div className="mt-12">
      <ProductSection title="Sản phẩm liên quan" products={products} icon="related" />
    </div>
  )
}