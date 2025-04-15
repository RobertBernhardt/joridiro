<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/InputComponents/Button.svelte';
	import Login from '$lib/Login/Login.svelte';
	import Register from '$lib/Register/Register.svelte';
	import { contest } from '$lib/stores/contests';
	import { modal } from '$lib/stores/modal';
	import { user } from '$lib/stores/user';
	import AnnouncementModal from './AnnouncementModal.svelte';
	import JoinContestModal from './JoinContestModal.svelte';
	import UpdateScoreModal from './UpdateScoreModal.svelte';

	$: isOrganizer = $user?._id === $contest.organizer;
	$: hasJoined = $user?.contests.includes($contest._id);
</script>

<div class="container">
	{#if isOrganizer}
		<div class="edit">
			<a href="{$page.params.id}/edit">
				<Button style="style4">
					<svg
						width="19"
						height="20"
						viewBox="0 0 19 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M13.6667 2.49993C13.8856 2.28106 14.1455 2.10744 14.4314 1.98899C14.7174 1.87054 15.0239 1.80957 15.3334 1.80957C15.6429 1.80957 15.9494 1.87054 16.2354 1.98899C16.5214 2.10744 16.7812 2.28106 17.0001 2.49993C17.219 2.7188 17.3926 2.97863 17.511 3.2646C17.6295 3.55057 17.6904 3.85706 17.6904 4.16659C17.6904 4.47612 17.6295 4.78262 17.511 5.06859C17.3926 5.35455 17.219 5.61439 17.0001 5.83326L5.75008 17.0833L1.16675 18.3333L2.41675 13.7499L13.6667 2.49993Z"
							stroke="var(--red2)"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					Edit Contest
				</Button>
			</a>
		</div>
		<div class="announcement">
			<button on:click={() => ($modal = AnnouncementModal)}
				><svg
					width="15"
					height="18"
					viewBox="0 0 15 18"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M13.3334 16.5L7.50008 12.3333L1.66675 16.5V3.16667C1.66675 2.72464 1.84234 2.30072 2.1549 1.98816C2.46746 1.67559 2.89139 1.5 3.33341 1.5H11.6667C12.1088 1.5 12.5327 1.67559 12.8453 1.98816C13.1578 2.30072 13.3334 2.72464 13.3334 3.16667V16.5Z"
						stroke="var(--gray1)"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				Add announcement</button
			>
		</div>
	{:else if !hasJoined}
		<Button
			onClick={() => ($user ? ($modal = JoinContestModal) : ($modal = Register))}
			style="style1">Join Contest</Button
		>
	{:else}
		<Button onClick={() => ($modal = UpdateScoreModal)} style="style1">Update my score</Button>
	{/if}
</div>

<style>
	.container {
		width: 100%;
		height: fit-content;
		display: flex;
		flex-direction: column;
		justify-content: center;
		z-index: 100;
	}
	.announcement {
		padding: 8px 16px;
	}
	.announcement button {
		width: 100%;
		padding: 12px 0;
		border: none;
		border-radius: 7px;
		font-size: 0.9rem;
		background-color: #fff;
		color: var(--gray1);
		border: 1px solid var(--gray2);
		font-weight: 600;
		cursor: pointer;
		justify-content: center;
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.edit {
		padding: 8px 16px;
	}
</style>
