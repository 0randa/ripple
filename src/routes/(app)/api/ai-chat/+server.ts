import { GEMINI_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
		return json({ error: 'not_configured', message: 'AI chat is not configured. Add a GEMINI_API_KEY to your .env file.' });
	}

	const { message, tankContext } = await request.json();

	const systemPrompt = `You are an expert aquarium advisor helping a fish keeper. Be concise but thorough.

Tank: ${tankContext.name} (${tankContext.type}, ${tankContext.volume_liters}L)
${tankContext.latestParams ? `Latest Parameters: pH ${tankContext.latestParams.ph}, Ammonia ${tankContext.latestParams.ammonia}ppm, Nitrite ${tankContext.latestParams.nitrite}ppm, Nitrate ${tankContext.latestParams.nitrate}ppm, Temp ${tankContext.latestParams.temperature}°F` : 'No parameter data yet.'}
Inhabitants: ${tankContext.inhabitants?.length ? tankContext.inhabitants.map((i: any) => `${i.name} (${i.species})`).join(', ') : 'None yet'}

Provide helpful, specific advice based on this data. If you detect concerning parameter values, flag them clearly.`;

	try {
		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					system_instruction: { parts: [{ text: systemPrompt }] },
					contents: [{ role: 'user', parts: [{ text: message }] }],
					generationConfig: {
						maxOutputTokens: 1024,
						temperature: 0.7
					}
				})
			}
		);

		if (response.status === 429) {
			return json({ error: 'quota_exceeded', message: 'AI assistant is currently unavailable — free credits used up.' });
		}

		if (!response.ok) {
			const errBody = await response.text();
			console.error('Gemini API error:', response.status, errBody);
			return json({ error: 'api_error', message: 'AI is temporarily unavailable. Please try again later.' });
		}

		const result = await response.json();
		const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

		return json({ text });
	} catch (err) {
		console.error('AI chat error:', err);
		return json({ error: 'api_error', message: 'Failed to connect to AI service.' });
	}
};
