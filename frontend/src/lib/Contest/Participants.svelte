<script lang="ts">
	import { page } from '$app/stores';
	import { alert } from '$lib/Notifications/notifications';
	import { contest } from '$lib/stores/contests';
	import { modal, props } from '$lib/stores/modal';
	import { user } from '$lib/stores/user';
	import API from '../../utils/API';
	import PickAnotherWinner from './PickAnotherWinner.svelte';

	$: participants = $contest.participants;

	const calcScore = (participant: any) => {
		return participant.score.reduce((acc: any, cur: any) => {
			return acc + cur.points;
		}, 0);
	};
	let isOrganizer = false;
	if ($user) {
		isOrganizer = $user._id === $contest.organizer;
	}
	const getParticipantData = async () => {
		const participantIDArray = $contest.participants.map((participant: any) => participant._id);
		let promises: any = [];
		participantIDArray.forEach((participantID: any) => {
			promises.push(
				API.post(`/contest/participant/`, {
					ids: participantIDArray
				})
			);
		});
		const participantData: any = await Promise.all(promises);
		// Add the fullNames from the participant data to $contest.participants array and also inclue everything thats in there and do not change the order
		$contest.participants = participantData[0].data.map((participant: any) => {
			return {
				...$contest.participants.find((p: any) => p._id === participant._id),
				alias: participant.fullName
			};
		});
		// Sort based on score
		$contest.participants.sort((a: any, b: any) => calcScore(b) - calcScore(a));
	};
	if (isOrganizer) {
		getParticipantData();
	}

	// $contest.milestones is an array of objects where the object may have a property called participants_reached. Accumulate the first entry of the array with the index of the milestone reached. Participants reached is an array of ids. Also fetch the details of those ids from the $contest.participants
	$: milestoneWinner = $contest.milestones.map((milestone: any, index: number) => {
		if (milestone.participants_reached) {
			return {
				_id: milestone._id,
				index: index,
				prize: milestone.prize,
				type: 'MILESTONE',
				winner: milestone.winner,
				// Do this only with the first entry of the array. particpnat_reached[0]
				unconfirmedWinner: milestone.participants_reached.map((participantID: any) => {
					return $contest.participants.find(
						(participant: any) => participant._id === participantID
					);
				})
			};
		}
		return milestone;
	});
	$: grandPrizeWinner = [
		{
			_id: $contest._id,
			index: $contest.milestones.length,
			prize: $contest.grandPrize.amount,
			winner: $contest.grandPrize.winner,
			type: 'GRAND_PRIZE',
			unconfirmedWinner: $contest.grandPrize.participants_reached.map((participantID: any) => {
				return $contest.participants.find((participant: any) => participant._id === participantID);
			})
		}
	];
	// Combine the two arrays into one
	$: winners = [...milestoneWinner, ...grandPrizeWinner];

	const acceptWinner = async (
		type: 'MILESTONE' | 'GRAND_PRIZE' | 'LOTTERY',
		milestoneId: string,
		participantID: string
	) => {
		try {
			const res = await API.post(`/contest/${$page.params.id}/confirmWinner`, {
				winnerType: type,
				milestoneId,
				winner: participantID
			});
			// Add winner to the milestone object
			winners = winners.map((winner: any) => {
				if (winner._id === milestoneId) {
					return {
						...winner,
						winner: participantID
					};
				}
				return winner;
			});
			$alert = {
				type: res.type,
				message: res.message
			};
		} catch (err: any) {
			$alert = {
				type: err.response.data.type,
				message: err.response.data.message
			};
		}
	};
</script>

<section
	id="participants"
	class="container {$contest.type === 'SCORE' ? 'score_contest' : 'deadline'}"
>
	<div class="header">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M16 17.0001V19.0001H2V17.0001C2 17.0001 2 13.0001 9 13.0001C16 13.0001 16 17.0001 16 17.0001ZM12.5 7.50005C12.5 6.80782 12.2947 6.13113 11.9101 5.55556C11.5256 4.97998 10.9789 4.53138 10.3394 4.26647C9.69985 4.00157 8.99612 3.93226 8.31718 4.0673C7.63825 4.20235 7.01461 4.5357 6.52513 5.02518C6.03564 5.51466 5.7023 6.1383 5.56725 6.81724C5.4322 7.49617 5.50152 8.1999 5.76642 8.83944C6.03133 9.47899 6.47993 10.0256 7.0555 10.4102C7.63108 10.7948 8.30777 11.0001 9 11.0001C9.92826 11.0001 10.8185 10.6313 11.4749 9.97493C12.1313 9.31855 12.5 8.42831 12.5 7.50005ZM15.94 13.0001C16.5547 13.4758 17.0578 14.0805 17.4137 14.7716C17.7696 15.4626 17.9697 16.2233 18 17.0001V19.0001H22V17.0001C22 17.0001 22 13.3701 15.94 13.0001ZM15 4.00005C14.3117 3.99622 13.6385 4.20201 13.07 4.59005C13.6774 5.43879 14.0041 6.45634 14.0041 7.50005C14.0041 8.54377 13.6774 9.56132 13.07 10.4101C13.6385 10.7981 14.3117 11.0039 15 11.0001C15.9283 11.0001 16.8185 10.6313 17.4749 9.97493C18.1313 9.31855 18.5 8.42831 18.5 7.50005C18.5 6.57179 18.1313 5.68156 17.4749 5.02518C16.8185 4.3688 15.9283 4.00005 15 4.00005Z"
				fill="black"
			/>
		</svg>
		<p>Participants</p>
	</div>

	<div class="wrapper">
		{#if isOrganizer}
			<div class="participants">
				<p class="title">Winners</p>
				{#each winners as milestone, index}
					{#if milestone.unconfirmedWinner?.length > 0}
						<div class="participant">
							<div class="data">
								<div class="winnericon">
									{#if milestone.type === 'MILESTONE'}
										<svg
											width="22"
											height="22"
											viewBox="0 0 22 22"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												fill-rule="evenodd"
												clip-rule="evenodd"
												d="M18.9065 9.72151L16.3233 2.51647C16.239 2.27997 16.0291 2.1113 15.7816 2.07188C15.5332 2.03522 15.2811 2.13605 15.1271 2.33405C15.0739 2.40372 13.7732 4.01889 10.1908 3.80622C5.72207 3.54772 4.4259 6.1538 4.37365 6.26472C4.29573 6.42972 4.28657 6.61855 4.34798 6.79089L8.56832 18.5609H3.74023C3.36073 18.5609 3.05273 18.8689 3.05273 19.2484C3.05273 19.6279 3.36073 19.9359 3.74023 19.9359H14.9126C15.2921 19.9359 15.6001 19.6279 15.6001 19.2484C15.6001 18.8689 15.2921 18.5609 14.9126 18.5609H10.0286L8.33823 13.8447C8.7104 13.3515 9.88743 12.2148 12.6906 12.3826C17.0741 12.642 18.7443 10.4548 18.813 10.3604C18.9487 10.1771 18.9835 9.93692 18.9065 9.72151Z"
												fill="white"
											/>
										</svg>
									{:else}
										<svg
											width="22"
											height="22"
											viewBox="0 0 22 22"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											class="s-AOQzXdIqQVUN"
											><path
												d="M6.41683 14.6663H2.75016C2.50705 14.6663 2.27389 14.7629 2.10198 14.9348C1.93007 15.1067 1.8335 15.3399 1.8335 15.583V20.1663H7.3335V15.583C7.3335 15.3399 7.23692 15.1067 7.06501 14.9348C6.8931 14.7629 6.65994 14.6663 6.41683 14.6663ZM12.8335 9.16634H9.16683C8.92371 9.16634 8.69056 9.26292 8.51865 9.43483C8.34674 9.60673 8.25016 9.83989 8.25016 10.083V20.1663H13.7502V10.083C13.7502 9.83989 13.6536 9.60673 13.4817 9.43483C13.3098 9.26292 13.0766 9.16634 12.8335 9.16634ZM19.2502 11.9163H15.5835C15.3404 11.9163 15.1072 12.0129 14.9353 12.1848C14.7634 12.3567 14.6668 12.5899 14.6668 12.833V20.1663H20.1668V12.833C20.1668 12.5899 20.0703 12.3567 19.8983 12.1848C19.7264 12.0129 19.4933 11.9163 19.2502 11.9163ZM11.0002 1.83301L10.0835 3.66634L8.25016 3.93401L9.77825 5.19442L9.30066 7.33301L11.0002 6.11109L12.6997 7.33301L12.2221 5.19442L13.7502 3.93401L11.9168 3.66634L11.0002 1.83301Z"
												fill="white"
												class="s-AOQzXdIqQVUN"
											/></svg
										>
									{/if}
								</div>
								{#if milestone.winner}
									<p class="name">
										{participants.find((participant) => {
											return participant._id === milestone.winner;
										}).alias}
									</p>
								{:else}
									<p class="name">{milestone.unconfirmedWinner[0].alias}</p>
								{/if}
							</div>
							<div class="score_contact">
								<div class="score">
									<p class="price">{milestone.prize} €</p>
								</div>
								{#if !milestone.winner}
									<a href="/messages/{milestone.unconfirmedWinner[0]._id}">
										<button>Contact</button>
									</a>
									<button
										on:click={() =>
											acceptWinner(
												milestone.type,
												milestone._id,
												milestone.unconfirmedWinner[0]._id
											)}
										class="accept"
									>
										<svg
											width="20"
											height="20"
											viewBox="0 0 20 20"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M14.7622 6.36154L14.7634 6.36032C14.7944 6.32907 14.8312 6.30428 14.8718 6.28735C14.9125 6.27043 14.956 6.26172 15 6.26172C15.044 6.26172 15.0876 6.27043 15.1282 6.28735C15.1688 6.30428 15.2057 6.32907 15.2367 6.36032L15.5917 6.00822L15.2527 6.37572C15.2865 6.40693 15.3135 6.44482 15.332 6.48698C15.3504 6.52915 15.36 6.57469 15.36 6.62072C15.36 6.66675 15.3504 6.71228 15.332 6.75445C15.3135 6.79662 15.2865 6.8345 15.2527 6.86572L15.2453 6.87254L15.2382 6.87966L8.43815 13.6797L8.43815 13.6797L8.43671 13.6811C8.40572 13.7124 8.36885 13.7372 8.32823 13.7541C8.28761 13.771 8.24405 13.7797 8.20004 13.7797C8.15603 13.7797 8.11247 13.771 8.07185 13.7541C8.03123 13.7372 7.99436 13.7124 7.96337 13.6811L7.96338 13.6811L7.96193 13.6797L4.76193 10.4797L4.76198 10.4796L4.75576 10.4736C4.72255 10.4415 4.69598 10.4032 4.67758 10.3609C4.65917 10.3185 4.64929 10.273 4.64849 10.2268C4.64769 10.1806 4.65599 10.1348 4.67292 10.0918C4.68985 10.0488 4.71508 10.0096 4.74716 9.97644C4.77924 9.94323 4.81754 9.91666 4.85989 9.89826C4.90223 9.87985 4.94779 9.86997 4.99396 9.86917C5.04012 9.86837 5.086 9.87667 5.12895 9.8936C5.17076 9.91008 5.20901 9.93441 5.24164 9.96527L7.84592 12.5779L8.19971 12.9328L8.55383 12.5782L14.7622 6.36154Z"
												fill="black"
												stroke="white"
											/>
										</svg>
										Confirm
									</button>
									<button
										on:click={() => {
											($modal = PickAnotherWinner),
												($props = { type: milestone.type, data: milestone });
										}}
										class="reject"
									>
										<svg
											width="20"
											height="20"
											viewBox="0 0 20 20"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M15 5L5 15"
												stroke="white"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
											<path
												d="M5 5L15 15"
												stroke="white"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>

										Reject</button
									>
								{/if}
							</div>
						</div>
					{/if}
				{/each}
			</div>
		{/if}
		<div class="participants">
			{#each participants as participant, index}
				<div class="participant">
					<div class="data">
						<div class="index">
							{index < 9 ? '0' : ''}{index + 1}
						</div>
						<p class="name">{participant.alias}</p>
					</div>
					<div class="score_contact">
						<div class="score">
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M5.4537 10.8792C5.0537 10.8125 4.6537 10.7208 4.2537 10.6125C3.79537 10.4792 3.3537 10.2875 2.9287 9.99583C2.8537 9.9375 2.77037 9.87917 2.67037 9.8125C2.67037 9.8625 2.6787 11.3792 2.67037 12.0958C2.66204 12.4375 2.77037 12.6875 2.96204 12.8958C3.1787 13.1292 3.43704 13.2958 3.7037 13.4292C4.17037 13.6625 4.66204 13.8125 5.17037 13.9125C5.64537 14.0042 6.12037 14.0625 6.6037 14.0792C6.8787 14.0875 7.1537 14.0875 7.4287 14.0708V13.9375L7.42037 12.6708V12.6208C7.42037 12.5125 7.4287 12.3792 7.42037 12.2375C7.4287 12.0042 7.4287 11.7375 7.4287 11.4792V10.9792C7.24537 10.9958 7.0537 10.9958 6.87037 10.9958C6.39537 10.9958 5.92037 10.9625 5.4537 10.8792Z"
									fill={$contest.type === 'SCORE' ? 'var(--purple1)' : 'var(--green1)'}
								/>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M5.61159 6.6625C5.10326 6.5875 4.60326 6.47917 4.10326 6.3125C3.71159 6.1875 3.32826 6.02083 2.96992 5.77917C2.87826 5.7125 2.77826 5.6375 2.66992 5.5625C2.66992 5.6125 2.67826 7.14583 2.66992 7.87917C2.66992 8.15417 2.74492 8.37913 2.89492 8.5708C3.12826 8.85413 3.40326 9.02913 3.69492 9.17913C4.11992 9.40413 4.56159 9.53747 5.01159 9.63747C5.44492 9.73747 5.88659 9.80413 6.33659 9.82913C6.70326 9.85413 7.06992 9.86247 7.42826 9.8458L7.41992 7.95417L7.44492 7.97083C7.40326 7.62083 7.45326 7.17917 7.71992 6.72083C7.01992 6.77917 6.31159 6.75417 5.61159 6.6625Z"
									fill={$contest.type === 'SCORE' ? 'var(--purple1)' : 'var(--green1)'}
								/>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M2.95063 4.40309C3.1998 4.68476 3.49563 4.85892 3.8023 5.00476C4.3548 5.26726 4.9298 5.41142 5.51313 5.50476C6.0048 5.58309 6.4998 5.62309 6.89813 5.61559C7.82897 5.61726 8.65401 5.52476 9.46651 5.28226C9.87151 5.16142 10.2665 5.00392 10.6373 4.75559C10.8407 4.61892 11.0307 4.45892 11.1773 4.22642C11.3723 3.91809 11.3748 3.55892 11.1773 3.25476C11.1098 3.15059 11.0315 3.05476 10.9473 2.97309C10.6323 2.66809 10.269 2.49059 9.89568 2.34392C9.23151 2.08309 8.54818 1.95559 7.8573 1.89726C6.91563 1.81809 5.97647 1.85809 5.04397 2.06392C4.5373 2.17476 4.04063 2.33059 3.56813 2.59476C3.31563 2.73559 3.0748 2.90309 2.88147 3.16142C2.72063 3.37642 2.62647 3.62142 2.69397 3.92809C2.7373 4.12309 2.8348 4.27226 2.95063 4.40309Z"
									fill={$contest.type === 'SCORE' ? 'var(--purple1)' : 'var(--green1)'}
								/>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M17.3298 13.8477C17.2948 13.8743 17.2764 13.8893 17.2573 13.901C17.0539 14.0318 16.8557 14.1785 16.6448 14.2885C15.9007 14.6793 15.1182 14.8618 14.3223 14.9685C13.8398 15.0335 13.3565 15.0543 12.8715 15.0502C12.3965 15.0468 11.9232 15.0177 11.454 14.9352C11.0548 14.8643 10.6565 14.7718 10.2615 14.6635C9.80066 14.5352 9.354 14.3427 8.9365 14.051C8.854 13.9927 8.7715 13.9318 8.6765 13.8635C8.6765 13.9135 8.684 15.4302 8.674 16.1535C8.669 16.4893 8.77566 16.7377 8.96483 16.946C9.184 17.1877 9.43816 17.3485 9.704 17.4827C10.1782 17.7202 10.6698 17.8627 11.1707 17.9652C11.6465 18.0618 12.124 18.116 12.604 18.1335C13.4315 18.1635 14.2548 18.1068 15.0707 17.9143C15.5398 17.8035 15.9998 17.6543 16.4373 17.4077C16.6873 17.2668 16.9247 17.1002 17.1182 16.846C17.2598 16.6602 17.334 16.4443 17.3315 16.1777C17.3265 15.4402 17.3298 13.901 17.3298 13.8477Z"
									fill={$contest.type === 'SCORE' ? 'var(--purple1)' : 'var(--green1)'}
								/>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M8.90139 12.6255C9.12805 12.9097 9.40555 13.0872 9.69555 13.2364C10.1206 13.4547 10.5622 13.5922 11.0122 13.6947C11.4514 13.7955 11.8939 13.8572 12.3389 13.8864C13.1989 13.9422 14.0547 13.8964 14.9056 13.7155C15.4231 13.6047 15.9314 13.4489 16.4147 13.1814C16.6731 13.0389 16.9197 12.868 17.1197 12.6055C17.2589 12.4222 17.3331 12.2097 17.3314 11.9447C17.3256 11.2022 17.3264 9.65802 17.3247 9.62052C17.2264 9.69052 17.1397 9.75802 17.0489 9.81802C16.3481 10.288 15.5881 10.5039 14.8131 10.643C14.4522 10.708 14.0881 10.7464 13.7239 10.7772C13.0197 10.8364 12.3164 10.8089 11.6147 10.7147C11.1072 10.6464 10.6039 10.5372 10.1097 10.3705C9.71722 10.2397 9.33555 10.0764 8.97639 9.83219C8.87972 9.76552 8.78472 9.69469 8.67639 9.61719C8.67639 9.66635 8.68055 11.1997 8.67389 11.9314C8.67139 12.2122 8.74972 12.4355 8.90139 12.6255Z"
									fill={$contest.type === 'SCORE' ? 'var(--purple1)' : 'var(--green1)'}
								/>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M9.57154 6.64984C9.31904 6.79067 9.07904 6.95817 8.88571 7.21651C8.72488 7.43067 8.62988 7.67567 8.69821 7.98317C8.74071 8.17734 8.83904 8.32734 8.95404 8.45817C9.20321 8.73901 9.49904 8.91401 9.80571 9.05984C10.359 9.32234 10.934 9.46651 11.5165 9.55984C12.009 9.63817 12.5032 9.67817 12.9015 9.67067C13.8324 9.67234 14.6574 9.57901 15.4699 9.33734C15.8749 9.21651 16.2707 9.05817 16.6407 8.80984C16.844 8.67401 17.0349 8.51401 17.1815 8.28151C17.3757 7.97234 17.379 7.61401 17.1815 7.30984C17.1132 7.20567 17.0349 7.10984 16.9507 7.02817C16.6357 6.72234 16.2724 6.54484 15.899 6.39901C15.2349 6.13817 14.5515 6.00984 13.8615 5.95234C12.919 5.87234 11.9799 5.91317 11.0474 6.11817C10.5415 6.22984 10.044 6.38567 9.57154 6.64984Z"
									fill={$contest.type === 'SCORE' ? 'var(--purple1)' : 'var(--green1)'}
								/>
							</svg>
							<p class="currentscore">
								{calcScore(participant)}
								{calcScore(participant) != 1 ? 'points' : 'point'}
							</p>
						</div>
						{#if isOrganizer}
							<a href="/messages/{participant._id}">
								<button>Contact</button>
							</a>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
	{#if $contest.participants.length > 10}
		<div class="load">
			<button class="load">Load More</button>
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
	}
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.score_contest .winnericon {
		background-color: var(--purple1);
	}
	.winnericon {
		width: 40px;
		height: 40px;
		background-color: var(--green1);
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.header p {
		font-size: 1.3rem;
		font-weight: 600;
		margin-left: 10px;
	}
	.participants {
		display: flex;
		flex-direction: column;
		background-color: var(--green2);
		border-radius: 7px;
		padding: 8px;
		gap: 10px;
	}
	.score_contest .participants {
		background-color: var(--purple3);
	}
	.participant {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: white;
		padding: 15px 16px;
		border-radius: 7px;
	}
	.price {
		font-size: 1.3rem;
		font-weight: 600;
		color: var(--green1);
	}
	.data {
		display: flex;
		align-items: center;
		font-weight: 600;
		gap: 20px;
	}
	.index {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--gray1);
		background-color: var(--gray4);
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.participant:nth-child(1) .score svg {
		fill: var(--green1);
	}
	.participant:nth-child(1) .index {
		background-color: var(--green1);
		color: var(--green2);
	}
	.score_contest .participant:nth-child(1) .index {
		background-color: var(--purple1);
		color: var(--purple4);
	}
	.participant:nth-child(1) .currentscore {
		color: var(--green1);
	}
	.score_contest .participant:nth-child(1) .currentscore {
		color: var(--purple1);
	}
	.score_contact {
		display: flex;
		align-items: center;
	}
	.score {
		display: flex;
		align-items: center;
		margin-right: 10px;
	}
	.score svg {
		margin-right: 10px;
	}
	.currentscore {
		font-size: 1.3rem;
		font-weight: 600;
	}
	.totalscore {
		font-weight: 500;
		opacity: 0.8;
		align-self: flex-end;
		margin-left: 5px;
	}
	.title {
		font-size: 0.9rem;
		font-weight: 600;
		margin-right: 10px;
		margin-left: 5px;
	}
	button {
		border: none;
		border-radius: 7px;
		padding: 8px 16px;
		font-weight: 600;
		font-size: 0.9rem;
		background-color: white;
		border: 1px solid var(--input_border);
		margin-left: 20px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 5px;
	}
	.load {
		display: flex;
		justify-content: center;
		margin-top: 10px;
	}
	.accept {
		background-color: var(--green1);
		color: var(--green2);
	}
	.reject {
		background-color: var(--red1);
		color: white;
	}

	@media only screen and (max-width: 1000px) {
		.container {
			padding: 0;
		}
		.participant {
			align-items: unset;
			flex-direction: column;
			gap: 20px;
		}
		.score_contact {
			align-items: unset;
			flex-direction: column;
			gap: 20px;
		}
		button {
			justify-content: center;
			margin-left: 0;
		}
	}
</style>
