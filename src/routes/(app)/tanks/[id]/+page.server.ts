import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const { data: tank } = await supabase
		.from('tanks')
		.select('*')
		.eq('id', params.id)
		.single();

	if (!tank) throw error(404, 'Tank not found');

	const [{ data: parameterLogs }, { data: inhabitants }, { data: maintenanceEvents }] =
		await Promise.all([
			supabase
				.from('parameter_logs')
				.select('*')
				.eq('tank_id', params.id)
				.order('logged_at', { ascending: true })
				.limit(100),
			supabase
				.from('inhabitants')
				.select('*')
				.eq('tank_id', params.id)
				.order('added_at', { ascending: false }),
			supabase
				.from('maintenance_events')
				.select('*')
				.eq('tank_id', params.id)
				.order('performed_at', { ascending: false })
				.limit(20)
		]);

	return {
		tank,
		parameterLogs: parameterLogs || [],
		inhabitants: inhabitants || [],
		maintenanceEvents: maintenanceEvents || []
	};
};

export const actions: Actions = {
	logParameters: async ({ request, params, locals: { supabase } }) => {
		const formData = await request.formData();

		const entry: Record<string, any> = { tank_id: params.id };
		const fields = ['ph', 'ammonia', 'nitrite', 'nitrate', 'temperature'];

		for (const field of fields) {
			const val = formData.get(field);
			entry[field] = val ? Number(val) : null;
		}

		const { error: err } = await supabase.from('parameter_logs').insert(entry);
		if (err) return fail(500, { error: err.message });
		return { success: true, action: 'logParameters' };
	},

	addInhabitant: async ({ request, params, locals: { supabase } }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const species = formData.get('species') as string;
		const type = formData.get('inhabitantType') as string;

		if (!name || !species || !type) {
			return fail(400, { error: 'All fields are required' });
		}

		const { error: err } = await supabase.from('inhabitants').insert({
			tank_id: params.id,
			name,
			species,
			type
		});

		if (err) return fail(500, { error: err.message });
		return { success: true, action: 'addInhabitant' };
	},

	removeInhabitant: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		const { error: err } = await supabase.from('inhabitants').delete().eq('id', id);
		if (err) return fail(500, { error: err.message });
		return { success: true, action: 'removeInhabitant' };
	},

	logMaintenance: async ({ request, params, locals: { supabase } }) => {
		const formData = await request.formData();
		const type = formData.get('maintenanceType') as string;
		const notes = formData.get('notes') as string;

		if (!type) return fail(400, { error: 'Type is required' });

		const { error: err } = await supabase.from('maintenance_events').insert({
			tank_id: params.id,
			type,
			notes: notes || null
		});

		if (err) return fail(500, { error: err.message });
		return { success: true, action: 'logMaintenance' };
	}
};
