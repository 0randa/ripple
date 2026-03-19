export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

interface Params {
	ph: number | null;
	ammonia: number | null;
	nitrite: number | null;
	nitrate: number | null;
	temperature: number | null;
}

const SAFE_RANGES = {
	ph: { min: 6.5, max: 7.8, warnMin: 6.0, warnMax: 8.2 },
	ammonia: { max: 0, warnMax: 0.25 },
	nitrite: { max: 0, warnMax: 0.25 },
	nitrate: { max: 20, warnMax: 40 },
	temperature: { min: 74, max: 80, warnMin: 70, warnMax: 84 }
};

function checkRange(
	value: number | null,
	range: { min?: number; max?: number; warnMin?: number; warnMax?: number }
): HealthStatus {
	if (value === null) return 'unknown';

	const { min, max, warnMin, warnMax } = range;

	if (warnMin !== undefined && value < warnMin) return 'critical';
	if (warnMax !== undefined && value > warnMax) return 'critical';
	if (min !== undefined && value < min) return 'warning';
	if (max !== undefined && value > max) return 'warning';

	return 'healthy';
}

export function getHealthStatus(params: Params | null): HealthStatus {
	if (!params) return 'unknown';

	const statuses: HealthStatus[] = [
		checkRange(params.ph, SAFE_RANGES.ph),
		checkRange(params.ammonia, SAFE_RANGES.ammonia),
		checkRange(params.nitrite, SAFE_RANGES.nitrite),
		checkRange(params.nitrate, SAFE_RANGES.nitrate),
		checkRange(params.temperature, SAFE_RANGES.temperature)
	];

	if (statuses.includes('critical')) return 'critical';
	if (statuses.includes('warning')) return 'warning';
	if (statuses.every((s) => s === 'unknown')) return 'unknown';
	return 'healthy';
}

export function getParamStatus(param: keyof typeof SAFE_RANGES, value: number | null): HealthStatus {
	if (value === null) return 'unknown';
	return checkRange(value, SAFE_RANGES[param]);
}
