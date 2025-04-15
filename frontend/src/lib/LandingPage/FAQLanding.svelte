<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/InputComponents/Button.svelte';
	import Input from '$lib/InputComponents/Input.svelte';
	import { alert as notifications } from '$lib/Notifications/notifications';
	import { contest } from '$lib/stores/contests';
	import { modal } from '$lib/stores/modal';
	import { user } from '$lib/stores/user';
	import API from '../../utils/API';

	let selected: number = -1;

	const questions = [
		{
			question: 'Why do I have to choose between three contest sizes?',
			answer:
				'We at Joridiro realized that neither you nor we know what is the exact right amount of prize money for a given contest. Is it 2720 € or rather 6.470 €? Who knows? So it’s much easier to choose between three different sizes which are an order of magnitude bigger in their incentive effect. Also you can actually better fit your contest to a size than the other way around: You define how the participants get points and therefore decide about the difficulty level as well as the requirements and rules so you can set how big your contest should be (sometimes it’s better if you exclude some people when you want to focus on specific niches). So you can make the very same contest to a contest S, M or L depending how strictly you define score methods, requirements and rules. The big advantage of having three standardized sizes is that this makes it also much easier for participants to understand and compare.'
		},
		{
			question: 'Why is the duration / the needed points for grand prize given?',
			answer:
				'Like with the not-possibly perfect amount of prize money, we at Joridiro realized that organizers actually also can’t know the perfect number of points or the perfect duration of a contest. Is it 42 points or 123 points? Is it 23 days or 48 days? It’s a completely wild guess. Therefore we standardized the days and points for deadline and score contests depending on different contest sizes. With this the contests are much better comparable'
		},
		{
			question: 'Why can’t I freely choose where the milestones are?',
			answer:
				'Milestones are most important to push the start of a contest. Therefore they are set to be more to the start than to the end. It makes it better comparable for participants at what stage a given contest is if they are standardized.'
		},
		{
			question: 'Why is the lottery mandatory in contest M and L?',
			answer:
				'Participants get a lottery ticket per day for every score update they make. The lottery is an incentive for participants to regularly update their score (even the ones who probably won’t win the grand prize). Therefore you incentivize them - not only the leading ones - to be active and also get a timely overview how your contest is going.'
		},
		{
			question: 'What are the milestones for?',
			answer:
				'The milestones are an incentive for the participants of a contest to become active as soon as possible. They are of the same kind as the grand prize, i.e. either deadline milestones for the deadline contest or score milestones for the score contest. Since they increase the total prize pool of your contest they help you to attract more and better participants'
		},
		{
			question: 'What is the lottery for?',
			answer:
				'Participants get one lottery ticket every day they update their score. After the grand prize winner is confirmed a lottery winner is drawn (who also has to be confirmed, i.e. if their scores were wrong they won’t win). Therefore the lottery is a big incentive for all participants to be active every day on your contest and update their score regularly. This gives you a live overview how your contest is actually going'
		},
		{
			question: 'What if I want to change my contest later on?',
			answer:
				'There is a button “Edit Contest” with which you can change your contest. Please be aware that these changes aren’t saved directly but have to be released by Joridiro. It’s unproblematic if you change your image or add some more info about your company. But we want to avoid that a contest is changed in its core functionality after it has already started (and especially later on in the contest). So Joridiro reserves the right to refuse the changes. If you want to announce something you can use the announcements feature. Also participants might ask you open questions via the FAQ section which you can answer'
		},
		{
			question: 'How much does it cost to create a contest?',
			answer:
				'There are three contest sizes, each with a fixed predefined price. The price is a sum of the grand prize, milestones, lottery and the platform fee of Joridiro. Depending on your location a VAT rate is added to this price during checkout. You see the full prizes of you create your contest [link]'
		},
		{
			question: 'When does my contest start?',
			answer:
				'Your contest starts after we get the confirmation from Stripe that your payment is complete.'
		},
		{
			question: 'How long is my contest?',
			answer:
				'The duration of a contest depends on the contest type and contest size. These are standardized, so you have six options: for score contests the contest ends after 5 (S), 25 (M) or 100 points (L). For deadline contests the contest ends after 7 (S), 25 (M) or 45 (L) days.'
		},
		{
			question: 'How does the winner confirmation work?',
			answer:
				"Winner confirmation is a process which starts after winning any prize, i.e. for grand prize, milestones and lottery winners. For the confirmation you have to confirm that the score the winner has set is actually correct and that the score given is actually true and that he did not violate any of your requirements or rules. Your confirmation can't be taken back so make sure to be certain before you confirm the winner. If you fail to confirm within 7 days the winner is automatically confirmed. If you reject a winner the contest continues or the next winner is chosen who you have to confirm. After you confirm the winner he also has to be confirmed by Joridiro with their ID, tax ID and bank details to get the prize money correctly. If this fails the contest also continues"
		},
		{
			question: "What if my contest doesn't work?",
			answer:
				'Joridiro defines that a contest didn’t work if you were not able to attract any participant who updated their score to > 0. In this case you can contact Joridiro and we will refund you. If the contest doesn’t really get momentum we can also try to add some methods to score or remove some requirements.'
		},
		{
			question: 'How can I attract participants?',
			answer:
				'You know yourself best what kind of people would be best to have as sellers / producers on your platform. We recommend either a social media campaign or to contact these people directly via mail or a call. It’s your job to find and attract participants for your contest, which will be the first power users of your platform or new market niche. What Joridiro offers you is an attractive argument to convince these people to give your platform a try. Nothing more, nothing less.'
		},
		{
			question: 'What contest type is the right one for my business?',
			answer:
				'You can choose between deadline and score contests. Deadline contests end after the deadline is over. Score contests end after the first participant reaches the target score. Well, we would say that the deadline contest is more predictable since you have a fixed timetable for each contest size. On the other hand with the score contest you can set better incentives if you want something urgently done. Also with different methods on how to score you can give participants options to try different strategies on how to win your contest (which all could help your platform work better). '
		},
		{
			question: 'What contest size should I choose?',
			answer:
				'Our smallest contest S is more of a trial balloon and you won’t be able to solve big business issues with it. It’s important that you define your contest to match its size. You can target several niches with several contests M or one bigger goal with a contest L. With your requirements, rules and methods how to score you define the difficulty level and effort of your contest. It also depends on your business and the size a prize must have for your market to attract sellers / producers.'
		},
		{
			question: 'How do I know how my contest is going?',
			answer:
				'Participants update their scores during the contest. With every update they get a lottery ticket, so they have an incentive to update regularly. When you go on your contest page you will see some more info in different sections.'
		}
	];
</script>

<section id="faqs" class="container">
	<div class="heading">
		<h2>Frequently Asked Questions</h2>
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
										fill="var(--gray1)"
										stroke="var(--gray1)"
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
										fill="#FFFFFF"
										stroke="#FFFFFF"
									/>
								</svg>
							{/if}
						</div>
						<div class="step_title">
							<p>{question.question}</p>
						</div>
					</div>
					<div class="icon" />
				</div>
				<div class="description {selected == index ? 'active' : ''}">
					{question.answer}
				</div>
			{/if}
		{/each}
	</div>
</section>

<style>
	.container {
		width: 100%;
		padding: 0 20px;
		max-width: 1670px;
		margin-left: auto;
		margin-right: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0 20px;
	}
	.heading {
		width: fit-content;
		height: 100%;
		display: flex;
		flex-direction: column;
        margin-bottom: 50px;
		align-items: center;
		justify-content: center;
	}
	.heading h2 {
		font-size: 2.2rem;
		font-weight: 600;
		opacity: 0.8;
        text-align: center;
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
		border-top: 1px solid var(--gray3);
	}
	.text {
		display: flex;
	}
	.step_number {
		width: 40px;
		height: 40px;
		min-width: 40px;
		border-radius: 50%;
		border: 1px solid var(--gray3);
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
	@media only screen and (max-width: 768px) {
        .heading h2{
            font-size: 2rem;
            text-align: center;
        }
		.container {
			width: 100%;
		}
	}
</style>
