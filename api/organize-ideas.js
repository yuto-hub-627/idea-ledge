import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { nodes, condition } = req.body
  const nodeText = nodes.map((n) => `- ${n.data.label}`).join('\n')

  try {
    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `以下のアイデアを「${condition || 'テーマ・重要度・関連性'}」の条件で分類・整理してください。JSON only (no markdown):
{"nodes":[{"id":"1","label":"分類名","type":"center"},{"id":"2","label":"カテゴリA","type":"branch","parentId":"1"},{"id":"3","label":"アイデア","type":"leaf","parentId":"2"}]}

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
