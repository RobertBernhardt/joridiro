<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/InputComponents/Button.svelte';
	import Input from '$lib/InputComponents/Input.svelte';
	import { modal } from '$lib/stores/modal';
	import { onMount } from 'svelte';
	import API from '../../utils/API';
	import { createForm } from 'svelte-forms-lib';
    import * as yup from 'yup';
	import { alert as notifications } from '$lib/Notifications/notifications';
	import { contest } from '$lib/stores/contests';
	import AnnouncementBlock from './AnnouncementBlock.svelte';
	import FaqQuestions from './FAQQuestions.svelte';
	

	const {form, handleChange, errors, touched, handleSubmit, isValid, updateField ,validateField, updateInitialValues} = createForm({
        initialValues: {
            announcement: ''
        },
        validationSchema: yup.object().shape({
            announcement: yup.string().required('Announcement is required')
        }),
        onSubmit: async (values) => {
			try{
				let res = await API.post(`/contest/${$page.params.id}/announce`, {announcement: values.announcement})
				$contest = res.data
			} catch(err: any){
				$notifications = {
					type: 'ERROR',
					message: err.response.data.message
				}
			}
        }
    });
</script>

<div class="container">
	<div class="header">
		<h1>FAQs</h1>
		<svg on:click={()=>$modal=''} on:keydown={()=>$modal=''} width="25" height="25" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M30 10L10 30M10 10L30 30"
				stroke="#6A7584"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</div>
	<div class="questions">
	{#each $contest.faq as faq}
		<FaqQuestions
			faq = {faq}
		/>
	{/each}
</div>
</div>


<style>
	.questions{
		margin-top: -30px;
	}
	.container {
		width: 100%;
		max-width: 700px;
		height: fit-content;
		border: 2px solid var(--gray3);
		padding: 40px;
		border-radius: 7px;
		position: relative;
		background-color: #ffffff;
	}
    .header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
    }
	h1 {
		font-size: 1.4rem;
		font-weight: 600;
		margin-bottom: 20px;
	}
    .header svg{
        cursor: pointer;
    }
	.inputField{
		background-color: var(--gray4);
		padding: 24px;
		border-radius: 7px;
	}
    
	@media only screen and (max-width: 1000px) {
		.container{
			padding: 20px 10px;
		}
	}
</style>
