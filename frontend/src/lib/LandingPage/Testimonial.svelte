<div class="title">
	<h2>What people think of Joridiro</h2>
</div>
<div class="container">
	<div class="pfp">
		<!-- Github user profile -->
		<img src="./images/robert.svg" alt="Profile" />
	</div>
	<div class="wrapper">
		<div class="quotemark">
			<svg
				width="40"
				height="34"
				viewBox="0 0 40 34"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M8.29721 34C9.9484 34 11.3932 33.5879 12.6316 32.7636C13.87 31.9394 14.8194 30.9091 15.4799 29.6727C16.2229 28.3539 16.5944 26.9939 16.5944 25.5927C16.5944 23.6145 15.8927 21.8012 14.4892 20.1527C13.0857 18.4218 11.6409 17.5976 10.1548 17.68C10.6502 15.0424 11.5996 12.9406 13.0031 11.3745C14.4066 9.80849 16.1816 8.20121 18.3282 6.55273L14.9845 0C12.1775 1.48364 9.61816 3.58545 7.3065 6.30545C4.99484 8.94303 3.17853 11.8279 1.85759 14.96C0.619195 18.0097 0 21.0594 0 24.1091C0 26.9115 0.784314 29.2606 2.35294 31.1564C4.00413 33.0521 5.98555 34 8.29721 34ZM30.0929 34C31.5789 34 32.9412 33.5879 34.1796 32.7636C35.5005 31.9394 36.5325 30.9091 37.2755 29.6727C38.0186 28.3539 38.3901 26.9939 38.3901 25.5927C38.3901 24.2739 38.0186 23.0376 37.2755 21.8836C36.6151 20.6473 35.7895 19.617 34.7988 18.7927C33.808 17.9685 32.8586 17.5976 31.9505 17.68C32.3633 15.0424 33.2714 12.9406 34.6749 11.3745C36.0784 9.80849 37.8535 8.20121 40 6.55273L36.6563 0C33.8493 1.48364 31.29 3.58545 28.9783 6.30545C26.6667 8.94303 24.8916 11.8279 23.6532 14.96C22.4149 18.0097 21.7957 21.0594 21.7957 24.1091C21.7957 26.9115 22.58 29.2606 24.1486 31.1564C25.7998 33.0521 27.7812 34 30.0929 34Z"
					fill="#EA3D09"
				/>
			</svg>
		</div>
		<div class="review">
			<p>
				I actually wished I would have had the option to use Joridiro contests for my former
				projects. It's a missing link and will help increase the survival rate of new platform
				ventures. Joridiro will make you wonder how some companies could solve the egg-and-chicken
				problem at all. It's a messy affair but now we are able to systematically solve it for most
				applications
			</p>
			<p class="name">Robert Bernhardt</p>
			<p class="designation">Owner Joridiro</p>
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		margin: 0 auto;
		padding: 60px;
		max-width: 1670px;
		width: 100%;
		height: 100%;
		margin-top: 2rem;
		margin-bottom: 2rem;
		background-color: var(--gray4);
		border-radius: 40px;
	}

	.title {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin: 0 auto;
		width: 100%;
		height: 100%;
	}
	.title h2 {
		font-size: 2.5rem;
		font-weight: 600;
	}
	.pfp {
		width: 200px;
		min-width: 200px;
		height: 200px;
		border-radius: 50%;
		overflow: hidden;
	}

	.pfp img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		justify-content: center;
		margin-left: 60px;
	}

	.quotemark {
		width: 40px;
		height: 40px;
		margin-right: 1rem;
	}

	.quotemark svg {
		width: 100%;
		height: 100%;
	}

	.review {
		margin-top: 20px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
	}

	.review p {
		font-size: 1.1rem;
		font-weight: 400;
		line-height: 1.5;
		color: #000;
		margin: 0;
	}

	.review p.name {
		font-size: 1.2rem;
		font-weight: 600;
		line-height: 1.5;
		color: #000;
		margin-top: 10px;
	}

	.review p.designation {
		font-size: 1rem;
		font-weight: 400;
		line-height: 1.5;
		color: #000;
		margin: 0;
		opacity: 0.8;
	}

	@media screen and (max-width: 768px) {
		.container {
			flex-direction: column;
			padding: 20px;
		}

		.pfp {
			width: 150px;
			min-width: 150px;
			height: 150px;
		}

		.wrapper {
			margin-left: 20px;
		}

		.quotemark {
			width: 30px;
			height: 30px;
		}

		.review {
			margin-top: 10px;
		}
		.title h2 {
			font-size: 2rem;
			text-align: center;
		}
		.review p {
			font-size: 1rem;
		}
		.review p.name {
			font-size: 1.1rem;
		}
		.review p.designation {
			font-size: 0.9rem;
		}
	}
</style>
