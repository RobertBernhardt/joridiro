<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/InputComponents/Button.svelte';
	import Input from '$lib/InputComponents/Input.svelte';
	import { alert as notifications } from '$lib/Notifications/notifications';
	import Tooltip from '$lib/Utility/Tooltip.svelte';
	import { contest } from '$lib/stores/contests';
	import { modal } from '$lib/stores/modal';
	import { user } from '$lib/stores/user';
	import API from '../../utils/API';
	import FaqModal from './FAQModal.svelte';

	let selected: number = -1;
	$: questions = $contest.faq;
	let faq = '';
	const handleSubmit = async () => {
		try {
			const res = await API.post(`/contest/${$page.params.id}/faq`, { question: faq });
			$contest = res.data;
			$notifications = {
				type: 'SUCCESS',
				message: 'Question has been submitted'
			};
		} catch (err: any) {
			$notifications = {
				type: 'ERROR',
				message: err.response.data.message
			};
		}
		faq = '';
	};
</script>

<section id="faqs" class="container">
	<div class="header">
		<div class="title">
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M17 12V3C17 2.73478 16.8946 2.48043 16.7071 2.29289C16.5196 2.10536 16.2652 2 16 2H3C2.73478 2 2.48043 2.10536 2.29289 2.29289C2.10536 2.48043 2 2.73478 2 3V17L6 13H16C16.2652 13 16.5196 12.8946 16.7071 12.7071C16.8946 12.5196 17 12.2652 17 12ZM21 6H19V15H6V17C6 17.2652 6.10536 17.5196 6.29289 17.7071C6.48043 17.8946 6.73478 18 7 18H18L22 22V7C22 6.73478 21.8946 6.48043 21.7071 6.29289C21.5196 6.10536 21.2652 6 21 6Z"
					fill="black"
				/>
			</svg>
			<p>Frequently Asked Questions</p>
		</div>
		<Tooltip
			tooltip="Something not clear yet for you? Ask the organizer open questions in this FAQ section"
		/>
	</div>

	<div class="steps">
		{#each questions as question, index}
			{#if question.answer}
				<div
					on:click={() => (selected != index ? (selected = index) : (selected = -1))}
					on:keydown={() => (selected = index)}
					class="step"
				>
					<div class="text">
						<div class="step_number {selected == index ? 'active' : ''}">
							<p>{index + 1}</p>
						</div>
						<div class="step_title">
							<p>{question.question}</p>
						</div>
					</div>
					<div class="icon">
						{#if selected != index}
							<svg
								width="40"
								height="40"
								viewBox="0 0 40 40"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M20.3333 19.1666V19.6666H20.8333H25.8333C25.9217 19.6666 26.0064 19.7017 26.069 19.7642C26.1315 19.8267 26.1666 19.9115 26.1666 19.9999C26.1666 20.0883 26.1315 20.1731 26.069 20.2356C26.0064 20.2981 25.9217 20.3333 25.8333 20.3333H20.8333H20.3333V20.8333V25.8333C20.3333 25.9217 20.2981 26.0064 20.2356 26.069C20.1731 26.1315 20.0883 26.1666 19.9999 26.1666C19.9115 26.1666 19.8267 26.1315 19.7642 26.069C19.7017 26.0064 19.6666 25.9217 19.6666 25.8333V20.8333V20.3333H19.1666H14.1666C14.0782 20.3333 13.9934 20.2981 13.9309 20.2356C13.8684 20.1731 13.8333 20.0883 13.8333 19.9999C13.8333 19.9115 13.8684 19.8267 13.9309 19.7642C13.9934 19.7017 14.0782 19.6666 14.1666 19.6666H19.1666H19.6666V19.1666V14.1666C19.6666 14.0782 19.7017 13.9934 19.7642 13.9309C19.8267 13.8684 19.9115 13.8333 19.9999 13.8333C20.0883 13.8333 20.1731 13.8684 20.2356 13.9309C20.2981 13.9934 20.3333 14.0782 20.3333 14.1666V19.1666Z"
									fill="black"
									stroke="black"
								/>
							</svg>
						{:else}
							<svg
								width="40"
								height="40"
								viewBox="0 0 40 40"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M14.1666 19.6667H25.8333C25.9217 19.6667 26.0064 19.7019 26.069 19.7644C26.1315 19.8269 26.1666 19.9117 26.1666 20.0001C26.1666 20.0885 26.1315 20.1733 26.069 20.2358C26.0064 20.2983 25.9217 20.3334 25.8333 20.3334H14.1666C14.0782 20.3334 13.9934 20.2983 13.9309 20.2358C13.8684 20.1733 13.8333 20.0885 13.8333 20.0001C13.8333 19.9117 13.8684 19.8269 13.9309 19.7644C13.9934 19.7019 14.0782 19.6667 14.1666 19.6667Z"
									fill="#EA3D09"
									stroke="#EA3D09"
								/>
							</svg>
						{/if}
					</div>
				</div>
				<div class="description {selected == index ? 'active' : ''}">
					{question.answer}
				</div>
			{/if}
		{/each}
	</div>
	<form on:submit|preventDefault={handleSubmit} class="input">
		<Input
			value={faq}
			onChange={(e) => (faq = e.target.value)}
			placeholder="Ask a question"
			type="text"
			name="faq"
		/>
		<div class="button">
			<Button type="submit">Submit</Button>
		</div>
	</form>
	{#if $user?._id === $contest.organizer}
		<div class="btn">
			<Button onClick={() => ($modal = FaqModal)}>Answer FAQs</Button>
		</div>
	{/if}
</section>

<style>
	.container {
		width: 100%;
		padding: 0 20px;
	}

	.header {
		display: flex;
		align-items: center;
		margin-bottom: 20px;
        gap: 10px;
	}
    .title{
        display: flex;
        align-items: center;
    }
	.header p {
		font-size: 1.3rem;
		font-weight: 600;
		margin-left: 10px;
	}

	.steps {
		display: flex;
		flex-direction: column;
	}
	.step {
		display: flex;
		padding: 20px 0;
		justify-content: space-between;
		cursor: pointer;
		border-top: 1px solid var(--gray2);
	}
	.text {
		display: flex;
	}
	.step_number {
		width: 40px;
		height: 40px;
		min-width: 40px;
		border-radius: 50%;
		background-color: var(--red4);
		color: var(--red1);
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20px;
	}
	.step_title {
		font-size: 1.1rem;
		font-weight: 600;
		transition: all 0.3s;
	}
	.description {
		height: 0px;
		overflow: hidden;
		transition: all 0.3s ease;
		opacity: 0;
	}
	.description.active {
		height: auto;
		margin-bottom: 20px;
		transition: all 0.3s;
		opacity: 1;
	}
	.step_number.active {
		background-color: var(--red1);
		color: #ffffff;
		transition: all 0.3s;
	}
	.input {
		gap: 20px;
		display: flex;
		height: fit-content;
	}
	.btn {
		width: fit-content;
		margin-left: auto;
		margin-right: auto;
	}
	@media only screen and (max-width: 768px) {
		.container {
			width: 100%;
			padding: 0;
		}
	}
</style>
