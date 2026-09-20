'use client'

import React, { useState } from 'react'
import { Download, Share, PlusSquare, X } from 'lucide-react'
import { usePWAInstall } from '@/lib/hooks/use-pwa-install'
import { motion, AnimatePresence } from 'motion/react'

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall()
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null
  }

  return (
    <>
      <AnimatePresence>
        {(isInstallable || isIOS) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {isInstallable ? (
              <button
                onClick={install}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>تثبيت التطبيق</span>
              </button>
            ) : isIOS ? (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-emerald-500 text-emerald-700 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-50 transition-all active:scale-95"
              >
                <Share className="w-4 h-4" />
                <span>تثبيت على iOS</span>
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-6 left-6 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto">
                  <Download className="w-10 h-10 text-emerald-600" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900">تثبيت على iPhone</h3>
                  <p className="text-gray-500 font-medium">استخدم ثمار كأنها تطبيق حقيقي على هاتفك</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl text-right space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-600">
                      <Share className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">١. اضغط على زر "مشاركة" في متصفح سفاري.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-gray-600">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">٢. اختر "إضافة إلى الشاشة الرئيسية".</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  فهمت ذلك
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
