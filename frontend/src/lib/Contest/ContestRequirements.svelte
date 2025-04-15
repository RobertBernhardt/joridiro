<script lang="ts">
	import Tooltip from '$lib/Utility/Tooltip.svelte';
import { contest } from '$lib/stores/contests';

	let selected: number = -1;
	const requirements: any = [
		{
			type: 'LOCATION',
			title: 'Location',
			value: $contest.requirements.countries
		},
		{
			type: 'ORGANIZER_LINK',
			title: 'Platform',
			value: $contest.requirements.organizer_platform
		},
		{
			type: 'CATEGORIES',
			title: 'Categories',
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
				// Add <span> to odd elements and </span> to even elements
				value:
					'Must be from ' +
					requirement.value
						.map((country: string, index: number) => {
							if (index !== 0) {
								return `<span style="color:var(--red1)"> OR</span> ${country}`;
							} else {
								return country;
							}
						})
						.join(''),
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
				value: requirement.value
					.map((role: string, index: number) => {
						if (index !== 0) {
							return `<span style="color:var(--red1)"> OR</span> ${role}`;
						} else {
							return role;
						}
					})
					.join(''),
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
</script>

<section id="requirements" class="container">
	<div class="header">
		<div class="title">
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M22 16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H8C6.89 18 6 17.1 6 16V4C6 2.89 6.89 2 8 2H20C20.5304 2 21.0391 2.21071 21.4142 2.58579C21.7893 2.96086 22 3.46957 22 4V16ZM16 20V22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V7H4V20H16ZM13 14L20 7L18.59 5.59L13 11.17L9.91 8.09L8.5 9.5L13 14Z"
					fill="black"
				/>
			</svg>
			<p>Requirements</p>
		</div>
        <Tooltip
            tooltip="You have to fulfill all requirements if you want to take part in the contest. If it is later recognized that you didn't fulfill all requirements your score becomes invalid. In case there are several options for the same requirement you have to check at least one"
        />
	</div>
	<div class="steps">
		{#each displayableRequirements as requirement, index}
			<div
				on:click={() => (selected != index ? (selected = index) : (selected = -1))}
				on:keydown={() => (selected = index)}
				class="step"
			>
				<div class="text">
					<div class="icon">
						{@html requirement.icon}
					</div>
					<div class="data">
						<div class="step_title">
							<p>{requirement.title}</p>
							<div class="required">*</div>
						</div>
						<div class="description">
							{@html requirement.value}
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.container {
		width: 100%;
		padding: 0 20px;
	}
    .title{
        display: flex;
        align-items: center;
    }
	.header {
		display: flex;
		align-items: center;
		margin-bottom: 20px;
        gap: 10px;
	}
	.header p {
		font-size: 1.3rem;
		font-weight: 600;
		margin-left: 10px;
	}

	.steps {
		display: flex;
		gap: 20px;
		flex-direction: column;
	}
	.step {
		display: flex;
		flex-direction: column;
		padding: 16px;
		cursor: pointer;
		justify-content: baseline;
		border: 1px solid var(--gray3);
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
		font-size: 0.92rem;
		font-weight: 600;
		opacity: 0.8;
		display: flex;
		justify-content: space-between;
	}
	.required {
		color: var(--red1);
		font-weight: 600;
		font-size: 1rem;
	}
	.description {
		overflow: hidden;
		transition: all 0.3s ease;
		color: #000000;
		font-weight: 600;
		font-size: 1.1rem;
	}

	@media only screen and (max-width: 768px) {
		.container {
			padding: 0;
		}
	}
</style>
