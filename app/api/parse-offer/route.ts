import Anthropic from '@anthropic-ai/sdk'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const { text } = await pdfParse(buffer)

    const client = new Anthropic()
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `You are a salary extraction assistant. Extract compensation details from offer letter text and return ONLY a JSON object. Fields: currency (string, e.g. "INR"), ctc (annual total, number), basePay (number), basic (number), hra (number), flexiBenefit (number, optional), conveyance (number, optional), companyPF (number, optional), gratuity (number, optional), variablePay (number, optional), joiningBonus (number, optional), joiningBonusClawbackMonths (number, optional), esppMatchPercent (number, optional), esppMaxContribPercent (number, optional), npsPercent (number, optional), country (ISO 2-letter code), taxRegime ("new" or "old", optional). Return only JSON, no markdown, no explanation.`,
      messages: [
        {
          role: 'user',
          content: `Extract salary components from this offer letter text and return ONLY valid JSON. If a field is not present, omit it.\n\nText:\n\n${text.slice(0, 8000)}`,
        },
      ],
    })

    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    const json = JSON.parse(raw)
    return Response.json(json)
  } catch (err) {
    console.error('parse-offer error:', err)
    return Response.json({ error: 'Failed to parse offer letter' }, { status: 500 })
  }
}
