export const formatPrice = (price) => {
  if (!price) return 'Liên hệ'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(parseFloat(price))
}

export const formatSold = (sold) => {
  if (sold >= 1000) return (sold / 1000).toFixed(1) + 'k'
  return sold
}

export const formatReview = (num) => {
  if (!num) return '0'
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

export const calculateFinalPrice = (price, discountPercentage) => {
  const priceNum = Number(price) || 0
  const discountNum = Number(discountPercentage) || 0

  if (discountNum > 0) {
    return priceNum - (priceNum * discountNum / 100)
  }

  return priceNum
}

export const formatTime = (seconds) => {
  return `00:${seconds < 10 ? `0${seconds}` : seconds}`
}

export const getImageUrl = (imageField, placeholder) => {
  if (!imageField) return placeholder

  let target = imageField

  // 1. Nếu là chuỗi Văn bản (String JSON), tiến hành parse ra trước
  if (typeof imageField === 'string') {
    try {
      target = JSON.parse(imageField)
    } catch {
      return placeholder
    }
  }

  // 2. Nếu sau khi parse (hoặc bản chất ban đầu) là Mảng (Array) -> Bốc phần tử đầu tiên
  if (Array.isArray(target)) {
    if (target.length === 0) return placeholder
    target = target[0]
  }

  // 3. Trích xuất secure_url từ Object cuối cùng
  return target?.secure_url || placeholder
}