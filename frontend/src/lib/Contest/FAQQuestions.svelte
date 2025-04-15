<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/InputComponents/Button.svelte';
	import Input from '$lib/InputComponents/Input.svelte';
	import { contest } from '$lib/stores/contests';
	import API from '../../utils/API';

	export let faq: any
    let answer = faq.answer
	export let answeringQuestion = false;


	const handleSubmit = () => {
		API.post(`contest/${$page.params.id}/${faq._id}/answerfaq`, {
			answer: answer,
		})
		.then((res) => {
			$contest = res.data
			answeringQuestion = false
		})
		.catch((err) => {
			console.log(err);
		});
	}

	const handleDelete = async () => {
		const res = await API.post(`contest/${$page.params.id}/${faq._id}/deletefaq`,{})
		$contest = res.data
	}
	$: console.log(handleSubmit)
</script>

<div class="wrapper {answeringQuestion ? 'answerblock' : ''}">
	<div class="question">
		<div class="logo">
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M17 12V3C17 2.73478 16.8946 2.48043 16.7071 2.29289C16.5196 2.10536 16.2652 2 16 2H3C2.73478 2 2.48043 2.10536 2.29289 2.29289C2.10536 2.48043 2 2.73478 2 3V17L6 13H16C16.2652 13 16.5196 12.8946 16.7071 12.7071C16.8946 12.5196 17 12.2652 17 12ZM21 6H19V15H6V17C6 17.2652 6.10536 17.5196 6.29289 17.7071C6.48043 17.8946 6.73478 18 7 18H18L22 22V7C22 6.73478 21.8946 6.48043 21.7071 6.29289C21.5196 6.10536 21.2652 6 21 6Z"
					fill="#EA3D09"
				/>
			</svg>
		</div>
		<div class="question_text">
			<p>{faq.question}</p>
			<p class="answer">{faq.answer}</p>
		</div>
		<div class="answer">
		</div>
	</div>
    {#if !answeringQuestion && faq.answer == ''}
        <div class="btn_grp">
            <Button onClick={()=>(answeringQuestion = true)} style="style5">Answer</Button>
            <Button onClick={handleDelete} style="style4">Reject</Button>
        </div>
    {/if}
	{#if faq.answer != ''}
		<div class="btn_grp">
			<svg on:click={()=>(answeringQuestion = true)} on:keydown={()=>(answeringQuestion = true)} width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g clip-path="url(#clip0_1579_101896)">
				<path d="M14.166 6.49993C14.3849 6.28106 14.6447 6.10744 14.9307 5.98899C15.2167 5.87054 15.5232 5.80957 15.8327 5.80957C16.1422 5.80957 16.4487 5.87054 16.7347 5.98899C17.0206 6.10744 17.2805 6.28106 17.4993 6.49993C17.7182 6.7188 17.8918 6.97863 18.0103 7.2646C18.1287 7.55057 18.1897 7.85706 18.1897 8.16659C18.1897 8.47612 18.1287 8.78262 18.0103 9.06859C17.8918 9.35455 17.7182 9.61439 17.4993 9.83326L6.24935 21.0833L1.66602 22.3333L2.91602 17.7499L14.166 6.49993Z" stroke="#6A7584" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</g>
				<defs>
				<clipPath id="clip0_1579_101896">
				<rect width="20" height="20" fill="white" transform="translate(0 4)"/>
				</clipPath>
				</defs>
			</svg>
		</div>
	{/if}
</div>

{#if answeringQuestion}
	<div class="input {answeringQuestion ? 'answerblock' : ''}">
		<Input
			value={answer}
			label="Answer"
			required={true}
			placeholder="Enter your answer"
			onChange={(e) => (answer = e.target.value)}
		/>
		<div class="button_group">
			<div class="btn">
				<Button onClick={handleSubmit} style="style1" type="button">Save</Button>
				<Button onClick={()=>(answeringQuestion = false)} style="style3" type="button">Cancel</Button>
			</div>
			<div class="last_btn">
				<Button onClick={handleDelete} style="style4" type="button">Delete</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: flex;
		margin-top: 30px;
	}
    .answerblock{
        background-color: var(--gray4);
        padding: 20px;
    }
	.question_text {
		font-weight: 600;
	}
	.question{
		display: flex;
		gap: 10px;
		width: 100%;
	}
	.answer{
		font-weight: 400;
	}
	.btn_grp {
		display: flex;
		height: fit-content;
		gap: 10px;
		margin-left: auto;
	}
    .button_group{
        display: flex;
        gap: 10px;
        width: fit-content;
        width: 100%;
    }
    .btn{
        display: flex;
        width: fit-content;
        gap: 10px;
    }
    .last_btn{
        margin-left: auto;
    }
</style>
