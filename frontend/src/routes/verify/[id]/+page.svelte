<script lang="ts">
	import { page } from '$app/stores';
	import { user } from '$lib/stores/user';
	import { onMount } from 'svelte';
	import API from '../../../utils/API';
	let result: any = null;
	onMount(async () => {
		try {
			const res = await API.post(`/user/verifyOTP/${$page.url.pathname.split('/')[2]}`, {});
			if($user) $user.email_verified = true;
			result = res;
		} catch (err: any) {
            console.log(err)
            result = err.response.data;
        }
	});
</script>

<div class="container">
	{#if result}
		{result.message}
	{/if}
</div>

<style>
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
        padding: 200px 0;
	}
</style>
