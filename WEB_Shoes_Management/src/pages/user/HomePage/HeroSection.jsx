import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'

export const HeroSection = () => {
  return (
    <section className="bg-white rounded-3xl p-8 md:p-16 my-8 overflow-hidden shadow-shadow-custom">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Bên trái: Text */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Bước chân tự tin,<br/>
            <span className="text-brand-primary">phong cách dẫn đầu</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-md text-justify">
            Khám phá những mẫu giày thể thao mới nhất với công nghệ đệm êm ái, thiết kế thời thượng cho mọi hoạt động của bạn.
          </p>

          <div className="flex gap-4 pt-4">
            <Link to="/products" className="flex items-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-full font-bold hover:bg-[#c73652] transition-all hover:shadow-lg hover:shadow-[#e94560]/30 active:scale-95">
              Mua ngay <FiArrowRight size={20} />
            </Link>
            <Link to="/products" className="px-8 py-4 rounded-full font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all active:scale-95">
              Xem thêm
            </Link>
          </div>
        </div>

        {/* Bên phải: Hình ảnh */}
        <div className="relative group">
          <div className="absolute inset-0 bg-brand-primary/20 rounded-3xl rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
          <img
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"
            alt="Hero Shoe"
            className="relative rounded-3xl w-full h-[400px] object-cover shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>

      </div>
    </section>
  )
}