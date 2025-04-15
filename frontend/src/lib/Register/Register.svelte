<script>
    import { createForm } from 'svelte-forms-lib';
	import * as yup from 'yup';
	import Button from "$lib/InputComponents/Button.svelte";
    import Checkbox from "$lib/InputComponents/Checkbox.svelte";
	import Input from "$lib/InputComponents/Input.svelte";
	import { modal } from '$lib/stores/modal';
	import API from '../../utils/API';
	import { alert } from '$lib/Notifications/notifications';
	import Login from '$lib/Login/Login.svelte';

    let isSubmitting = false

    const {form, handleChange, errors, touched, handleSubmit} = createForm({
        initialValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            terms: true
        },
        validationSchema: yup.object().shape({
            fullName: yup.string().required('Full name is required'),
            email: yup.string().email('Email is invalid').required('Email is required'),
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
                terms: yup
                    .boolean()
                    .oneOf([true], 'You must accept the terms and conditions')
        }),
        onSubmit: async (values) => {
            isSubmitting = true
            API.post('/user/register', values)
                .then((res) => {
                    isSubmitting = false
                    $alert = {
                        type: res.type,
                        message: res.message
                    }
                    $modal = Login
                })
                .catch((err) => {
                    isSubmitting = false
                    $alert = {
                        type: err.response ? err.response.data.type : 'ERROR',
                        message: err.response ? err.response.data.message : 'Something went wrong'
                    }
                })
                
        }
    })
</script>

<div class="register">
    <div on:click={()=>$modal = ''} on:keydown={()=>$modal = ''} class="close">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
    </div>
    <div class="header">
        <h1>Sign Up to Joridiro</h1>
        <p>Welcome to Joridiro, please enter your details</p>
    </div>
    <form on:submit={handleSubmit}>
        <Input
            label="Full Name"
            name="fullName"
            placeholder="Enter your full name"
            required = {true}
            onChange={handleChange}
            type="text"
            value={$form.fullName}
            error={$errors.fullName}
        />
        <Input
            label="Email"
            name="email"
            placeholder="Enter your email"
            required = {true}
            type="email"
            onChange={handleChange}
            value={$form.email}
            error={$errors.email}
        />
        <Input
            label="Password"
            name="password"
            onChange={handleChange}
            placeholder="Enter your password"
            required = {true}
            type="password"
            value={$form.password}
            error={$errors.password}
        />
        <Input
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Confirm your password"
            onChange={handleChange}
            required = {true}
            type="password"
            value={$form.confirmPassword}
            error={$errors.confirmPassword}
        />
        <Checkbox name='terms' error={$errors.terms != ''} value={$form.terms} onChange={handleChange} text="I agree to the Terms & Conditions of Joridiro" />
        <div class="seperator"></div>
        <Button disabled={isSubmitting}>
            Register
        </Button>
    </form>
</div>

<style>
    .register{
        width: 542px;
        height: fit-content;
        border: 2px solid var(--gray3);
        padding: 40px;
        border-radius: 7px;
        position: relative;
        background-color: #ffffff;
    }
    form{
        width: 100%;
        display: flex;
        flex-direction: column;
    }
    .header{
        margin-bottom: 25px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    h1{
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 5px;
    }
    p{
        font-size: 1rem;
        font-weight: 400;
        color: var(--text_secondary);
    }
    .seperator{
        width: 100%;
        height: 1px;
        margin: 15px 0;
    }
    .close{
        position: absolute;
        top: 30px;
        right: 30px;
        cursor: pointer;
    }
    @media only screen and (max-width: 700px) {
        .register{
            border: none;
            border-radius: 0;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        .close{
            top: 25px;
        }
    }
</style>