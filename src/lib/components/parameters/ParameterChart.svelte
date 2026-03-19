<script lang="ts">
	import { formatDateTime, formatParam } from '$lib/utils/format';

	let { data, parameter, label, color = 'var(--color-teal-light)' }: {
		data: any[];
		parameter: string;
		label: string;
		color?: string;
	} = $props();

	const WIDTH = 380;
	const HEIGHT = 180;
	const PADDING = { top: 20, right: 15, bottom: 30, left: 45 };
	const chartW = WIDTH - PADDING.left - PADDING.right;
	const chartH = HEIGHT - PADDING.top - PADDING.bottom;

	let filteredData = $derived(data.filter((d) => d[parameter] !== null));

	let yMin = $derived(Math.min(...filteredData.map((d) => d[parameter])));
	let yMax = $derived(Math.max(...filteredData.map((d) => d[parameter])));
	let yRange = $derived(yMax - yMin || 1);

	function xScale(i: number): number {
		return PADDING.left + (i / Math.max(filteredData.length - 1, 1)) * chartW;
	}

	function yScale(val: number): number {
		return PADDING.top + chartH - ((val - yMin) / yRange) * chartH;
	}

	let linePath = $derived(
		filteredData.length > 1
			? filteredData
					.map((d, i) => {
						const x = xScale(i);
						const y = yScale(d[parameter]);
						return `${i === 0 ? 'M' : 'L'}${x},${y}`;
					})
					.join(' ')
			: ''
	);

	let areaPath = $derived(
		filteredData.length > 1
			? linePath +
				` L${xScale(filteredData.length - 1)},${PADDING.top + chartH} L${PADDING.left},${PADDING.top + chartH} Z`
			: ''
	);

	// Y-axis ticks
	let yTicks = $derived(() => {
		const ticks = [];
		const step = yRange / 4;
		for (let i = 0; i <= 4; i++) {
			ticks.push(yMin + step * i);
		}
		return ticks;
	});

	let hoveredIndex = $state<number | null>(null);

	function handleMouseMove(e: MouseEvent) {
		const svg = (e.currentTarget as SVGElement).getBoundingClientRect();
		const mouseX = e.clientX - svg.left - PADDING.left;
		const idx = Math.round((mouseX / chartW) * (filteredData.length - 1));
		hoveredIndex = Math.max(0, Math.min(idx, filteredData.length - 1));
	}

	function handleMouseLeave() {
		hoveredIndex = null;
	}
</script>

<div class="chart-wrapper">
	<h3 class="chart-label">{label}</h3>
	{#if filteredData.length > 1}
		<svg
			viewBox="0 0 {WIDTH} {HEIGHT}"
			class="chart"
			onmousemove={handleMouseMove}
			onmouseleave={handleMouseLeave}
			role="img"
			aria-label="{label} chart"
		>
			<!-- Grid lines -->
			{#each yTicks() as tick}
				<line
					x1={PADDING.left}
					x2={WIDTH - PADDING.right}
					y1={yScale(tick)}
					y2={yScale(tick)}
					class="grid-line"
				/>
				<text
					x={PADDING.left - 8}
					y={yScale(tick) + 4}
					class="axis-label"
					text-anchor="end"
				>
					{formatParam(tick)}
				</text>
			{/each}

			<!-- Area fill -->
			<path d={areaPath} fill={color} class="area-fill" />

			<!-- Line -->
			<path d={linePath} fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

			<!-- Data points -->
			{#each filteredData as point, i}
				<circle
					cx={xScale(i)}
					cy={yScale(point[parameter])}
					r={hoveredIndex === i ? 5 : 2.5}
					fill={color}
					opacity={hoveredIndex === i ? 1 : 0.6}
				/>
			{/each}

			<!-- Hover tooltip -->
			{#if hoveredIndex !== null && filteredData[hoveredIndex]}
				{@const point = filteredData[hoveredIndex]}
				{@const tx = xScale(hoveredIndex)}
				{@const ty = yScale(point[parameter])}

				<line x1={tx} x2={tx} y1={PADDING.top} y2={PADDING.top + chartH} stroke={color} stroke-width="1" opacity="0.3" />

				<g transform="translate({Math.min(tx, WIDTH - 90)}, {Math.max(ty - 40, 5)})">
					<rect x="-35" y="-12" width="70" height="28" rx="6" class="tooltip-bg" stroke={color} stroke-width="1" />
					<text x="0" y="2" class="tooltip-value" text-anchor="middle" fill={color}>
						{formatParam(point[parameter])}
					</text>
					<text x="0" y="12" class="tooltip-date" text-anchor="middle">
						{formatDateTime(point.logged_at).split(',')[0]}
					</text>
				</g>
			{/if}
		</svg>
	{:else}
		<div class="chart-empty">Not enough data</div>
	{/if}
</div>

<style>
	.chart-wrapper {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
	}

	.chart-label {
		font-family: var(--font-heading);
		font-size: 0.9rem;
		font-weight: 400;
		color: var(--color-text-secondary);
		margin-bottom: var(--space-2);
	}

	.chart {
		width: 100%;
		height: auto;
	}

	.area-fill {
		opacity: 0.12;
	}

	:global([data-theme='light']) .area-fill {
		opacity: 0.18;
	}

	.grid-line {
		stroke: var(--color-border);
		stroke-width: 0.5;
	}

	.axis-label {
		font-family: var(--font-mono);
		font-size: 9px;
		fill: var(--color-text-muted);
	}

	.tooltip-bg {
		fill: var(--color-bg-secondary);
		opacity: 0.95;
	}

	.tooltip-value {
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 600;
	}

	.tooltip-date {
		font-size: 8px;
		fill: var(--color-text-muted);
	}

	.chart-empty {
		height: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-muted);
		font-size: 0.85rem;
		font-style: italic;
	}
</style>
