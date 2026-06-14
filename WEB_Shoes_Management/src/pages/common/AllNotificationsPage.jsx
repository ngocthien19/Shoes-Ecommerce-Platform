import { useSelector } from 'react-redux'
import { NotificationSidebar } from './NotificationSidebar'
import { NotificationDetail } from './NotificationDetail'
import { useNotifications } from '~/hooks/useNotifications'

export const AllNotificationsPage = () => {
  const user = useSelector((state) => state.user.userInfo)
  const userRole = user?.roleId

  const {
    notifications,
    loading,
    selectedNotification,
    hasMore,
    loadingMore,
    unreadCount,
    loadMore,
    markAllAsRead,
    selectNotification
  } = useNotifications()

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <div className="flex h-full w-full">
        <NotificationSidebar
          notifications={notifications}
          loading={loading}
          selectedNotification={selectedNotification}
          unreadCount={unreadCount}
          hasMore={hasMore}
          loadingMore={loadingMore}
          userRole={userRole}
          onSelectNotification={selectNotification}
          onMarkAllAsRead={markAllAsRead}
          onLoadMore={loadMore}
        />

        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
          <NotificationDetail
            notification={selectedNotification}
            userRole={userRole}
          />
        </div>
      </div>
    </div>
  )
}