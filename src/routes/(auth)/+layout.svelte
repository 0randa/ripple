<script lang="ts">
	let { children } = $props();
</script>

<div class="auth-layout">
	<div class="auth-container">
		<div class="auth-logo">
			<h1>Ripple</h1>
			<p>Aquarium Management</p>
		</div>
		{@render children()}
	</div>
</div>

<style>
	.auth-layout {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-4);
		background: linear-gradient(135deg, var(--color-deep-navy) 0%, var(--color-ocean-dark) 50%, var(--color-teal-deep) 100%);
	}

	.auth-container {
		width: 100%;
		max-width: 420px;
	}

	.auth-logo {
		text-align: center;
		margin-bottom: var(--space-8);
	}

	.auth-logo h1 {
		font-family: var(--font-heading);
		font-size: 2.5rem;
		font-style: italic;
		color: var(--color-teal-light);
		letter-spacing: 0.02em;
	}

	.auth-logo p {
		color: var(--color-text-secondary);
		margin-top: var(--space-1);
		font-size: 0.9rem;
	}
</style>
