import express from 'express'
import cors from 'cors'
import Groq from 'groq-sdk'
import { config } from 'dotenv'

config()

const app = express()
app.use(cors())
app.use(express.json())

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function callGroq(prompt) {
  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })
  const text = res.choices[0].message.content
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('JSON not found in response')
  return JSON.parse(match[0])
}

app.post('/api/generate-mindmap', async (req, res) => {
  const { nodes } = req.body
  const nodeText = nodes.map((n) => `- ${n.data.label}`).join('\n')
  try {
    const json = await callGroq(`以下のアイデアリストをマインドマップ構造に整理してください。
JSONフォーマットで返してください。

アイデア:
${nodeText}

レスポンス形式（JSON only, no markdown):
{
  "nodes": [
    { "id": "1", "label": "中心テーマ", "type": "center" },
    { "id": "2", "label": "ブランチ1", "type": "branch", "parentId": "1" },
    { "id": "3", "label": "サブブランチ", "type": "leaf", "parentId": "2" }
  ]
}`)
    res.json(json)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/research-ideas', async (req, res) => {
  const { nodes } = req.body
  const nodeText = nodes.map((n) => `- ${n.data.label}`).join('\n')
  try {
    const json = await callGroq(`以下のアイデアに関連する既存の事例・前例・類似概念をリサーチして、マインドマップ構造で返してください。
実在するプロジェクト、製品、概念、理論を含めてください。

アイデア:
${nodeText}

JSON only (no markdown):
{
  "nodes": [
    { "id": "1", "label": "中心テーマ", "type": "center" },
    { "id": "2", "label": "既存事例カテゴリ", "type": "branch", "parentId": "1" },
    { "id": "3", "label": "具体的な事例名", "type": "leaf", "parentId": "2", "description": "簡単な説明" }
  ]
}`)
    res.json(json)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/organize-ideas', async (req, res) => {
  const { nodes, condition } = req.body
  const nodeText = nodes.map((n) => `- ${n.data.label}`).join('\n')
  try {
    const json = await callGroq(`以下のアイデアを「${condition || 'テーマ・重要度・関連性'}」の条件で分類・整理してください。

アイデア:
${nodeText}

JSON only (no markdown):
{
  "nodes": [
    { "id": "1", "label": "分類名", "type": "center" },
    { "id": "2", "label": "カテゴリA", "type": "branch", "parentId": "1" },
    { "id": "3", "label": "アイデア", "type": "leaf", "parentId": "2" }
  ]
}`)
    res.json(json)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

const PORT = 3001
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`))
