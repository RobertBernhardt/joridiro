<div class="container reverse">
	<div class="text">
		<h2>The story of Joridiro</h2>
		<p>
			Joridiro is about solving a fundamental problem for innovative businesses: the egg-and-chicken
			problem. Whenever you create a two-sided platform or marketplace you have the problem that at
			the beginning the whole thing doesn't work because if there are no sellers, there are no
			buyers, but if there are no buyers it's also unattractive for sellers (or producers) to start.
			You have no chicken and no egg. We created Joridiro contests to solve this problem by giving
			such an attractive incentive for your first sellers / producers that you can overcome the
			egg-and-chicken problem and henceforth have a hen which gives you many eggs and chickens every
			day.
		</p>
	</div>
	<div class="image">
		<img src="./images/story.svg" alt="" />
	</div>
</div>

<style>
	.container {
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
		padding-right: 50px;
		align-items: flex-start;
		justify-content: center;
	}

	.image img {
		width: 100%;
		height: 100%;
		object-fit: contain;
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
		.container {
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

		.text {
			padding-right: unset;
		}

		.image {
			width: 100%;
			max-width: unset;
			min-width: unset;
		}
	}
</style>
