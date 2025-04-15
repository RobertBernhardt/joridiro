<script lang="ts">
	import Button from '$lib/InputComponents/Button.svelte';
	import Input from '$lib/InputComponents/Input.svelte';
	import Users from '$lib/Messages/Users.svelte';
	import { onMount } from 'svelte';
	import API from '../../utils/API';
	import { page } from '$app/stores';
	import { user } from '$lib/stores/user';
	import { messages } from '$lib/stores/messages';
	import io from 'socket.io-client';
	import UserMessages from '$lib/Messages/UserMessages.svelte';
	import ContactForm from '$lib/LandingPage/ContactForm.svelte';
	import { modal } from '$lib/stores/modal';
	let socket: any;

	let search: string;
	let users: any = [];
	const socketInit = () => {
		socket = io(`wss://${API.socketURL}:${API.socketPort}`);
		socket.on('connection', (socket: any) => {});
		socket.on('connect', () => {
			console.log('HERE');
			socket.emit('assign_user', $user._id);
		});
		socket.on('message', async (msg: any) => {
			if (!$messages[msg.sender]) {
				const user = await API.get(`message/user/${msg.sender}`, {});
				// Add the user to the users array in index 0
				$messages[user.data._id] = {
					_id: user.data._id,
					fullName: user.data.fullName,
					pfp: user.data.pfp,
					messages: user.data.messages ? user.data.messages : [],
					unreadMessages: user.data.unreadMessages ? user.data.unreadMessages : 0
				};
				console.log($messages, msg);
				$messages[msg.sender].messages = $messages[msg.sender].messages.push(msg);
				console.log($messages);
			} else {
				$messages[msg.sender].messages = $messages[msg.sender].messages.push(msg);
			}
			// > Play sound here
		});
	};

	onMount(() => {
		API.get('/message/user/all', {}).then((res: any) => {
			users = res.data.filter((user: any) => user._id != $user.sender);
			// $messages is a map of all the messages. Store it in the users array with user id as the key
			users.forEach((user: any) => {
				$messages[user._id] = {
					_id: user._id,
					fullName: user.fullName,
					pfp: user.pfp,
					messages: [],
					unreadMessages: user.unreadMessages
				};
			});
			socketInit();
			console.log(socket);
			// Remove $user._id from users array
			if (
				!users.find((user: any) => user._id === $page.params.id) &&
				$page.params.id !== $user.sender
			) {
				console.log('HERE');
				// If users _id doesnt contain page.params.id, then add it to the users array
				API.get(`message/user/${$page.params.id}`, {}).then((user: any) => {
					console.log(user);
					// Add the user to the users array in index 0
					$messages[user.data._id] = {
						_id: user.data._id,
						fullName: user.data.fullName,
						pfp: user.data.pfp,
						messages: [],
						unreadMessages: user.data.unreadMessages
					};
				});
			}
		});
	});
	$: users = Object.values($messages);
</script>

<div class="wrapper {$page.params.id ? 'showdm' : ''}">
	<div class="userlist">
		<div class="search">
			<Button onClick={()=> $modal = ContactForm}>Create a ticket</Button>
		</div>
		<div class="userwrapper">
			{#each users as user}
				<a href="/messages/{user._id}">
					<div class="user {$page.params.id === user._id ? 'active' : ''}">
						<div class="pfp">
							{#if user.pfp}
								<img src={user.pfp} alt="pfp" />
							{:else if user.fullName}
								<p class="initials">
									{user.fullName.split(' ')[0][0] + user.fullName.split(' ')[1][0]}
								</p>
							{/if}
						</div>
						<div class="text">
							<p class="name">{user.fullName}</p>
							{#if user.messages}
								{#if user.messages[user.messages.length - 1]}
									{#if user.messages[user.messages.length - 1].message}
										<p class="last">
											{user.messages[user.messages.length - 1].message.substring(0, 30)}
										</p>
									{:else}
										<p class="last">Sent a file</p>
									{/if}
								{/if}
							{/if}
						</div>

						{#if user.unreadMessages}
							<div class="unread">
								<p>{user.unreadMessages}</p>
							</div>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	</div>
	<div class="messages">
		{#if $page.params.id}
			<UserMessages {socket} />
		{/if}
	</div>
</div>

<style>
	.active {
		background-color: #3d09ea;
		color: white;
	}
	.active .last {
		color: white;
		opacity: 0.8;
	}
	.unread {
		margin-left: auto;
		width: 25px;
		height: 25px;
		border-radius: 50%;
		background-color: var(--green1);
		display: flex;
		justify-content: center;
		align-items: center;
		color: white;
	}
	.active .unread {
		color: #000000;
		background-color: #ffffff;
	}
	.initials {
		color: black;
	}
	.user {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 10px 10px;
		border-radius: 7px;
		width: 100%;
	}
	.name {
		font-size: 1rem;
		font-weight: 500;
	}
	.last {
		font-size: 0.9rem;
		color: var(--gray1);
	}
	.initials {
		font-weight: 600;
	}
	.pfp {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		overflow: hidden;
		background-color: aliceblue;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.search {
		height: 60px;
		min-height: 60px;
		padding: 10px 5px;
		display: flex;
		align-items: center;
		width: 100%;
		background-color: var(--gray4);
	}
	.wrapper {
		display: flex;
		gap: 20px;
		height: calc(100vh - 70px);
		width: 100%;
		margin-top: 0;
		max-width: 1670px;
		margin-left: auto;
		padding: 0 30px;
		margin-right: auto;
		gap: 20px;
		margin-top: 70px;
		z-index: 999;
	}

	.userwrapper {
		display: flex;
		flex-direction: column;
		gap: 20px;
		width: 100%;
	}
	.messages {
		display: grid;
		grid-template-rows: 1fr 110px;
		gap: 20px;
		position: relative;
		width: 80%;
	}

	.userlist {
		width: 30%;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.search {
		width: 100%;
		height: 50px;
	}

	@media screen and (max-width: 1000px) {
		.wrapper {
			height: 100%;
			margin-top: 0;
			padding: 0;
			gap: 40px;
			overflow: hidden;
			transition: all 0.3s ease-in-out;
		}
		.wrapper.showdm {
			overflow: visible;
		}
		.userlist {
			width: 100%;
			min-width: calc(100vw - 40px);
			height: 100%;
			margin-top: 70px;
			margin-left: 20px;
		}
		.messages {
			width: 100%;
			min-width: calc(100vw - 40px);
			height: 100%;
		}
		.userwrapper {
			height: 100%;
			overflow-y: scroll;
		}
		.showdm {
			position: fixed;
			display: flex;
			top: 0;
			left: -100vw;
			width: 100%;
			height: 100%;
			z-index: 100;
			transition: all 0.3s ease-in-out;
			background-color: white;
		}
	}
</style>
