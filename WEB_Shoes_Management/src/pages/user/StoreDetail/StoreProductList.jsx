import { ProductSection } from '~/components/user/ProductSection'
import { Pagination } from '~/components/common/Pagination'

export const StoreProductList = ({ products, pagination, onPageChange }) => {
  return (
    <div className="animate-fadeIn">

      <ProductSection
        title="Sản phẩm của Shop"
        products={products || []}
        icon="related"
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="-mt-6 mb-8 flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}