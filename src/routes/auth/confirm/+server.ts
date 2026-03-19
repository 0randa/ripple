import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as 'signup' | 'email';

	if (token_hash && type) {
		await supabase.auth.verifyOtp({ token_hash, type });
	}

	throw redirect(303, '/dashboard');
};
