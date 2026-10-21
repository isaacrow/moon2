Fix OPENAI_API_KEY + Build Enterprise AI API Layer

You are a senior backend engineer.

You must fix and harden the OpenAI integration for an enterprise BIBFRAME AI-assisted cataloging platform.

The current error:

OPENAI_API_KEY is not configured or is invalid (exists=true, len=9)

This means:
• Environment variable exists
• But it is invalid or truncated
• The system must be fixed properly

🎯 OBJECTIVES

Properly configure OPENAI_API_KEY

Prevent future misconfiguration

Build secure backend AI proxy layer

Add validation and health checks

Add logging and failure handling

Make system production-ready

🔐 STEP 1 — Secure Environment Configuration
Requirements

• API key must never exist in frontend
• Must be stored in backend environment
• Must not be committed to git
• Must validate format before use

Implement
Node.js Backend Example

Install:

npm install openai dotenv

Create .env:

OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Load safely:

import dotenv from "dotenv";
dotenv.config();

if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.length < 40) {
  throw new Error("Invalid OPENAI_API_KEY configuration");
}
🧠 STEP 2 — Build AI Proxy Service

Do NOT call OpenAI directly from editor.

Create:

/api/ai/suggest-metadata

Backend route example:

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function suggestMetadata(req, res) {
  try {
    const { title, author, description } = req.body;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
        Extract structured bibliographic metadata:
        Title: ${title}
        Author: ${author}
        Description: ${description}

        Return JSON with:
        - subjects
        - genre
        - language
        - summary
      `
    });

    res.json({ success: true, data: response.output_text });

  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ success: false, error: "AI metadata suggestion failed" });
  }
}
🔎 STEP 3 — Add Health Check Endpoint

Create:

/api/ai/health
export async function aiHealth(req, res) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.length < 40) {
    return res.status(500).json({ status: "invalid_key" });
  }

  return res.json({ status: "ready" });
}

This prevents silent failure.

🧾 STEP 4 — Add AI Logging Table (PostgreSQL)

Create table:

CREATE TABLE ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_phase TEXT,
  input TEXT,
  output TEXT,
  success BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

Log every request.

🛡 STEP 5 — Add Production Safeguards

Must implement:

• Rate limiting
• Timeout handling
• Retry logic
• Error classification
• Token usage tracking
• Cost monitoring

Example timeout wrapper:

const controller = new AbortController();
setTimeout(() => controller.abort(), 10000);
🚀 STEP 6 — Add Validation Before Saving to RDF

AI suggestions must:

• Not generate fake URIs
• Not overwrite confirmed fields
• Require human confirmation
• Store AI-generated content separately

Only after user approval:

Convert to RDF triples.

🧩 STEP 7 — Optional Enterprise Layer

For production system:

Create separate AI microservice container:

ai-service/
  - metadata engine
  - duplicate detection engine
  - nl-to-sparql engine

Communicate via internal API.

Never mix AI logic inside triple store.

🏗 FINAL RESULT

After implementation:

✔ Secure API key
✔ No frontend exposure
✔ Controlled AI suggestions
✔ Logging and governance
✔ Production-ready AI layer
✔ Stable foundation for Phase 1–5