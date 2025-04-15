<script lang="ts">
	import { page } from '$app/stores';
	import ScoreBlock from '$lib/CreateComponents/ScoreBlock.svelte';
	import Button from '$lib/InputComponents/Button.svelte';
	import Login from '$lib/Login/Login.svelte';
	import { contest } from '$lib/stores/contests';
	import { modal } from '$lib/stores/modal';
	import { user } from '$lib/stores/user';
	import { calcScore } from '../../utils/getTotalScore';
	import contestTypes from '../../utils/contstTypes';
	import JoinContestModal from '../Contest/JoinContestModal.svelte';

	export let _id;
	export let endDate = '';
	export let title = '';
	export let companyName = '';
	export let type: 'SCORE' | 'DEADLINE';
	export let size: 'SMALL' | 'MEDIUM' | 'LARGE';
	export let prizepool: number;
	export let organizerId: string;
	export let target: number | Date;
	export let best: number;
	export let id: string = '';
	export let logo: string = '';
	export let image: string = '';
	export let short_description = '';
	export let requirements = '';
	let levelCount = 0;
	export let participants: any[] = [];

	$: displayableTarget = type === 'SCORE' ? target : getDate();
	const getLevelColor = () => {
		if (type === 'SCORE') {
			if (size == 'SMALL' || size == 'MEDIUM') {
				return 'var(--purple1)';
			} else {
				return '#FFFFFF';
			}
		} else {
			if (size == 'SMALL' || size == 'MEDIUM') {
				return 'var(--green1)';
			} else {
				return '#FFFFFF';
			}
		}
	};
	const getDate = () => {
		setInterval(() => {
			const timeLeft = new Date(endDate).getTime() - new Date().getTime();
			const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
			const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
			displayableTarget = `${days}d ${hours}h ${minutes}m ${seconds}s`;
			// > If the timeLeft is less than 0, then the contest is over
			if (timeLeft < 0) {
				displayableTarget = 'Contest Over';
			}
		}, 1000);
		const timeLeft = new Date(endDate).getTime() - new Date().getTime();
		const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
		const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
		return timeLeft < 0 ? 'Contest Over' : `${days}d ${hours}h ${minutes}m ${seconds}s`;
	};

	if (size == 'MEDIUM') levelCount = 1;
	if (size == 'LARGE') levelCount = 2;
</script>

<div class="container {type == 'SCORE' ? 'score' : 'deadline'} {size.toLowerCase()}">
	<div class="wrapper">
		<div class="header">
			<a href={$page.url.origin + '/contests/' + id}>
				<div class="logo">
					{#if logo}
						<img src={logo} alt="" />
					{:else}
						<img src="/images/defaultcontest.png" alt="" />
					{/if}
				</div>
			</a>
			<div class="text">
				<a href={$page.url.origin + '/contests/' + id}>
					<div class="title">
						<p>{title}</p>
					</div>
				</a>
				<div class="subtext">
					<p class="company_name">{companyName}</p>
					<p class="contest_type">{type.toLowerCase()} Contest</p>
				</div>
			</div>
		</div>
		<div class="indent">
			<div class="stats">
				<div class="flexblock">
					<div class="block">
						<p class="label">Grand Prize</p>
						<p class="value">{prizepool} €</p>
					</div>
					<div class="block">
						<p class="label">Level</p>
						<div class="level">
							{#each ['', '', ''] as level, index}
								<svg
									width="22"
									height="22"
									viewBox="0 0 20 20"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M12.66 12.18C12.69 12.29 12.7 12.4 12.7 12.5C12.73 13.15 12.44 13.85 11.97 14.28C11.75 14.47 11.39 14.67 11.11 14.75C10.23 15.06 9.35 14.62 8.83 14.11C9.77 13.89 10.32 13.21 10.5 12.5C10.62 11.89 10.37 11.38 10.27 10.78C10.17 10.2 10.19 9.71 10.4 9.18C10.55 9.47 10.71 9.77 10.9 10C11.5 10.78 12.45 11.12 12.66 12.18ZM20 10C20 15.5 15.5 20 10 20C4.5 20 0 15.5 0 10C0 4.5 4.5 0 10 0C15.5 0 20 4.5 20 10ZM15.16 10.56L15.06 10.36C14.9 10 14.45 9.38 14.45 9.38C14.27 9.15 14.05 8.94 13.85 8.74C13.32 8.27 12.73 7.94 12.22 7.45C11.05 6.31 10.79 4.44 11.54 3C10.79 3.18 10.14 3.58 9.58 4.03C7.55 5.65 6.75 8.5 7.71 10.95C7.74 11.03 7.77 11.11 7.77 11.21C7.77 11.38 7.65 11.53 7.5 11.6C7.31 11.67 7.13 11.63 7 11.5C6.93 11.46 6.9 11.42 6.87 11.37C6 10.26 5.84 8.66 6.43 7.39C5.12 8.45 4.41 10.24 4.5 11.92C4.56 12.31 4.6 12.7 4.74 13.09C4.85 13.56 5.06 14 5.3 14.44C6.14 15.78 7.61 16.75 9.19 16.94C10.87 17.15 12.67 16.85 13.96 15.7C15.4 14.4 15.9 12.33 15.16 10.56Z"
										fill={index > levelCount ? '#FAFAFA' : getLevelColor()}
									/>
								</svg>
							{/each}
						</div>
					</div>
				</div>
				<div class="flexblock">
					<div class="block">
						<p class="label">Best Result</p>
						<p class="value">{best} points</p>
					</div>
					<div class="block">
						<p class="label">{type == 'DEADLINE' ? 'Deadline' : 'Target'}</p>
						<div class="points">
							{#if type == 'SCORE'}
								<svg
									width="20"
									height="20"
									viewBox="0 0 20 20"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M17.0548 8.20528C16.8257 7.72987 16.3711 7.43441 15.8685 7.43441H11.4316V2.42482C11.4316 1.79697 11.0698 1.26571 10.51 1.07252C9.94764 0.878389 9.36741 1.08199 9.02159 1.58768H9.0207L3.05356 10.319C2.75766 10.7536 2.71666 11.319 2.94572 11.7963C3.17478 12.2707 3.62934 12.5662 4.13202 12.5662H8.56793V17.5767C8.56793 18.2036 8.92979 18.7339 9.48952 18.9271C9.63034 18.9764 9.77295 19 9.91288 19C10.3282 19 10.7213 18.7917 10.9797 18.4129L16.9469 9.68164C17.2428 9.24697 17.2838 8.68161 17.0548 8.20528Z"
										fill={size === 'LARGE' ? 'white' : '#B035D0'}
									/>
								</svg>
							{:else}
								<svg
									width="20"
									height="20"
									viewBox="0 0 20 20"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<g clip-path="url(#clip0_1_38870)">
										<path
											d="M10.0001 18.3333C14.6025 18.3333 18.3334 14.6023 18.3334 9.99996C18.3334 5.39759 14.6025 1.66663 10.0001 1.66663C5.39771 1.66663 1.66675 5.39759 1.66675 9.99996C1.66675 14.6023 5.39771 18.3333 10.0001 18.3333Z"
											stroke={size === 'LARGE' ? 'white' : '#4CBB25'}
											stroke-width="1.66667"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M10 5V10L13.3333 11.6667"
											stroke={size === 'LARGE' ? 'white' : '#4CBB25'}
											stroke-width="1.66667"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</g>
									<defs>
										<clipPath id="clip0_1_38870">
											<rect width="20" height="20" fill="white" />
										</clipPath>
									</defs>
								</svg>
							{/if}
							<p class="target">
								{type == 'SCORE' ? target : displayableTarget}
								{type === 'SCORE' ? (target > 1 ? 'points' : 'point') : ''}
							</p>
						</div>
					</div>
				</div>
			</div>
			<div class="short_description">
				<p>{short_description}</p>
			</div>
		</div>
	</div>
	<div class="wrapper">
		<a href={$page.url.origin + '/contests/' + id}>
			<div class="image">
				{#if image}
					<img src={image} alt="" />
				{:else}
					<img class="filter" src="icons/default_banner.svg" alt="" />
				{/if}
			</div>
		</a>
	</div>
</div>

<style>
	.contest_stats {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin-top: 20px;
		font-size: 0.95rem;
	}
	.participation_status {
		display: flex;
		align-items: center;
	}
	.score.small {
		background-color: var(--purple5);
		border: 1px solid var(--purple5);
	}
	.score.medium {
		background-color: var(--purple4);
		border: 1px solid var(--purple4);
	}
	.score.large {
		background-color: var(--purple1);
		border: 1px solid var(--purple1);
		color: white;
	}
	.large .contest_type {
		color: white !important;
	}
	.filter {
		filter: grayscale(100%) saturate(100%) contrast(100%);
	}
	.target {
		font-size: 22px;
	}
	.score.large .target,
	.score.large .label {
		color: white;
	}
	.deadline.small {
		background-color: var(--green5);
		border: 1px solid var(--green5);
	}
	.deadline.medium {
		background-color: var(--green4);
		border: 1px solid var(--green4);
	}
	.participation_status {
		display: flex;
		gap: 10px;
		margin-left: 80px;
		color: var(--red2);
	}
	.large .participation_status {
		color: white;
	}
	.deadline.large {
		background-color: var(--green1);
		border: 1px solid var(--green4);
		color: white;
	}
	a {
		text-decoration: none;
		color: inherit;
	}
	.deadline.large .target {
		color: white;
	}
	.deadline.large .label {
		color: white;
		font-weight: 500;
	}
	.container {
		padding: 0;
		flex-direction: column-reverse;
		border: 1px solid var(--gray3);
		width: 100%;
		height: fit-content;
		padding: 28px;
		gap: 70px;
		border-radius: 7px;
		display: flex;
		justify-content: space-between;
	}
	.score .contest_type {
		color: var(--purple1);
	}
	.deadline.large .contest_type {
		color: white !important;
	}
	.contest_type {
		text-transform: capitalize;
		color: var(--green1);
	}
	.text {
		display: flex;
		flex-direction: column-reverse;
	}
	.score .target {
		color: var(--purple1);
	}
	.target {
		color: var(--green1);
	}
	.wrapper:nth-child(2) {
		width: 100%;
		height: 200px;
	}
	.header {
		flex-direction: column;
		margin-top: -100px;
		gap: 8px;
		display: flex;
		padding-left: 16px;
	}
	.title p {
		font-size: 1.4rem;
		font-weight: 600;
	}
	.subtext {
		display: flex;
		gap: 10px;
	}
	.company_name {
		font-weight: 500;
	}
	.contest_type {
		font-weight: 500;
		border-left: 1px solid var(--gray2);
		padding-left: 10px;
	}
	.large .contest_type {
		border-left: 1px solid var(--gray3);
	}
	.logo {
		width: 50px;
		position: relative;
		height: 50px;
		z-index: 1;
	}
	.logo img {
		width: 100%;
		height: 100%;
		border-radius: 7px;
		object-fit: cover;
	}

	.indent {
		padding-left: 16px;
		display: flex;
		flex-direction: column-reverse;
		gap: 0;
		margin-top: 15px;
	}

	.stats {
		display: flex;
		margin: 24px 0 0 0;
		white-space: nowrap;
		flex-wrap: wrap;
		gap: 16px;
	}
	.flexblock {
		display: grid;
		grid-template-columns: 1fr;
		gap: 40px;
		width: 100%;
	}
	.label {
		font-weight: 600;
		font-size: 1rem;
		color: var(--gray1);
	}
	.value {
		font-weight: 600;
		font-size: 20px;
	}

	.block:last-child {
		border: none;
	}
	.level {
		display: flex;
		gap: 6px;
		margin-top: 5px;
	}
	.block {
		width: 100%;
	}
	.flexblock {
		display: flex;
		width: fit-content;
	}
	.points {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 22px;
		font-weight: 600;
	}
	.short_description {
		opacity: 0.9;
	}
	.button_group {
		width: fit-content;
		display: flex;
		gap: 20px;
		padding: 24px 0 0 84px;
	}
	.image {
		width: 100%;
		height: 100%;
		background-color: var(--purple3);
		border-radius: 7px;
		overflow: hidden;
	}
	.image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
