import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiHome, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from 'react-icons/fi'

export const ManagerStoresPage = () => {
  const [activeTab, setActiveTab] = useState('pending')

  const tabs = [
    { id: 'pending', label: 'Chờ duyệt', icon: FiClock, color: 'amber' },
    { id: 'approved', label: 'Đã duyệt', icon: FiCheckCircle, color: 'green' },
    { id: 'rejected', label: 'Bị từ chối', icon: FiXCircle, color: 'red' },
    { id: 'banned', label: 'Đã khóa', icon: FiAlertCircle, color: 'gray' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <FiHome className="text-blue-500" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý Cửa hàng</h1>
          <p className="text-sm text-gray-500">Phê duyệt và quản lý các cửa hàng trên sàn</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-all duration-200 font-medium ${
              activeTab === tab.id
                ? `text-${tab.color}-600 border-b-2 border-${tab.color}-500 bg-${tab.color}-50/30`
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-8 text-center text-gray-400">
          Danh sách cửa hàng {activeTab === 'pending' ? 'chờ duyệt' : activeTab === 'approved' ? 'đã duyệt' : activeTab === 'rejected' ? 'bị từ chối' : 'đã khóa'} sẽ hiển thị tại đây
        </div>
      </div>
    </div>
  )
}