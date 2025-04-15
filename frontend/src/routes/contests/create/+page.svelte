<script lang="ts">
	import { goto } from '$app/navigation';
	import AboutCompany from '$lib/CreateComponents/AboutCompany.svelte';
	import AboutContest from '$lib/CreateComponents/AboutContest.svelte';
	import ContestHeader from '$lib/CreateComponents/ContestHeader.svelte';
	import ContestPrize from '$lib/CreateComponents/ContestPrize.svelte';
	import HowToScore from '$lib/CreateComponents/HowToScore.svelte';
	import ProgressBar from '$lib/CreateComponents/ProgressBar.svelte';
	import Questions from '$lib/CreateComponents/Questions.svelte';
	import Requirements from '$lib/CreateComponents/Requirements.svelte';
	import Rules from '$lib/CreateComponents/Rules.svelte';
	import Button from '$lib/InputComponents/Button.svelte';
	import Dropdown from '$lib/InputComponents/Dropdown.svelte';
	import { contestCreation } from '$lib/stores/contestCreation';
	import { editedContest } from '$lib/stores/editContest';
	import { user } from '$lib/stores/user';
	import { onMount } from 'svelte';
	import API from '../../../utils/API';

	let showPage = false;

	onMount(() => {
		if (!$user) {
			goto('/');
		} else {
			showPage = true;
		}
	});

	$: globalFormErrors = {
		PRIZE: {},
		SCORE: {},
		RULES: {},
		REQUIREMENTS: {},
		QUESTIONS: {},
		ABOUT_CONTEST: {},
		ABOUT_COMPANY: {}
	};

	const handleNextStep = async () => {
		// If all the fields of globalFormErrors are empty, then we can go to the next step
		// Otherwise, we need to show the errors
		let canGoToNextStep = true;
		// Recursively check if all the fields are empty or not for objects and arrays
		const checkIfEmpty = (obj: any) => {
			for (let key in obj) {
				if (typeof obj[key] === 'object') {
					checkIfEmpty(obj[key]);
				} else {
					if (obj[key] !== '') {
						canGoToNextStep = false;
					}
				}
			}
		};
		checkIfEmpty(globalFormErrors);
		if ($contestCreation.step === 1) {
		}
		if ($contestCreation.step > 6) {
		}
		if (canGoToNextStep) {
			$contestCreation.step += 1;
		}
	};
	$: console.log(globalFormErrors);

	$editedContest = undefined;
</script>

{#if showPage}
	<div class="container">
		<div class="pageheader">CREATE NEW CONTEST</div>
		<form class="wrapper">
			<div class="progresswrapper">
				<ProgressBar />
			</div>
			<div class="form">
				{#if $contestCreation.step >= 0}
					<ContestPrize {globalFormErrors} />
				{/if}
				{#if $contestCreation.step >= 1}
					<HowToScore on:next={handleNextStep} {globalFormErrors} />
				{/if}
				{#if $contestCreation.step >= 2}
					<Rules on:next={handleNextStep} {globalFormErrors} />
				{/if}
				{#if $contestCreation.step >= 3}
					<Requirements on:next={handleNextStep} {globalFormErrors} />
				{/if}
				{#if $contestCreation.step >= 4}
					<AboutContest on:next={handleNextStep} {globalFormErrors} />
				{/if}
				{#if $contestCreation.step >= 5}
					<AboutCompany on:next={handleNextStep} {globalFormErrors} />
				{/if}
			</div>
		</form>
	</div>
{/if}

<style>
	.container {
		width: 100%;
		max-width: 100vw;
		height: fit-content;
		border-radius: 7px;
		position: relative;
		margin-top: 70px;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		flex-direction: column;
		overflow-x: hidden;
	}
	.pageheader {
		background-color: var(--gray3);
		width: 100%;
		padding: 15px;
		font-weight: 600;
		display: flex;
		justify-content: center;
		z-index: 999999;
	}
	.wrapper {
		width: 100%;
		max-width: 1200px;
		height: fit-content;
		padding: 40px;
		border-radius: 7px;
		position: relative;
		display: flex;
		gap: 40px;
	}
	.form {
		width: 100%;
		min-width: 200px;
		max-width: 700px;
		height: fit-content;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.progresswrapper {
		width: 250px;
		height: 40px;
		padding-left: 30px;
		top: 0;
		left: 0;
		z-index: 1;
		position: sticky;
		top: 90px;
	}
	@media only screen and (max-width: 1240px) {
		.wrapper {
			padding: 40px 0;
			display: flex;
			justify-content: center;
		}
	}

	@media only screen and (max-width: 950px) {
		.progresswrapper {
			display: none;
		}
		.wrapper {
			max-width: unset;
			padding: 40px 30px;
		}
		.form {
			max-width: unset;
			min-width: unset;
		}
	}
	@media only screen and (max-width: 768px) {
		.wrapper {
			padding: 40px 15px;
		}
	}
</style>
