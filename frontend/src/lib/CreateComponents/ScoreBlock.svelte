<script lang="ts">
	import Button from '$lib/InputComponents/Button.svelte';
	import Input from '$lib/InputComponents/Input.svelte';
	import { contestCreation } from '$lib/stores/contestCreation';
	import { createEventDispatcher } from 'svelte';
	import { createForm } from 'svelte-forms-lib';
	import * as yup from 'yup';
	export let save: any;
	export let index: any;
	export let key: any;
	export let value: any;
	export let deleteScore: any;
	export let cancel: any;
	export let edit: boolean = false;
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
			name: value.name,
			number: value.number,
			points: value.points,
			measuring_unit: value.measuring_unit,
			editable: false,
			showCancelBtn: value.showCancelBtn
		},
		validationSchema: yup.object().shape({
			name: yup.string().required('Required'),
			number: yup.number().required('Required').min(0.1, 'Must be greater than 0'),
			points: yup
				.number()
				.required('Required')
				.min(0.1, 'Must be greater than 0')
				.test('not_a_float', 'Must be an integer', (value) => {
					return Number.isInteger(value);
				}),
			measuring_unit: yup.string().required('Required'),
			description: yup.string(),
			editable: yup.boolean(),
			showCancelBtn: yup.boolean()
		}),
		onSubmit: async (values) => {
			$contestCreation.score[index] = values;
			save(values, index);
		}
	});
</script>

<form on:submit={handleSubmit} class="container">
	<div class="content">
		<div class="block">
			<div class="line">
				<div>
					<p>Participants get</p>
					<div class="input">
						<Input
							name="name"
							placeholder="2"
							required={true}
							type="text"
							onChange={handleChange}
							value={$form.name}
							error={$errors.name}
						/>
					</div>
				</div>
				<div>
					<p>points for every</p>
					<div class="input">
						<Input
							name="number"
							placeholder="200"
							required={true}
							type="text"
							onChange={handleChange}
							value={$form.number}
							error={$errors.number}
						/>
					</div>
				</div>
				<div class="input">
					<Input
						name="measuring_unit"
						placeholder="€ Revenue"
						required={true}
						type="text"
						onChange={handleChange}
						value={$form.measuring_unit}
						error={$errors.measuring_unit}
					/>
				</div>
			</div>
		</div>
	</div>
	<div class="buttons">
		<div class="save_cancel">
			<Button type="submit">Save</Button>
			{#if $form.showCancelBtn}
				<Button type="button" style="style2" onClick={() => cancel(index)}>Cancel</Button>
			{/if}
		</div>
		<div class="delete">
			<Button type="button" style="style2" onClick={() => deleteScore(index)}>
				<svg
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M2.5 5H4.16667H17.5"
						stroke="#EA3D09"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M6.66602 5.00033V3.33366C6.66602 2.89163 6.84161 2.46771 7.15417 2.15515C7.46673 1.84259 7.89065 1.66699 8.33268 1.66699H11.666C12.108 1.66699 12.532 1.84259 12.8445 2.15515C13.1571 2.46771 13.3327 2.89163 13.3327 3.33366V5.00033M15.8327 5.00033V16.667C15.8327 17.109 15.6571 17.5329 15.3445 17.8455C15.032 18.1581 14.608 18.3337 14.166 18.3337H5.83268C5.39065 18.3337 4.96673 18.1581 4.65417 17.8455C4.34161 17.5329 4.16602 17.109 4.16602 16.667V5.00033H15.8327Z"
						stroke="#EA3D09"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M11.666 9.16699V14.167"
						stroke="#EA3D09"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M8.33398 9.16699V14.167"
						stroke="#EA3D09"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<p style="color: var(--red1)">Delete</p>
			</Button>
		</div>
	</div>
</form>

<style>
	.container {
		padding: 0 24px 24px 24px;
		background-color: var(--gray4);
		border-radius: 7px;
		display: flex;
		flex-direction: column;
	}
	.line {
		display: flex;
		gap: 10px;
		align-items: center;
	}
    .line div{
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }
	.line p {
		white-space: nowrap;
		font-weight: 600;
		font-size: 0.9rem;
	}
	.buttons {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 10px;
	}
	.save_cancel {
		display: flex;
		gap: 10px;
	}
	.content {
		width: 100%;
	}
	.input {
		margin-top: 25px;
	}
	.block {
		display: flex;
		gap: 10px;
	}
	svg {
		cursor: pointer;
	}

	@media only screen and (max-width: 768px) {
        .container{
            padding: 20px 10px;
        }
		.block {
			flex-direction: column;
		}
        .line{
            flex-direction: column;
            width: 100%;
        }
        .line *{
            width: 100%;
        }
        .input{
            margin-top: 0;
        }
	}
</style>
