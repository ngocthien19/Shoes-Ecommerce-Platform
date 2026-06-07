import { formatPrice } from '~/utils/formatters'
import { FiMapPin, FiCalendar, FiBox } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export const OrderCard = ({ order, onCancelOrder, onWithdrawCancel }) => {

  // Render màu và text của badge trạng thái
  const renderStatusBadge = (status) => {
    switch (status) {
    case 'pending': return <span className="text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full text-xs">ĐƠN HÀNG MỚI</span>
    case 'processing': return <span className="text-blue-500 font-bold bg-blue-50 px-3 py-1 rounded-full text-xs">ĐANG XỬ LÝ</span>
    case 'shipped': return <span className="text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-full text-xs">ĐANG GIAO HÀNG</span>
    case 'delivered': return <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-xs">ĐÃ GIAO THÀNH CÔNG</span>
    case 'cancelled': return <span className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full text-xs">ĐÃ HỦY</span>
    case 'cancel_requested': return <span className="text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full text-xs">ĐANG YÊU CẦU HỦY</span>
    default: return null
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      {/* Header đơn hàng */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <FiBox className="text-gray-400" />
          <h3 className="font-bold text-gray-800">{order.store_name}</h3>
          <Link to={`/store/${order.store_id}`} className="text-xs bg-white border border-gray-200 text-brand-primary px-2 py-0.5 rounded text-semibold hover:bg-gray-50">
            Xem Shop
          </Link>
          <span className="text-xs text-gray-400 border-l border-gray-300 pl-3 ml-1">Mã đơn: {order.order_id}</span>
        </div>
        <div className="flex items-center gap-3">
          {renderStatusBadge(order.status)}
        </div>
      </div>

      <div className="p-5 flex flex-col lg:flex-row gap-6">
        {/* Danh sách sản phẩm (Bên trái) */}
        <div className="flex-1 space-y-4 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-6">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <img src={item.images?.[0]?.url || item.images?.[0]?.secure_url} alt={item.product_name} className="w-20 h-20 object-cover rounded-xl border border-gray-100" />
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{item.product_name}</h4>
                <p className="text-xs text-gray-500 mt-1">Phân loại: {item.color} / Size {item.size}</p>
                <div className="mt-2 text-sm font-bold text-brand-primary">
                  {formatPrice(item.price)} <span className="text-gray-400 text-xs font-normal">x{item.quantity}</span>
                </div>
              </div>
            </div>
          ))}
          {order.applied_voucher && (
            <div className="inline-block mt-2 bg-green-50 text-green-600 text-[11px] font-bold px-2 py-1 rounded">
              🎟️ MÃ GIẢM GIÁ: {order.applied_voucher}
            </div>
          )}
        </div>

        {/* Thông tin vận chuyển và Tổng tiền (Bên phải) */}
        <div className="w-full lg:w-[350px] flex flex-col justify-between">
          <div className="space-y-3 mb-4">
            <div className="flex gap-2 items-start">
              <FiMapPin className="text-gray-400 mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-700">Địa chỉ nhận hàng:</p>
                <p className="text-xs text-gray-500 mt-0.5">{order.recipient_name} - {order.recipient_phone}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{order.shipping_address}</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <FiCalendar className="text-gray-400 shrink-0" />
              <p className="text-xs text-gray-500">
                Ngày đặt: <span className="font-bold text-gray-700">{new Date(order.created_at).toLocaleString('vi-VN')}</span>
              </p>
            </div>
          </div>

          <div className="flex justify-between items-end border-t border-gray-100 pt-4">
            <span className="text-sm font-bold text-gray-500">Tổng cộng:</span>
            <span className="text-xl font-extrabold text-brand-primary">{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Footer / Buttons hành động */}
      <div className="p-4 bg-gray-50/50 flex justify-end gap-3 border-t border-gray-100">
        <Link to={`/orders/detail/${order.order_id}`} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg text-sm hover:bg-gray-50 transition-all">
          Xem chi tiết
        </Link>

        {/* Nút theo trạng thái */}
        {order.status === 'pending' && (
          <button onClick={() => onCancelOrder(order.order_id)} className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg text-sm hover:bg-[#c73652] transition-all shadow-sm active:scale-95">
            Hủy đơn hàng
          </button>
        )}

        {order.status === 'cancel_requested' && (
          <button onClick={() => onWithdrawCancel(order.order_id)} className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg text-sm hover:bg-orange-600 transition-all shadow-sm active:scale-95">
            Rút yêu cầu hủy
          </button>
        )}

        {(order.status === 'delivered' || order.status === 'cancelled') && (
          <button className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg text-sm hover:bg-[#c73652] transition-all shadow-sm active:scale-95">
            Mua lại
          </button>
        )}
      </div>
    </div>
  )
}