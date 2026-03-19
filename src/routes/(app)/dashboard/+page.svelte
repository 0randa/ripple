<script lang="ts">
	import { enhance } from '$app/forms';
	import TankCard from '$lib/components/tanks/TankCard.svelte';

	let { data } = $props();
	let showForm = $state(false);
	let formLoading = $state(false);
</script>

<div class="dashboard">
	<header class="dashboard-header">
		<h1>My Tanks</h1>
		<button class="btn-primary" onclick={() => showForm = true}>
			+ Add Tank
		</button>
	</header>

	{#if showForm}
		<div class="modal-backdrop" onclick={() => showForm = false} role="presentation">
			<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog">
				<h2>New Tank</h2>
				<form
					method="POST"
					action="?/createTank"
					use:enhance={() => {
						formLoading = true;
						return async ({ result, update }) => {
							formLoading = false;
							if (result.type === 'success') {
								showForm = false;
							}
							await update();
						};
					}}
				>
					<label>
						<span>Tank name</span>
						<input type="text" name="name" required placeholder="e.g. Living Room Tank" />
					</label>

					<label>
						<span>Volume (liters)</span>
						<input type="number" name="volume_liters" required min="1" step="0.1" placeholder="e.g. 100" />
					</label>

					<label>
						<span>Type</span>
						<select name="type" required>
							<option value="">Select type...</option>
							<option value="freshwater">Freshwater</option>
							<option value="saltwater">Saltwater</option>
							<option value="planted">Planted</option>
						</select>
					</label>

					<div class="modal-actions">
						<button type="button" class="btn-secondary" onclick={() => showForm = false}>
							Cancel
						</button>
						<button type="submit" class="btn-primary" disabled={formLoading}>
							{formLoading ? 'Creating...' : 'Create Tank'}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	{#if data.tanks.length === 0}
		<div class="empty-state">
			<div class="empty-icon">
				<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<rect x="2" y="6" width="20" height="14" rx="2" />
					<path d="M12 10v4" />
					<path d="M10 12h4" />
				</svg>
			</div>
			<h2>No tanks yet</h2>
			<p>Add your first aquarium to start tracking water parameters and inhabitants.</p>
			<button class="btn-primary" onclick={() => showForm = true}>
				+ Add your first tank
			</button>
		</div>
	{:else}
		<div class="tank-grid">
			{#each data.tanks as tank (tank.id)}
				<TankCard {tank} latestParams={tank.latestParams} />
			{/each}
		</div>
	{/if}
</div>

<!-- Loading skeleton shown during navigation -->
{#if false}
<div class="tank-grid">
	{#each [1, 2, 3] as _}
		<div class="skeleton-card">
			<div class="skeleton" style="width: 60%; height: 24px; margin-bottom: 12px;"></div>
			<div class="skeleton" style="width: 40%; height: 16px; margin-bottom: 20px;"></div>
			<div class="skeleton-params">
				{#each [1, 2, 3, 4, 5] as _}
					<div class="skeleton" style="height: 48px;"></div>
				{/each}
			</div>
		</div>
	{/each}
</div>
{/if}

<style>
	.dashboard-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-6);
	}

	.dashboard-header h1 {
		font-family: var(--font-heading);
	}

	.tank-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
		gap: var(--space-5);
	}

	.empty-state {
		text-align: center;
		padding: var(--space-16) var(--space-4);
		color: var(--color-text-secondary);
	}

	.empty-icon {
		color: var(--color-teal);
		opacity: 0.5;
		margin-bottom: var(--space-4);
	}

	.empty-state h2 {
		margin-bottom: var(--space-2);
	}

	.empty-state p {
		max-width: 400px;
		margin: 0 auto var(--space-6);
		line-height: 1.6;
	}

	/* Buttons */
	.btn-primary {
		padding: var(--space-2) var(--space-5);
		background: var(--color-teal);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-size: 0.9rem;
		font-weight: 500;
		transition: background var(--transition-fast);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-teal-deep);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		padding: var(--space-2) var(--space-5);
		background: transparent;
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 0.9rem;
		transition: all var(--transition-fast);
	}

	.btn-secondary:hover {
		border-color: var(--color-text-muted);
		color: var(--color-text);
	}

	/* Modal */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 200;
		padding: var(--space-4);
		backdrop-filter: blur(4px);
	}

	.modal {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
		width: 100%;
		max-width: 440px;
		animation: fade-in 0.2s ease-out;
	}

	.modal h2 {
		margin-bottom: var(--space-6);
	}

	.modal label {
		display: block;
		margin-bottom: var(--space-4);
	}

	.modal label span {
		display: block;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--space-1);
	}

	.modal input,
	.modal select {
		width: 100%;
		padding: var(--space-3) var(--space-4);
		background: var(--color-bg-input);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text);
		font-size: 1rem;
	}

	.modal input:focus,
	.modal select:focus {
		outline: none;
		border-color: var(--color-teal);
	}

	.modal-actions {
		display: flex;
		gap: var(--space-3);
		justify-content: flex-end;
		margin-top: var(--space-6);
	}

	@media (max-width: 640px) {
		.tank-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
