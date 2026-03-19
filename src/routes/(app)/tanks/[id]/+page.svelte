<script lang="ts">
	import { enhance } from '$app/forms';
	import { getHealthStatus } from '$lib/utils/health';
	import { tankTypeLabel, formatParam, formatDateTime, formatTimeAgo, maintenanceTypeLabel } from '$lib/utils/format';
	import HealthIndicator from '$lib/components/tanks/HealthIndicator.svelte';
	import ParameterBadge from '$lib/components/parameters/ParameterBadge.svelte';
	import ParameterChart from '$lib/components/parameters/ParameterChart.svelte';
	import AiChatPanel from '$lib/components/ai/AiChatPanel.svelte';

	let { data, form } = $props();

	let latestParams = $derived(data.parameterLogs[data.parameterLogs.length - 1] || null);
	let health = $derived(getHealthStatus(latestParams));

	let showParamForm = $state(false);
	let showInhabitantForm = $state(false);
	let showMaintenanceForm = $state(false);
	let showBubbles = $state(false);
	let showAiChat = $state(false);
	let activeTab = $state<'params' | 'inhabitants' | 'maintenance'>('params');

	function triggerBubbles() {
		showBubbles = true;
		setTimeout(() => showBubbles = false, 1000);
	}
</script>

<div class="tank-detail">
	<header class="tank-header">
		<div class="header-left">
			<a href="/dashboard" class="back-link">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 12H5M12 19l-7-7 7-7" />
				</svg>
				Back
			</a>
			<div class="header-title">
				<h1>{data.tank.name}</h1>
				<div class="header-meta">
					<span class="type-badge">{tankTypeLabel(data.tank.type)}</span>
					<span class="volume mono">{data.tank.volume_liters}L</span>
					<HealthIndicator status={health} />
				</div>
			</div>
		</div>
	</header>

	<!-- Current Parameters Summary -->
	{#if latestParams}
		<div class="current-params">
			<ParameterBadge label="pH" value={latestParams.ph} param="ph" />
			<ParameterBadge label="NH₃" value={latestParams.ammonia} param="ammonia" unit="ppm" />
			<ParameterBadge label="NO₂" value={latestParams.nitrite} param="nitrite" unit="ppm" />
			<ParameterBadge label="NO₃" value={latestParams.nitrate} param="nitrate" unit="ppm" />
			<ParameterBadge label="Temp" value={latestParams.temperature} param="temperature" unit="°F" />
		</div>
	{/if}

	<!-- Tabs -->
	<div class="tabs">
		<button class="tab" class:active={activeTab === 'params'} onclick={() => activeTab = 'params'}>
			Parameters
		</button>
		<button class="tab" class:active={activeTab === 'inhabitants'} onclick={() => activeTab = 'inhabitants'}>
			Inhabitants ({data.inhabitants.length})
		</button>
		<button class="tab" class:active={activeTab === 'maintenance'} onclick={() => activeTab = 'maintenance'}>
			Maintenance
		</button>
	</div>

	<!-- Parameters Tab -->
	{#if activeTab === 'params'}
		<div class="tab-content fade-in">
			<div class="section-header">
				<h2>Parameter History</h2>
				<div class="bubble-container">
					<button class="btn-primary" onclick={() => showParamForm = !showParamForm}>
						+ Log Parameters
					</button>
					{#if showBubbles}
						<span class="bubble"></span>
						<span class="bubble"></span>
						<span class="bubble"></span>
					{/if}
				</div>
			</div>

			{#if showParamForm}
				<form
					method="POST"
					action="?/logParameters"
					class="param-form fade-in"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								showParamForm = false;
								triggerBubbles();
							}
							await update();
						};
					}}
				>
					<div class="param-inputs">
						<label>
							<span>pH</span>
							<input type="number" name="ph" step="0.1" min="0" max="14" placeholder="7.0" />
						</label>
						<label>
							<span>Ammonia (ppm)</span>
							<input type="number" name="ammonia" step="0.05" min="0" placeholder="0.00" />
						</label>
						<label>
							<span>Nitrite (ppm)</span>
							<input type="number" name="nitrite" step="0.05" min="0" placeholder="0.00" />
						</label>
						<label>
							<span>Nitrate (ppm)</span>
							<input type="number" name="nitrate" step="1" min="0" placeholder="0" />
						</label>
						<label>
							<span>Temp (°F)</span>
							<input type="number" name="temperature" step="0.1" min="0" placeholder="78.0" />
						</label>
					</div>
					<div class="form-actions">
						<button type="button" class="btn-secondary" onclick={() => showParamForm = false}>Cancel</button>
						<button type="submit" class="btn-primary">Save</button>
					</div>
				</form>
			{/if}

			{#if data.parameterLogs.length > 1}
				<div class="charts-grid">
					<ParameterChart data={data.parameterLogs} parameter="ph" label="pH" color="var(--color-teal-light)" />
					<ParameterChart data={data.parameterLogs} parameter="ammonia" label="Ammonia (ppm)" color="var(--color-warning)" />
					<ParameterChart data={data.parameterLogs} parameter="nitrite" label="Nitrite (ppm)" color="var(--color-critical)" />
					<ParameterChart data={data.parameterLogs} parameter="nitrate" label="Nitrate (ppm)" color="var(--color-amber)" />
					<ParameterChart data={data.parameterLogs} parameter="temperature" label="Temperature (°F)" color="var(--color-teal)" />
				</div>
			{:else}
				<p class="empty-section">Log at least 2 readings to see charts.</p>
			{/if}
		</div>
	{/if}

	<!-- Inhabitants Tab -->
	{#if activeTab === 'inhabitants'}
		<div class="tab-content fade-in">
			<div class="section-header">
				<h2>Inhabitants</h2>
				<button class="btn-primary" onclick={() => showInhabitantForm = !showInhabitantForm}>
					+ Add
				</button>
			</div>

			{#if showInhabitantForm}
				<form
					method="POST"
					action="?/addInhabitant"
					class="inline-form fade-in"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') showInhabitantForm = false;
							await update();
						};
					}}
				>
					<div class="inline-fields">
						<input type="text" name="name" required placeholder="Name" />
						<input type="text" name="species" required placeholder="Species" />
						<select name="inhabitantType" required>
							<option value="fish">Fish</option>
							<option value="plant">Plant</option>
						</select>
					</div>
					<div class="form-actions">
						<button type="button" class="btn-secondary" onclick={() => showInhabitantForm = false}>Cancel</button>
						<button type="submit" class="btn-primary">Add</button>
					</div>
				</form>
			{/if}

			{#if data.inhabitants.length === 0}
				<p class="empty-section">No inhabitants yet. Add your fish and plants!</p>
			{:else}
				<div class="inhabitant-list">
					{#each data.inhabitants as inhabitant (inhabitant.id)}
						<div class="inhabitant-item">
							<div class="inhabitant-info">
								<span class="inhabitant-icon">{inhabitant.type === 'fish' ? '🐟' : '🌿'}</span>
								<div>
									<strong>{inhabitant.name}</strong>
									<span class="species">{inhabitant.species}</span>
								</div>
							</div>
							<form method="POST" action="?/removeInhabitant" use:enhance>
								<input type="hidden" name="id" value={inhabitant.id} />
								<button type="submit" class="btn-icon" title="Remove">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M18 6L6 18M6 6l12 12" />
									</svg>
								</button>
							</form>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Maintenance Tab -->
	{#if activeTab === 'maintenance'}
		<div class="tab-content fade-in">
			<div class="section-header">
				<h2>Maintenance Log</h2>
				<button class="btn-primary" onclick={() => showMaintenanceForm = !showMaintenanceForm}>
					+ Log Event
				</button>
			</div>

			{#if showMaintenanceForm}
				<form
					method="POST"
					action="?/logMaintenance"
					class="inline-form fade-in"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') showMaintenanceForm = false;
							await update();
						};
					}}
				>
					<div class="inline-fields">
						<select name="maintenanceType" required>
							<option value="">Select type...</option>
							<option value="water_change">Water Change</option>
							<option value="filter_clean">Filter Clean</option>
							<option value="dosing">Dosing</option>
						</select>
						<input type="text" name="notes" placeholder="Notes (optional)" />
					</div>
					<div class="form-actions">
						<button type="button" class="btn-secondary" onclick={() => showMaintenanceForm = false}>Cancel</button>
						<button type="submit" class="btn-primary">Log</button>
					</div>
				</form>
			{/if}

			{#if data.maintenanceEvents.length === 0}
				<p class="empty-section">No maintenance events logged yet.</p>
			{:else}
				<div class="maintenance-list">
					{#each data.maintenanceEvents as event (event.id)}
						<div class="maintenance-item">
							<div class="maintenance-type">{maintenanceTypeLabel(event.type)}</div>
							<div class="maintenance-meta">
								{#if event.notes}
									<span class="maintenance-notes">{event.notes}</span>
								{/if}
								<span class="maintenance-time">{formatTimeAgo(event.performed_at)}</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- AI Chat FAB -->
	<button class="ai-fab" onclick={() => showAiChat = true} title="Ask AI Assistant">
		<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
		</svg>
	</button>
</div>

<AiChatPanel
	tank={data.tank}
	{latestParams}
	inhabitants={data.inhabitants}
	bind:open={showAiChat}
/>

<style>
	.ai-fab {
		position: fixed;
		bottom: var(--space-6);
		right: var(--space-6);
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: var(--color-gold);
		color: var(--color-deep-navy);
		border: none;
		box-shadow: var(--shadow-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform var(--transition-fast), box-shadow var(--transition-fast);
		z-index: 50;
	}

	.ai-fab:hover {
		transform: scale(1.08);
		box-shadow: 0 8px 32px rgba(213, 168, 83, 0.4);
	}
	.tank-detail {
		max-width: 900px;
	}

	.tank-header {
		margin-bottom: var(--space-6);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--space-3);
	}

	.back-link:hover {
		color: var(--color-teal-light);
	}

	.header-title h1 {
		font-family: var(--font-heading);
		font-size: 1.75rem;
		margin-bottom: var(--space-2);
	}

	.header-meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
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
		font-size: 0.85rem;
		color: var(--color-text-secondary);
	}

	.current-params {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-6);
	}

	/* Tabs */
	.tabs {
		display: flex;
		gap: var(--space-1);
		border-bottom: 1px solid var(--color-border);
		margin-bottom: var(--space-5);
	}

	.tab {
		padding: var(--space-3) var(--space-4);
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--color-text-secondary);
		font-size: 0.9rem;
		transition: all var(--transition-fast);
	}

	.tab:hover {
		color: var(--color-text);
	}

	.tab.active {
		color: var(--color-teal-light);
		border-bottom-color: var(--color-teal-light);
	}

	/* Sections */
	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-4);
	}

	.section-header h2 {
		font-size: 1.15rem;
	}

	.empty-section {
		color: var(--color-text-muted);
		font-style: italic;
		text-align: center;
		padding: var(--space-8) 0;
	}

	/* Parameter form */
	.param-form {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-5);
		margin-bottom: var(--space-5);
	}

	.param-inputs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: var(--space-3);
	}

	.param-inputs label span {
		display: block;
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--space-1);
	}

	.param-inputs input {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg-input);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text);
		font-family: var(--font-mono);
		font-size: 0.95rem;
	}

	.param-inputs input:focus {
		outline: none;
		border-color: var(--color-teal);
	}

	/* Charts */
	.charts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
		gap: var(--space-4);
	}

	/* Inline forms */
	.inline-form {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.inline-fields {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.inline-fields input,
	.inline-fields select {
		flex: 1;
		min-width: 120px;
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg-input);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text);
		font-size: 0.9rem;
	}

	.inline-fields input:focus,
	.inline-fields select:focus {
		outline: none;
		border-color: var(--color-teal);
	}

	.form-actions {
		display: flex;
		gap: var(--space-2);
		justify-content: flex-end;
		margin-top: var(--space-3);
	}

	/* Inhabitant list */
	.inhabitant-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.inhabitant-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.inhabitant-info {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.inhabitant-icon {
		font-size: 1.2rem;
	}

	.inhabitant-info strong {
		display: block;
		color: var(--color-text);
		font-size: 0.95rem;
	}

	.species {
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		font-style: italic;
	}

	.btn-icon {
		padding: var(--space-1);
		background: none;
		border: none;
		color: var(--color-text-muted);
		border-radius: var(--radius-sm);
		transition: color var(--transition-fast);
	}

	.btn-icon:hover {
		color: var(--color-critical);
	}

	/* Maintenance list */
	.maintenance-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.maintenance-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.maintenance-type {
		font-weight: 500;
		color: var(--color-text);
	}

	.maintenance-meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: 0.85rem;
	}

	.maintenance-notes {
		color: var(--color-text-secondary);
	}

	.maintenance-time {
		color: var(--color-text-muted);
		font-size: 0.8rem;
	}

	/* Bubble animation container */
	.bubble-container {
		position: relative;
	}

	/* Buttons */
	.btn-primary {
		padding: var(--space-2) var(--space-4);
		background: var(--color-teal);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-size: 0.85rem;
		font-weight: 500;
		transition: background var(--transition-fast);
	}

	.btn-primary:hover { background: var(--color-teal-deep); }

	.btn-secondary {
		padding: var(--space-2) var(--space-4);
		background: transparent;
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 0.85rem;
	}

	.btn-secondary:hover {
		border-color: var(--color-text-muted);
		color: var(--color-text);
	}

	@media (max-width: 768px) {
		.charts-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 640px) {
		.current-params {
			grid-template-columns: repeat(3, 1fr);
		}

		.inline-fields {
			flex-direction: column;
		}

		.tabs {
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
		}

		.tab {
			white-space: nowrap;
			padding: var(--space-2) var(--space-3);
			font-size: 0.85rem;
		}

		.section-header {
			flex-wrap: wrap;
			gap: var(--space-2);
		}

		.param-inputs {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 400px) {
		.current-params {
			grid-template-columns: repeat(2, 1fr);
		}

		.param-inputs {
			grid-template-columns: 1fr;
		}
	}
</style>
