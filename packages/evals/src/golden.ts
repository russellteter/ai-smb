import { request } from 'undici';

async function main() {
  const base = process.env.API_BASE || 'http://localhost:3001';
  // Health
  const healthResp = await request(`${base}/health`);
  const health = (await healthResp.body.json()) as any;
  if (!health.ok) throw new Error('Health failed');
  // Parser
  const parseResp = await request(`${base}/api/parse_prompt`, {
    method: 'POST',
    body: JSON.stringify({ prompt: 'dentists in columbia sc with no chat widget and owner identified' }),
    headers: { 'content-type': 'application/json' }
  });
  const parse = (await parseResp.body.json()) as any;
  if (!parse.dsl || parse.dsl.version !== 1) throw new Error('Parser invalid');
  console.log('Evals passed');
}

main().catch((e) => {
  console.error('Evals failed', e);
  process.exit(1);
});

