METHOD 2 — CLI (More Reliable)

From project root:

supabase secrets set OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Then:

supabase functions deploy

This guarantees secret is injected.

🔎 VERIFY IT WORKS

Inside your edge function, temporarily add:

console.log("KEY LENGTH:", Deno.env.get("OPENAI_API_KEY")?.length);

After redeploy, logs should show:

KEY LENGTH: 50+

If it shows:

undefined

→ secret not injected

If it shows:

9

→ truncated key pasted

🧠 Why This Happens

Supabase Edge Functions run in isolated Deno runtime.

They DO NOT read:

• .env files
• local machine variables
• frontend secrets

They ONLY read:

Supabase → Edge Functions → Secrets

That’s it.

🎯 Final Architecture (Now Correct)
Frontend
   ↓
Supabase Edge Function (Deno)
   ↓ (Deno.env.get)
OpenAI

No client key.
No KV fallback.
No button.
Pure enterprise pattern.

⚠ If After This It Still Says “Not Configured”

Possible causes:

1️⃣ Secret added to wrong project
2️⃣ You didn’t redeploy
3️⃣ Using different Supabase environment
4️⃣ Key pasted with extra spaces
5️⃣ You saved under wrong name (must be EXACTLY: OPENAI_API_KEY)

Case-sensitive.

🔥 Quick Diagnostic Command

Run:

supabase secrets list

You should see:

OPENAI_API_KEY

If not → it’s not set.