"use client"

import React, { useState, useRef } from "react"
import Image from "next/image"
import { UploadCloud, CheckCircle2, X, FileText, Loader2, Sparkles } from "lucide-react"

interface FileItem {
  id: string
  file: File
  name: string
  size: string
  preview: string
  status: "completed" | "uploading" | "ready"
  progress: number
}

interface DropzoneProps {
  onFileSelect: (file: File | null) => void
  accept?: string
  maxSizeMB?: number
  currentImage?: string
  label?: string
}

export function Dropzone({
  onFileSelect,
  accept = "image/*",
  maxSizeMB = 8,
  currentImage,
  label = "Subir Imagen",
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileItem, setFileItem] = useState<FileItem | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`El archivo excede el tamaño máximo permitido (${maxSizeMB} MB)`)
      return
    }

    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : ""
    const item: FileItem = {
      id: Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      size: formatSize(file.size),
      preview,
      status: "completed",
      progress: 100,
    }

    setFileItem(item)
    onFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleRemove = () => {
    setFileItem(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Dropzone Drag Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300 shadow-xl backdrop-blur-xl ${
          isDragging
            ? "border-cyan-400 bg-cyan-950/40 shadow-cyan-500/20 scale-[1.01]"
            : "border-violet-500/30 bg-violet-950/30 hover:border-cyan-400/60 hover:bg-violet-900/40 hover:shadow-violet-900/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-600/30 transition-transform group-hover:scale-110">
          <UploadCloud className="h-6 w-6" />
        </div>

        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
          Arrastra tu archivo aquí <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
        </h4>
        <p className="mt-1 text-xs text-violet-300/70 font-medium">
          o <span className="text-cyan-300 underline underline-offset-2">busca en tu dispositivo</span> (PNG, JPG, WebP hasta {maxSizeMB} MB)
        </p>
      </div>

      {/* Selected File Item Card */}
      {(fileItem || currentImage) && (
        <div className="flex flex-col gap-2 rounded-2xl border border-cyan-500/30 bg-violet-950/40 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              {fileItem?.preview || currentImage ? (
                <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden border border-cyan-500/30 bg-black">
                  <Image
                    src={fileItem?.preview || currentImage || "/placeholder.svg"}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-900/40 text-violet-300 border border-violet-700/30">
                  <FileText className="h-6 w-6" />
                </div>
              )}

              <div className="flex flex-col overflow-hidden text-xs">
                <span className="font-bold text-white truncate max-w-[200px]">
                  {fileItem?.name || label}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-medium">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    {fileItem ? `${fileItem.size} • Subido` : "Imagen actual en Cloudinary"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors"
              title="Eliminar archivo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Glowing Status Bar */}
          <div className="h-1.5 w-full rounded-full bg-violet-900/40 overflow-hidden mt-1">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 w-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  )
}
