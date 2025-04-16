<script lang="ts">
	import Header from '$lib/Header/Header.svelte';
	import Login from '$lib/Login/Login.svelte';
	import Notifications from '$lib/Notifications/Notifications.svelte';
	import Register from '$lib/Register/Register.svelte';
	import { modal, props } from '$lib/stores/modal';
	import './styles.css';
	import API from '../utils/API';
	import { onMount } from 'svelte';
	import Verify from '$lib/Verify/Verify.svelte';
	import { page } from '$app/stores';
	import { user } from '$lib/stores/user';
	import Footer from '$lib/Footer/Footer.svelte';
	import ContactForm from '$lib/LandingPage/ContactForm.svelte';
	let isLoaded = false;
	onMount(async () => {
		try {
			const res = await API.post('/user/me', {});
			$user = res.user;
			isLoaded = true;
			if (!$user.email_verified && $page.url.pathname.split('/')[1] != 'verify') {
				const sendOTP = await API.post('/user/sendOTP', {});
				if (sendOTP.status === 200) {
					$modal = Verify;
				}
			}
		} catch (err) {
			$user = null;
			isLoaded = true;
		}
	});
	let transparentHeader = true;
	let position: 'relative' | 'absolute' | 'fixed' = 'relative';
	$: if (
		(($page.url.pathname.split('/')[1] === 'contests' ||
			$page.url.pathname.split('/')[1] === 'about') &&
			!$page.url.pathname.split('/')[2]) ||
		!$page.url.pathname.split('/')[1]
	) {
		transparentHeader = true;
		position = 'absolute';
	} else {
		transparentHeader = false;
	}
</script>

<div class="container">
	{#if isLoaded}

		<div class="block">
			<Header transparent={transparentHeader} {position} />
			<Notifications />
			<div class="slot">
				<slot />
			</div>
			{#if $modal}
				<div class="modal">
					<svelte:component this={$modal} {$props} />
				</div>
			{/if}
			{#if $page.url.pathname.split('/')[1] != 'messages'}
				<Footer />
			{/if}
		</div>
	{/if}
</div>

<style>
	.container{
		display: flex;
		flex-direction: column;
	}
	.modal {
		background-color: #00000040;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999999999999999;
	}

</style>
