import { format, formatDistanceToNow } from 'date-fns';

export function formatDate(date: string | Date): string {
	return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
	return format(new Date(date), 'MMM d, h:mm a');
}

export function formatTimeAgo(date: string | Date): string {
	return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatParam(value: number | null, decimals = 1): string {
	if (value === null) return '--';
	return value.toFixed(decimals);
}

export function tankTypeLabel(type: string): string {
	const labels: Record<string, string> = {
		freshwater: 'Freshwater',
		saltwater: 'Saltwater',
		planted: 'Planted'
	};
	return labels[type] || type;
}

export function maintenanceTypeLabel(type: string): string {
	const labels: Record<string, string> = {
		water_change: 'Water Change',
		filter_clean: 'Filter Clean',
		dosing: 'Dosing'
	};
	return labels[type] || type;
}
