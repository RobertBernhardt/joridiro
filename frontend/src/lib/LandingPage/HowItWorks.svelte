<div class="container">
	<div class="title">
		<h2>How it works</h2>
		<p>Collect entries, incentivize participants, and select random winners</p>
	</div>
	<div class="feature">
		<div class="text">
			<p class="step">Step #1</p>
			<h2>Create Contest</h2>
			<p>
				In the beginning, God created the Joridiro contests. But the contest was without form and
				void, and emptiness was over the face of the deep. Therefore you have to create your full
				contest first. Decide what contest type (deadline or score) and what size you want. Set your
				requirements for joining, rules and methods for scoring. Tell your future participants
				something about your contest and your company. The contest will be live after you paid it
			</p>
		</div>
		<div class="image">
			<img src="https://storage.googleapis.com/joridiro_resources/how1.svg" alt="" />
		</div>
	</div>
	<div class="feature">
		<div class="text">
			<p class="step">Step #2</p>
			<h2>Participants</h2>
			<p>You know best who could be suitable for your platform as seller / producer. A Joridiro contest is a convincing argument to attract these people, but finding them is your job. So make sure to attract as many as possible to join your contest</p>
		</div>
		<div class="image">
			<img src="https://storage.googleapis.com/joridiro_resources/how2.svg" alt="" />
		</div>
	</div>
	<div class="feature">
		<div class="text">
			<p class="step">Step #3</p>
			<h2>Support your Contest</h2>
			<p>Your contest works best when you start a marketing campaign at the same time to attract the other side of your success equation - the end users. It will make it easier for your new sellers / producers to get momentum and with that start the whole motor of your platform. The better your support, the more successful your contest. Timing is important!</p>
		</div>
		<div class="image">
			<img src="https://storage.googleapis.com/joridiro_resources/how3.svg" alt="" />
		</div>
	</div>
	<div class="feature">
		<div class="text">
			<p class="step">Step #4</p>
			<h2>Boost your Business</h2>
			<p>You have created a great contest, attracted participants and boosted it with a parallel marketing campaign? Happy you - look forward to seeing your business getting momentum and you yourself gaining network effects. Your boost into the next level has begun!</p>
		</div>
		<div class="image">
			<img src="https://storage.googleapis.com/joridiro_resources/how4.svg" alt="" />
		</div>
	</div>
</div>

<style>
	.title {
		width: fit-content;
		margin-left: auto;
		margin-right: auto;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.title h2 {
		font-size: 2.2rem;
		font-weight: 600;
		opacity: 0.8;
	}
	.title p {
		opacity: 0.7;
	}
	.feature {
		margin-bottom: 2rem;
	}
	.feature .step {
		font-weight: 600;
	}
	.feature:nth-child(2) .step {
		color: #3d09ea;
	}
	.feature:nth-child(3) .step {
		color: #4cbb25;
	}
	.feature:nth-child(4) .step {
		color: #b035d0;
	}
	.feature:nth-child(5) .step {
		color: #ea3d09;
	}
	.feature {
		width: 100%;
		max-width: 1670px;
		padding: 0 30px;
		height: 100%;
		display: flex;
		align-items: center;
		margin-left: auto;
		margin-right: auto;
		justify-content: space-between;
		gap: 100px;
	}

	.image {
		width: 50vw;
		min-width: 500px;
		max-width: 550px;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.text {
		width: fit-content;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
	}

	.image img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.text:nth-child(2) {
		padding-right: 50px;
	}

	.text:nth-child(1) {
		padding-left: 50px;
	}

	.text h2 {
		font-size: 2.2rem;
		font-weight: 600;
		opacity: 0.8;
	}

	.text p {
		max-width: 700px;
		font-size: 1rem;
		font-weight: 500;
		opacity: 0.7;
		margin-top: 20px;
	}

	@media only screen and (max-width: 1100px) {
		.feature {
			flex-direction: column;
			gap: 50px;
			justify-content: unset;
			align-items: center;
		}

		.text p {
			width: 100%;
			max-width: unset;
		}

		.container.reverse {
			display: flex;
			flex-direction: column-reverse;
		}

		.text:nth-child(2) {
			padding-right: unset;
		}

		.text:nth-child(1) {
			padding-left: unset;
		}
		.image {
			width: 100%;
			max-width: unset;
			min-width: unset;
		}
	}
</style>
