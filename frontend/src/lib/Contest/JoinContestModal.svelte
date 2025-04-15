<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/InputComponents/Button.svelte';
	import Checkbox from '$lib/InputComponents/Checkbox.svelte';
	import Input from '$lib/InputComponents/Input.svelte';
	import { alert } from '$lib/Notifications/notifications';
	import { contest } from '$lib/stores/contests';
	import { modal } from '$lib/stores/modal';
	import { user } from '$lib/stores/user';
	import API from '../../utils/API';
	import ContestRequirements from './ContestRequirements.svelte';

	const requirements: any = [
		{
			type: 'LOCATION',
			title: 'Location',
			value: $contest.requirements.countries
		},
		{
			type: 'ORGANIZER_LINK',
			title: "You need to create an account on the organizer's website on",
			value: $contest.requirements.organizer_platform
		},
		{
			type: 'CATEGORIES',
			title: 'To do well in this contest, you need to be active in the following categories',
			value: $contest.requirements.categories
		},
		{
			type: 'ROLES',
			title: 'Roles',
			value: $contest.requirements.roles
		}
	];
	$contest.requirements.additional.forEach((requirement: any) => {
		requirements.push({
			type: 'OTHER',
			title: requirement.name,
			value: requirement.description
		});
	});
	const displayableRequirements: any = [];

	requirements.forEach((requirement: any) => {
		if (requirement.type === 'LOCATION' && requirement.value.length > 0) {
			displayableRequirements.push({
				type: 'LOCATION',
				title: requirement.title,
				checked: false,
				value: `Must be from ${requirement.value.join(', ')}`,
				icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_1359_59184)">
                            <path d="M17.5 8.33398C17.5 14.1673 10 19.1673 10 19.1673C10 19.1673 2.5 14.1673 2.5 8.33398C2.5 6.34486 3.29018 4.43721 4.6967 3.03068C6.10322 1.62416 8.01088 0.833984 10 0.833984C11.9891 0.833984 13.8968 1.62416 15.3033 3.03068C16.7098 4.43721 17.5 6.34486 17.5 8.33398Z" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10 10.834C11.3807 10.834 12.5 9.7147 12.5 8.33398C12.5 6.95327 11.3807 5.83398 10 5.83398C8.61929 5.83398 7.5 6.95327 7.5 8.33398C7.5 9.7147 8.61929 10.834 10 10.834Z" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </g>
                            <defs>
                            <clipPath id="clip0_1359_59184">
                            <rect width="20" height="20" fill="white"/>
                            </clipPath>
                            </defs>
                        </svg>
                        `
			});
		} else if (requirement.type === 'ORGANIZER_LINK' && requirement.value) {
			displayableRequirements.push({
				type: 'PROFILE',
				title: requirement.title,
				checked: false,
				value: requirement.value,
				icon: `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_1359_59198)">
                    <path d="M12.4999 5.83398H14.9999C15.5471 5.83398 16.0889 5.94176 16.5944 6.15115C17.1 6.36055 17.5593 6.66746 17.9462 7.05437C18.3331 7.44128 18.64 7.90061 18.8494 8.40614C19.0588 8.91166 19.1666 9.45348 19.1666 10.0007C19.1666 10.5478 19.0588 11.0896 18.8494 11.5952C18.64 12.1007 18.3331 12.56 17.9462 12.9469C17.5593 13.3338 17.1 13.6408 16.5944 13.8501C16.0889 14.0595 15.5471 14.1673 14.9999 14.1673H12.4999M7.49992 14.1673H4.99992C4.45274 14.1673 3.91093 14.0595 3.4054 13.8501C2.89988 13.6408 2.44055 13.3338 2.05364 12.9469C1.27224 12.1655 0.833252 11.1057 0.833252 10.0007C0.833252 8.89558 1.27224 7.83577 2.05364 7.05437C2.83504 6.27297 3.89485 5.83398 4.99992 5.83398H7.49992" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6.66675 10H13.3334" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_1359_59198">
                    <rect width="20" height="20" fill="white"/>
                    </clipPath>
                    </defs>
                </svg>
        `
			});
		} else if (requirement.type === 'ROLES' && requirement.value.length > 0) {
			displayableRequirements.push({
				type: 'ROLES',
				title: requirement.title,
				checked: false,
				value: requirement.value.join(', '),
				icon: `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_1359_59219)">
                    <path d="M10.0001 18.3327C14.6025 18.3327 18.3334 14.6017 18.3334 9.99935C18.3334 5.39698 14.6025 1.66602 10.0001 1.66602C5.39771 1.66602 1.66675 5.39698 1.66675 9.99935C1.66675 14.6017 5.39771 18.3327 10.0001 18.3327Z" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 18.3333V15" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.3333 10H15" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5.00008 10H1.66675" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 4.99935V1.66602" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_1359_59219">
                    <rect width="20" height="20" fill="white"/>
                    </clipPath>
                    </defs>
                </svg>
                `
			});
		} else if (requirement.type === 'CATEGORIES' && requirement.value.length > 0) {
			displayableRequirements.push({
				type: 'CATEEGORIES',
				title: requirement.title,
				checked: false,
				value: requirement.value.join(', '),
				icon: `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_1359_59219)">
                    <path d="M10.0001 18.3327C14.6025 18.3327 18.3334 14.6017 18.3334 9.99935C18.3334 5.39698 14.6025 1.66602 10.0001 1.66602C5.39771 1.66602 1.66675 5.39698 1.66675 9.99935C1.66675 14.6017 5.39771 18.3327 10.0001 18.3327Z" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 18.3333V15" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.3333 10H15" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5.00008 10H1.66675" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 4.99935V1.66602" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_1359_59219">
                    <rect width="20" height="20" fill="white"/>
                    </clipPath>
                    </defs>
                </svg>
                `
			});
		} else if (requirement.type === 'OTHER') {
			displayableRequirements.push({
				type: 'OTHER',
				title: requirement.title,
				checked: false,
				value: requirement.value,
				icon: `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_1359_59226)">
                    <path d="M10.8105 10.44L16.123 10.44C16.5374 10.44 16.9349 10.2753 17.2279 9.98231C17.5209 9.68928 17.6855 9.29185 17.6855 8.87745C17.6855 8.46305 17.5209 8.06562 17.2279 7.7726C16.9349 7.47957 16.5374 7.31495 16.123 7.31495L6.64913 7.31495L9.61629 5.60186C9.79417 5.49936 9.95011 5.36281 10.0752 5.20001C10.2003 5.03722 10.292 4.85136 10.3453 4.65308C10.3985 4.4548 10.4121 4.24797 10.3853 4.04442C10.3586 3.84087 10.292 3.64459 10.1893 3.4668C10.0867 3.289 9.95 3.13318 9.7871 3.00823C9.6242 2.88329 9.43827 2.79167 9.23994 2.73862C9.04162 2.68557 8.83478 2.67212 8.63125 2.69904C8.42772 2.72597 8.2315 2.79274 8.05379 2.89554C2.68555 5.43995 0.810547 6.98817 0.810547 10.44C0.810547 11.2607 0.972207 12.0734 1.2863 12.8317C1.60039 13.59 2.06076 14.279 2.64113 14.8594C3.2215 15.4397 3.91049 15.9001 4.66878 16.2142C5.42706 16.5283 6.23978 16.69 7.06055 16.69L10.1855 16.69C10.5999 16.69 10.9974 16.5253 11.2904 16.2323C11.5834 15.9393 11.748 15.5419 11.748 15.1275C11.748 14.7131 11.5834 14.3156 11.2904 14.0226C10.9974 13.7296 10.5999 13.565 10.1855 13.565" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10.1855 13.5645L11.123 13.5645C11.5374 13.5645 11.9349 13.3998 12.2279 13.1068C12.5209 12.8138 12.6855 12.4164 12.6855 12.002C12.6855 11.5876 12.5209 11.1901 12.2279 10.8971C11.9349 10.6041 11.5374 10.4395 11.123 10.4395L10.8105 10.4395" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_1359_59226">
                    <rect width="20" height="20" fill="white"/>
                    </clipPath>
                    </defs>
                </svg>
                `
			});
		}
	});
	let submitAttempted = false;
	$: error =
		submitAttempted &&
		displayableRequirements.some((requirement: any) => requirement.checked === false);

	let profile = '';
	let alias = '';

	$: profileError = !profile && submitAttempted ? 'You must have a profile to join a contest' : '';
	$: aliasError = !alias && submitAttempted ? 'You must have an alias to join a contest' : '';

	const joinContest = async () => {
		let allChecked = true;
		displayableRequirements.forEach((requirement: any) => {
			if (!requirement.checked) {
				submitAttempted = true;
				allChecked = false;
			}
		});
		if (!allChecked) return;
		if (error) return;
		if (!profile || !alias) return (submitAttempted = true);
		checkAlias();
		if (aliasError) return;
		$modal = '';
		try {
			const res = await API.post(`/contest/${$contest._id}/join`, {
				alias: alias,
				profile: profile
			});
			$alert = res;
			// Push data to contest.participants using es6 spread operator
			$contest.participants = [
				...$contest.participants,
				{
					_id: $user._id,
					score: 0,
					lottery_tickets: 0
				}
			];
			console.log(res);
			$user = res.data;
			console.log($user);
		} catch (err: any) {
			$alert = err.response.data;
		}
	};

	const checkAlias = async () => {
		if (alias.length < 3) return;
		try {
			const res = await API.post(`/contest/${$contest._id}/validAlias`, {
				alias: alias
			});
		} catch (err: any) {
			aliasError = err.response.data.message;
		}
	};
</script>

<div class="container">
	<div class="header">
		<h1>Join Contest</h1>
		<svg
			on:click={() => ($modal = '')}
			on:keydown={() => ($modal = '')}
			width="25"
			height="25"
			viewBox="0 0 40 40"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M30 10L10 30M10 10L30 30"
				stroke="#6A7584"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</div>
	<div class="company">
		<div class="image">
			{#if $contest.about_company.logo}
				<img src={$contest.about_company.logo} alt="" />
			{:else}
				<img src="./images/defaultcontest.png" alt="" />
			{/if}
		</div>
		<div class="text">
			<p class="title">{$contest.title}</p>
			<p class="company">{$contest.about_company.name}</p>
		</div>
	</div>
	{#if error}
		<div class="error">
			<p>Some of the requirements are not met</p>
		</div>
	{/if}
	<div class="requirements">
		{#each displayableRequirements as requirement, index}
			<label
				on:click={() =>
					(displayableRequirements[index].checked = !displayableRequirements[index].checked)}
				on:keydown={() =>
					(displayableRequirements[index].checked = !displayableRequirements[index].checked)}
				for="name"
			>
				<div class="step">
					<div class="text">
						<div class="icon">
							{@html requirement.icon}
						</div>
						<div class="data">
							<div class="step_title">
								<p>{requirement.title}</p>
							</div>
							<div class="description">
								{requirement.value}
							</div>
						</div>
					</div>
				</div>
				<Checkbox name="name" value={requirement.checked} />
			</label>
		{/each}
	</div>
	<div class="input">
		<Input
			label="Enter the link to your profile or your username"
			placeholder="Enter your profile link"
			bind:value={profile}
			on:change={() => (submitAttempted = false)}
			required={true}
			error={profileError}
		/>
		<Input
			label="Enter your alias"
			placeholder="Enter the alias you want to use for the contest"
			bind:value={alias}
			on:change={() => (submitAttempted = false)}
			onBlur={checkAlias}
			required={true}
			error={aliasError}
		/>
	</div>
	<Button onClick={joinContest}>
		<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g clip-path="url(#clip0_1847_52885)">
				<path
					d="M18.3337 1.66663L9.16699 10.8333"
					stroke="white"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M18.3337 1.66663L12.5003 18.3333L9.16699 10.8333L1.66699 7.49996L18.3337 1.66663Z"
					stroke="white"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</g>
			<defs>
				<clipPath id="clip0_1847_52885">
					<rect width="20" height="20" fill="white" />
				</clipPath>
			</defs>
		</svg>
		Join the contest
	</Button>
</div>

<style>
	.container {
		width: fit-content;
		max-width: 700px;
		height: fit-content;
		border: 2px solid var(--gray3);
		padding: 40px;
		border-radius: 7px;
		position: relative;
		background-color: #ffffff;
	}
	.requirements {
		margin: 10px 0;
	}
	.header {
		margin-bottom: 15px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.input {
		margin-top: 30px;
	}
	label {
		display: flex;
		justify-content: space-between;
		gap: 20px;
	}
	h1 {
		font-size: 1.4rem;
		font-weight: 600;
		margin-bottom: 5px;
	}
	.header svg {
		cursor: pointer;
	}
	p {
		font-size: 1rem;
		font-weight: 400;
		color: var(--text_secondary);
	}
	.company {
		display: flex;
		align-items: center;
	}
	.company .image {
		width: 50px;
		height: 50px;
		min-width: 50px;
		border-radius: 7px;
		overflow: hidden;
		margin-right: 15px;
	}
	.company .image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.company .text {
		display: flex;
		flex-direction: column;
	}
	.company .text .title {
		font-size: 1.2rem;
		font-weight: 600;
		color: var(--text_primary);
		margin-bottom: 5px;
	}
	.error {
		background-color: var(--red4);
		color: var(--red1);
		margin-top: 20px;
		padding: 2px 10px;
		border-radius: 7px;
		font-weight: 600;
	}
	.error p {
		font-weight: 600;
		color: var(--red1);
		font-size: 0.9rem;
	}
	.step {
		display: flex;
		flex-direction: column;
		padding: 10px 0;
		cursor: pointer;
		justify-content: baseline;
		border-radius: 7px;
	}
	.text {
		display: flex;
	}
	.data {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
	.icon {
		width: 40px;
		height: 40px;
		min-width: 40px;
		border-radius: 50%;
		background-color: var(--red4);
		color: var(--red1);
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20px;
	}
	.text {
		display: flex;
		width: 100%;
	}
	.step_title {
		width: 100%;
		font-weight: 600;
		opacity: 0.8;
		font-size: 0.9rem;
		display: flex;
		justify-content: space-between;
	}
	.description {
		overflow: hidden;
		transition: all 0.3s ease;
		color: #000000;
		font-weight: 600;
		font-size: 1rem;
	}
</style>
