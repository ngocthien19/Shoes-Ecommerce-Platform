import { FiStar, FiEye, FiFlag, FiCheckCircle, FiXCircle, FiMessageSquare } from 'react-icons/fi'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { getImageUrl } from '~/utils/formatters'
import { Link } from 'react-router-dom'

export const ReviewTable = ({
  reviews,
  selectedIds,
  onSelectRow,
  onSelectAll,
  reviewType,
  onReport,
  onReopen
}) => {
  const handleToggleSelectAll = (e) => onSelectAll(e.target.checked)

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={14}
            className={star <= rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-secondary/5 border-b border-gray-100 text-xs font-bold text-brand-secondary uppercase tracking-wider">
              <th className="py-4 px-6 w-12 text-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/20 accent-brand-primary cursor-pointer"
                  checked={reviews.length > 0 && selectedIds.length === reviews.length}
                  onChange={handleToggleSelectAll}
                />
              </th>
              <th className="py-4 px-4">Khách hàng</th>
              {reviewType === 'product' && <th className="py-4 px-4">Sản phẩm</th>}
              <th className="py-4 px-4 text-center">Đánh giá</th>
              <th className="py-4 px-4">Nội dung</th>
              <th className="py-4 px-4 text-center">Ngày đánh giá</th>
              <th className="py-4 px-4 text-center">Trạng thái</th>
              <th className="py-4 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={reviewType === 'product' ? 8 : 7} className="text-center py-16 text-gray-400 font-medium">
                  Không tìm thấy đánh giá nào phù hợp.
                </td>
              </tr>
            ) : (
              reviews.map((review) => {
                const isChecked = selectedIds.includes(review.id)
                const canReopen = review.is_active === 0 && review.is_reported === 0

                return (
                  <tr key={review.id} className={`hover:bg-gray-50/40 transition-colors duration-200 ${isChecked ? 'bg-brand-primary/5' : ''}`}>
                    <td className="py-4 px-6 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/20 accent-brand-primary cursor-pointer"
                        checked={isChecked}
                        onChange={() => onSelectRow(review.id)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-gray-900">{review.fullname}</span>
                        <span className="text-[10px] text-gray-400">ID: #{review.user_id}</span>
                      </div>
                    </td>
                    {reviewType === 'product' && (
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={getImageUrl(review.product_images?.[0], 'https://placehold.co/40x40?text=Product')}
                            alt={review.product_name}
                            className="w-8 h-8 rounded-lg object-cover border border-gray-100"
                          />
                          <span className="text-sm font-semibold text-gray-700 line-clamp-1 max-w-[150px]">
                            {review.product_name}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="text-[10px] font-bold text-gray-500">{review.rating}/5</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-[250px]">
                        <p className="text-sm text-gray-600 line-clamp-2">{review.comment || 'Không có nội dung'}</p>
                        {(() => {
                          let imagesArray = []
                          try {
                            imagesArray = typeof review.images === 'string'
                              ? JSON.parse(review.images || '[]')
                              : (Array.isArray(review.images) ? review.images : [])
                          } catch (e) {
                            imagesArray = []
                          }
                          return imagesArray.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <FiMessageSquare size={10} className="text-gray-400" />
                              <span className="text-[10px] text-gray-400">{imagesArray.length} ảnh</span>
                            </div>
                          )
                        })()}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {review.is_active === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black">
                            <FiCheckCircle size={10} /> Hiển thị
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-black">
                            <FiXCircle size={10} /> Đã ẩn
                          </span>
                        )}
                        {review.is_reported === 1 && (
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black">
                                <FiFlag size={10} /> Đã BC
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[200px] text-center">
                              Lý do: {review.report_reason || 'Vi phạm quy định'}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={`/vendor/reviews/detail/${review.id}?type=${reviewType}`}
                              className="inline-flex p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white border border-gray-200 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                            >
                              <FiEye size={13} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg bg-gray-800 text-white text-xs border-none font-semibold">
    Xem chi tiết
                          </TooltipContent>
                        </Tooltip>

                        {review.is_reported === 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => onReport([review.id], review.comment)}
                                className="inline-flex p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white border border-amber-100 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                              >
                                <FiFlag size={13} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-lg bg-amber-600 text-white text-xs border-none font-semibold">
                              Báo cáo vi phạm
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {canReopen && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => onReopen([review.id])}
                                className="inline-flex p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                              >
                                <FiCheckCircle size={13} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-lg bg-blue-600 text-white text-xs border-none font-semibold">
                              Yêu cầu mở lại
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}