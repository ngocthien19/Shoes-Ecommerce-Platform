import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'

export const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50/50 font-sans overflow-hidden">
      {/* Sidebar cố định bên trái */}
      <AdminSidebar />

      {/* Khu vực nội dung bên phải */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header cố định trên cùng */}
        <AdminHeader />

        {/* Nội dung chính cuộn dọc */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  )
}