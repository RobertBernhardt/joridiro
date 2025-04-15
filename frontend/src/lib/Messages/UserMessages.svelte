<script lang="ts">
	import { user } from '$lib/stores/user';
	import { afterUpdate, onMount } from 'svelte';
	import API from '../../utils/API';
	import io from 'socket.io-client';
	import Input from '$lib/InputComponents/Input.svelte';
	import Button from '$lib/InputComponents/Button.svelte';
	import { page } from '$app/stores';
	import { messages } from '$lib/stores/messages';
	import { bind, onDestroy } from 'svelte/internal';
	let containerRef: any;
	let recieverInfo: any;
	let loadedMore: boolean = false;
	let text: string;
	let error: any;
	let isLoading: boolean = false;
	let files: any = [];
	export let socket: any;
	let isSending: boolean = false;
	const scrollToBottom = async (node: any) => {
		if (!node) return;
		node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};
	afterUpdate(() => {
		if (!loadedMore) scrollToBottom(containerRef);
		loadedMore = false;
	});
	const sendMessage = async () => {
		// > There has to be a text or a file
		if (isSending) return;
		isSending = true;
		if (!text.trim() && files.length === 0) return;

		const msg = await API.post('/message/send', {
			receiver: $page.params.id,
			message: text,
			attachments: files
		});
		text = '';
		files = [];
		$messages[$page.params.id].messages = $messages[$page.params.id].messages.push(msg.data);
		socket.emit('message', msg.data);
		scrollToBottom(containerRef);
		isSending = false;
	};
	const getMoreMessages = async () => {
		if (isLoading) return;
		isLoading = true;
		const res = await API.get(
			`/message/${$page.params.id}?start=${$messages[$page.params.id].messages.length}`,
			{}
		);
		isLoading = false;
		loadedMore = true;
		$messages[$page.params.id].messages = $messages[$page.params.id].messages.unshift(...res.data);
	};
	let msgs: any;
	$: userMessages = $messages[$page.params.id] ? $messages[$page.params.id].messages : [];
	const init = async () => {
		msgs = '';
		userMessages = [];
		recieverInfo = $messages[$page.params.id];
		text = '';
		const res = await API.get(`/message/${$page.params.id}?start=0`, {});
		msgs = res.data;
		scrollToBottom(containerRef);
	};
	$: if (msgs && $messages[$page.params.id]) {
		$messages[$page.params.id].messages = msgs;
	}
	$: if ($page.params.id) {
		init();
	}
	const markAsRead = async () => {
		await API.post(`/message/read/${$page.params.id}`, {});
	};
	onMount(async () => {
		init();
		markAsRead();
	});

	const handleFile = (e: any) => {
		files = [];
		for (let i = 0; i < e.target.files.length; i++) {
			const file = e.target.files[i];
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = (e: any) => {
				files = [...files, e.target.result];
			};
		}
	};

	$: console.log(files);
</script>

<svelte:window
	on:keypress={(e) => {
		if (e.key === 'Enter') {
			sendMessage();
		}
	}}
/>
<div class="header">
	{#if $messages[$page.params.id]}
		<div class="pfp">
			{#if $messages[$page.params.id].pfp}
				<img src={$messages[$page.params.id].pfp} alt="pfp" />
			{:else}
				<p class="initials">
					{#if $messages[$page.params.id].fullName}
						{$messages[$page.params.id].fullName.split(' ')[0][0] +
							$messages[$page.params.id].fullName.split(' ')[1][0]}
					{/if}
				</p>
			{/if}
		</div>
		{#if $messages[$page.params.id].fullName}
			<div class="name">
				<p>{$messages[$page.params.id].fullName}</p>
			</div>
		{/if}
	{/if}
</div>
<div
	class="messagewrapper"
	on:scroll={() => {
		if (containerRef.scrollTop === 0) {
			getMoreMessages();
		}
	}}
	bind:this={containerRef}
>
	{#if userMessages.length > 0}
		{#each userMessages as message}
			<!-- If it is visible mark as read -->
			<div class="messagecontainer {$user._id === message.sender ? 'sender' : 'reciever'}">
				<div class="block">
					{#if $user._id != message.sender}
						<div class="pfp">
							{#if $messages[$page.params.id].pfp}
								<img src={$messages[$page.params.id].pfp} alt="pfp" />
							{:else}
								<p class="initials">
									{#if $messages[$page.params.id].fullName}
										{$messages[$page.params.id].fullName.split(' ')[0][0] +
											$messages[$page.params.id].fullName.split(' ')[1][0]}
									{/if}
								</p>
							{/if}
						</div>
					{/if}
					<div class="message">
						{#if message.message}
							<div class="latest_message">
								<!-- Turn the links in the message clickable -->
								<p>
									{#each message.message.split(' ') as word}
										{#if word.includes('http')}
											<a href={word} target="_blank">{word}</a>
										{:else}
											{word}
										{/if}
										{' '}
									{/each}
								</p>
							</div>
						{/if}
						<div class="msg_attachments">
							{#if message.attachments.length > 0}
								{#each message.attachments as attachment}
									{#if attachment}
										{#if attachment.includes('jpg') || attachment.includes('png') || attachment.includes('jpeg') || attachment.includes('svg')}
											<a href={attachment}>
												<div class="image">
													<img src={attachment} alt="attachment" />
												</div>
											</a>
										{:else}
											<a href={attachment}>
												<div class="image fileattachment">
													<svg
														width="50"
														height="50"
														viewBox="0 0 24 24"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
															stroke="var(--green1)"
															stroke-width="2"
															stroke-linecap="round"
															stroke-linejoin="round"
														/>
														<path
															d="M14 2V8H20"
															stroke="var(--green1)"
															stroke-width="2"
															stroke-linecap="round"
															stroke-linejoin="round"
														/>
														<path
															d="M9 15H15"
															stroke="var(--green1)"
															stroke-width="2"
															stroke-linecap="round"
															stroke-linejoin="round"
														/>
													</svg>
												</div>
											</a>
										{/if}
									{/if}
								{/each}
							{/if}
						</div>
					</div>
				</div>
				<div class="time">
					<p>{new Date(message.createdAt).toLocaleString()}</p>
				</div>
			</div>
		{/each}
	{/if}
</div>
<div class="inputwrapper">
	{#if files.length > 0}
		<div class="attachments">
			<div on:click={() => (files = [])} on:keydown={() => (files = [])} class="close">
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
						stroke="black"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M15 9L9 15"
						stroke="black"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M9 9L15 15"
						stroke="black"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
			{#each files as file}
				{#if file.includes('data:image')}
					<div class="image">
						<img src={file} alt="" />
					</div>
				{:else}
					<div class="image file">
						<svg
							width="80"
							height="80"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
								stroke="var(--green1)"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M14 2V8H20"
								stroke="var(--green1)"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M9 15H15"
								stroke="var(--green1)"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
	<form on:submit={(e) => e.preventDefault()} class="inputText">
		<input
			type="text"
			placeholder="Message"
			on:change={(e) => {
				text = e.target.value;
			}}
			bind:value={text}
		/>
		<div class="fileUpload">
			<input
				on:change={handleFile}
				type="file"
				multiple={true}
				accept=".jpg, .jpeg, .png, .svg, .pdf, .doc, .docx"
			/>
			<button
				><svg
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M11.8752 11.8981H10.6269V13.1472C10.6269 13.4922 10.3469 13.7722 10.0019 13.7722C9.65686 13.7722 9.37686 13.4922 9.37686 13.1472V11.8981H8.12682C7.78182 11.8981 7.50182 11.6181 7.50182 11.2731C7.50182 10.9281 7.78182 10.6481 8.12682 10.6481H9.37686V9.3989C9.37686 9.0539 9.65686 8.7739 10.0019 8.7739C10.3469 8.7739 10.6269 9.0539 10.6269 9.3989V10.6481H11.8752C12.2202 10.6481 12.5002 10.9281 12.5002 11.2731C12.5002 11.6181 12.2202 11.8981 11.8752 11.8981ZM16.5427 7.58057H14.0735C12.6027 7.57224 11.3877 6.35391 11.3877 4.86807V2.25224C11.3877 2.04974 11.2277 1.87891 11.0185 1.87891H6.72432C4.72182 1.87891 3.09766 3.52807 3.09766 5.54141V14.2964C3.09766 16.4081 4.80266 18.1222 6.89349 18.1222H13.286C15.2877 18.1222 16.9044 16.4897 16.9044 14.4756V7.94557C16.9044 7.74307 16.7435 7.58057 16.5427 7.58057Z"
						fill="#454545"
					/>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M14.1803 6.39247C14.7411 6.3983 15.5203 6.4008 16.1811 6.3983C16.5194 6.39747 16.6911 5.98914 16.4569 5.74247C16.0328 5.29747 15.4419 4.67664 14.8486 4.0533C14.2528 3.42747 13.6544 2.79914 13.2194 2.34247C12.9786 2.08997 12.5586 2.2633 12.5586 2.6133V4.75414C12.5586 5.65247 13.2911 6.39247 14.1803 6.39247Z"
						fill="#454545"
					/>
				</svg>
			</button>
		</div>
		<div class="btn">
			<button type="submit" on:click={sendMessage}>
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
						d="M16.0595 8.14767L5.24832 2.22124C4.65552 1.89724 3.95392 1.94764 3.41552 2.35804C2.87552 2.76924 2.63712 3.43564 2.79312 4.09724L3.905 8.79935C3.93926 8.94423 4.06892 9.04639 4.21779 9.04575L11.2083 9.01567H11.2107C11.5411 9.01567 11.8091 9.28287 11.8107 9.61327C11.8123 9.94527 11.5443 10.2141 11.2131 10.2157L4.20911 10.2465C4.06128 10.2472 3.93314 10.349 3.89912 10.4929L2.79312 15.1693C2.63712 15.8309 2.87552 16.4981 3.41552 16.9101C3.71952 17.1413 4.07632 17.2589 4.43552 17.2589C4.71152 17.2589 4.99072 17.1893 5.24832 17.0477L16.0595 11.1213C16.6099 10.8189 16.9387 10.2637 16.9387 9.63407C16.9387 9.00527 16.6099 8.44927 16.0595 8.14767Z"
						fill="white"
					/>
				</svg>
			</button>
		</div>
	</form>
</div>

<style>
	.block {
		display: flex;
		gap: 20px;
	}
	.image {
		width: 200px;
		height: 100%;
	}
	.close {
		width: 20px;
		height: 20px;
		position: absolute;
		right: 20px;
		top: 20px;
	}
	.close svg {
		width: 100%;
		height: 100%;
	}
	.header {
		width: 100%;
		display: flex;
		align-items: center;
		height: 60px;
		border-bottom: 1px solid var(--gray3);
		position: absolute;
		z-index: 999999;
	}
	.fileattachment {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 20px;
		min-height: 150px;
	}
	a {
		color: #2b2bff;
	}
	.file {
		border: 1px solid var(--gray1);
		border-radius: 7px;
	}
	.msg_attachments {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.attachments {
		width: 100%;
		height: 150px;
		background: var(--gray4);
		padding: 10px;
		display: flex;
		gap: 20px;
		position: relative;
	}
	.image {
		width: 200px;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 7px;
		overflow: hidden;
	}
	.image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.pfp {
		display: flex;
		width: 50px;
		height: 50px;
		border-radius: 50%;
		overflow: hidden;
		background-color: var(--gray4);
		justify-content: center;
		align-items: center;
	}
	.inputwrapper {
		height: fit-content;
		margin-top: auto;
		z-index: 999999;
	}
	.fileUpload {
		display: flex;
		position: relative;
		cursor: pointer;
	}
	.fileUpload input {
		position: absolute;
		height: 100%;
		width: 100%;
		opacity: 0;
		cursor: pointer;
	}
	.fileUpload button svg {
		cursor: pointer;
	}
	.fileUpload button {
		background-color: var(--gray4);
		cursor: pointer;
	}
	input {
		display: flex;
		height: fit-content;
		width: 100%;
		font-size: 0.9rem;
		outline: none;
		border: none;
	}
	button {
		background-color: var(--red1);
		display: flex;
		justify-content: center;
		align-items: center;
		border: none;
		padding: 10px;
		border-radius: 50%;
	}
	.name {
		display: flex;
		align-items: center;
		font-weight: 500;
		margin-left: 10px;
	}
	.initials {
		font-weight: 600;
	}
	/* Hide scrollbar */
	::-webkit-scrollbar {
		display: none;
	}
	.messagewrapper {
		display: flex;
		flex-direction: column;
		gap: 20px;
		height: fit-content;
		max-height: calc(100vh - 255px);
		overflow: auto;
		position: absolute;
		top: 60px;
		width: 100%;
		bottom: 0;
		margin-bottom: 114px;
	}
	.inputText {
		display: flex;
		gap: 20px;
		position: absolute;
		bottom: 0;
		height: fit-content;
		width: 100%;
		border: 1px solid var(--gray3);
		padding: 10px 20px;
		align-items: center;
		margin-bottom: 30px;
		border-radius: 7px;
	}
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 20px;
		position: absolute;
		width: 100%;
		height: fit-content;
		max-height: calc(100vh - 200px);
		margin-bottom: 120px;
		bottom: 0;
		overflow: auto;
	}
	.message {
		padding: 5px 12px;
		border-radius: 7px;
		height: fit-content;
		word-break: break-word;
	}
	.messagecontainer {
		max-width: 770px;
	}
	.sender {
		margin-left: auto;
	}
	.reciever {
		margin-right: auto;
	}
	.sender .message {
		background-color: var(--green3);
	}
	.reciever .message {
		background-color: var(--gray4);
	}
	.time {
		font-size: 0.8rem;
		color: var(--gray1);
		width: fit-content;
	}
	.sender .time {
		margin-left: auto;
	}
	.reciever .time {
		margin-right: auto;
		padding-left: 70px;
	}

	@media screen and (max-width: 768px) {
		.messagewrapper {
			max-height: calc(100vh - 175px);
		}
	}
</style>
