export interface IdeaNodeData {
  label: string
  isEditing?: boolean
  // node type marker
}

export interface MindMapNodeData {
  label: string
  type: 'center' | 'branch' | 'leaf'
  description?: string
}

export type AppMode = 'canvas' | 'mindmap'
export type AIAction = 'generate' | 'research' | 'organize'
