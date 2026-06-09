import { motion } from 'framer-motion'
import { Header } from '~/layouts/user/Header'
import { Footer } from '~/layouts/user/Footer'
import { RegisterStoreForm } from './RegisterStoreForm'
import { FiShoppingBag, FiInfo } from 'react-icons/fi'

export const RegisterStorePage = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-4 flex-1 w-full mb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="bg-white rounded-[2.5rem] my-8 overflow-hidden shadow-shadow-custom border border-white"
        >
          {/* Header Section của Card */}
          <div className="bg-gradient-to-r from-brand-primary/5 via-transparent to-transparent p-8 md:p-12 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-brand-primary rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 shrink-0">
                <FiShoppingBag size={32} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-brand-secondary tracking-tight">Kênh Người Bán</h1>
                <p className="text-gray-500 font-medium mt-1">Đăng ký để bắt đầu kinh doanh cùng ShoesStore</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold self-start md:self-center">
              <FiInfo size={14} /> THỜI GIAN DUYỆT: 24H - 48H
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 md:p-12 lg:p-16">
            <RegisterStoreForm />
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}