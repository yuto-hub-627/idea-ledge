import { useState, useRef } from 'react'
import { Handle, Position } from '@xyflow/react'
import { X } from 'lucide-react'

interface IdeaData {
  label: string
  onDelete: (id: string) => void
  onLabelChange: (id: string, label: string) => void
  [key: string]: unknown
}

interface IdeaNodeProps {
  id: string
  data: IdeaData
  selected?: boolean
}

export function IdeaNode({ data, id, selected }: IdeaNodeProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(data.label)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const startEdit = () => {
    setValue(data.label)
    setEditing(true)
  }

  const commit = () => {
    setEditing(false)
    data.onLabelChange(id, value)
  }

  return (
    <div
      className={`relative group min-w-[120px] max-w-[240px] bg-white rounded-2xl shadow-md border-2 transition-all ${
        selected ? 'border-violet-400 shadow-violet-100' : 'border-gray-200 hover:border-gray-300'
      }`}
      onDoubleClick={startEdit}
    >
      <Handle type="target" position={Position.Left} className="!bg-violet-400 !border-white" />
      <Handle type="source" position={Position.Right} className="!bg-violet-400 !border-white" />

      <div className="p-3">
        {editing ? (
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                commit()
              }
              if (e.key === 'Escape') {
                setEditing(false)
                setValue(data.label)
              }
            }}
            className="w-full text-sm text-gray-800 resize-none outline-none bg-transparent leading-relaxed"
            rows={2}
            placeholder="アイデアを入力..."
          />
        ) : (
          <p className="text-sm text-gray-800 leading-relaxed break-words whitespace-pre-wrap min-h-[2rem]">
            {data.label || <span className="text-gray-400">ダブルクリックで編集</span>}
          </p>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); data.onDelete(id) }}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
      >
        <X size={10} />
      </button>
    </div>
  )
}
