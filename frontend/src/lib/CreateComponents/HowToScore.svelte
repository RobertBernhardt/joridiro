<script lang="ts">
	import Button from '$lib/InputComponents/Button.svelte';
	import ScoreBlock from './ScoreBlock.svelte';
	import SectionHeader from './SectionHeader.svelte';
	import { createForm } from 'svelte-forms-lib';
	import * as yup from 'yup';
	import { contestCreation } from '$lib/stores/contestCreation';
	import { createEventDispatcher } from 'svelte/internal';
	import contestTypes from '../../utils/contstTypes';
	import { editedContest } from '$lib/stores/editContest';
	import { page } from '$app/stores';
	const dispatch = createEventDispatcher();
	export let globalFormErrors: any;
	let submitAttempted = false;

	// Make an object with the same structure as the form with 3 empty objects
	const {
		form,
		handleChange,
		errors,
		touched,
		handleSubmit,
		isValid,
		updateField,
		validateField,
		updateInitialValues
	} = createForm({
		initialValues: {
			score: $editedContest ? $editedContest.score.map((score: any) => {
				return {
					name: score.name,
					number: score.number,
					points: score.points,
					measuring_unit: score.measuring_unit,
					description: score.description,
					editable: false,
					showCancelBtn: false
				};
			}) : [
				{
					name: '',
					number: 1,
					points: 1,
					measuring_unit: '',
					description: '',
					editable: true,
					showCancelBtn: false
				}
			]
		},
		validationSchema: yup.object().shape({
			score: yup
				.array()
				.of(
					yup.object().shape({
						name: yup.string(),
						number: yup.number().min(0.1, 'Must be greater than 0'),
						points: yup
							.number()
							.min(0.1, 'Must be greater than 0')
							.test('not_a_float', 'Must be an integer', (value) => {
								return Number.isInteger(value);
							}),
						measuring_unit: yup.string(),
						description: yup.string(),
						editable: yup.boolean(),
						showCancelBtn: yup.boolean()
					})
				)
				.min(1, 'Must have at least one score rule')
		}),
		onSubmit: (values) => {
			submitAttempted = true;
			if ($form.score[0].name) {
				values.score = values.score.map((rule: any) => {
					delete rule.editable;
					delete rule.showCancelBtn;
					return rule;
				});
				dispatch('next', $contestCreation.step);
			}
		}
	});

	const save = (value: any, index: number) => {
		if ($form.score.length > 1) {
			updateField('score', [
				...$form.score.slice(0, index),
				value,
				...$form.score.slice(index + 1)
			]);
		} else {
			updateField('score', [value]);
		}
	};

	const edit = (index: number) => {
		let score = $form.score[index];
		score.editable = true;
		score.showCancelBtn = true;
		save(score, index);
	};
	const cancel = (index: number) => {
		let score = $form.score[index];
		score.editable = false;
		score.showCancelBtn = false;
		save(score, index);
	};
	const add = () => {
		let score = {
			name: '',
			number: 200,
			points: 0,
			measuring_unit: '',
			description: '',
			editable: true
		};
		updateField('score', [...$form.score, score]);
	};

	const deleteScore = (index: number) => {
		if ($form.score.length > 1) {
			// Delete from $contestCreation
			$contestCreation.score = [
				...$contestCreation.score.slice(0, index),
				...$contestCreation.score.slice(index + 1)
			];
			updateField('score', [...$form.score.slice(0, index), ...$form.score.slice(index + 1)]);
		}
	};
	$: globalFormErrors
	$: showSectionError =
		!$form.score[0].name && submitAttempted ? 'You must have at least one scoring criteria' : '';

	$: if ($page.url.pathname.split('/')[3] === 'edit') {
		$editedContest.score = $form.score;
	}
</script>

<form on:submit|preventDefault={handleSubmit}>
	<SectionHeader title="How to score" tooltip="Here you can define up to three methods how participants in your contest can score points. Each method is unlimited, i.e. a participant could win by just getting points in one method or by combining points scored with different methods. In each method you define how much points participants get for doing a number of some specific achievement. Points aren't divided, e.g. if you say that participants get 2 points for every 100 € revenue on your platform, they'll get for 199 € total revenue still 2 points and only with 200 € they will get 4 points in total in this method" />

	{#if showSectionError}
		<div class="error">
			<p>{showSectionError}</p>
		</div>
	{/if}

	<div class="score">
		{#each $form.score as score, i}
			{#if score.editable}
				<ScoreBlock key={i} value={$form.score[i]} {deleteScore} {save} {cancel} index={i} />
			{:else}
				<div class="block">
					<div class="icon">
						<svg
							width="20"
							height="20"
							viewBox="0 0 20 20"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g clip-path="url(#clip0_1579_102860)">
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M2.50397 12.8787C2.5038 13.0293 2.50363 13.1799 2.50363 13.3305C2.50363 13.4682 2.50372 13.6058 2.5038 13.7434C2.50402 14.0873 2.50423 14.4309 2.50311 14.7742C2.50207 15.0216 2.50572 15.268 2.56249 15.5107C2.73072 16.2279 3.16405 16.768 3.71874 17.2221C4.50051 17.8617 5.40832 18.256 6.36405 18.5482C7.64686 18.9404 8.96405 19.1154 10.3015 19.1523C12.0021 19.1997 13.6786 19.0435 15.312 18.5466C16.3385 18.2346 17.3068 17.8023 18.1182 17.0773C18.8125 16.457 19.1974 15.7029 19.1724 14.7456C19.1555 14.1054 19.1594 13.4646 19.1633 12.8238C19.1651 12.5339 19.1668 12.2441 19.1667 11.9544C19.1667 11.9268 19.1671 11.8991 19.1676 11.8714C19.1689 11.7946 19.1702 11.7178 19.1614 11.6424C19.0328 10.5195 18.4838 9.669 17.5 9.10754C17.4135 9.05806 17.3812 9.02265 17.4125 8.9164C17.4745 8.7039 17.4989 8.4841 17.4984 8.26119C17.4963 7.19452 17.4969 6.12733 17.4979 5.06015C17.4979 4.86431 17.4792 4.6716 17.4349 4.48046C17.2698 3.769 16.8385 3.23462 16.2911 2.78306C15.5745 2.19192 14.7458 1.81067 13.8703 1.52317C12.5198 1.07942 11.1276 0.88775 9.71092 0.846604C7.9578 0.795562 6.23072 0.96327 4.55207 1.49556C3.56718 1.80806 2.63853 2.23619 1.86249 2.93931C1.18332 3.55442 0.805717 4.29921 0.829155 5.2414C0.845321 5.88174 0.841805 6.52279 0.838287 7.16391C0.836592 7.47291 0.834897 7.78192 0.835405 8.09087C0.835405 8.20754 0.839051 8.32525 0.854155 8.44087C0.996342 9.53358 1.55103 10.3513 2.50415 10.8987C2.5927 10.9497 2.61718 10.993 2.5854 11.094C2.51874 11.306 2.50155 11.5263 2.50259 11.7492C2.50482 12.1257 2.5044 12.5022 2.50397 12.8787ZM13.8104 3.28513C12.3171 2.70336 10.7567 2.51534 9.16767 2.50284C8.78954 2.49346 8.41246 2.51586 8.03694 2.54346C6.76715 2.63721 5.52548 2.86221 4.34527 3.36013C3.76767 3.60388 3.21506 3.89346 2.79215 4.37315C2.40361 4.81377 2.40881 5.19659 2.79788 5.63877C3.11246 5.99659 3.50881 6.24346 3.93017 6.45232C5.00777 6.98721 6.15986 7.25544 7.34683 7.39294C9.21246 7.60857 11.0604 7.52471 12.8781 7.02888C13.7531 6.78982 14.5948 6.46638 15.3015 5.87263C15.9984 5.28721 15.9979 4.72836 15.3099 4.13773C14.8656 3.75596 14.351 3.49555 13.8104 3.28513ZM9.65361 12.4935C7.79111 12.5586 5.97027 12.3232 4.17027 11.7054C4.19944 11.9304 4.28902 12.0914 4.40725 12.2388C4.68798 12.5924 5.05413 12.8388 5.44684 13.0461C6.68069 13.6976 8.01767 13.97 9.39058 14.0992C10.5807 14.2112 11.7692 14.1867 12.9531 14.0205C14.0583 13.8653 15.1323 13.5992 16.1317 13.0856C16.5854 12.8528 17.0151 12.5825 17.3171 12.1565C17.5609 11.8133 17.5593 11.5086 17.3198 11.1643C17.1114 10.8648 16.8213 10.6565 16.5197 10.4601C16.4484 10.4136 16.412 10.4461 16.371 10.4827C16.3657 10.4875 16.3603 10.4923 16.3546 10.4971C15.9093 10.8726 15.4125 11.1659 14.8838 11.4054C13.2224 12.1596 11.4588 12.4304 9.65361 12.4935ZM4.17288 14.2304C4.27747 14.2821 4.3798 14.3335 4.48083 14.3842L4.48112 14.3844C4.6939 14.4913 4.90102 14.5953 5.11142 14.6924C6.88746 15.5133 8.75361 15.881 10.7099 15.8367C10.8766 15.8329 11.0433 15.8309 11.2099 15.8288L11.2104 15.8288C11.7584 15.822 12.3058 15.8152 12.852 15.7481C14.4296 15.5549 15.914 15.0752 17.3109 14.319C17.3522 14.2968 17.3937 14.2752 17.4426 14.2498L17.4429 14.2496C17.4593 14.2411 17.4765 14.2322 17.4947 14.2226C17.4947 14.3123 17.4958 14.3999 17.4969 14.4862C17.4993 14.6817 17.5016 14.87 17.4911 15.0575C17.4786 15.2794 17.3567 15.4617 17.2119 15.6247C16.8093 16.0773 16.2927 16.3612 15.7484 16.6008C14.7036 17.0601 13.601 17.294 12.4729 17.4122C11.1078 17.5554 9.74475 17.5278 8.3885 17.3018C7.30048 17.1205 6.24631 16.8315 5.28121 16.2778C4.96975 16.0992 4.68069 15.8898 4.44475 15.6148C4.25465 15.394 4.15152 15.1461 4.17079 14.8476C4.17898 14.7117 4.17695 14.5748 4.17485 14.4325C4.17387 14.3665 4.17288 14.2993 4.17288 14.2304ZM2.57171 7.5906L2.50361 7.55492C2.50361 7.60652 2.50524 7.65519 2.50681 7.70171C2.50999 7.79651 2.51288 7.88235 2.501 7.96586C2.41663 8.56482 2.71454 8.97003 3.15934 9.30805C3.6609 9.6893 4.2234 9.95075 4.81402 10.157C6.34319 10.6914 7.92496 10.8575 9.53433 10.8242C11.0125 10.7935 12.4583 10.582 13.8416 10.0372C14.4359 9.80336 15.0026 9.51534 15.4604 9.05336C15.6317 8.88096 15.7937 8.69034 15.814 8.44086C15.83 8.24449 15.8262 8.0461 15.8225 7.84657V7.8464C15.8209 7.75916 15.8192 7.67169 15.8192 7.58409C15.7526 7.58448 15.7026 7.61604 15.654 7.64674C15.6376 7.65709 15.6213 7.66735 15.6046 7.67627C14.2479 8.407 12.8062 8.8695 11.2781 9.07367C10.5316 9.17326 9.78305 9.17513 9.0339 9.177C8.94465 9.17723 8.85537 9.17745 8.76611 9.17784C6.96142 9.18565 5.23277 8.83044 3.58277 8.0945C3.24585 7.94389 2.91903 7.77262 2.57171 7.5906Z"
									fill="#6A7584"
								/>
							</g>
							<defs>
								<clipPath id="clip0_1579_102860">
									<rect width="20" height="20" fill="white" />
								</clipPath>
							</defs>
						</svg>
					</div>
					<div class="text">
						<p class="label">Participants get</p>
						<p class="value">
							{score.name} {score.name > 1 ? 'points' : 'point'} for {score.number > 1 ? score.number : 'every'}
							{score.measuring_unit}
						</p>
					</div>
					<div on:click={() => edit(i)} on:keydown={() => edit(i)} class="edit">
						<svg
							width="20"
							height="28"
							viewBox="0 0 20 28"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g clip-path="url(#clip0_1579_101896)">
								<path
									d="M14.166 6.49993C14.3849 6.28106 14.6447 6.10744 14.9307 5.98899C15.2167 5.87054 15.5232 5.80957 15.8327 5.80957C16.1422 5.80957 16.4487 5.87054 16.7347 5.98899C17.0206 6.10744 17.2805 6.28106 17.4993 6.49993C17.7182 6.7188 17.8918 6.97863 18.0103 7.2646C18.1287 7.55057 18.1897 7.85706 18.1897 8.16659C18.1897 8.47612 18.1287 8.78262 18.0103 9.06859C17.8918 9.35455 17.7182 9.61439 17.4993 9.83326L6.24935 21.0833L1.66602 22.3333L2.91602 17.7499L14.166 6.49993Z"
									stroke="#6A7584"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</g>
							<defs>
								<clipPath id="clip0_1579_101896">
									<rect width="20" height="20" fill="white" transform="translate(0 4)" />
								</clipPath>
							</defs>
						</svg>
					</div>
				</div>
			{/if}
		{/each}
	</div>
	<div class="addMethodBtn">
		<Button
			showLoaderOnDisable={false}
			type="button"
			onClick={add}
			disabled={$form.score.length == 3}
			style="style3"
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M10.334 9.16658V9.66658H10.834H15.834C15.9224 9.66658 16.0072 9.7017 16.0697 9.76422C16.1322 9.82673 16.1673 9.91151 16.1673 9.99992C16.1673 10.0883 16.1322 10.1731 16.0697 10.2356C16.0072 10.2981 15.9224 10.3333 15.834 10.3333H10.834H10.334V10.8333V15.8333C10.334 15.9217 10.2989 16.0064 10.2364 16.069C10.1738 16.1315 10.0891 16.1666 10.0007 16.1666C9.91224 16.1666 9.82746 16.1315 9.76495 16.069C9.70244 16.0064 9.66732 15.9217 9.66732 15.8333V10.8333V10.3333H9.16732H4.16732C4.07891 10.3333 3.99413 10.2981 3.93162 10.2356C3.8691 10.1731 3.83398 10.0883 3.83398 9.99992C3.83398 9.91151 3.8691 9.82673 3.93162 9.76422C3.99413 9.7017 4.07891 9.66658 4.16732 9.66658H9.16732H9.66732V9.16658V4.16659C9.66732 4.07818 9.70244 3.9934 9.76495 3.93088C9.82746 3.86837 9.91225 3.83325 10.0007 3.83325C10.0891 3.83325 10.1738 3.86837 10.2364 3.93088C10.2989 3.9934 10.334 4.07818 10.334 4.16659V9.16658Z"
					fill="#EA3D09"
					stroke="#EA3D09"
				/>
			</svg>
			<p>Add Method</p>
		</Button>
	</div>
	<div class="next">
		{#if $contestCreation.step == 1}
			<Button type="submit">Next Step</Button>
		{/if}
	</div>
</form>

<style>
	.next {
		margin-top: 30px;
	}
	.addMethodBtn {
		margin-top: 30px;
	}
	.error {
		color: var(--red1);
		background-color: var(--red4);
		border-radius: 7px;
		padding: 4px 24px;
		font-weight: 600;
		font-size: 0.9rem;
		margin-bottom: 10px;
	}
	.score {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.points {
		display: flex;
		gap: 8px;
		align-items: center;
		background-color: var(--gray4);
		width: fit-content;
		height: fit-content;
		padding: 3px 10px;
		white-space: nowrap;
	}
	.text {
		width: 100%;
	}
	.block {
		display: flex;
		padding: 16px 24px;
		border: 1px solid var(--gray3);
		border-radius: 7px;
		gap: 20px;
	}
	.block .icon {
		width: 40px;
		height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--gray4);
		border-radius: 50%;
	}
	.text {
		display: flex;
		flex-direction: column;
	}
	.label {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--gray1);
	}
	.value {
		font-size: 1.2rem;
		font-weight: 600;
	}
	.description {
		font-size: 0.9rem;
		font-weight: 400;
		color: var(--gray1);
	}
</style>
