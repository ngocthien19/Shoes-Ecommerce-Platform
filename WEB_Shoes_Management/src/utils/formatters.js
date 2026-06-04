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

export const getAvatarUrl = (user) => {
  if (!user?.avatar) return 'https://via.placeholder.com/150'

  if (typeof user.avatar === 'string') {
    try {
      const parsed = JSON.parse(user.avatar)
      return parsed?.secure_url || 'https://via.placeholder.com/150'
    } catch {
      return 'https://via.placeholder.com/150'
    }
  }
  return user.avatar?.secure_url || 'https://via.placeholder.com/150'
}

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}