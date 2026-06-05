import { FiCamera } from 'react-icons/fi'
import { TabProfile } from './Tabs/TabProfile'
import { TabFavorites } from './Tabs/TabFavorites'
import { TabPassword } from './Tabs/TabPassword'

export const ProfileTabsContent = ({
  user,
  activeTab,
  loading,
  onUpdateProfile,
  onFileChange,
  previewAvatar,
  favoriteProducts = [],
  onRemoveFavoriteItem
}) => {
  return (
    <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm w-full min-h-[550px] animate-fadeIn">

      <div className="flex items-center gap-5 pb-8 border-b border-gray-100 w-full">
        <div className="relative group/avatar">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-gray-100 overflow-hidden ring-1 ring-gray-200">
            <img src={previewAvatar} alt="Hồ sơ" className="w-full h-full object-cover" />
          </div>
          <label htmlFor="avatar-file" className="absolute bottom-0 right-0 w-7 h-7 bg-brand-primary text-white border-2 border-white rounded-full flex items-center justify-center shadow-md hover:bg-[#c73652] cursor-pointer transition-all">
            <FiCamera size={12} />
          </label>
          <input type="file" id="avatar-file" accept="image/*" onChange={onFileChange} className="hidden" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-brand-secondary tracking-tight">{user?.fullname}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Mã thành viên: #UID-{user?.id || '0000'}</p>
        </div>
      </div>

      {/* ── ĐIỀU HƯỚNG SẠCH SẼ THEO TAB CON ── */}
      {activeTab === 'profile' && (
        <TabProfile user={user} loading={loading} onUpdateProfile={onUpdateProfile} />
      )}

      {activeTab === 'favorites' && (
        <TabFavorites
          loading={loading}
          favoriteProducts={favoriteProducts}
          onRemoveFavoriteItem={onRemoveFavoriteItem}
        />
      )}

      {activeTab === 'password' && (
        <TabPassword loading={loading} onUpdateProfile={onUpdateProfile} />
      )}

    </div>
  )
}