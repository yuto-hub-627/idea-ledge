import { useState, useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react'
import type { Connection, Node, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { IdeaNode } from './components/IdeaNode'
import { MindMapNode } from './components/MindMapNode'
import { Toolbar } from './components/Toolbar'
import { buildMindMapLayout } from './utils/mindmapLayout'
import type { AppMode, AIAction } from './types'

const nodeTypes = {
  idea: IdeaNode,
  mindmap: MindMapNode,
}

let nextId = 1
const uid = () => `idea-${nextId++}`

function Canvas() {
  const [mode, setMode] = useState<AppMode>('canvas')
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [loading, setLoading] = useState(false)
  const [organizeCondition, setOrganizeCondition] = useState('')
  const { screenToFlowPosition, fitView } = useReactFlow()
  const paneRef = useRef<HTMLDivElement>(null)

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id))
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
    },
    [setNodes, setEdges],
  )

  const updateLabel = useCallback(
    (id: string, label: string) => {
      setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n)))
    },
    [setNodes],
  )

  const addNode = useCallback(() => {
    const id = uid()
    const jitter = () => (Math.random() - 0.5) * 200
    setNodes((nds) => {
      const base = nds.length === 0 ? { x: 200, y: 200 } : { x: 200 + jitter(), y: 200 + jitter() }
      return [
        ...nds,
        {
          id,
          type: 'idea',
          position: base,
          data: { label: '', onDelete: deleteNode, onLabelChange: updateLabel },
        },
      ]
    })
    setTimeout(() => fitView({ padding: 0.3, duration: 300 }), 50)
  }, [setNodes, deleteNode, updateLabel, fitView])

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, type: 'smoothstep', style: { stroke: '#a78bfa', strokeWidth: 2 } } as Edge, eds),
      ),
    [setEdges],
  )

  const onCanvasDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (mode !== 'canvas') return
      const target = e.target as HTMLElement
      if (!target.classList.contains('react-flow__pane')) return
      const id = uid()
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: 'idea',
          position: pos,
          data: { label: '', onDelete: deleteNode, onLabelChange: updateLabel },
        },
      ])
    },
    [mode, screenToFlowPosition, setNodes, deleteNode, updateLabel],
  )

  const callAI = useCallback(
    async (action: AIAction) => {
      const ideaNodes = nodes.filter((n) => n.type === 'idea')
      if (ideaNodes.length === 0) {
        alert('先にアイデアノードを追加してください')
        return
      }
      setLoading(true)
      try {
        const endpoint =
          action === 'generate'
            ? '/api/generate-mindmap'
            : action === 'research'
              ? '/api/research-ideas'
              : '/api/organize-ideas'

        const base = import.meta.env.DEV ? 'http://localhost:3001' : ''
        const res = await fetch(`${base}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodes: ideaNodes, condition: organizeCondition }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)

        const { nodes: mmNodes, edges: mmEdges } = buildMindMapLayout(data.nodes)
        setNodes(mmNodes)
        setEdges(mmEdges)
        setMode('mindmap')
        setTimeout(() => fitView({ padding: 0.2, duration: 600 }), 100)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        alert(`エラー: ${msg}`)
      } finally {
        setLoading(false)
      }
    },
    [nodes, organizeCondition, setNodes, setEdges, fitView],
  )

  const backToCanvas = useCallback(() => {
    setNodes([])
    setEdges([])
    setMode('canvas')
  }, [setNodes, setEdges])

  return (
    <div className="w-full h-full relative" ref={paneRef}>
      <Toolbar
        mode={mode}
        loading={loading}
        organizeCondition={organizeCondition}
        onAddNode={addNode}
        onGenerate={callAI}
        onBack={backToCanvas}
        onConditionChange={setOrganizeCondition}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDoubleClick={onCanvasDoubleClick}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 100, y: 100, zoom: 1 }}
        deleteKeyCode="Delete"
        className="bg-gray-50"
      >
        <Background color="#e5e7eb" gap={24} />
        <Controls className="!shadow-md !border-gray-200 !rounded-xl" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'idea') return '#a78bfa'
            const t = (n.data as { type?: string }).type
            if (t === 'center') return '#7c3aed'
            if (t === 'branch') return '#ddd6fe'
            return '#f3f4f6'
          }}
          className="!rounded-xl !border-gray-200 !shadow-md"
        />
      </ReactFlow>

      {mode === 'canvas' && nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-300">アイデアを置いてみよう</p>
            <p className="text-sm text-gray-400 mt-2">ダブルクリックでノード追加 · 上のボタンでAI生成</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  )
}
