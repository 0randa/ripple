<script lang="ts">
	import { getHealthStatus } from '$lib/utils/health';
	import { formatParam, tankTypeLabel } from '$lib/utils/format';
	import HealthIndicator from './HealthIndicator.svelte';
	import ParameterBadge from '../parameters/ParameterBadge.svelte';

	let { tank, latestParams } = $props();

	let health = $derived(getHealthStatus(latestParams));
</script>

<a href="/tanks/{tank.id}" class="tank-card">
	<div class="card-header">
		<h3 class="tank-name">{tank.name}</h3>
		<HealthIndicator status={health} />
	</div>

	<div class="card-meta">
		<span class="type-badge">{tankTypeLabel(tank.type)}</span>
		<span class="volume">{tank.volume_liters}L</span>
	</div>

	{#if latestParams}
		<div class="params-grid">
			<ParameterBadge label="pH" value={latestParams.ph} param="ph" />
			<ParameterBadge label="NH₃" value={latestParams.ammonia} param="ammonia" unit="ppm" />
			<ParameterBadge label="NO₂" value={latestParams.nitrite} param="nitrite" unit="ppm" />
			<ParameterBadge label="NO₃" value={latestParams.nitrate} param="nitrate" unit="ppm" />
			<ParameterBadge label="Temp" value={latestParams.temperature} param="temperature" unit="°F" />
		</div>
	{:else}
		<p class="no-data">No parameters logged yet</p>
	{/if}
</a>

<style>
	.tank-card {
		display: block;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-5);
		text-decoration: none;
		color: inherit;
		transition: all var(--transition-base);
		backdrop-filter: blur(8px);
	}

	.tank-card:hover {
		background: var(--color-bg-card-hover);
		border-color: var(--color-teal-muted);
		box-shadow: var(--shadow-card);
		transform: translateY(-2px);
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-2);
	}

	.tank-name {
		font-family: var(--font-heading);
		font-size: 1.2rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.card-meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.type-badge {
		font-size: 0.75rem;
		padding: var(--space-1) var(--space-2);
		background: rgba(26, 122, 122, 0.15);
		color: var(--color-teal-light);
		border-radius: var(--radius-full);
		font-weight: 500;
	}

	.volume {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--color-text-secondary);
	}

	.params-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
		gap: var(--space-2);
	}

	.no-data {
		color: var(--color-text-muted);
		font-size: 0.85rem;
		font-style: italic;
	}
</style>
