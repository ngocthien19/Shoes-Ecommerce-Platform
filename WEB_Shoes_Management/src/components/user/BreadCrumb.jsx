import { Link } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'

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