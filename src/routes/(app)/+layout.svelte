<script lang="ts">
	import { goto, onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data, children } = $props();
	let isLight = $state(false);

	onMount(() => {
		isLight = document.documentElement.getAttribute('data-theme') === 'light';
	});

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	function toggleTheme() {
		const next = isLight ? '' : 'light';
		isLight = !isLight;
		document.documentElement.setAttribute('data-theme', next);
		localStorage.setItem('ripple-theme', next);
	}

	async function logout() {
		await data.supabase.auth.signOut();
		goto('/login');
	}
</script>

<div class="app-shell">
	<nav class="navbar">
		<a href="/dashboard" class="nav-brand">
			<span class="brand-text">Ripple</span>
		</a>

		<div class="nav-actions">
			<button class="nav-btn" onclick={toggleTheme} title="Toggle theme">
				{#if isLight}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="5" />
						<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
					</svg>
				{:else}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
					</svg>
				{/if}
			</button>
			<button class="nav-btn logout-btn" onclick={logout}>
				Sign out
			</button>
		</div>
	</nav>

	<main class="app-main">
		{@render children()}
	</main>
</div>

<style>
	.app-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-6);
		background: var(--color-bg-secondary);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 100;
		backdrop-filter: blur(12px);
	}

	.nav-brand {
		text-decoration: none;
	}

	.brand-text {
		font-family: var(--font-heading);
		font-size: 1.4rem;
		font-style: italic;
		font-weight: 700;
		color: var(--color-teal-light);
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.nav-btn {
		padding: var(--space-2) var(--space-3);
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		font-size: 0.85rem;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.nav-btn:hover {
		border-color: var(--color-teal);
		color: var(--color-text);
	}

	.app-main {
		flex: 1;
		padding: var(--space-6);
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
	}

	@media (max-width: 640px) {
		.app-main {
			padding: var(--space-4);
		}

		.navbar {
			padding: var(--space-3) var(--space-4);
		}
	}
</style>
