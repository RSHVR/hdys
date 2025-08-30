<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	interface Message {
		id: string;
		text: string;
		isUser: boolean;
		isStreaming?: boolean;
		targetLanguage?: string;
	}

	const LANGUAGES = [
		'Japanese',
		'French',
		'German',
		'Spanish',
		'Italian',
		'Portuguese',
		'Korean',
		'Chinese',
		'Arabic',
		'Greek',
		'Persian',
		'Polish',
		'Indonesian',
		'Czech',
		'Hebrew',
		'Hindi',
		'Dutch',
		'Romanian',
		'Russian',
		'Turkish',
		'Ukrainian',
		'Vietnamese'
	];

	let messages: Message[] = $state([]);
	let inputText = $state('');
	let selectedLanguage = $state('Japanese');
	let isLoading = $state(false);
	let chatContainer: HTMLElement;
	let textareaRef: HTMLTextAreaElement;

	onMount(() => {
		if (browser) {
			const stored = localStorage.getItem('chat-messages');
			if (stored) {
				messages = JSON.parse(stored);
			}
		}
	});

	function saveMessages() {
		if (browser) {
			localStorage.setItem('chat-messages', JSON.stringify(messages));
		}
	}

	function scrollToBottom() {
		setTimeout(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);
	}

	async function sendMessage() {
		if (!inputText.trim() || isLoading) return;

		const userMessage: Message = {
			id: crypto.randomUUID(),
			text: inputText,
			isUser: true
		};

		const botMessage: Message = {
			id: crypto.randomUUID(),
			text: '',
			isUser: false,
			isStreaming: true,
			targetLanguage: selectedLanguage
		};

		messages = [...messages, userMessage, botMessage];
		saveMessages();
		scrollToBottom();

		const textToTranslate = inputText;
		inputText = '';
		isLoading = true;

		try {
			const response = await fetch('/api/translate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					text: textToTranslate,
					targetLanguage: selectedLanguage
				})
			});

			if (!response.ok) {
				throw new Error('Translation failed');
			}

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
							const data = JSON.parse(line.slice(6));

							if (data.type === 'chunk') {
								const messageIndex = messages.findIndex((m) => m.id === botMessage.id);
								if (messageIndex !== -1) {
									messages[messageIndex] = {
										...messages[messageIndex],
										text: messages[messageIndex].text + data.text
									};
									saveMessages();
									scrollToBottom();
								}
							} else if (data.type === 'complete') {
								const messageIndex = messages.findIndex((m) => m.id === botMessage.id);
								if (messageIndex !== -1) {
									messages[messageIndex] = {
										...messages[messageIndex],
										isStreaming: false
									};
									saveMessages();
								}
								break;
							} else if (data.type === 'error') {
								const messageIndex = messages.findIndex((m) => m.id === botMessage.id);
								if (messageIndex !== -1) {
									messages[messageIndex] = {
										...messages[messageIndex],
										text: 'Sorry, translation failed. Please try again.',
										isStreaming: false
									};
									saveMessages();
								}
								break;
							}
						} catch (e) {
							// Skip malformed JSON
						}
					}
				}
			}
		} catch (error) {
			const messageIndex = messages.findIndex((m) => m.id === botMessage.id);
			if (messageIndex !== -1) {
				messages[messageIndex] = {
					...messages[messageIndex],
					text: 'Sorry, translation failed. Please try again.',
					isStreaming: false
				};
				saveMessages();
			}
		}

		isLoading = false;

		// Refocus textarea for smoother interaction
		if (textareaRef) {
			textareaRef.focus();
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function clearChat() {
		messages = [];
		if (browser) {
			localStorage.removeItem('chat-messages');
		}
	}
</script>

<div class="flex min-h-screen flex-col bg-[#FCDFA6]">
	<!-- Header -->
	<div
		class="sticky top-0 z-10 flex items-center justify-center border-b border-stone-200 bg-[#6D5A72] px-4 py-3 backdrop-blur-sm"
	>
		<h1 class="text-xl font-semibold text-white">How Do You Say?</h1>
	</div>

	<!-- Chat Container -->
	<div class="flex-1 px-4 pt-2 pb-2">
		<div class="mx-auto max-w-md flex justify-end mb-2">
			<button
				onclick={clearChat}
				class="rounded-lg px-2 py-1 text-xs text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700"
			>
				Clear
			</button>
		</div>
		<div bind:this={chatContainer} class="mx-auto max-w-md h-[calc(100vh-240px)] overflow-y-auto space-y-4 rounded-2xl border border-stone-300 bg-white/50 px-4 py-4 shadow-sm">
			{#each messages as message (message.id)}
				<div class="flex {message.isUser ? 'justify-end' : 'justify-start'}">
					<div class="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
						{#if message.isUser}
							<div class="rounded-2xl rounded-br-sm bg-blue-500 px-4 py-2 text-white shadow-sm">
								<p class="text-sm whitespace-pre-wrap">{message.text}</p>
							</div>
						{:else}
							<div
								class="rounded-2xl rounded-bl-sm border border-stone-200 bg-white px-4 py-2 shadow-sm"
							>
								{#if message.targetLanguage}
									<div class="mb-1 text-xs text-stone-500">→ {message.targetLanguage}</div>
								{/if}
								<p class="text-sm whitespace-pre-wrap text-stone-800">
									{message.text}
									{#if message.isStreaming}
										<span class="ml-1 inline-block h-4 w-2 animate-pulse bg-blue-500"></span>
									{/if}
								</p>
							</div>
						{/if}
					</div>
				</div>
			{/each}

			{#if messages.length === 0}
				<div class="flex h-64 items-center justify-center">
					<div class="text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500"
						>
							<svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z"
								/>
							</svg>
						</div>
						<h3 class="mb-2 text-lg font-medium text-stone-800">Start a Translation</h3>
						<p class="max-w-sm text-sm text-stone-500">
							Type any text below and I'll translate it to {selectedLanguage} for you.
						</p>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Input Area -->
	<div class="p-4">
		<div class="mx-auto max-w-md rounded-2xl border border-stone-300 bg-white/80 p-4 shadow-sm">
			<div class="flex gap-3">
				<div class="relative flex-1">
					<textarea
						bind:this={textareaRef}
						bind:value={inputText}
						onkeydown={handleKeyPress}
						placeholder="Type something to translate..."
						disabled={isLoading}
						class="w-full resize-none rounded-xl border border-stone-300 bg-white/90 px-4 py-3 text-sm placeholder:text-stone-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
						rows="1"
						style="min-height: 44px; max-height: 120px;"
					></textarea>
				</div>
				<button
					onclick={sendMessage}
					disabled={!inputText.trim() || isLoading}
					class="flex items-center justify-center rounded-xl bg-blue-500 h-11 w-11 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="Send message"
				>
					{#if isLoading}
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
						></div>
					{:else}
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
							/>
						</svg>
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Language Selection -->
	<div class="bg-[#FCDFA6] p-4">
		<div class="mx-auto max-w-md">
			<label class="mb-2 block text-sm font-medium text-stone-700"> Target Language </label>
			<select
				bind:value={selectedLanguage}
				class="w-full min-w-48 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:w-auto"
			>
				{#each LANGUAGES as language}
					<option value={language}>{language}</option>
				{/each}
			</select>
		</div>
	</div>
</div>
