import { Link } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'

<<<<<<< Updated upstream
const BreadCrumb = ({ product }) => {
  return (
    <nav className="flex items-center gap-2 text-base text-breadcrumb my-8">
      <Link
        to="/"
        className="relative hover:text-breadcrumb transition-colors duration-300 ease-out cursor-pointer
                   after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-breadcrumb
                   after:transition-all after:duration-300 after:ease-out hover:after:w-full"
      >
        Trang chủ
      </Link>

      <FiChevronRight size={14} />

      <Link
        to={`/products/${product?.category_slug}`}
        className="relative hover:text-breadcrumb transition-colors duration-300 ease-out cursor-pointer
                   after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-breadcrumb
                   after:transition-all after:duration-300 after:ease-out hover:after:w-full"
      >
        {product?.category_name}
      </Link>

      <FiChevronRight size={14} />

      <span className="text-gray-900 font-semibold">{product?.name}</span>
    </nav>
  )
}

export default BreadCrumb
=======
// items có dạng: [{ label: 'Trang chủ', link: '/' }, { label: 'Tất cả sản phẩm', link: null }]
export const BreadCrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-2 text-sm text-brand-secondary my-6">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center gap-2">
            {isLast ? (
              <span className="text-gray-900 font-semibold">{item.label}</span>
            ) : (
              <>
                <Link
                  to={item.link}
                  className="relative hover:text-brand-secondary transition-colors duration-300 ease-out cursor-pointer
                             after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-brand-secondary
                             after:transition-all after:duration-300 after:ease-out hover:after:w-full"
                >
                  {item.label}
                </Link>
                <FiChevronRight size={14} />
              </>
            )}
          </div>
        )
      })}
    </nav>
  )
}
>>>>>>> Stashed changes
