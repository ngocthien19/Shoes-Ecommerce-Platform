import { FiLayers } from 'react-icons/fi'

export const ProductVariantsTable = ({ variants = [] }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="border-b border-gray-50 pb-4">
        <h3 className="text-lg font-black text-brand-secondary flex items-center gap-2">
          <FiLayers className="text-brand-primary" /> Danh sách biến thể trong kho
        </h3>
        <p className="text-xs text-gray-400 font-semibold mt-0.5">Chi tiết số lượng tồn kho theo từng kích cỡ và màu sắc phân loại</p>
      </div>

      <div className="overflow-hidden border border-gray-100 rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-secondary/5 border-b border-gray-100 text-xs font-bold text-brand-secondary uppercase tracking-wider">
              <th className="py-3.5 px-6">Mã biến thể</th>
              <th className="py-3.5 px-4 text-center">Kích cỡ (Size)</th>
              <th className="py-3.5 px-4 text-center">Màu sắc</th>
              <th className="py-3.5 px-6 text-center">Số lượng tồn kho</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
            {variants.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-12 text-gray-400 font-medium">
                  Sản phẩm này hiện chưa được thiết lập biến thể phân loại nào.
                </td>
              </tr>
            ) : (
              variants.map((variant, idx) => (
                <tr key={variant.id || idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-gray-400 text-xs">#{variant.id || idx + 1}</td>
                  <td className="py-4 px-4 text-center font-black text-gray-900">{variant.size}</td>
                  <td className="py-4 px-4 text-center">
                    {variant.color ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700">
                        {variant.color}
                      </span>
                    ) : (
                      <span className="text-gray-400 font-normal italic">Không phân loại màu</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`font-black ${variant.stock > 0 ? 'text-gray-900' : 'text-red-500'}`}>
                      {variant.stock} đôi
                    </span>
                    {variant.stock === 0 && <span className="text-[10px] text-red-500 font-black ml-1.5 uppercase tracking-wide">(Hết hàng)</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}