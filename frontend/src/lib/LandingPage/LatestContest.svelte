<script lang="ts">
	import Card from '$lib/Contest/Card.svelte';
	import { calcScore } from '../../utils/getTotalScore';
	import API from '../../utils/API';
	import contestTypes from '../../utils/contstTypes';
	import { onMount } from 'svelte';
	import SmallCard from './SmallCard.svelte';
	let contests: any = []
    onMount(async ()=>{
        const res = await API.get('/contest?page=1', {})
        contests = res.data
        // Just show 4 contests
        contests = contests.slice(0, 4)
    })
</script>

<div class="wrapper">
    <div class="title">
        <h2>Latest Contests</h2>
        <p>Collect entries, incentivize participants, and select random winners</p>
    </div>
	<div class="cardcontainer">
		{#if contests.length > 0}
			{#each contests as contest}
				<SmallCard
					_id={contest._id}
					title={contest.title}
					companyName={contest.about_company.name}
					type={contest.type}
					prizepool={contest.grandPrize.amount}
					size={contest.size}
					target={contestTypes.get(contest.size).max_score}
					best={contest.participants[0] ? calcScore(contest.participants[0]) : 0}
					id={contest._id}
					organizerId={contest.organizer}
					logo={contest.about_company.logo}
					image={contest.banner}
					endDate={contest.endDate}
					short_description={contest.about_contest.short_description}
					requirements={contest.requirements}
					participants={contest.participants}
				/>
			{/each}
		{/if}
	</div>
</div>

<style>
    .title {
        text-align: center;
        margin: 30px 0;
    }
    .title h2 {
        font-size: 2.5rem;
        font-weight: 600;
        color: #000;
    }
	.wrapper {
		display: flex;
		flex-direction: column;
	}
	.cardcontainer {
		width: 100%;
		max-width: 1670px;
		margin-top: 50px;
		height: fit-content;
		display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		margin-left: auto;
        margin-right: auto;
        gap: 40px;
	}

	@media only screen and (max-width: 1155px) {
		.cardcontainer {
			padding: 20px;
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
			gap: 30px;
		}
	}
</style>
