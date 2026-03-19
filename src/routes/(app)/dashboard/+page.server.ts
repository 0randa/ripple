import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();

	const { data: tanks } = await supabase
		.from('tanks')
		.select('*')
		.eq('user_id', user!.id)
		.order('created_at', { ascending: false });

	// Get latest parameter log for each tank
	const tanksWithParams = await Promise.all(
		(tanks || []).map(async (tank) => {
			const { data: logs } = await supabase
				.from('parameter_logs')
				.select('*')
				.eq('tank_id', tank.id)
				.order('logged_at', { ascending: false })
				.limit(1);

			return {
				...tank,
				latestParams: logs?.[0] || null
			};
		})
	);

	return { tanks: tanksWithParams };
};

export const actions: Actions = {
	createTank: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const volume_liters = Number(formData.get('volume_liters'));
		const type = formData.get('type') as string;

		if (!name || !volume_liters || !type) {
			return fail(400, { error: 'All fields are required' });
		}

		const { error } = await supabase.from('tanks').insert({
			name,
			volume_liters,
			type,
			user_id: user.id
		});

		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true };
	}
};
