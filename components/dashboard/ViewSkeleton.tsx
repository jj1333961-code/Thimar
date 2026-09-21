'use client'

import React from 'react'

export function ViewSkeleton({ title = 'جاري التحميل...' }: { title?: string }) {
  return (
    <div className="w-full space-y-6 animate-pulse" dir="rtl">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200/80 rounded-2xl" />
          <div className="h-4 w-72 bg-gray-100 rounded-xl" />
        </div>
        <div className="h-10 w-28 bg-gray-100 rounded-2xl" />
      </div>

      {/* Main Grid / Card Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-44 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl" />
            <div className="h-4 w-16 bg-gray-100 rounded-full" />
          </div>
          <div className="h-5 w-36 bg-gray-200/80 rounded-xl" />
          <div className="h-3 w-full bg-gray-100 rounded-lg" />
        </div>

        <div className="h-44 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-blue-50 rounded-xl" />
            <div className="h-4 w-16 bg-gray-100 rounded-full" />
          </div>
          <div className="h-5 w-32 bg-gray-200/80 rounded-xl" />
          <div className="h-3 w-full bg-gray-100 rounded-lg" />
        </div>

        <div className="h-44 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-4 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-amber-50 rounded-xl" />
            <div className="h-4 w-16 bg-gray-100 rounded-full" />
          </div>
          <div className="h-5 w-40 bg-gray-200/80 rounded-xl" />
          <div className="h-3 w-3/4 bg-gray-100 rounded-lg" />
        </div>
      </div>

      {/* Large Content Block Skeleton */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm space-y-4">
        <div className="h-6 w-52 bg-gray-200/80 rounded-xl" />
        <div className="space-y-3 pt-2">
          <div className="h-16 w-full bg-gray-50 rounded-2xl" />
          <div className="h-16 w-full bg-gray-50 rounded-2xl" />
          <div className="h-16 w-full bg-gray-50 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
