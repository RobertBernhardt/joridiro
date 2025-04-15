<script>
	import AboutHeader from '$lib/LandingPage/About/AboutHeader.svelte';
	import OurMission from '$lib/LandingPage/About/OurMission.svelte';
	import Story from '$lib/LandingPage/About/Story.svelte';
</script>

<div class="container">
	<AboutHeader />
	<Story />
	<OurMission />
</div>

<style>
	.container{
		display: flex;
		flex-direction: column;
		gap: 50px;
	}
</style>