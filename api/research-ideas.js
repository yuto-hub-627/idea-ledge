import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { nodes } = req.body
  const nodeText = nodes.map((n) => `- ${n.data.label}`).join('\n')

  try {
    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `以下のアイデアに関連する既存の事例・前例・類似概念をリサーチして、マインドマップ構造で返してください。実在するプロジェクト・製品・概念を含めてください。JSON only (no markdown):
{"nodes":[{"id":"1","label":"中心テーマ","type":"center"},{"id":"2","label":"カテゴリ","type":"branch","parentId":"1"},{"id":"3","label":"具体的な事例","type":"leaf","parentId":"2","description":"説明"}]}

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
