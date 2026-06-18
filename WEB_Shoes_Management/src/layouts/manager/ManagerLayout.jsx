import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { ManagerSidebar } from './ManagerSidebar'
import { ManagerHeader } from './ManagerHeader'
import { useMaintenance } from '~/hooks/useMaintenance'
import { MaintenanceModal } from '~/components/common/MaintenanceModal'

export const ManagerLayout = () => {
  const { isMaintenance, maintenanceMessage, loading, handleMaintenanceLogout } = useMaintenance()
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)

  useEffect(() => {
    if (!loading && isMaintenance) {
      setShowMaintenanceModal(true)
    }
  }, [loading, isMaintenance])

  const handleCloseMaintenance = () => {
    setShowMaintenanceModal(false)
    // Gọi logout
    handleMaintenanceLogout()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
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

      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={showMaintenanceModal}
        message={maintenanceMessage}
        onClose={handleCloseMaintenance}
        onLogout={handleMaintenanceLogout}
      />
    </>
  )
}