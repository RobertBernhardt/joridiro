<script lang="ts">
	import Card from '$lib/Contest/Card.svelte';
	import UpdateScoreModal from '$lib/Contest/UpdateScoreModal.svelte';
	import Button from '$lib/InputComponents/Button.svelte';
	import Input from '$lib/InputComponents/Input.svelte';
	import { modal } from '$lib/stores/modal';
	import { calcScore } from '../../utils/getTotalScore';
	import API from '../../utils/API';
	import contestTypes from '../../utils/contstTypes';
	import type { PageLoad } from './$types';
	import FaqModal from '$lib/Contest/FAQModal.svelte';
	let value = '';
	export let data: PageLoad;
	let contests = data.contests;
	let search: any = [];

	$: console.log(value)
	const searchContests = async (e: any) => {
		console.log("HERE")
		value = e.target.value;
		const res = await API.post('/contest/search', { query: e.target.value });
		search = res.data;
	};

</script>

<div class="container">
	<div class="header">
		<p class="title">Joridiro Contests</p>
		<div class="search">
			<Input
				icon_left="../icons/search.svg"
				name="name"
				value={value}
				onChange={searchContests}
				placeholder="Search for contests"
			/>
			<div class="searchBox">
				{#if value}
					{#if search.length < 1}
						<div class="searchItem">
							<p class="noResults">No results found</p>
						</div>
					{:else}
						{#each search as contest}
							<div class="searchItem">
								<a class="searchContainer" href="/contests/{contest._id}">
									<div class="image">
										{#if !contest.banner}
											<img src="/images/defaultcontest.png" alt="" />
										{:else}
											<img src={contest.banner} alt="" />
										{/if}
									</div>
									<div class="info">
										<p class="title">{contest.title}</p>
										<p class="company">{contest.about_company.name}</p>
									</div>
								</a>
							</div>
						{/each}
					{/if}
				{/if}
			</div>
		</div>
		<div class="box1">
			<svg
				width="572"
				height="579"
				viewBox="0 0 572 579"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					opacity="0.1"
					d="M556.377 391.3C570.726 383.016 575.642 364.668 567.358 350.319L374.327 15.9803C366.043 1.63154 347.695 -3.2847 333.347 4.99957L15.9806 188.231C1.63183 196.515 -3.28441 214.863 4.99986 229.212L198.03 563.55C206.315 577.899 224.662 582.815 239.011 574.531L556.377 391.3Z"
					fill="url(#paint0_linear_1358_53753)"
				/>
				<defs>
					<linearGradient
						id="paint0_linear_1358_53753"
						x1="285.787"
						y1="-9.69909"
						x2="285.787"
						y2="475.559"
						gradientUnits="userSpaceOnUse"
					>
						<stop stop-color="white" />
						<stop offset="1" stop-color="white" stop-opacity="0" />
					</linearGradient>
				</defs>
			</svg>
		</div>
		<div class="box2">
			<svg
				width="456"
				height="231"
				viewBox="0 0 456 231"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					opacity="0.1"
					d="M450.977 38.2341C459.261 52.5829 454.345 70.9306 439.996 79.2148L185.268 226.282C170.92 234.566 152.572 229.65 144.288 215.301L5.00009 -25.9517C-3.28418 -40.3005 1.63209 -58.6482 15.9809 -66.9324L270.709 -214C285.058 -222.284 303.405 -217.368 311.69 -203.019L450.977 38.2341Z"
					fill="url(#paint0_linear_1358_53752)"
				/>
				<defs>
					<linearGradient
						id="paint0_linear_1358_53752"
						x1="108.845"
						y1="211.883"
						x2="301.471"
						y2="-121.757"
						gradientUnits="userSpaceOnUse"
					>
						<stop stop-color="white" />
						<stop offset="1" stop-color="white" stop-opacity="0" />
					</linearGradient>
				</defs>
			</svg>
		</div>
	</div>
</div>
<div class="wrapper">
	<div class="cardcontainer">
		{#if data.contests.length > 0}
			{#each data.contests as contest}
				<Card
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
		{:else}
			No contests found
		{/if}
	</div>
</div>

<style>
	.noResults{
		font-size: 14px;
		padding-top: 20px;
		font-weight: 500;
	}
	.searchContainer {
		display: flex;
		gap: 20px;
		width: 100%;
		padding: 10px;
	}
	.searchContainer:hover {
		background-color: var(--gray4);
	}
	.info {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}
	.info .title {
		font-size: 18px;
		font-weight: 500;
		display: flex;
	}
	.company {
		font-size: 14px;
		color: var(--gray1);
	}
	.image {
		width: 50px;
		height: 50px;
		border-radius: 10px;
		overflow: hidden;
	}
	.image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.searchItem {
		padding: 10px 10px;
		background-color: #ffffff;
		width: 100%;
		color: #000000;
		display: flex;
		align-items: center;
	}
	.searchBox {
		display: flex;
		flex-direction: column;
		position: absolute;
		width: 100%;
		top: 55px;
		max-width: 860px;
		border-radius: 7px;
		overflow: hidden;
	}
	.wrapper {
		display: flex;
		flex-direction: column;
	}
	.container {
		color: white;
		display: flex;
		justify-content: center;
		background: linear-gradient(161.15deg, #6714cc 12.73%, #2f08ce 72.95%);
		padding: 100px 0 80px 0;
		flex-direction: column;
		align-items: center;
	}
	.header {
		gap: 30px;
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 920px;
	}
	.title {
		font-size: 2.3rem;
		font-weight: 500;
	}
	.search {
		width: 100%;
		position: relative;
		max-width: 920px;
		z-index: 999999;
		height: fit-content;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 30px;
		gap: 30px;
		margin-left: auto;
		margin-right: auto;
	}
	.header p:not(.title) {
		margin-top: -20px;
		opacity: 0.6;
	}

	.box1 {
		position: absolute;
		bottom: 120px;
		right: 0;
	}
	.box2 {
		position: absolute;
		top: 0;
		left: 0;
	}
	.cardcontainer {
		width: 100%;
		max-width: 1670px;
		margin-top: 50px;
		height: fit-content;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 30px;
		gap: 30px;
		margin-left: auto;
		margin-right: auto;
	}

	@media only screen and (max-width: 1155px) {
		.header {
			width: 100%;
			padding: 0 20px;
		}
		.cardcontainer {
			padding: 20px;
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
			gap: 30px;
		}
		.box1 {
			display: none;
		}
		.box2 {
			display: none;
		}
		.search{
			padding: 0;
			max-width: unset;
		}
	}
</style>
