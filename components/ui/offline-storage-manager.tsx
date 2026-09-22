'use client'

import React, { useState, useEffect } from 'react'
import { 
  HardDrive, 
  Trash2, 
  FileAudio, 
  BookOpen, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  FolderOpen
} from 'lucide-react'
import { getAllCachedAssets, removeCachedAsset, clearAllCachedAssets, type CachedAssetRecord } from '@/lib/offline-storage'
import { t } from '@/lib/i18n'

export function OfflineStorageManager() {
  const [assets, setAssets] = useState<CachedAssetRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<'all' | 'adhan' | 'quran' | 'tafsir' | 'tuhfa'>('all')
  const [deletingKey, setDeletingKey] = useState<string | null>(null)
  const [clearingAll, setClearingAll] = useState(false)

  const loadAssets = async () => {
    setLoading(true)
    const list = await getAllCachedAssets()
    setAssets(list)
    setLoading(false)
  }

  useEffect(() => {
    loadAssets()
    const handleUpdate = () => loadAssets()
    window.addEventListener('thimar:asset-cached', handleUpdate)
    window.addEventListener('thimar:asset-removed', handleUpdate)
    window.addEventListener('thimar:storage-cleared', handleUpdate)
    return () => {
      window.removeEventListener('thimar:asset-cached', handleUpdate)
      window.removeEventListener('thimar:asset-removed', handleUpdate)
      window.removeEventListener('thimar:storage-cleared', handleUpdate)
    }
  }, [])

  const handleDeleteOne = async (key: string) => {
    setDeletingKey(key)
    await removeCachedAsset(key)
    await loadAssets()
    setDeletingKey(null)
  }

  const handleClearAll = async () => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف جميع الملفات الصوتية والتفاسير المحملة؟ يمكنك إعادة تحميلها في أي وقت.')) {
      return
    }
    setClearingAll(true)
    await clearAllCachedAssets()
    await loadAssets()
    setClearingAll(false)
  }

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes <= 0) return 'حجم تقريبي (١-٣ ميغابايت)'
    const k = 1024
    const sizes = ['بايت', 'ك.ب', 'م.ب', 'ج.ب']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const totalBytes = assets.reduce((acc, curr) => acc + (curr.size || 1500000), 0)

  const filteredAssets = activeCategory === 'all' 
    ? assets 
    : assets.filter(a => a.category === activeCategory)

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'adhan':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">أذان</span>
      case 'quran':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">قرآن</span>
      case 'tafsir':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">تفسير</span>
      case 'tuhfa':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">تحفة الأطفال</span>
      default:
        return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">ملف</span>
    }
  }

  return (
    <section id="offline-storage-manager" className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden" dir="rtl">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={loadAssets}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
            title="تحديث قائمة الملفات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {assets.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearingAll}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>تفريغ كل التخزين</span>
            </button>
          )}
        </div>

        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-emerald-600" />
          <span>إدارة التخزين والأصوات المحملة</span>
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Storage Summary Bar */}
        <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-2xl border border-emerald-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 text-right">
            <div className="text-xs text-gray-500 font-bold">المساحة المشغولة محلياً:</div>
            <div className="text-2xl font-black text-emerald-950 flex items-baseline gap-2">
              <span>{formatBytes(totalBytes)}</span>
              <span className="text-xs font-normal text-gray-500">({assets.length} ملفات جاهزة بدون إنترنت)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تشغيل فوري وسريع دون استهلاك الباقة</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
          {[
            { id: 'all', label: `الكل (${assets.length})` },
            { id: 'adhan', label: `الأذان (${assets.filter(a => a.category === 'adhan').length})` },
            { id: 'quran', label: `المصحف (${assets.filter(a => a.category === 'quran').length})` },
            { id: 'tuhfa', label: `التحفة (${assets.filter(a => a.category === 'tuhfa').length})` },
            { id: 'tafsir', label: `التفاسير (${assets.filter(a => a.category === 'tafsir').length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeCategory === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Assets List */}
        {loading ? (
          <div className="py-12 text-center text-gray-400 font-medium text-xs animate-pulse">
            جاري فحص الذاكرة المحلية والملفات المحفوظة...
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="py-10 text-center space-y-2 border-2 border-dashed border-gray-100 rounded-2xl">
            <FolderOpen className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-500 font-medium">لا توجد ملفات محملة في هذا القسم حالياً.</p>
            <p className="text-[11px] text-gray-400">يمكنك تحميل أصوات الأذان والقرآن وتحفة الأطفال والتفاسير للعمل بدون إنترنت.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {filteredAssets.map(item => (
              <div 
                key={item.key}
                className="p-3.5 bg-gray-50 hover:bg-emerald-50/50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                    {item.category === 'tafsir' ? <BookOpen className="w-4 h-4" /> : <FileAudio className="w-4 h-4" />}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800 text-xs flex items-center gap-2">
                      <span>{item.title}</span>
                      {getCategoryBadge(item.category)}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {item.reciter && <span className="font-semibold text-gray-600 ml-2">{item.reciter}</span>}
                      <span>{formatBytes(item.size)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteOne(item.key)}
                  disabled={deletingKey === item.key}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40"
                  title="حذف هذا الملف من الذاكرة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
