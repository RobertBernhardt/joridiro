<script lang="ts">
	import Input from '$lib/InputComponents/Input.svelte';
	import * as yup from 'yup';
	import { createForm } from 'svelte-forms-lib';
	import LogoSubmit from '$lib/InputComponents/LogoSubmit.svelte';
	import Button from '$lib/InputComponents/Button.svelte';
	import { user } from '$lib/stores/user';
	import API from '../../../utils/API';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { calcScore } from '../../../utils/getTotalScore';
	import { contest } from '$lib/stores/contests';
	import contestTypes from '../../../utils/contstTypes';

	let contests: any = [];
	let displayableTarget = ''

	
	onMount(async () => {
		const res = await API.get('/user/contests', {});
		contests = res.data;
		contests.forEach((contest: any) => {
			contest.score = calcScore(contest.participant);
			if (contest.type === 'SCORE') {
				contest.progress =
					(calcScore(contest.max) / contestTypes.get(contest.size).max_score) * 100;
			} else {
				console.log(contest.start_date, contest.end_date);
				// Progress is todays date / deadline
				contest.progress =
					(new Date().getTime() - new Date(contest.start_date).getTime()) /
					(new Date(contest.end_date).getTime() - new Date(contest.start_date).getTime());
					console.log(contest.progress)
				
			}
		});
	});
	
</script>

<header>
	<h1>Contests</h1>
</header>

<div class="contest_participated_in">
	<p class="subtitle">Contests in which you have participated</p>
	<div class="table">
		<div class="table_header">
			<div class="table_header_item">Contest Name</div>
			<div class="table_header_item">Deadline/Target</div>
			<div class="table_header_item">My points</div>
			<div class="table_header_item">Ranking</div>
			<div class="table_header_item">Status</div>
			<div class="table_header_item">Prize Pool</div>
		</div>
		{#each contests as contest}
			<div class="table_row">
				<div class="table_row_item">{contest.title}</div>
				<div class="table_row_item">
					<div class="progessbar_container">
						<div
							style="width: {contest.progress}%;background-color: {contest.type === 'SCORE'
								? 'var(--purple1)'
								: 'var(--green1)'}"
							class="progressbar"
						/>
					</div>
				</div>
				<div class="table_row_item">{contest.score}</div>
				<div class="table_row_item">{contest.rank}</div>
				<div class="table_row_item">{contest.open ? 'Open' : 'Closed'}</div>
				<div class="table_row_item">{contestTypes.get(contest.size).grand_prize}</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.subtitle {
		font-size: 1.1rem;
		font-weight: 500;
		margin-top: 10px;
		opacity: 0.7;
	}
	header h1 {
		font-size: 1.5rem;
		font-weight: 600;
	}
	.table_header {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
		grid-gap: 30px;
		margin-top: 10px;
	}
	.progessbar_container {
		height: 8px;
		width: 100%;
		background-color: #e0e0e0;
		border-radius: 5px;
	}
	.progressbar {
		height: 100%;
		border-radius: 5px;
	}
	.table_header_item {
		font-size: 1rem;
		font-weight: 500;
		opacity: 0.8;
	}
	.table_row {
		display: grid;
		grid-gap: 30px;
		grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
		margin-top: 10px;
		align-items: center;
	}
</style>
