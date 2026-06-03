import { ProductCard } from '~/components/user/ProductCard'
import { FiArrowRight, FiZap, FiTrendingUp, FiClock, FiLayers } from 'react-icons/fi'

export const ProductSection = ({ title, products, icon }) => {
  const renderIcon = () => {
    switch (icon) {
    case 'zap': return <FiZap className="text-brand-primary" size={24} />
    case 'trending': return <FiTrendingUp className="text-brand-primary" size={24} />
    case 'clock': return <FiClock className="text-brand-primary" size={24} />
    case 'related': return <FiLayers className="text-brand-primary" size={24} />
    default: return null
    }
  }

  return (
    <>
      <section className="my-12 bg-white rounded-3xl p-6 shadow-shadow-custom">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {renderIcon()}
            <h2 className="text-2xl font-extrabold text-brand-secondary tracking-tight">{title}</h2>
          </div>
          <a href="#" className="group flex items-center gap-1 text-sm font-semibold text-brand-secondary hover:underline transition-all duration-300">
              Xem tất cả
            <FiArrowRight size={16} className="transition-transform duration-300 ease-out group-hover:translate-x-1" />
          </a>
        </div>

        {/* Sử dụng grid responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map(p => <ProductCard key={p.id} product={p} />)
          ) : (
            <p className="col-span-full text-center text-gray-500 py-10">Hiện chưa có sản phẩm nào.</p>
          )}
        </div>
      </section>
    </>
  )
}