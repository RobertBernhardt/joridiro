<script lang="ts">
	import { page } from '$app/stores';
	import Banner from '$lib/Contest/Banner.svelte';
	import ContestAbout from '$lib/Contest/ContestAbout.svelte';
	import ContestAdminProperties from '$lib/Contest/ContestAdminProperties.svelte';
	import ContestAnnouncements from '$lib/Contest/ContestAnnouncements.svelte';
	import ContestAnswerStats from '$lib/Contest/ContestAnswerStats.svelte';
	import ContestFaq from '$lib/Contest/ContestFAQ.svelte';
	import ContestHowToScore from '$lib/Contest/ContestHowToScore.svelte';
	import ContestInfo from '$lib/Contest/ContestInfo.svelte';
	import ContestPrizeDetails from '$lib/Contest/ContestPrizeDetails.svelte';
	import ContestRequirements from '$lib/Contest/ContestRequirements.svelte';
	import ContestRules from '$lib/Contest/ContestRules.svelte';
	import ContestStats from '$lib/Contest/ContestStats.svelte';
	import ContestTags from '$lib/Contest/ContestTags.svelte';
	import JoinContestModal from '$lib/Contest/JoinContestModal.svelte';
	import Link from '$lib/Contest/Link.svelte';
	import Participants from '$lib/Contest/Participants.svelte';
	import StepsToWin from '$lib/Contest/StepsToWin.svelte';
	import Timeline from '$lib/Contest/Timeline.svelte';
	import UpdateScoreModal from '$lib/Contest/UpdateScoreModal.svelte';
	import ProgressBar from '$lib/CreateComponents/ProgressBar.svelte';
	import Requirements from '$lib/CreateComponents/Requirements.svelte';
	import Rules from '$lib/CreateComponents/Rules.svelte';
	import { contest, score } from '$lib/stores/contests';
	import { modal } from '$lib/stores/modal';
	import { user } from '$lib/stores/user';
	import API from '../../../utils/API';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	export let data: PageData;
	$contest = data.contest;

	let isLoaded = false;
	onMount(async () => {
		if (data.contest.payment_status === 'UNPAID') {
			const res2 = await API.post(`/payment/${$page.params.id}`, {});
			window.location.href = res2.data.url;
		} else if (data.contest.payment_status === 'PENDING') {
			$contest = data.contest;
		}
		isLoaded = true;
	});

	// Add score object from data to contest store
	if (data.score) {
		$contest.score = $contest.score.map((s: any) => {
			// Add the value and the score to the score object under participant_value and participant_score
			const score = data.score.score.find((sc: any) => sc.category === s._id);
			if (score) {
				s.participant_value = score.value ? score.value : 0;
				s.participant_score = score.points ? score.points : 0;
			}

			return s;
		});
		$contest.lottery_tickets = data.score.lottery_tickets;
		$contest.rank = data.rank;
	}
	let linktab: any;
	let fixPosition = false;
	$: originalLinkTabPosition = linktab?.getBoundingClientRect().top;
	let scrollY = 0;
</script>

<svelte:head>
	<title>{$contest.title}</title>
	<meta name="description" content={$contest.smallDescription} />
	<meta property="og:title" content={$contest.title} />
	<meta property="og:description" content={$contest.smallDescription} />
	<meta property="og:image" content={$contest.banner} />
</svelte:head>

<svelte:window
	on:hashchange={() => {
		const element = document.querySelector(location.hash);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' });
		}
	}}
	bind:scrollY
	on:scroll={(e) => {
		let rect = linktab.getBoundingClientRect();
		if (scrollY >= originalLinkTabPosition) {
			console.log('HERE');
			fixPosition = true;
		} else {
			fixPosition = false;
		}
	}}
/>

{#if isLoaded}
	{#if $contest.payment_status === 'PENDING'}
		<section class="pending">
			<p>
				Your payment is being processed but it's pending. This might take a while. Your contest will
				go live as soon as your payment has been processed
			</p>
		</section>
	{:else}
		<section>
			<div class="banner">
				{#if $contest.banner}
					<img src={$contest.banner} alt="" />
				{:else}
					<img src="../icons/default_banner.svg" alt="" />
				{/if}
			</div>
			<div class="container">
				<div class="data">
					<ContestInfo
						title={$contest.title}
						company_name={$contest.about_company.name}
						company_link={$contest.about_company.link}
						logo={$contest.about_company.logo}
					/>
					<div class="wrapper">
						<div class="block">
							<ContestTags tags={$contest.about_contest.tags} />
							{#if $contest.about_company.description}
								<p class="aboutcompany">
									{$contest.about_company.description}
								</p>
							{/if}
							<div class="progress mobile">
								<div class="progressbar">
									<Timeline
										startDate={new Date($contest.startDate)}
										endDate={new Date($contest.endDate)}
										type={$contest.type}
										max_score={0}
										size={$contest.size}
										bestResult={0}
										milestones={$contest.milestones}
									/>
								</div>
								<ContestAdminProperties />
								<div class="border" />
								<div bind:this={linktab} class={fixPosition ? 'fixed' : ''}>
									<Link contest={$contest} />
								</div>
							</div>
							<ContestStats
								grandPrize={$contest.grandPrize.amount}
								size={$contest.size}
								type={$contest.type}
								bestResult={0}
								totalParticipants={0}
							/>
						</div>
						<ContestPrizeDetails
							milestones={$contest.milestones}
							startDate={new Date($contest.startDate)}
							endDate={new Date($contest.endDate)}
							lottery={$contest.lotteryPrize}
							type={$contest.type}
							grandPrize={$contest.grandPrize}
							size={$contest.size}
						/>
						<ContestAbout />
						<ContestHowToScore score={$contest.score} type={$contest.type} />
						{#if $contest.requirements.organizer_platform || $contest.requirements.additional.length > 0 || $contest.requirements.categories.length > 0 || $contest.requirements.countries.length > 0 || $contest.requirements.roles.length > 0}
							<ContestRequirements />
						{/if}
						{#if $contest.rules.length > 0 && $contest.rules[0]}
							<ContestRules rules={$contest.rules} />
						{/if}
						{#if $contest.announcements.length > 0}
							<ContestAnnouncements />
						{/if}
						<ContestFaq />
						{#if $contest.participants.length > 0}
							<Participants />
						{/if}
					</div>
				</div>
				<div class="progress">
					<div class="fixed">
						<Timeline
							startDate={new Date($contest.startDate)}
							endDate={new Date($contest.endDate)}
							type={$contest.type}
							max_score={0}
							size={$contest.size}
							bestResult={0}
							milestones={$contest.milestones}
						/>
						<ContestAdminProperties />
						<div class="border" />
						<Link contest={$contest} />
					</div>
				</div>
			</div>
		</section>
	{/if}
{/if}

<style>
	.pending {
		width: 100%;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: white;
	}
	section {
		width: 100%;
		height: fit-content;
	}
	.banner {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		top: 0;
	}
	.banner img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}
	.container {
		width: 100%;
		height: fit-content;
		display: flex;
		position: relative;
		justify-content: center;
		margin-top: 450px;
		background-color: white;
		border-radius: 20px;
		padding: 32px 50px;
		gap: 60px;
	}
	.data {
		width: fit-content;
		max-width: 950px;
		height: 100%;
		width: 100%;
	}
	.wrapper {
		padding-left: 100px;
		display: flex;
		flex-direction: column;
		gap: 45px;
	}
	.block {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.progress {
		width: 280px;
		height: auto;
		position: relative;
	}
	.progressbar {
		width: 280px;
		height: auto;
		position: relative;
	}
	.fixed {
		top: 70px;
		left: 0;
		background-color: white;
		overflow: auto;
		width: 100%;
		min-width: 280px;
		padding-top: 2px;
		z-index: 1000;
		position: sticky;
	}
	.fixed::-webkit-scrollbar {
		display: none;
	}
	.border {
		width: 100%;
		height: 1px;
		margin: 20px 0;
		background-color: #e5e5e5;
	}
	.progress.mobile {
		display: none;
	}
	@media only screen and (max-width: 1000px) {
		.progress {
			display: none;
		}
		.fixed {
			position: fixed;
		}
		.progress.mobile {
			display: block;
		}
		.block {
			padding: 0;
		}
		.wrapper {
			padding: 0;
			margin-top: 10px;
		}
		.container {
			padding: 32px 20px;
		}
		.progress {
			width: 100%;
		}
		.progressbar {
			margin-left: auto;
			margin-right: auto;
		}
	}
</style>
