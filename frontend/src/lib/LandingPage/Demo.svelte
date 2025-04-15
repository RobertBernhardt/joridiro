<script>
	import { page } from '$app/stores';
	import ContestSize from '$lib/CreateComponents/ContestSize.svelte';
	import Toggle from '$lib/InputComponents/Toggle.svelte';
	import ToggleSwitch from '$lib/InputComponents/ToggleSwitch.svelte';
	import contestTypes from '../../utils/contstTypes';
	import { writable } from 'svelte/store';
	import Button from '$lib/InputComponents/Button.svelte';
	import { contest } from '$lib/stores/contests';
	import { goto } from '$app/navigation';
	import { demoContest } from '../../routes/demo/democontest';
	const fields = writable({
		type: 'DEADLINE'
	});
	let value = true;
	let size = 'SMALL';
	let sizeError = '';
	let levelCount = 0;
	let color = 'var(--purple1)';
	$: target = contestTypes.get(size).max_score;
	$: endDate = new Date().getTime() + contestTypes.get(size).days * 24 * 60 * 60 * 1000;
	$: displayableTarget = value ? getDate() : target;
	const handleChange = (e) => {
		value = e.target.checked;
		if (value) {
			$fields.type = 'DEADLINE';
		} else {
			$fields.type = 'SCORE';
		}
	};
	$: if (!value) {
		color = getLevelColor();
	} else {
		color = getLevelColor();
	}
	const getLevelColor = () => {
		if (!value) {
			return 'var(--purple1)';
		} else {
			return 'var(--green1)';
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

<div class="heading">
	<h2>Demo Contests</h2>
	<p>Collect entries, incentivize participants, and select random winners</p>
</div>
<div class="toggle">
	<Toggle
		label="Are there specific categories that the participants need to be focused on?"
		name="categoryFieldExists"
		required={true}
		onChange={handleChange}
		placeholder="Enter the demographic"
		{value}
		options={['Score Contest', 'Deadline Contest']}
	/>
</div>

<div class="container">
	<div class="img">
		{#if $fields.type==="SCORE"}
		<img src="./images/demo.svg" alt="" />
		{:else}
		<img src="./images/demo2.svg" alt="" />
		{/if}
		
	</div>
	<div class="options {value ? 'deadline' : 'score'} {size.toLowerCase()}">
		<ContestSize
			style="style2"
			name="size"
			onChange={(e) => {
				size = e.target.value;
				levelCount = 0;
				if (size == 'MEDIUM') levelCount = 1;
				if (size == 'LARGE') levelCount = 2;
			}}
			value={size}
			{fields}
			errors={sizeError}
		/>
		<div class="header">
			<div class="text">
				<a href={$page.url.origin + '/contests/'}>
					<div class="title">
						<p>Your Amazing Contest</p>
					</div>
				</a>
				<div class="subtext">
					<p class="company_name">The Amazing Company</p>
					<p class="contest_type">{value ? 'Deadline' : 'Score'} Contest</p>
				</div>
			</div>
		</div>
		<div class="indent">
			<div class="stats">
				<div class="flexblock">
					<div class="block">
						<p class="label">Grand Prize</p>
						<p class="value">{contestTypes.get(size).grand_prize} €</p>
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
										fill={index > levelCount ? '#FAFAFA' : color}
									/>
								</svg>
							{/each}
						</div>
					</div>
				</div>
				<div class="flexblock">
					<div class="block">
						<p class="label">Best Result</p>
						<p class="value">470 points</p>
					</div>
					<div class="block">
						<p class="label">{value ? 'Deadline' : 'Target'}</p>
						<div class="points">
							{#if !value}
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
										fill="#B035D0"
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
											stroke="#4CBB25"
											stroke-width="1.66667"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M10 5V10L13.3333 11.6667"
											stroke="#4CBB25"
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
								{!value ? target : displayableTarget}
								{!value ? (target > 1 ? 'points' : 'point') : ''}
							</p>
						</div>
					</div>
				</div>
			</div>
			<div class="short_description">
				<p>
					Spending your summer at Deloitte is a fantastic way to get up close to the world of
					business, find out what excites and inspires you, and where it could take you. As well as
					vital work experience, you'll get a good idea of whether we're the firm for you.
				</p>
			</div>
			<a href="/demo/?data=QUARTERMEAL_{size}_{$fields.type}" style="width: fit-content">
				<Button style={$fields.type === "DEADLINE" ? 'style5' : 'style6'}>View Demo</Button>
			</a>
		</div>
	</div>
</div>

<style>
	.heading {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-top: 30px;
		margin-bottom: 30px;
	}
	.heading h2 {
		font-size: 2.3rem;
		font-weight: 600;
		color: var(--black);
		margin-bottom: 10px;
	}
	.heading p {
		font-size: 1rem;
		font-weight: 400;
		margin-bottom: 10px;
	}
	.toggle {
		width: 100%;
		display: flex;
		justify-content: center;
	}
	.container {
		width: 100%;
		max-width: 1670px;
		padding: 0 30px;
		height: 100%;
		display: flex;
		align-items: center;
		margin-left: auto;
		margin-right: auto;
		justify-content: space-between;
		gap: 100px;
	}
	.img {
		width: 50vw;
		min-width: 500px;
		max-width: 550px;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.img img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.options {
		width: 50%;
	}
	@media only screen and (max-width: 1100px) {
		.container {
			flex-direction: column;
			gap: 50px;
			justify-content: unset;
			align-items: center;
		}

		.options {
			width: 100%;
		}
	}
	.contest_stats {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin-top: 30px;
		font-size: 0.95rem;
	}
	.participation_status {
		display: flex;
		align-items: center;
	}
	.filter {
		filter: grayscale(100%) saturate(100%) contrast(100%);
	}
	.participation_status {
		display: flex;
		gap: 10px;
		margin-left: 80px;
		color: var(--red2);
	}
	.score .target {
		color: var(--purple1);
	}
	.target {
		color: var(--green1);
	}
	a {
		text-decoration: none;
		color: inherit;
	}
	.container {
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
	.contest_type {
		text-transform: capitalize;
		color: var(--green1);
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
		max-width: 400px;
	}
	.header {
		display: flex;
		gap: 20px;
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
	.indent {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.stats {
		display: flex;
		margin: 24px 0 0 0;
		white-space: nowrap;
		gap: 40px;
		flex-wrap: wrap;
	}
	.flexblock {
		display: grid;
		grid-template-columns: 1fr;
		gap: 40px;
	}
	.label {
		font-weight: 600;
		font-size: 1rem;
		color: var(--gray1);
	}
	.value {
		font-size: 22px;
		font-weight: 600;
	}

	.block:last-child {
		border: none;
	}
	.level {
		display: flex;
		gap: 6px;
		margin-top: 5px;
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
	@media only screen and (max-width: 1100px) {
		.img {
			min-width: unset;
			width: 100%;
		}
		.header {
			margin-top: 30px;
		}
	}
</style>
