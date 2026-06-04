import Groq from 'groq-sdk'

// Strip BOM (U+FEFF) that may appear from Windows .env files
const apiKey = (process.env.GROQ_API_KEY || '').replace(/﻿/g, '').trim()
const groq = new Groq({ apiKey })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { nodes } = req.body
  const nodeText = nodes.map((n) => `- ${n.data.label}`).join('\n')

  try {
    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `以下のアイデアリストをマインドマップ構造に整理してください。JSON only (no markdown):
{"nodes":[{"id":"1","label":"中心テーマ","type":"center"},{"id":"2","label":"ブランチ","type":"branch","parentId":"1"},{"id":"3","label":"リーフ","type":"leaf","parentId":"2"}]}

アイデア:\n${nodeText}`
      }]
    })
    const text = result.choices[0].message.content
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('JSON not found')
    res.json(JSON.parse(match[0]))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
