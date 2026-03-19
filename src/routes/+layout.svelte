<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import '$lib/styles/global.css';

	let { data, children } = $props();

	onMount(() => {
		const { data: { subscription } } = data.supabase.auth.onAuthStateChange((_event: string, session: any) => {
			if (session?.expires_at !== data.session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		// Init theme
		const saved = localStorage.getItem('ripple-theme');
		if (saved) {
			document.documentElement.setAttribute('data-theme', saved);
		}

		return () => subscription.unsubscribe();
	});
</script>

{@render children()}
