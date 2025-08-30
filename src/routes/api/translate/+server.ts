import type { RequestHandler } from './$types';
import { COHERE_API_KEY } from '$env/static/private';

export const POST: RequestHandler = async ({ request, platform }) => {
	const apiKey = COHERE_API_KEY || platform?.env?.COHERE_API_KEY;

	if (!apiKey) {
		return new Response('API key not configured', { status: 500 });
	}

	try {
		const { text, targetLanguage } = await request.json();

		if (!text || !targetLanguage) {
			return new Response('Text and target language are required', { status: 400 });
		}

		const response = await fetch('https://api.cohere.ai/v2/chat', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'command-a-translate-08-2025',
				messages: [
					{
						role: 'system',
						content: `You are a professional translator. Translate the given text accurately to ${targetLanguage}. Return both the translated text, and its English pronunciation, nothing else. Preserve the original meaning, tone, and formatting.`
					},
					{
						role: 'user',
						content: text
					}
				],
				stream: true,
				max_tokens: 1000
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Cohere API error:', response.status, errorText);
			return new Response(`Translation service error: ${response.status}`, { status: 500 });
		}

		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();

				const sendData = (data: any) => {
					const sseData = `data: ${JSON.stringify(data)}\n\n`;
					controller.enqueue(encoder.encode(sseData));
				};

				sendData({
					type: 'start',
					originalText: text,
					targetLanguage
				});

				try {
					const reader = response.body?.getReader();
					if (!reader) {
						throw new Error('No response body');
					}

					const decoder = new TextDecoder();
					let buffer = '';

					while (true) {
						const { done, value } = await reader.read();

						if (done) break;

						buffer += decoder.decode(value, { stream: true });
						const lines = buffer.split('\n');
						buffer = lines.pop() || '';

						for (const line of lines) {
							if (line.startsWith('data: ')) {
								try {
									const jsonData = JSON.parse(line.slice(6));

									if (jsonData.type === 'content-delta') {
										sendData({
											type: 'chunk',
											text: jsonData.delta?.message?.content?.text || ''
										});
									} else if (jsonData.type === 'message-end') {
										sendData({ type: 'complete' });
										break;
									}
								} catch (e) {
									// Skip malformed JSON
								}
							}
						}
					}
				} catch (error) {
					sendData({
						type: 'error',
						error: 'Translation failed'
					});
				}

				controller.close();
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST',
				'Access-Control-Allow-Headers': 'Content-Type'
			}
		});

	} catch (error) {
		console.error('Translation error:', error);
		return new Response('Internal server error', { status: 500 });
	}
};