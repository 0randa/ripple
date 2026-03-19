<script lang="ts">
	interface Message {
		role: 'user' | 'assistant';
		text: string;
	}

	let { tank, latestParams, inhabitants, open = $bindable(false) }: {
		tank: any;
		latestParams: any;
		inhabitants: any[];
		open: boolean;
	} = $props();

	let messages = $state<Message[]>([]);
	let input = $state('');
	let loading = $state(false);
	let error = $state('');
	let chatContainer: HTMLElement;

	async function sendMessage() {
		if (!input.trim() || loading) return;

		const userMessage = input.trim();
		input = '';
		messages = [...messages, { role: 'user', text: userMessage }];
		loading = true;
		error = '';

		try {
			const res = await fetch('/api/ai-chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: userMessage,
					tankContext: {
						name: tank.name,
						type: tank.type,
						volume_liters: tank.volume_liters,
						latestParams,
						inhabitants
					}
				})
			});

			const data = await res.json();

			if (data.error === 'quota_exceeded' || data.error === 'not_configured') {
				error = data.message;
				loading = false;
				return;
			}

			if (data.error) {
				error = data.message || 'Something went wrong.';
				loading = false;
				return;
			}

			messages = [...messages, { role: 'assistant', text: data.text }];
		} catch {
			error = 'Failed to reach AI service.';
		}

		loading = false;
		// Scroll to bottom
		setTimeout(() => {
			if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
		}, 50);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}
</script>

{#if open}
	<div class="chat-backdrop" onclick={() => open = false} role="presentation"></div>
	<div class="chat-panel">
		<div class="chat-header">
			<h3>AI Assistant</h3>
			<button class="close-btn" onclick={() => open = false}>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 6L6 18M6 6l12 12" />
				</svg>
			</button>
		</div>

		<div class="chat-messages" bind:this={chatContainer}>
			{#if messages.length === 0}
				<div class="chat-intro">
					<p>Ask me about your tank — water quality, fish health, treatment advice, or anything else.</p>
				</div>
			{/if}

			{#each messages as msg}
				<div class="message {msg.role}">
					<div class="message-bubble">
						{msg.text}
					</div>
				</div>
			{/each}

			{#if loading}
				<div class="message assistant">
					<div class="message-bubble typing">
						<span class="dot"></span><span class="dot"></span><span class="dot"></span>
					</div>
				</div>
			{/if}

			{#if error}
				<div class="error-banner">{error}</div>
			{/if}
		</div>

		<div class="chat-input">
			<textarea
				bind:value={input}
				onkeydown={handleKeydown}
				placeholder="Describe symptoms or ask about your tank..."
				rows="2"
				disabled={!!error && (error.includes('credits') || error.includes('configured'))}
			></textarea>
			<button class="send-btn" onclick={sendMessage} disabled={!input.trim() || loading}>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
				</svg>
			</button>
		</div>
	</div>
{/if}

<style>
	.chat-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 300;
	}

	.chat-panel {
		position: fixed;
		z-index: 301;
		display: flex;
		flex-direction: column;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);

		/* Desktop: slide from right */
		right: 0;
		top: 0;
		bottom: 0;
		width: 400px;
		animation: slide-right-in 0.3s ease-out;
	}

	.chat-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-5);
		border-bottom: 1px solid var(--color-border);
		background: rgba(213, 168, 83, 0.05);
	}

	.chat-header h3 {
		font-family: var(--font-heading);
		font-style: italic;
		color: var(--color-gold);
		font-size: 1.1rem;
	}

	.close-btn {
		background: none;
		border: none;
		color: var(--color-text-secondary);
		padding: var(--space-1);
	}

	.close-btn:hover {
		color: var(--color-text);
	}

	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.chat-intro {
		text-align: center;
		padding: var(--space-8) var(--space-4);
		color: var(--color-text-muted);
		font-size: 0.9rem;
		font-style: italic;
	}

	.message {
		display: flex;
	}

	.message.user {
		justify-content: flex-end;
	}

	.message-bubble {
		max-width: 85%;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-lg);
		font-size: 0.9rem;
		line-height: 1.5;
		white-space: pre-wrap;
	}

	.user .message-bubble {
		background: var(--color-teal);
		color: white;
		border-bottom-right-radius: var(--radius-sm);
	}

	.assistant .message-bubble {
		background: rgba(213, 168, 83, 0.1);
		border: 1px solid rgba(213, 168, 83, 0.2);
		color: var(--color-text);
		border-bottom-left-radius: var(--radius-sm);
	}

	.typing {
		display: flex;
		gap: 4px;
		align-items: center;
		padding: var(--space-3) var(--space-5);
	}

	.dot {
		width: 6px;
		height: 6px;
		background: var(--color-gold);
		border-radius: 50%;
		animation: pulse-warning 1s ease-in-out infinite;
	}

	.dot:nth-child(2) { animation-delay: 0.2s; }
	.dot:nth-child(3) { animation-delay: 0.4s; }

	.error-banner {
		text-align: center;
		padding: var(--space-3);
		background: rgba(245, 158, 11, 0.1);
		border: 1px solid rgba(245, 158, 11, 0.2);
		border-radius: var(--radius-md);
		color: var(--color-amber);
		font-size: 0.85rem;
	}

	.chat-input {
		display: flex;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		border-top: 1px solid var(--color-border);
		background: rgba(213, 168, 83, 0.03);
	}

	textarea {
		flex: 1;
		resize: none;
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg-input);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text);
		font-size: 0.9rem;
		font-family: var(--font-body);
	}

	textarea:focus {
		outline: none;
		border-color: var(--color-gold);
	}

	textarea:disabled {
		opacity: 0.5;
	}

	.send-btn {
		padding: var(--space-2) var(--space-3);
		background: var(--color-gold);
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-deep-navy);
		transition: opacity var(--transition-fast);
		align-self: flex-end;
	}

	.send-btn:hover:not(:disabled) {
		opacity: 0.8;
	}

	.send-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Mobile: slide from bottom */
	@media (max-width: 640px) {
		.chat-panel {
			top: auto;
			left: 0;
			right: 0;
			bottom: 0;
			width: 100%;
			height: 75vh;
			border-radius: var(--radius-xl) var(--radius-xl) 0 0;
			animation: slide-up 0.3s ease-out;
		}
	}
</style>
