import { FiMessageSquare, FiMapPin, FiStar, FiPackage, FiClock } from 'react-icons/fi'
import { BiStore } from 'react-icons/bi'
import { useState, useEffect } from 'react'
import { storeService } from '~/services/user/storeService'
import { Link } from 'react-router-dom'

export const StoreInfo = ({ storeId }) => {

  const [store, setStore] = useState(null)

  useEffect(() => {
    const fetchStore = async () => {
      if (storeId) {
        const storeData = await storeService.getStoreDetail(storeId)
        setStore(storeData)
      }
    }

    fetchStore()
  }, [storeId])

  if (!store) return null

  // Format ngày tham gia đơn giản (YYYY-MM-DD)
  const joinDate = new Date(store.created_at).toLocaleDateString('vi-VN')

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mt-8">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-between">

        {/* Khối bên trái: Avatar & Nút hành động */}
        <div className="flex gap-4 items-center md:w-1/3">
          <div className="w-20 h-20 shrink-0 rounded-full border border-gray-100 overflow-hidden shadow-sm">
            <img src={store.logo?.secure_url} alt={store.name} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{store.name}</h3>

            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e94560]/10 text-brand-primary border border-brand-primary/20 rounded-lg text-sm font-semibold hover:bg-brand-primary hover:text-white transition-all duration-300 cursor-pointer">
                <FiMessageSquare size={14} /> Chat Ngay
              </button>
              <Link to={`/store/${store.id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 border border-gray-200 rounded-lg text-sm font-semibold hover:border-gray-400 hover:text-gray-800 transition-all duration-300 cursor-pointer">
                <BiStore size={14} /> Xem Shop
              </Link>
            </div>
          </div>
        </div>

        {/* Khối bên phải: Các thông số của Shop (chia Grid) */}
        <div className="flex-1 w-full grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 md:pl-8 md:border-l md:border-gray-100">

          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-secondary shrink-0">
              <FiPackage size={18} />
            </div>
            <div>
              <p className="text-gray-500">Sản phẩm</p>
              <p className="font-bold text-brand-primary">{store.total_products || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-secondary shrink-0">
              <FiStar size={18} />
            </div>
            <div>
              <p className="text-gray-500">Đánh giá</p>
              <p className="font-bold text-gray-800">{store.rating_average || '0.0'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-secondary shrink-0">
              <FiClock size={18} />
            </div>
            <div>
              <p className="text-gray-500">Tham gia</p>
              <p className="font-bold text-gray-800">{joinDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-secondary shrink-0">
              <FiMapPin size={18} />
            </div>
            <div>
              <p className="text-gray-500">Khu vực</p>
              {/* Cắt chuỗi để lấy mỗi Tên Thành Phố/Tỉnh cho gọn UI */}
              <p className="font-bold text-gray-800 line-clamp-1">{store.address ? store.address.split(',').pop().trim() : 'Đang cập nhật'}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}