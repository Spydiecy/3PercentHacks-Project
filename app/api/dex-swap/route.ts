import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();

    // Forward the request to the external API
    const response = await fetch('https://api.rango.exchange/basic/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
