import { Plus, Sparkles, Search, ListFilter, ArrowLeft, Loader2 } from 'lucide-react'
import type { AppMode, AIAction } from '../types'

interface ToolbarProps {
  mode: AppMode
  loading: boolean
  organizeCondition: string
  onAddNode: () => void
  onGenerate: (action: AIAction) => void
  onBack: () => void
  onConditionChange: (v: string) => void
}

export function Toolbar({
  mode,
  loading,
  organizeCondition,
  onAddNode,
  onGenerate,
  onBack,
  onConditionChange,
}: ToolbarProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 px-3 py-2 whitespace-nowrap">
      {mode === 'mindmap' ? (
        <>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={15} />
            キャンバスに戻る
          </button>
        </>
      ) : (
        <>
          <span className="text-sm font-semibold text-violet-700 px-1">アイデアレッジ</span>
          <div className="w-px h-5 bg-gray-200 mx-1" />

          <button
            onClick={onAddNode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Plus size={15} />
            追加
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <button
            onClick={() => onGenerate('generate')}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-violet-700 hover:bg-violet-50 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            マインドマップ生成
          </button>

          <button
            onClick={() => onGenerate('research')}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            既存事例リサーチ
          </button>

          <button
            onClick={() => onGenerate('organize')}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-700 hover:bg-green-50 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <ListFilter size={15} />}
            整理
          </button>

          <input
            value={organizeCondition}
            onChange={(e) => onConditionChange(e.target.value)}
            placeholder="整理の条件（例: 優先度）"
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-violet-400 w-36"
          />
        </>
      )}
    </div>
  )
}
