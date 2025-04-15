<script lang="ts">
	import { createForm } from 'svelte-forms-lib';
	import * as yup from 'yup';
	import { alert } from '$lib/Notifications/notifications';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Input from '$lib/InputComponents/Input.svelte';
	import { page } from '$app/stores';
	import API from '../../../utils/API';
	import { modal } from '$lib/stores/modal';
	import Button from '$lib/InputComponents/Button.svelte';
    let linkSent = false;
    
	let isSubmitting = false;
	const { form, handleChange, errors, touched, handleSubmit } = createForm({
		initialValues: {
			password: '',
            confirmPassword: ''
		},
		validationSchema: yup.object().shape({
            password: yup
            .string()
				.required('Password is required')
				.min(10, 'Password must be at least 10 characters')
				.max(50, 'Password must be at most 50 characters')
				.matches(/(?=.*[A-Z])/, 'Password must contain one uppercase letter')
				.matches(/(?=.*[a-z])/, 'Password must contain one lowercase letter')
				.matches(/(?=.*[0-9])/, 'Password must contain one number')
				.matches(/(?=.*[!@#$%_^&*])/, 'Password must contain one special character'),
			confirmPassword: yup
				.string()
				.required('Confirm password is required')
				.oneOf([yup.ref('password'), null], 'Passwords must match'),
		}),
		onSubmit: async (values) => {
			isSubmitting = true;
			API.post(`/user/resetPassword/${$page.params.id}`, values)
				.then(async (res) => {
					isSubmitting = false;
					$modal = '';
                    goto('../../');
					$alert = {
						type: res.type,
						message: res.message
					};
				})
				.catch((err) => {
					isSubmitting = false;
					$alert = {
						type: err.response ? err.response.data.type : 'ERROR',
						message: err.response ? err.response.data.message : 'Something went wrong'
					};
				});
		}
	});
	$: console.log($touched);
</script>


<form on:submit={handleSubmit} class="wrapper">
    <div class="title">
        <h1>Change Password</h1>
    </div>
	<Input
		name="password"
		value={$form.password}
		error={$errors.password}
		label="Password"
		onChange={handleChange}
		placeholder="Enter your password"
		type="password"
	/>

    <Input
		name="confirmPassword"
		value={$form.confirmPassword}
		error={$errors.confirmPassword}
		label="Confirm Password"
		onChange={handleChange}
		placeholder="Confirm your password"
		type="password"
	/>
	<Button type="submit" disabled={isSubmitting}>Change Password</Button>
</form>

<style>
    h1{
        font-size: 1.8rem;
        font-weight: 600;
        color: var(--primary);
        margin-bottom: 20px;
    }
	form{
		position: relative;
        max-width: 600px;
        margin-top: 10vh;
        margin-left: auto;
        margin-right: auto;
        padding: 20px;
	}
	.wrapper {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: 10px;
	}
	button {
		color: #ffffff;
		font-size: 14px;
		padding: 12px 25px;
		display: flex;
		border: 2px solid var(--primary);
		background-color: var(--primary);
		justify-content: center;
		align-items: center;
		border-radius: 7px;
		cursor: pointer;
		transition: all 0.3s ease-in-out;
		font-weight: 500;
	}
	button:hover {
		background-color: transparent !important;
		color: black;
		transition: all 0.3s ease-in-out;
	}
	button:active {
		transform: scale(0.95);
		transition: all 0.3s ease-in-out;
	}
	button:disabled {
		background-color: #e0e0e0;
		color: #9e9e9e;
		cursor: not-allowed;
	}
</style>