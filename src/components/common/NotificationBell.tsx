/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, ShieldAlert, Truck, Utensils, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserNotifications, markNotificationAsRead, deleteNotification } from '../../services/notificationService';
import type { Notification } from '../../types';

export const NotificationBell: React.FC = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (profile?.uid) {
      loadNotifications();
    }
  }, [profile?.uid]);

  const loadNotifications = async () => {
    if (!profile?.uid) return;
    try {
      const data = await getUserNotifications(profile.uid);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch {
      // Fallback sample notification for demo persona if empty
      setNotifications([
        {
          id: 'demo_n_01',
          userId: profile?.uid || 'user',
          title: 'Organization Verified',
          message: 'Your organization has passed administrative verification under FSSAI rules.',
          type: 'VERIFICATION',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ]);
      setUnreadCount(1);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SAFETY':
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'PICKUP':
        return <Truck className="w-4 h-4 text-blue-500" />;
      case 'DONATION':
        return <Utensils className="w-4 h-4 text-emerald-500" />;
      default:
        return <Award className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-stone-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-stone-400 text-xs">
                No notifications right now.
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-3.5 hover:bg-stone-50 transition flex gap-3 ${
                    !n.id ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-stone-800 truncate">{n.title}</p>
                      <span className="text-[10px] text-stone-400 whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">{n.message}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" /> Mark read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="text-[11px] text-stone-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
