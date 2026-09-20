'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Download, Share2, Sparkles, Check, Copy } from 'lucide-react'

interface QuranShareDialogProps {
  isOpen: boolean
  onClose: () => void
  surahName: string
  ayahNumbers: number[]
  ayahTexts: string[]
}

export function QuranShareDialog({
  isOpen,
  onClose,
  surahName,
  ayahNumbers,
  ayahTexts,
}: QuranShareDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen || ayahTexts.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 1080
    const padding = 70

    // Measure required height dynamically so no Ayah part is ever truncated
    ctx.font = 'bold 36px "Amiri", "Traditional Arabic", "Cairo", serif'
    const fullAyahText = ayahTexts
      .map((txt, i) => `${txt} ﴿${ayahNumbers[i] || i + 1}﴾`)
      .join(' ')

    // Word wrap calculation
    const words = fullAyahText.split(' ')
    const lines: string[] = []
    let currentLine = ''
    const maxLineWidth = width - padding * 2 - 80

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxLineWidth) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)

    const lineHeight = 64
    const textBlockHeight = lines.length * lineHeight
    const headerHeight = 240
    const footerHeight = 200
    const totalHeight = Math.max(900, headerHeight + textBlockHeight + footerHeight)

    canvas.width = width
    canvas.height = totalHeight

    // 1. Luxury Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, totalHeight)
    bgGrad.addColorStop(0, '#062B21') // Deep Islamic Emerald
    bgGrad.addColorStop(0.5, '#0B3B2E')
    bgGrad.addColorStop(1, '#041F18')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, width, totalHeight)

    // 2. Luxury Golden Borders
    ctx.strokeStyle = '#D4AF37' // Golden color
    ctx.lineWidth = 4
    ctx.strokeRect(30, 30, width - 60, totalHeight - 60)

    ctx.strokeStyle = '#F3E5AB'
    ctx.lineWidth = 1.5
    ctx.strokeRect(40, 40, width - 80, totalHeight - 80)

    // Golden Corner Ornaments
    const drawCorner = (x: number, y: number, angle: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.strokeStyle = '#D4AF37'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(35, 0)
      ctx.moveTo(0, 0)
      ctx.lineTo(0, 35)
      ctx.arc(15, 15, 15, Math.PI, 1.5 * Math.PI)
      ctx.stroke()
      ctx.restore()
    }

    drawCorner(45, 45, 0)
    drawCorner(width - 45, 45, Math.PI / 2)
    drawCorner(width - 45, totalHeight - 45, Math.PI)
    drawCorner(45, totalHeight - 45, -Math.PI / 2)

    // 3. Header: App Name & Brand
    ctx.textAlign = 'center'
    ctx.fillStyle = '#E6C665'
    ctx.font = 'bold 30px "Amiri", "Cairo", sans-serif'
    ctx.fillText('منصة ثِمَار التعليمية للقرآن الكريم', width / 2, 95)

    ctx.fillStyle = '#A3D9C9'
    ctx.font = '20px "Cairo", sans-serif'
    ctx.fillText('Thimar Platform for Quran & Islamic Studies', width / 2, 130)

    // Decorative divider
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(width / 2 - 180, 155)
    ctx.lineTo(width / 2 + 180, 155)
    ctx.stroke()

    // Surah Frame
    const surahRange =
      ayahNumbers.length === 1
        ? `سورة ${surahName} • الآية ${ayahNumbers[0]}`
        : `سورة ${surahName} • الآيات (${Math.min(...ayahNumbers)} - ${Math.max(...ayahNumbers)})`

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 32px "Amiri", serif'
    ctx.fillText(surahRange, width / 2, 205)

    // 4. Ayah Text (Full Tashkeel, Centered, Luxury Gold-White)
    ctx.direction = 'rtl'
    ctx.textAlign = 'center'
    ctx.font = 'bold 38px "Amiri", "Traditional Arabic", serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 8

    let currentY = headerHeight + 40
    for (const line of lines) {
      ctx.fillText(line, width / 2, currentY)
      currentY += lineHeight
    }

    ctx.shadowBlur = 0

    // 5. Footer: App Description & Verification
    const footerY = totalHeight - 90
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)'
    ctx.beginPath()
    ctx.moveTo(width / 2 - 220, footerY - 40)
    ctx.lineTo(width / 2 + 220, footerY - 40)
    ctx.stroke()

    ctx.fillStyle = '#D4AF37'
    ctx.font = 'bold 22px "Amiri", serif'
    ctx.fillText('﴿صَدَقَ اللَّهُ الْعَظِيمُ﴾', width / 2, footerY - 10)

    ctx.fillStyle = '#8AB8A8'
    ctx.font = '19px "Cairo", sans-serif'
    ctx.fillText(
      'تطبيق ثمار • الحفظ الميسر والتسميع الذكي • تلاوة وتفسير معتمد',
      width / 2,
      footerY + 24
    )

    // Export to data URL
    const dataUrl = canvas.toDataURL('image/png')
    setImageUrl(dataUrl)
  }, [isOpen, surahName, ayahNumbers, ayahTexts])

  const handleDownload = () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `thimar-ayah-${surahName}-${ayahNumbers.join('-')}.png`
    a.click()
  }

  const handleShare = async () => {
    if (!imageUrl) return
    try {
      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(imageUrl)).blob()
        const file = new File([blob], `thimar-${surahName}.png`, { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `آية من سورة ${surahName} - منصة ثمار`,
            text: `﴿${ayahTexts.join(' ')}﴾ [سورة ${surahName}]`,
            files: [file],
          })
          return
        }
      }
      handleDownload()
    } catch {
      handleDownload()
    }
  }

  const handleCopyText = () => {
    const text = `﴿${ayahTexts.join(' ')}﴾\n[سورة ${surahName} - الآية ${ayahNumbers.join(', ')}]\n— عبر منصة ثِمار للقرآن والتعليم`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-[2.5rem] max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-l from-emerald-900 to-teal-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black">مشاركة بطاقة الآية الكريمة</h3>
                <p className="text-xs text-emerald-100">صورة مزخرفة فاخرة بالخط القرآني واسم المنصة</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hidden Canvas used to generate image */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Image Preview */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50 flex items-center justify-center">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="بطاقة الآية"
                className="max-h-[50vh] w-auto rounded-2xl shadow-xl border border-emerald-900/10 object-contain"
              />
            ) : (
              <div className="py-20 text-center text-gray-400 font-bold">جاري تجهيز التصميم...</div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-white border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold flex items-center gap-2 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم نسخ النص' : 'نسخ النص'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-200"
              >
                <Download className="w-4 h-4" />
                <span>تحميل الصورة (PNG)</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>مشاركة</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
