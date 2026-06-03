import { Handle, Position } from '@xyflow/react'

interface MindMapData {
  label: string
  type: 'center' | 'branch' | 'leaf'
  description?: string
  [key: string]: unknown
}

interface MindMapNodeProps {
  data: MindMapData
}

const styles = {
  center: 'bg-violet-600 text-white border-violet-700 text-base font-semibold shadow-lg shadow-violet-200 min-w-[140px]',
  branch: 'bg-violet-100 text-violet-900 border-violet-300 text-sm font-medium shadow-md min-w-[110px]',
  leaf: 'bg-white text-gray-700 border-gray-200 text-xs shadow-sm min-w-[90px]',
}

export function MindMapNode({ data }: MindMapNodeProps) {
  const style = styles[data.type] || styles.leaf

  return (
    <div className={`rounded-xl border-2 px-3 py-2 text-center ${style}`}>
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <p className="leading-tight break-words">{data.label}</p>
      {data.description && (
        <p className="text-xs opacity-60 mt-1 leading-tight">{data.description}</p>
      )}
      <Handle type="source" position={Position.Right} className="!opacity-0" />
    </div>
  )
}
