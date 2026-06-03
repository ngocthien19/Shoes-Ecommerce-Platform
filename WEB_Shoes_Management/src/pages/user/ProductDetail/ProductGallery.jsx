import { useState } from 'react'

export const ProductGallery = ({ images, productName }) => {
  // Nếu mảng rỗng hoặc null, tạo mảng giả để test UI
  const safeImages = images?.length > 0 ? images : [
    { secure_url: 'https://placehold.co/600x600/f6f9fc/a0aabf?text=Chưa+có+ảnh+1' },
    { secure_url: 'https://placehold.co/600x600/f6f9fc/a0aabf?text=Chưa+có+ảnh+2' },
    { secure_url: 'https://placehold.co/600x600/f6f9fc/a0aabf?text=Chưa+có+ảnh+3' },
    { secure_url: 'https://placehold.co/600x600/f6f9fc/a0aabf?text=Chưa+có+ảnh+4' }
  ]

  const [activeImg, setActiveImg] = useState(safeImages[0].secure_url)

  return (
    <div className="flex flex-col gap-4">
      {/* Ảnh chính */}
      <div className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center">
        <img
          src={activeImg}
          alt={productName}
          className="w-full h-full object-cover transition-all duration-300"
        />
      </div>

      {/* Danh sách ảnh Thumbnail */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {safeImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImg(img.secure_url)}
            className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer
              ${activeImg === img.secure_url ? 'border-brand-primary' : 'border-transparent hover:border-gray-200'}`}
          >
            <img src={img.secure_url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}