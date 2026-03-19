<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
	let loading = $state(false);
</script>

<form
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	}}
>
	<div class="form-card">
		<h2>Welcome back</h2>

		{#if form?.error}
			<div class="error-message">{form.error}</div>
		{/if}

		<label>
			<span>Email</span>
			<input type="email" name="email" required placeholder="you@example.com" />
		</label>

		<label>
			<span>Password</span>
			<input type="password" name="password" required placeholder="Your password" />
		</label>

		<button type="submit" disabled={loading}>
			{loading ? 'Signing in...' : 'Sign in'}
		</button>

		<p class="switch-link">
			Don't have an account? <a href="/register">Create one</a>
		</p>
	</div>
</form>

<style>
	.form-card {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
		backdrop-filter: blur(12px);
	}

	h2 {
		text-align: center;
		margin-bottom: var(--space-6);
		color: var(--color-text);
	}

	.error-message {
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: #fca5a5;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		margin-bottom: var(--space-4);
	}

	label {
		display: block;
		margin-bottom: var(--space-4);
	}

	label span {
		display: block;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--space-1);
	}

	input {
		width: 100%;
		padding: var(--space-3) var(--space-4);
		background: var(--color-bg-input);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text);
		font-size: 1rem;
		transition: border-color var(--transition-fast);
	}

	input:focus {
		outline: none;
		border-color: var(--color-teal);
		box-shadow: 0 0 0 3px rgba(26, 122, 122, 0.2);
	}

	input::placeholder {
		color: var(--color-text-muted);
	}

	button {
		width: 100%;
		padding: var(--space-3) var(--space-4);
		background: var(--color-teal);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-size: 1rem;
		font-weight: 500;
		transition: background var(--transition-fast);
		margin-top: var(--space-2);
	}

	button:hover:not(:disabled) {
		background: var(--color-teal-deep);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.switch-link {
		text-align: center;
		margin-top: var(--space-4);
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}
</style>
