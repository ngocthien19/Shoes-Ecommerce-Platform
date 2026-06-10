import { Outlet } from 'react-router-dom'
import { VendorSidebar } from './VendorSidebar'
import { VendorHeader } from './VendorHeader'

export const VendorLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50/50 font-sans overflow-hidden">
      {/* Sidebar cố định bên trái */}
      <VendorSidebar />

      {/* Khu vực nội dung bên phải */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header cố định trên cùng */}
        <VendorHeader />

        {/* Nội dung chính cuộn dọc */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {/* Outlet là nơi React Router sẽ render nội dung của các trang con vào */}
          <Outlet />
        </main>
      </div>
    </div>
  )
}