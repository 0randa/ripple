<script lang="ts">
	import { getParamStatus } from '$lib/utils/health';
	import { formatParam } from '$lib/utils/format';

	let { label, value, param, unit = '' }: {
		label: string;
		value: number | null;
		param: string;
		unit?: string;
	} = $props();

	let status = $derived(getParamStatus(param as any, value));
</script>

<div class="badge {status}">
	<span class="badge-label">{label}</span>
	<span class="badge-value mono">
		{formatParam(value)}{#if value !== null}<span class="badge-unit">{unit}</span>{/if}
	</span>
</div>

<style>
	.badge {
		text-align: center;
		padding: var(--space-2);
		border-radius: var(--radius-md);
		background: rgba(255, 255, 255, 0.03);
	}

	.badge-label {
		display: block;
		font-size: 0.7rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-1);
	}

	.badge-value {
		font-family: var(--font-mono);
		font-size: 0.95rem;
		font-weight: 500;
	}

	.badge-unit {
		font-size: 0.7rem;
		color: var(--color-text-muted);
		margin-left: 1px;
	}

	.healthy .badge-value { color: var(--color-healthy); }
	.warning .badge-value { color: var(--color-warning); }
	.critical .badge-value { color: var(--color-critical); }
	.unknown .badge-value { color: var(--color-text-muted); }
</style>
