<script lang="ts">
	import type { HealthStatus } from '$lib/utils/health';

	let { status }: { status: HealthStatus } = $props();
</script>

<span
	class="indicator {status}"
	title={status === 'unknown' ? 'No data' : status}
></span>

<style>
	.indicator {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.healthy {
		background: var(--color-healthy);
		animation: pulse-healthy 2s ease-in-out infinite;
	}

	.warning {
		background: var(--color-warning);
		animation: pulse-warning 1.5s ease-in-out infinite;
	}

	.critical {
		background: var(--color-critical);
		animation: pulse-critical 1s ease-in-out infinite;
	}

	.unknown {
		background: var(--color-text-muted);
		opacity: 0.5;
	}
</style>
