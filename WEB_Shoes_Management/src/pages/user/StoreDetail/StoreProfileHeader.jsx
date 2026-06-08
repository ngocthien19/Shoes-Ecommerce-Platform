import { FiMessageSquare, FiMapPin, FiStar, FiPackage, FiCalendar } from 'react-icons/fi'
import { getImageUrl } from '~/utils/formatters'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export const StoreProfileHeader = ({ store }) => {
  const navigate = useNavigate()

  // Xử lý khi bấm nút Chat
  const handleChatWithStore = () => {
    toast.success(`Đang mở khung chat với ${store.name}...`)
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-8 animate-fadeIn">
      {/* Banner */}
      <div className="h-48 md:h-64 w-full relative bg-gray-200">
        <img
          src={getImageUrl(store?.banner?.secure_url)}
          alt="Banner"
          className="w-full h-full object-cover"
        />
        {/* Lớp phủ đen nhẹ để chữ/logo nổi hơn nếu cần */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Thông tin Cửa hàng */}
      <div className="relative px-6 pb-8 sm:px-10">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-16 sm:-mt-20 relative z-10 mb-6">
          {/* Logo */}
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-md shrink-0">
            <img
              src={getImageUrl(store.logo, 'https://via.placeholder.com/150')}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Tên & Nút Chat */}
          <div className="flex-1 flex flex-col sm:flex-row justify-between sm:items-end gap-4 pb-2">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{store.name}</h1>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <FiMapPin /> {store.address || 'Chưa cập nhật địa chỉ'}
              </p>
            </div>

            <button
              onClick={handleChatWithStore}
              className="flex items-center justify-center gap-2 bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#c73652] transition-all duration-300 shadow-sm shadow-brand-primary/30 active:scale-95 cursor-pointer"
            >
              <FiMessageSquare size={18} /> Chat với Shop
            </button>
          </div>
        </div>

        {/* Thống kê & Giới thiệu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <div className="md:col-span-2 space-y-2">
            <h3 className="font-bold text-gray-800 text-sm">Giới thiệu cửa hàng</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {store.bio || 'Cửa hàng này chưa cập nhật thông tin giới thiệu.'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2"><FiPackage /> Sản phẩm:</span>
              <span className="font-bold text-brand-primary">{store.total_products || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2"><FiStar className="text-yellow-500" /> Đánh giá:</span>
              <span className="font-bold text-gray-800">{Number(store.rating_average || 0).toFixed(1)} / 5.0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2"><FiCalendar /> Tham gia:</span>
              <span className="font-medium text-gray-800">{new Date(store.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}