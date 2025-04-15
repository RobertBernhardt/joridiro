<script lang="ts">
	import RadioButtons from '$lib/InputComponents/RadioButtons.svelte';
	import ContestInvoice from './ContestInvoice.svelte';
	import ContestSize from './ContestSize.svelte';
	import ContestType from './ContestType.svelte';
	import PricingTable from './PricingTable.svelte';
	import SectionHeader from './SectionHeader.svelte';
	import { createForm } from 'svelte-forms-lib';
	import * as yup from 'yup';
	import Input from '$lib/InputComponents/Input.svelte';
	import FileSubmit from '$lib/InputComponents/FileSubmit.svelte';
	import { contestCreation } from '$lib/stores/contestCreation';
	import Button from '$lib/InputComponents/Button.svelte';
	import { contest } from '$lib/stores/contests';
	import { editedContest } from '$lib/stores/editContest';
	import { page } from '$app/stores';
	export let globalFormErrors: any;
	const { form, handleChange, errors, touched, handleSubmit, validateField, updateField } =
		createForm({
			initialValues: $editedContest
				? {
						title: $editedContest.title,
						banner: $editedContest.banner,
						type: $editedContest.type,
						size: $editedContest.size,
						organizer_platform: $editedContest.organizer_platform
				  }
				: {
						title: '',
						banner: [],
						type: 'SCORE',
						size: 'SMALL',
						organizer_platform: ''
				  },
			validationSchema: yup.object().shape({
				organizer_platform: yup.string().required().url('Must be a valid URL with http(s)://'),
				title: yup.string().required(),
				banner: yup.array().of(
					yup.object().shape({
						name: yup.string().required(),
						src: yup.string().required()
					})
				),
				type: yup.string().required(),
				size: yup.string().required()
			}),
			onSubmit: (values) => {
				$contestCreation.title = values.title;
				$contestCreation.banner = values.banner;
				$contestCreation.type = values.type;
				$contestCreation.size = values.size;
				$contestCreation.organizer_platform = values.organizer_platform;
				$contestCreation.step = 1;
			}
		});

	$: $contestCreation.title = $form.title;
	$: $contestCreation.banner = $form.banner;
	$: $contestCreation.type = $form.type;
	$: $contestCreation.size = $form.size;
	let numDays = 7;
	$: if ($form.size === 'SMALL') {
		numDays = 7;
	} else if ($form.size === 'MEDIUM') {
		numDays = 30;
	} else if ($form.size === 'LARGE') {
		numDays = 60;
	}
	$: globalFormErrors['PRIZE'] = $errors;

	$: calculateEndDate = (numDays: number) => {
		const date = new Date();
		date.setDate(date.getDate() + numDays);
		// Display as 12th January 2022
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};
	$: if ($page.url.pathname.split('/')[3] === 'edit') {
		$editedContest.title = $form.title;
		$editedContest.banner = $form.banner;
		$editedContest.size = $form.size;
		$editedContest.type = $form.type;
		$editedContest.organizer_platform = $form.organizer_platform;
	}
</script>

<form on:submit|preventDefault={handleSubmit}>
	<Input
		name="title"
		label="Contest Name"
		placeholder="Enter a meaningful and memorable title for your contest"
		required={true}
		type="text"
		value={$form.title}
		onChange={handleChange}
		error={$errors.title}
	/>
	<Input
		name="organizer_platform"
		label="On which page is the contest gonna take place?"
		placeholder="Ex: https://www.yourwebsite.com"
		required={true}
		type="text"
		value={$form.organizer_platform}
		onChange={handleChange}
		error={$errors.organizer_platform}
	/>

	<FileSubmit
		label="Upload banner"
		name="banner"
		required={false}
		onChange={handleChange}
		error={$errors.banner}
		accept="image/*"
		count={1}
		{updateField}
		{validateField}
		value={$form.banner}
	/>
	{#if !$page.url.pathname.includes('edit')}
		<SectionHeader
			title="Prizes"
			tooltip="Choose whatever contest fits your businesses needs best. You can choose between the two basic types score and deadline contest as well as the size of your contest in the three sizes S, M and L"
		/>
		<div class="container">
			<ContestType name="type" onChange={handleChange} value={$form.type} fields={form} {errors} />
			<div class="seperation10" />
			<ContestSize name="size" onChange={handleChange} value={$form.size} fields={form} {errors} />
			<div class="seperation" />
			<ContestInvoice fields={form} />
			{#if $form.type === 'DEADLINE'}
				<div class="duration">
					Contest Period : <nbsp> <span class="bold"
						>{new Date().toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})} - {calculateEndDate(numDays)}</span
					>
				</div>
			{/if}
		</div>
		{#if $contestCreation.step == 0}
			<div class="next">
				<Button type="submit">Next Step</Button>
			</div>
		{/if}
	{/if}
</form>

<style>
	.container {
		display: flex;
		flex-direction: column;
	}
	.duration {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 10px;
		background-color: #f7f7f9;
		margin-top: 30px;
	}
	.bold {
		font-weight: 600;
	}
	.next {
		margin-top: 30px;
	}
	.seperation {
		margin: 20px 0;
	}
	.seperation10 {
		margin: 10px 0;
	}
</style>
