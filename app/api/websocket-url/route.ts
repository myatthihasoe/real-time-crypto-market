export async function GET() {
  const baseUrl = process.env.COINGECKO_WEBSOCKET_URL;
  const apiKey = process.env.COINGECKO_API_KEY;

  if (!baseUrl || !apiKey) {
    return Response.json({ error: 'WebSocket URL or API key not configured' }, { status: 500 });
  }

  const url = `${baseUrl}?x_cg_pro_api_key=${apiKey}`;
  return Response.json({ url });
}