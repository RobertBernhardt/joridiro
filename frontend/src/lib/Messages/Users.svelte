<script>
	import { page } from '$app/stores';
	import { user } from '$lib/stores/user';
</script>

<a href="{$page.url.host}/messages/{$user._id}">
	<div class="container active">
		<div class="pfp">
			<img src={$user.pfp} alt="pfp" />
		</div>
		<div class="message">
			<div class="username">
				<h3>Alapan Bagchi</h3>
			</div>
			<div class="latest_message">
				<p>Message</p>
			</div>
		</div>
	</div>
</a>

<style>
	.active {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		height: 70px;
		border-radius: 7px;
		background-color: var(--gray4);
		padding: 10px;
		cursor: pointer;
	}
	.pfp {
		width: 50px;
		height: 50px;
		min-width: 50px;
		border-radius: 50%;
		overflow: hidden;
	}
	.pfp img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.username h3 {
		font-size: 1.1rem;
		font-weight: 500;
	}
	.container {
		display: flex;
		flex-direction: row;
		height: 100%;
		width: 100%;
		max-width: 1610px;
		margin-left: auto;
		margin-right: auto;
		gap: 20px;
	}
	.message {
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100%;
	}
</style>
