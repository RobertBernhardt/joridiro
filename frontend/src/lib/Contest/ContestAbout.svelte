<script lang="ts">
	import { contest } from '$lib/stores/contests';
	import { onMount } from 'svelte';
</script>

<section id="about" class="container">
	<div class="about">
		<h2 class="title">About the contest</h2>
		<p class="description">
			{$contest.about_contest.short_description}
		</p>
	</div>
	<div class="subabout">
		{#if $contest.about_contest.purpose}
			<div class="about">
				<h2 class="subtitle">The purpose of this contest</h2>
				<p class="subdescription">
					{$contest.about_contest.purpose}
				</p>
			</div>
		{/if}
		{#if $contest.about_contest.target_audience}
			<div class="about">
				<h2 class="subtitle">Who is this contest for?</h2>
				<p class="subdescription">
					{$contest.about_contest.target_audience}
				</p>
			</div>
		{/if}
		{#if $contest.about_contest.how_to_win}
			<div class="about">
				<h2 class="subtitle">What do you have to do to win?</h2>
				<p class="subdescription">
					{$contest.about_contest.how_to_win}
				</p>
			</div>
		{/if}
		{#if $contest.about_contest.boost}
			<div class="about">
				<h2 class="subtitle">How does the organizer support this contest?</h2>
				<p class="subdescription">
					{$contest.about_contest.boost}
				</p>
			</div>
		{/if}
	</div>
</section>

<style>
    .subabout{
        padding-left: 20px;
        display: flex;
        flex-direction: column;
        gap: 30px;
        border-left: 1px solid var(--gray3);
    }
	.subtitle {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 10px;
	}
	.subdescription {
		font-size: 1rem;
	}
	.container {
		width: 100%;
		padding: 0 20px;
		display: flex;
		flex-direction: column;
		gap: 30px;
	}
	.title {
		font-size: 1.3rem;
		font-weight: 600;
		margin-bottom: 10px;
	}

	.container {
		width: 100%;
		border-radius: 7px;
		height: fit-content;
		position: relative;
		display: flex;
		flex-direction: column;
	}
	@media only screen and (max-width: 768px) {
		.container {
			padding: 0;
		}
        .subabout{
            border-left: none;
            padding-left: 0;
        }
	}
</style>
