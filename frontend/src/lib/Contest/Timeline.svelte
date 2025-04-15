<script lang="ts">
	import { contest } from '$lib/stores/contests';
	import { calcScore } from '../../utils/getTotalScore';
	import contestTypes from '../../utils/contstTypes';

	export let startDate: Date;
	export let endDate: Date;
	export let max_score: number = 0;
	export let type: string = 'DEADLINE';
	export let size: string = 'SMALL';
	export let milestones: any = [];
	export let bestResult: number = 0;

	$: topParticipant = $contest.participants[0];

	let progress =
		type === 'DEADLINE'
			? (new Date().getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime()) + 1
			: topParticipant
			? topParticipant.score.reduce((acc: any, cur: any) => {
					return acc + cur.points;
			  }, 0) /
					contestTypes.get(size).max_score +
			  1
			: 1;

	// Math.PI / 180 is to convert degrees to radians and -90 is to start the circle from the top
	const calculateDotPositions = (milestones: any) => {
		if (type === 'DEADLINE') {
			let totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
			let angles: any = [];
			milestones.forEach((milestone: any) => {
				// Calculate the difference between the milestone date and the start date in days
				let days =
					(new Date(milestone.date).getTime() - new Date(startDate).getTime()) /
					(1000 * 60 * 60 * 24);
				angles.push({
					type: 'MILESTONE',
					angle: (((days / totalDays) * 360 - 90) * Math.PI) / 180,
					date: new Date(milestone.date)
				});
			});
			angles.push({
				type: 'CONTEST_END',
				angle: ((360 - 90) * Math.PI) / 180,
				date: endDate
			});
			return angles;
		} else {
			let totalScore = contestTypes.get(size).max_score;
			let angles: any = [];
			milestones.forEach((milestone: any) => {
				angles.push({
					type: 'MILESTONE',
					angle: (((milestone.points / totalScore) * 360 - 90) * Math.PI) / 180,
					target: milestone.points
				});
			});
			angles.push({
				type: 'CONTEST_END',
				angle: ((360 - 90) * Math.PI) / 180,
				target: totalScore
			});
			return angles;
		}
	};

	let events = calculateDotPositions(milestones);
	$: checkIfEventIsPassed = (event: any, progress: any) => {
		if (type == 'DEADLINE') {
			if (event.type === 'MILESTONE') {
				return event.date.getTime() < new Date().getTime();
			}
			if (event.type === 'CONTEST_END') {
				return endDate.getTime() < new Date().getTime();
			}
		} else {
			if (event.type === 'MILESTONE') {
				return calcScore(topParticipant) >= event.target;
			}
			if (event.type === 'CONTEST_END') {
				return calcScore(topParticipant) >= contestTypes.get(size).max_score;
			}
		}
	};

	if (type === 'DEADLINE') {
		progress =
			(endDate.getTime() - new Date().getTime()) / (endDate.getTime() - startDate.getTime());
	}

	let countdown = endDate.getTime() - new Date().getTime();
	let displayCountdown = '';
	if (type === 'DEADLINE') {
		displayCountdown = `${Math.floor(countdown / (1000 * 60 * 60 * 24))} d ${Math.floor(
			(countdown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
		)} h ${Math.floor((countdown % (1000 * 60 * 60)) / (1000 * 60))} m`;
		setInterval(() => {
			countdown = endDate.getTime() - new Date().getTime();
			displayCountdown = `${Math.floor(countdown / (1000 * 60 * 60 * 24))} d ${Math.floor(
				(countdown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
			)} h ${Math.floor((countdown % (1000 * 60 * 60)) / (1000 * 60))} m`;
			if (progress >= 2) {
				progress = 2;
			} else {
				progress =
					(new Date().getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime()) +
					1;
			}
		}, 1000);
	} else {
		setInterval(() => {
			progress = topParticipant
				? topParticipant.score.reduce((acc: any, cur: any) => {
						return acc + cur.points;
				  }, 0) /
						contestTypes.get(size).max_score +
				  1
				: 1;
		}, 1000);
	}
</script>

<div class="progress-bar {type == 'DEADLINE' ? 'deadline' : 'score'}">
	<svg fill="#FFFFFF" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
		<circle class="progress-bar__track" cx="50" cy="50" r="45px" />
		<circle
			class="progress-bar__progress"
			cx="50"
			cy="50"
			r="45px"
			transform="rotate(-90 50 50)"
			stroke-dasharray={2 * Math.PI * 45}
			stroke-dashoffset={(0 - progress) * 2 * Math.PI * 45}
			fill="none"
		/>
	</svg>
	<div class="dots">
		{#each events as event}
			<div
				class="dot {checkIfEventIsPassed(event, progress) ? 'active' : ''}"
				style="left: {50 + Math.cos(event.angle) * 48}%; top: {50 + Math.sin(event.angle) * 48}%;"
			>
				{#if event.type === 'MILESTONE'}
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M13.7502 7.06956L11.8716 1.82953C11.8102 1.65753 11.6576 1.53487 11.4776 1.5062C11.2969 1.47953 11.1136 1.55287 11.0016 1.69687C10.9629 1.74753 10.0169 2.9222 7.41157 2.76753C4.16155 2.57953 3.21888 4.47486 3.18088 4.55553C3.12421 4.67553 3.11755 4.81287 3.16221 4.9382L6.23155 13.4982H2.72022C2.44422 13.4982 2.22021 13.7222 2.22021 13.9982C2.22021 14.2742 2.44422 14.4982 2.72022 14.4982H10.8456C11.1216 14.4982 11.3456 14.2742 11.3456 13.9982C11.3456 13.7222 11.1216 13.4982 10.8456 13.4982H7.29357L6.06421 10.0682C6.33488 9.70956 7.1909 8.88289 9.22957 9.00489C12.4176 9.19356 13.6322 7.60289 13.6822 7.53423C13.7809 7.40089 13.8062 7.22622 13.7502 7.06956Z"
							fill="#6A7584"
						/>
					</svg>
				{:else if event.type === 'CONTEST_END'}
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M4.66683 10.6667H2.00016C1.82335 10.6667 1.65378 10.7369 1.52876 10.8619C1.40373 10.987 1.3335 11.1565 1.3335 11.3333V14.6667H5.3335V11.3333C5.3335 11.1565 5.26326 10.987 5.13823 10.8619C5.01321 10.7369 4.84364 10.6667 4.66683 10.6667ZM9.3335 6.66668H6.66683C6.49002 6.66668 6.32045 6.73691 6.19542 6.86194C6.0704 6.98696 6.00016 7.15653 6.00016 7.33334V14.6667H10.0002V7.33334C10.0002 7.15653 9.92992 6.98696 9.8049 6.86194C9.67988 6.73691 9.51031 6.66668 9.3335 6.66668ZM14.0002 8.66668H11.3335C11.1567 8.66668 10.9871 8.73691 10.8621 8.86194C10.7371 8.98696 10.6668 9.15653 10.6668 9.33334V14.6667H14.6668V9.33334C14.6668 9.15653 14.5966 8.98696 14.4716 8.86194C14.3465 8.73691 14.177 8.66668 14.0002 8.66668ZM8.00016 1.33334L7.3335 2.66668L6.00016 2.86134L7.1115 3.77801L6.76416 5.33334L8.00016 4.44468L9.23616 5.33334L8.88883 3.77801L10.0002 2.86134L8.66683 2.66668L8.00016 1.33334Z"
							fill="#6A7584"
						/>
					</svg>
				{/if}
			</div>
		{/each}
	</div>

	<div class="progress-bar__text">
		{#if type === 'DEADLINE'}
			<p class="label">
				{#if progress != 2}
					Deadline
				{/if}
			</p>
			<p class="value">
				{#if contest.open}
					Contest Ended
				{:else}
					{displayCountdown}
				{/if}
			</p>
		{:else}
			<p class="label">Target</p>
			<p class="value">{contestTypes.get(size).max_score}</p>
		{/if}
	</div>
</div>

<style>
	.dots {
		width: 205px;
		height: 205px;
		position: absolute;
		top: 10px;
		left: 36px;
		border-radius: 50%;
	}
	.dot {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background-color: #ffffff;
		border: 4px solid var(--gray2);
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		transform: translate(-50%, -50%);
	}
	.active {
		border: 4px solid var(--green1);
	}
	.score .active {
		border: 4px solid var(--purple1);
	}
	/* Progress bar container styles */
	.progress-bar {
		position: relative;
		width: 100%;
		height: 230px;
		aspect-ratio: 1/1;
		padding: 0 30px;
	}
	/* Progress bar track styles */
	.progress-bar__track {
		stroke: var(--gray2);
		stroke-width: 4px;
	}

	/* Progress bar progress styles */
	.progress-bar__progress {
		stroke: #4caf50;
		stroke-width: 4px;
		stroke-linecap: round;
		transition: stroke-dashoffset 0.3s ease;
	}
	.score .progress-bar__progress {
		stroke: var(--purple1);
	}
	/* Progress bar text styles */
	.progress-bar__text {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
	}

	.label {
		font-size: 1rem;
		font-weight: 500;
		color: var(--gray1);
		margin-top: -10px;
	}
	.value {
		font-size: 1.5rem;
		font-weight: 600;
		color: #000;
		white-space: nowrap;
		margin-top: -10px;
	}
	circle {
		fill: transparent;
		stroke: var(--gray2);
		stroke-width: 2;
	}
</style>
