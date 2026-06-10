import { Outlet } from 'react-router-dom'
import { Header } from '~/layouts/user/Header'
import { Footer } from '~/layouts/user/Footer'

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col relative">
      <Header />

      {/* Khu vực nội dung sẽ thay đổi theo từng trang */}
      <main className="flex-1 flex flex-col w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}