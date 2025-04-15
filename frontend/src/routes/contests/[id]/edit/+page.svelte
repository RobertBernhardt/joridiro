<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
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
	import { alert as notifications } from '$lib/Notifications/notifications';
	import { contestCreation } from '$lib/stores/contestCreation';
	import { contest } from '$lib/stores/contests';
	import { editedContest } from '$lib/stores/editContest';
	import { user } from '$lib/stores/user';
	import { onMount } from 'svelte';
	import API from '../../../../utils/API';

	$: globalFormErrors = {
		PRIZE: {},
		SCORE: {},
		RULES: {},
		REQUIREMENTS: {},
		QUESTIONS: {},
		ABOUT_CONTEST: {},
		ABOUT_COMPANY: {}
	};
	const checkIfEmpty = (obj: any) => {
		for (let key in obj) {
			if (typeof obj[key] === 'object') {
				checkIfEmpty(obj[key]);
			} else {
				if (obj[key] !== '') {
					return false;
				}
			}
		}
		return true;
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
	};

	const submitEditContestRequest = async () => {
		try {
			if (checkIfEmpty(globalFormErrors)) {
				// > Remove editable and showCancelBtn from the object in the score and rules and additional field in requirements
				$editedContest.score = $editedContest.score.map((item: any) => {
					delete item.editable;
					delete item.showCancelBtn;
					return item;
				});
				$editedContest.rules = $editedContest.rules.map((item: any) => {
					return item.name;
				});
				$editedContest.requirements.additional = $editedContest.requirements.additional.map(
					(item: any) => {
						delete item.additional;
						return item;
					}
				);
				const res = await API.post(
					`/contest/${$page.url.pathname.split('/')[2]}/edit`,
					$editedContest
				);
				$notifications = {
                    type: 'SUCCESS',
                    message: res.data.message
                };
				goto(`/contests/${$page.url.pathname.split('/')[2]}`);
			}
		} catch (err: any) {
			$notifications = {
				type: 'ERROR',
				message: err.response.data.message
			};
		}
	};

	let data: any = {};
	let isLoaded = false;
	onMount(async () => {
		data = await API.get(`/contest/${$page.url.pathname.split('/')[2]}`, {});
		console.log(data);
		$editedContest = data.data;
		isLoaded = true;
	});
	$: console.log($editedContest);
	$: console.log(globalFormErrors);
</script>

{#if $editedContest && isLoaded}
	<div class="container">
		<div class="pageheader">EDIT YOUR CONTEST</div>
		<form on:submit|preventDefault={submitEditContestRequest} class="wrapper">
			<div class="form">
				<ContestPrize {globalFormErrors} />
				<HowToScore on:next={handleNextStep} {globalFormErrors} />
				<Rules on:next={handleNextStep} {globalFormErrors} />
				<Requirements on:next={handleNextStep} {globalFormErrors} />
				<AboutContest on:next={handleNextStep} {globalFormErrors} />
				<AboutCompany on:next={handleNextStep} {globalFormErrors} />
				<Button type="submit">Submit for review</Button>
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
		max-width: 900px;
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
