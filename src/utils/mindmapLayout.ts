import type { Node, Edge } from '@xyflow/react'

interface RawNode {
  id: string
  label: string
  type: 'center' | 'branch' | 'leaf'
  parentId?: string
  description?: string
}

const NODE_WIDTH = 160
const NODE_HEIGHT = 60
const H_GAP = 80
const V_GAP = 40

export function buildMindMapLayout(rawNodes: RawNode[]): { nodes: Node[]; edges: Edge[] } {
  const nodeMap = new Map(rawNodes.map((n) => [n.id, n]))
  const children = new Map<string, string[]>()

  rawNodes.forEach((n) => {
    if (n.parentId) {
      const list = children.get(n.parentId) || []
      list.push(n.id)
      children.set(n.parentId, list)
    }
  })

  const root = rawNodes.find((n) => n.type === 'center') || rawNodes[0]

  const subtreeHeight = (id: string): number => {
    const kids = children.get(id) || []
    if (kids.length === 0) return NODE_HEIGHT
    const total = kids.reduce((sum, k) => sum + subtreeHeight(k) + V_GAP, -V_GAP)
    return Math.max(total, NODE_HEIGHT)
  }

  const positions = new Map<string, { x: number; y: number }>()

  const place = (id: string, x: number, top: number) => {
    const h = subtreeHeight(id)
    const y = top + h / 2 - NODE_HEIGHT / 2
    positions.set(id, { x, y })

    const kids = children.get(id) || []
    let cursor = top
    kids.forEach((kid) => {
      const kh = subtreeHeight(kid)
      place(kid, x + NODE_WIDTH + H_GAP, cursor)
      cursor += kh + V_GAP
    })
  }

  place(root.id, 0, 0)

  const nodes: Node[] = rawNodes.map((n) => ({
    id: n.id,
    type: 'mindmap',
    position: positions.get(n.id) || { x: 0, y: 0 },
    data: { label: n.label, type: n.type, description: n.description },
  }))

  const edges: Edge[] = rawNodes
    .filter((n) => n.parentId && nodeMap.has(n.parentId))
    .map((n) => ({
      id: `e-${n.parentId}-${n.id}`,
      source: n.parentId!,
      target: n.id,
      type: 'smoothstep',
      style: { stroke: '#a78bfa', strokeWidth: 2 },
    }))

  return { nodes, edges }
}
