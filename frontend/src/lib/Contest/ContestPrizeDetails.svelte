<script lang="ts">
	import { contest } from '$lib/stores/contests';
	import { calcScore } from '../../utils/getTotalScore';
	import contestTypes from '../../utils/contstTypes';
	import { DateSchema } from 'yup';

	export let milestones: any[] = [];
	export let startDate: Date = new Date();
	export let endDate: Date = new Date();
	export let type: string = '';
	export let lottery: any = {};
	export let grandPrize: any = {};
	export let size: string = 'SMALL';

	$: bestResult = $contest.participants.length > 0 ? calcScore($contest.participants[0]) : 0;
	const target = contestTypes.get(size).max_score;

	let firstUnreachedMilestoneIndex: number = 0;
	let events: any = [];
	milestones.forEach((milestone, index) => {
		if (type === 'DEADLINE') {
			events.push({
				name: `Milestone ${index + 1}`,
				date: new Date(milestone.date),
				prize: milestone.prize,
				type: 'MILESTONE',
				reached: new Date() > new Date(startDate.getTime() + milestone.days * 24 * 60 * 60 * 1000)
			});
		} else {
			events.push({
				name: `Milestone ${index + 1}`,
				target: milestone.points,
				prize: milestone.prize,
				type: 'MILESTONE',
				reached: bestResult >= milestone.points
			});
		}
	});
	if (lottery && lottery.amount) {
		if (type === 'DEADLINE') {
			events.push({
				name: 'Lottery',
				date: endDate,
				prize: lottery.amount,
				type: 'LOTTERY',
				reached: new Date() > new Date(startDate.getTime() + lottery.days * 24 * 60 * 60 * 1000)
			});
		} else {
			events.push({
				name: 'Lottery',
				date: endDate,
				target: target,
				prize: lottery.amount,
				type: 'LOTTERY',
				reached: bestResult >= target
			});
		}
	}
	if (type === 'DEADLINE') {
		events.push({
			name: 'Grand Prize',
			date: endDate,
			prize: grandPrize.amount,
			type: 'END',
			reached: new Date() > endDate
		});
	} else {
		events.push({
			name: 'Grand Prize',
			date: endDate,
			target: target,
			prize: grandPrize.amount,
			type: 'END',
			reached: bestResult >= target
		});
	}

	// Calculate the first firstUnreachedMilestoneIndex milestone
	for (let i = 0; i < events.length; i++) {
		if (!events[i].reached) {
			firstUnreachedMilestoneIndex = i;
			break;
		}
	}

	// Display a countdown to the first unreached milestone in the format of "X days Y hours Z minutes" and update it every minute
	let countdown: string = '';
	if (type === 'DEADLINE') {
		setInterval(() => {
			const now = new Date();
			const timeLeft = events[firstUnreachedMilestoneIndex].date.getTime() - now.getTime();
			const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
			const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
			// Show seconds only if the countdown is less than 1 minute
			if(minutes > 0) {
				countdown = `${days} days ${hours} hours ${minutes} minutes`;
			} else {
				countdown = `${seconds} seconds`;
			}
			// Make it NaN if the countdown is over
			if(seconds < 0) {
				countdown = 'NaN';
			}

			if (timeLeft < 0) {
				events[firstUnreachedMilestoneIndex].reached = true;
				if (firstUnreachedMilestoneIndex < events.length - 1) {
					firstUnreachedMilestoneIndex++;
				}
			}
		}, 1000);
	} else {
		// Set firstUnreachedMilestoneIndex based on bestResult and max_score
		for (let i = 0; i < events.length; i++) {
			if (events[i].type === 'MILESTONE' && bestResult < events[i].target) {
				firstUnreachedMilestoneIndex = i;
				break;
			}
		}
	}
</script>

<section id="status" class="wrapper {type == 'DEADLINE' ? 'deadline' : 'score'}">
	{#each events as event, i}
		<div class="container {event.reached ? 'reached' : ''}">
			<div class="card">
				<div class="block">
					<div class="logo">
						{#if event.reached}
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M0.410156 13.41L6.00016 19L7.41016 17.58L1.83016 12M22.2402 5.58002L11.6602 16.17L7.50016 12L6.07016 13.41L11.6602 19L23.6602 7.00002M18.0002 7.00002L16.5902 5.58002L10.2402 11.93L11.6602 13.34L18.0002 7.00002Z"
									fill={type == 'DEADLINE' ? 'var(--green1)' : 'var(--purple1)'}
								/>
							</svg>
						{:else if event.type == 'MILESTONE'}
							<div class="milestonelogo">
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
										d="M18.9068 9.72053L16.3236 2.51549C16.2393 2.27899 16.0293 2.11033 15.7818 2.07091C15.5334 2.03424 15.2813 2.13508 15.1273 2.33308C15.0742 2.40274 13.7734 4.01791 10.1911 3.80524C5.72231 3.54674 4.42615 6.15283 4.3739 6.26374C4.29598 6.42874 4.28681 6.61758 4.34823 6.78991L8.56856 18.5599H3.74048C3.36098 18.5599 3.05298 18.8679 3.05298 19.2474C3.05298 19.6269 3.36098 19.9349 3.74048 19.9349H14.9128C15.2923 19.9349 15.6003 19.6269 15.6003 19.2474C15.6003 18.8679 15.2923 18.5599 14.9128 18.5599H10.0288L8.33848 13.8437C8.71064 13.3505 9.88767 12.2139 12.6908 12.3816C17.0743 12.641 18.7445 10.4539 18.8133 10.3594C18.9489 10.1761 18.9838 9.93595 18.9068 9.72053Z"
										fill="white"
									/>
								</svg>
							</div>
						{:else if event.type == 'LOTTERY'}
							<svg
								width="39"
								height="40"
								viewBox="0 0 39 40"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M19.5 40.0001C30.2696 40.0001 39 31.0458 39 20.0001C39 8.95438 30.2696 0 19.5 0C8.73045 0 0 8.95438 0 20.0001C0 31.0458 8.73045 40.0001 19.5 40.0001Z"
									fill="#EA3D09"
								/>
								<path
									d="M19.5001 6.69263C12.3436 6.69263 6.62402 12.6653 6.62402 20.0003C6.62402 27.3365 12.3436 33.309 19.5001 33.309C26.5616 33.309 32.3762 27.3415 32.3762 20.0003C32.3763 19.9659 32.3731 19.9315 32.3665 19.8977C32.3116 12.6102 26.6225 6.69141 19.5001 6.69141V6.69263ZM17.0053 7.98764V10.9465C16.3303 11.1404 15.6792 11.4134 15.0651 11.7602L13.0395 9.68396C14.2482 8.8727 15.5928 8.29755 17.0053 7.98764ZM21.9949 7.98764C23.4075 8.29755 24.752 8.8727 25.9607 9.68396L23.9571 11.739C23.3382 11.3825 22.6793 11.1045 21.9949 10.9114V7.98764ZM19.5001 11.6064C19.5034 11.6064 19.5066 11.6064 19.5099 11.6064C24.018 11.5102 27.684 15.364 27.684 20.0003C27.6842 21.1026 27.4726 22.1941 27.0614 23.2126C26.6502 24.231 26.0473 25.1563 25.2874 25.9358C24.5274 26.7153 23.6251 27.3336 22.6322 27.7554C21.6392 28.1772 20.5749 28.3941 19.5001 28.394C18.4253 28.3941 17.3611 28.1772 16.3681 27.7554C15.3751 27.3336 14.4728 26.7153 13.7129 25.9358C12.9529 25.1563 12.3501 24.231 11.9388 23.2126C11.5276 22.1941 11.3161 21.1026 11.3162 20.0003C11.3161 18.8979 11.5276 17.8063 11.9388 16.7878C12.3501 15.7694 12.9529 14.8441 13.7129 14.0646C14.4728 13.2851 15.3751 12.6668 16.3681 12.245C17.3611 11.8232 18.4253 11.6063 19.5001 11.6064ZM9.50393 13.354L11.4661 15.4515C11.1284 16.0814 10.8626 16.749 10.6739 17.4414H7.88055C8.17562 15.9896 8.72481 14.6049 9.50149 13.354H9.50393ZM29.4951 13.354C30.2727 14.6047 30.8227 15.9894 31.1185 17.4414H28.291C28.1063 16.7556 27.8476 16.0932 27.5195 15.4664L29.4939 13.354H29.4951ZM18.9017 14.2677V14.9839C17.8048 15.1889 17.204 16.1101 17.204 17.4414C17.204 20.3076 20.2996 20.5127 20.2996 22.5602C20.2996 23.2765 19.9986 23.584 19.5001 23.584C19.0004 23.584 18.7006 23.2765 18.7006 22.559V21.7402H17.204V22.4577C17.204 23.8915 17.8036 24.7101 18.9017 24.9151V25.6302H20.1985V24.9151C21.2953 24.7101 21.8962 23.789 21.8962 22.4577C21.8962 19.5915 18.8018 19.489 18.8018 17.339C18.8018 16.6227 19.1004 16.3151 19.6001 16.3151C20.0985 16.3151 20.3983 16.6227 20.3983 17.3402V17.749H21.8962V17.4414C21.8962 16.1101 21.2953 15.1889 20.1985 14.9839V14.2677H18.9017ZM7.88177 22.5602H10.6715C10.861 23.2523 11.1276 23.9195 11.4661 24.5489L9.50637 26.6478C8.72883 25.3971 8.17881 24.0122 7.88299 22.5602H7.88177ZM28.3287 22.5602H31.1124C30.812 24.0065 30.2587 25.385 29.4792 26.629L27.5341 24.5477C27.8726 23.9183 28.1393 23.2511 28.3287 22.559V22.5602ZM15.0651 28.2402C15.6791 28.5879 16.3301 28.8619 17.0053 29.0565V32.0128C15.5929 31.7032 14.2483 31.1285 13.0395 30.3177L15.0651 28.2402ZM23.9351 28.2402H23.9388L25.9412 30.2952C24.7386 31.1068 23.401 31.6851 21.9949 32.0015V29.0515C22.6701 28.8573 23.3211 28.5838 23.9351 28.2365V28.2402Z"
									fill="white"
								/>
							</svg>
						{:else}
							<div class="milestonelogo">
								<svg
									width="22"
									height="22"
									viewBox="0 0 22 22"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6.41683 14.6663H2.75016C2.50705 14.6663 2.27389 14.7629 2.10198 14.9348C1.93007 15.1067 1.8335 15.3399 1.8335 15.583V20.1663H7.3335V15.583C7.3335 15.3399 7.23692 15.1067 7.06501 14.9348C6.8931 14.7629 6.65994 14.6663 6.41683 14.6663ZM12.8335 9.16634H9.16683C8.92371 9.16634 8.69056 9.26292 8.51865 9.43483C8.34674 9.60673 8.25016 9.83989 8.25016 10.083V20.1663H13.7502V10.083C13.7502 9.83989 13.6536 9.60673 13.4817 9.43483C13.3098 9.26292 13.0766 9.16634 12.8335 9.16634ZM19.2502 11.9163H15.5835C15.3404 11.9163 15.1072 12.0129 14.9353 12.1848C14.7634 12.3567 14.6668 12.5899 14.6668 12.833V20.1663H20.1668V12.833C20.1668 12.5899 20.0703 12.3567 19.8983 12.1848C19.7264 12.0129 19.4933 11.9163 19.2502 11.9163ZM11.0002 1.83301L10.0835 3.66634L8.25016 3.93401L9.77825 5.19442L9.30066 7.33301L11.0002 6.11109L12.6997 7.33301L12.2221 5.19442L13.7502 3.93401L11.9168 3.66634L11.0002 1.83301Z"
										fill="white"
									/>
								</svg>
							</div>
						{/if}
					</div>
					<div class="title">
						<p class="name">{event.name}</p>
						<p class="date">
							{#if type === 'DEADLINE'}
								{event.date.toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							{:else}
								{event.target} points
							{/if}
						</p>
					</div>
				</div>
				<div class="block">
					{#if i === firstUnreachedMilestoneIndex}
						{#if countdown != "NaN" && type=="DEADLINE"}
							<div class="deadline">
								<p class="label">Deadline:</p>
								<div class="time">
									<svg
										width="20"
										height="20"
										viewBox="0 0 20 20"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<g clip-path="url(#clip0_971_42585)">
											<path
												d="M10.0001 18.3334C14.6025 18.3334 18.3334 14.6024 18.3334 10C18.3334 5.39765 14.6025 1.66669 10.0001 1.66669C5.39771 1.66669 1.66675 5.39765 1.66675 10C1.66675 14.6024 5.39771 18.3334 10.0001 18.3334Z"
												stroke="#EA3D09"
												stroke-width="1.66667"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
											<path
												d="M10 5V10L13.3333 11.6667"
												stroke="#EA3D09"
												stroke-width="1.66667"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</g>
										<defs>
											<clipPath id="clip0_971_42585">
												<rect width="20" height="20" fill="white" />
											</clipPath>
										</defs>
									</svg>
									<p>
										{countdown}
									</p>
								</div>
							</div>
						{/if}
					{/if}
					<p class="price">
						<span>{new Intl.NumberFormat('de-DE', {
							style: 'currency',
							currency: 'EUR'
						  }).format(event.prize)}</span>
					</p>
				</div>
			</div>
		</div>
	{/each}
</section>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.container.reached {
		background-color: var(--green2);
		border: 1px solid var(--green4);
	}
	.score .container.reached {
		background-color: var(--purple4);
		border: 1px solid var(--purple4);
	}
	.container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 32px;
		border-radius: 7px;
		padding: 5px 18px;
		border: 1px solid var(--gray3);
	}
	.card {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.milestonelogo {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--green1);
		width: 40px;
		height: 40px;
		border-radius: 50%;
	}
	.score .milestonelogo {
		background-color: var(--purple1);
	}
	.name {
		font-size: 0.9rem;
		font-weight: 500;
	}
	.logo {
		display: flex;
		flex-direction: column;
		background-color: white;
		width: 40px;
		height: 40px;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
	}
	.date {
		font-size: 1rem;
		font-weight: 600;
	}
	.block {
		display: flex;
		align-items: center;
		gap: 20px;
	}
	.deadline {
		display: flex;
		gap: 10px;
		align-items: center;
	}
	.deadline p {
		font-size: 0.9rem;
	}
	.time {
		display: flex;
		align-items: center;
		gap: 8px;
		background-color: var(--red3);
		padding: 4px 12px;
		border-radius: 7px;
		color: var(--red1);
	}
	.time p {
		font-size: 0.9rem;
		font-weight: 600;
	}
	.price {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.price .label {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--gray1);
	}
	.price span {
		font-size: 1.2rem;
		font-weight: 600;
	}
	.reached .price span {
		color: var(--green1);
	}
	.score .reached .price span {
		color: var(--purple1);
	}
	.deadline {
		display: flex;
	}

	@media only screen and (max-width: 768px) {
		.container {
			padding: 5px 10px;
		}
		.card {
			flex-direction: column;
			align-items: flex-start;
		}
		.card .block:nth-child(1) {
			flex-direction: row;
		}
		.card .block:nth-child(2) {
			gap: 10px;
		}
		.card .block:nth-child(2) .price {
			width: 100%;
			display: flex;
			justify-content: space-between;
		}
		.deadline p {
			font-size: 1em;
			font-weight: 600;
			color: var(--gray1);
		}

		.block {
			flex-direction: column;
			align-items: flex-start;
			width: 100%;
		}
		.price {
			width: 100%;
		}
		.deadline {
			border-top: 1px solid var(--green3);
			width: 100%;
			margin-top: 20px;
			display: flex;
			justify-content: space-between;
			padding-top: 20px;
		}
		.deadline .label {
			font-size: 0.9rem;
			font-weight: 600;
			color: var(--gray1);
		}
		.time p {
			font-size: 0.9rem;
			font-weight: 600;
			color: var(--red1);
		}
	}
</style>
