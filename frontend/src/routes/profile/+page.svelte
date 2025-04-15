<script>
	import Input from '$lib/InputComponents/Input.svelte';
	import * as yup from 'yup';
	import { createForm } from 'svelte-forms-lib';
	import LogoSubmit from '$lib/InputComponents/LogoSubmit.svelte';
	import Button from '$lib/InputComponents/Button.svelte';
	import { user } from '$lib/stores/user';
	import API from '../../utils/API';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(()=>{
		console.log($user)
		if(!$user){
			goto("../")
		}
	})

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
			pfp: $user.pfp,
			fullName: $user.fullName,
			email: $user.email,
			country: $user.country,
			city: $user.city,
			street: $user.street,
			zip_code: $user.zipCode,
			vat_id: $user.vat_id,
			tax_id: $user.tax_id
		},
		validationSchema: yup.object().shape({
			fullName: yup.string().required("Required"),
			email: yup.string().email(),
			country: yup.string(),
			city: yup.string(),
			street: yup.string(),
			zip_code: yup.string(),
			vat_id: yup.string(),
			tax_id: yup.string()
		}),
		onSubmit: (values) => {
			API.post('user/profile/update', values).then((res) => {
				$user = res.user;
			});
		}
	});
</script>

<header>
	<h1>My Details</h1>
</header>

<form on:submit={handleSubmit} action="">
	<div class="block">
		<LogoSubmit
			label="Profile Picture"
			name="pfp"
			required={false}
			updateField={updateField}
			validateField={validateField}
			accept="image/*"
			value={$form.pfp}
			onChange={handleChange}
			error={$errors.pfp}
		/>
	</div>
	<div class="block">
		<Input
			label="Full Name"
			name="fullName"
			required={true}
			placeholder="Enter your full name"
			bind:value={$form.fullName}
			on:change={handleChange}
			error={$errors.fullName}
		/>
		<Input
			label="Email"
			required={true}
			placeholder="Enter your email"
			name="email"
			disabled={true}
			bind:value={$form.email}
			on:change={handleChange}
			error={$errors.email}
		/>
	</div>
	<div class="block">
		<Input
			label="VAT ID"
			name="vatid"
			placeholder="Enter your VAT ID"
			bind:value={$form.vat_id}
			on:change={handleChange}
			error={$errors.vat_id}
		/>
		<Input
			label="Tax ID"
			name="taxid"
			placeholder="Enter your Tax ID"
			bind:value={$form.tax_id}
			on:change={handleChange}
			error={$errors.tax_id}
		/>
	</div>
	<div class="block">
		<Input
			label="Country"
			name="country"
			placeholder="Enter your country"
			bind:value={$form.country}
			on:change={handleChange}
			error={$errors.country}
		/>
		<Input
			label="City"
			name="city"
			placeholder="Enter your city"
			bind:value={$form.city}
			on:change={handleChange}
			error={$errors.city}
		/>
	</div>
	<div class="block">
		<Input
			label="Street"
			name="street"
			placeholder="Enter your street"
			bind:value={$form.street}
			on:change={handleChange}
			error={$errors.street}
		/>
		<Input
			label="Zip Code"
			name="zipCode"
			placeholder="Enter your zipcode"
			bind:value={$form.zip_code}
			on:change={handleChange}
			error={$errors.zip_code}
		/>
	</div>
	<div class="btn">
		<Button>Save Changes</Button>
	</div>
</form>

<style>
	.btn{
		width:fit-content;
	}
	header h1 {
		font-size: 1.5rem;
		font-weight: 600;
	}
	form{
		display: flex;
		flex-direction: column;
		margin-top: 30px;
	}
	.block{
		display: flex;
		gap: 50px;
	}
</style>
