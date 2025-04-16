<script>
	import { createForm } from 'svelte-forms-lib';
	import * as yup from 'yup';

	import Button from '$lib/InputComponents/Button.svelte';
	import Checkbox from '$lib/InputComponents/Checkbox.svelte';
	import Input from '$lib/InputComponents/Input.svelte';
	import { modal } from '$lib/stores/modal';
	import API from '../../utils/API';
	import { alert } from '$lib/Notifications/notifications';
	import { user } from '$lib/stores/user';
	import Verify from '$lib/Verify/verify.svelte';
	import { page } from '$app/stores';
	import ForgotPassword from './ForgotPassword.svelte';

	let isSubmitting = false;

	const { form, handleChange, errors, touched, handleSubmit } = createForm({
		initialValues: {
			email: '',
			password: ''
		},
		validationSchema: yup.object().shape({
			email: yup.string().email('Email is invalid').required('Email is required'),
			password: yup
				.string()
				.required('Password is required')
				.min(10, 'Password must be at least 10 characters')
				.max(50, 'Password must be at most 50 characters')
				.matches(/(?=.*[A-Z])/, 'Password must contain one uppercase letter')
				.matches(/(?=.*[a-z])/, 'Password must contain one lowercase letter')
				.matches(/(?=.*[0-9])/, 'Password must contain one number')
				.matches(/(?=.*[!@#$%_^&*])/, 'Password must contain one special character')
		}),
		onSubmit: async (values) => {
			isSubmitting = true;
			API.post('/user/login', values)
				.then(async (res) => {
					isSubmitting = false;
					const res2 = await API.post('/user/me', {});
					$user = res2.user;
					$modal = '';
					if (!$user.email_verified) {
						const sendOTP = await API.post('/user/sendOTP', {});
						$modal = Verify;
					}
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
</script>

<div class="register">
	<div on:click={() => ($modal = '')} on:keydown={() => ($modal = '')} class="close">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="feather feather-x"
		>
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	</div>
	<div class="header">
		<h1>Sign In to Joridiro</h1>
		<p>Welcome back to Joridiro, please enter your details</p>
	</div>
	<form on:submit={handleSubmit}>
		<Input
			label="Email"
			name="email"
			placeholder="Enter your email"
			required={true}
			type="email"
			onChange={handleChange}
			value={$form.email}
			error={$errors.email}
		/>
		<div class="password">
			<Input
				label="Password"
				name="password"
				onChange={handleChange}
				placeholder="Enter your password"
				required={true}
				type="password"
				value={$form.password}
				error={$errors.password}
			/>
			<a class="forgot" href="" on:click={() => ($modal = ForgotPassword)}>Forgot Password?</a>
		</div>
		<Button disabled={isSubmitting}>Log in</Button>
	</form>
</div>

<style>
	.register {
		width: 542px;
		height: fit-content;
		border: 1px solid var(--input_border);
		padding: 40px;
		border-radius: 7px;
		position: relative;
		background-color: #ffffff;
	}
	.forgot {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--red1);
		margin-bottom: 15px;
		text-align: right;
		position: absolute;
		top: 0;
		right: 0;
	}
	form {
		width: 100%;
		display: flex;
		flex-direction: column;
	}
	.header {
		margin-bottom: 25px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	h1 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 5px;
	}
	p {
		font-size: 1rem;
		font-weight: 400;
		color: var(--text_secondary);
	}
	.password {
		position: relative;
	}

	.close {
		position: absolute;
		top: 30px;
		right: 30px;
		cursor: pointer;
	}
</style>
