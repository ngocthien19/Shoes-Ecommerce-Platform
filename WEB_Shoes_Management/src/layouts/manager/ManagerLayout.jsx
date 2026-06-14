import { Outlet } from 'react-router-dom'
import { ManagerSidebar } from './ManagerSidebar'
import { ManagerHeader } from './ManagerHeader'

export const ManagerLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50/50 font-sans overflow-hidden">
      {/* Sidebar cố định bên trái */}
      <ManagerSidebar />

      {/* Khu vực nội dung bên phải */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header cố định trên cùng */}
        <ManagerHeader />

        {/* Nội dung chính cuộn dọc */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  )
}