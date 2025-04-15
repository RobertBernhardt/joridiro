<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/InputComponents/Button.svelte';
	import Checkbox from '$lib/InputComponents/Checkbox.svelte';
	import Input from '$lib/InputComponents/Input.svelte';
	import { alert } from '$lib/Notifications/notifications';
	import { contest } from '$lib/stores/contests';
	import { modal } from '$lib/stores/modal';
	import { user } from '$lib/stores/user';
	import { calcScore } from '../../utils/getTotalScore';
	import API from '../../utils/API';
	import ContestRequirements from './ContestRequirements.svelte';
	import UpdateScoreBlock from './UpdateScoreBlock.svelte';
    let score = $contest.score
    const totalScore = () => {
        // Total score is the sum of all points property in the score array
        let total = 0
        score.forEach((item:any) => {
            total += item.participant_score
        })
        return total
    }
    // Make an array of 0s with the length of score array
    $: updatedScore = Array.from({length: score.length}, () => 0)
    $: errors = Array.from({length: score.length}, () => false)
    // If updatedScore has a value less than 0, set the error to true
    $: updatedScore.forEach((item:any, index:number) => {
        if (item < 0) {
            errors[index] = true
        } else {
            errors[index] = false
        }
    })
    $: lotteryTickets = $contest.participants.find((p: any) => p._id === $user._id).lottery_tickets
    // The participant has a property called last_updated. If it is today set a variable to true
    $: canGetLottery = new Date($contest.participants.find((p: any) => p._id === $user._id).last_updated).toDateString() === new Date().toDateString()
</script>

<div class="container">
	<div class="header">
		<h1>Update Score</h1>
		<svg on:click={()=>$modal=''} on:keydown={()=>$modal=''} width="25" height="25" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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
			<img src={$contest.about_company.logo} alt="" />
		</div>
		<div class="text">
			<p class="title">Fill out the form to update your score</p>
			<p class="company">{$contest.about_company.name}</p>
		</div>
	</div>
    {#if !canGetLottery}
        <div class="lottery">
            <div class="info">
                <div class="image">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_1433_48902)">
                        <path d="M15.9998 0.00146755C7.17553 0.00146755 0.123047 7.18187 0.123047 16.0001C0.123047 24.8198 7.17553 32 15.9998 32C24.7068 32 31.8765 24.8259 31.8765 16.0001C31.8767 15.9587 31.8726 15.9174 31.8645 15.8768C31.7969 7.1157 24.782 0 15.9998 0V0.00146755ZM12.9236 1.55835V5.1155C12.0912 5.34862 11.2885 5.67689 10.5312 6.0938L8.03361 3.59769C9.52401 2.62238 11.1819 1.93093 12.9236 1.55835ZM19.0759 1.55835C20.8177 1.93093 22.4756 2.62238 23.966 3.59769L21.4954 6.0683C20.7323 5.63975 19.9198 5.30552 19.0759 5.07331V1.55835ZM15.9998 5.90889C16.0038 5.90893 16.0078 5.90893 16.0118 5.90889C21.5705 5.79318 26.0909 10.4263 26.0909 16.0001C26.0911 17.3253 25.8302 18.6376 25.3231 19.8619C24.8161 21.0863 24.0728 22.1988 23.1357 23.1359C22.1986 24.0729 21.0861 24.8164 19.8617 25.3234C18.6373 25.8305 17.325 26.0913 15.9998 26.0911C14.6745 26.0913 13.3623 25.8305 12.1379 25.3234C10.9135 24.8164 9.80095 24.0729 8.86387 23.1359C7.92679 22.1988 7.18349 21.0863 6.67644 19.8619C6.16938 18.6376 5.9085 17.3253 5.9087 16.0001C5.9085 14.6749 6.16938 13.3625 6.67644 12.1381C7.18349 10.9137 7.92679 9.80124 8.86387 8.86416C9.80095 7.92708 10.9135 7.18365 12.1379 6.6766C13.3623 6.16955 14.6745 5.90869 15.9998 5.90889ZM3.67409 8.00987L6.09354 10.5315C5.67709 11.2888 5.34933 12.0914 5.11674 12.9238H1.6724C2.03622 11.1784 2.7134 9.51366 3.67108 8.00987H3.67409ZM28.324 8.00987C29.2828 9.51341 29.961 11.1782 30.3257 12.9238H26.8392C26.6116 12.0993 26.2925 11.303 25.888 10.5495L28.3225 8.00987H28.324ZM15.2619 9.10832V9.96941C13.9094 10.2159 13.1686 11.3233 13.1686 12.9238C13.1686 16.3696 16.9856 16.6162 16.9856 19.0777C16.9856 19.9388 16.6144 20.3085 15.9998 20.3085C15.3836 20.3085 15.014 19.9389 15.014 19.0763V18.0919H13.1686V18.9545C13.1686 20.6781 13.9079 21.6624 15.2619 21.9088V22.7684H16.8609V21.9088C18.2134 21.6624 18.9542 20.5549 18.9542 18.9545C18.9542 15.5086 15.1387 15.3854 15.1387 12.8007C15.1387 11.9396 15.5069 11.5698 16.123 11.5698C16.7376 11.5698 17.1073 11.9395 17.1073 12.8021V13.2936H18.9542V12.9238C18.9542 11.3233 18.2134 10.2159 16.8609 9.96941V9.10832H15.2619ZM1.6739 19.0777H5.11374C5.34735 19.9097 5.67612 20.7119 6.09354 21.4685L3.67709 23.9918C2.71835 22.4882 2.04016 20.8233 1.67541 19.0777H1.6739ZM26.8858 19.0777H30.3181C29.9478 20.8165 29.2656 22.4737 28.3044 23.9692L25.906 21.4671C26.3234 20.7104 26.6522 19.9082 26.8858 19.0763V19.0777ZM10.5312 25.9062C11.2883 26.3243 12.0911 26.6537 12.9236 26.8876V30.4417C11.182 30.0696 9.52412 29.3786 8.03361 28.4038L10.5312 25.9062ZM21.4684 25.9062H21.4729L23.9419 28.3768C22.4591 29.3525 20.8098 30.0478 19.0759 30.4281V26.8816C19.9084 26.6481 20.7112 26.3193 21.4684 25.9018V25.9062Z" fill="#EA3D09"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_1433_48902">
                        <rect width="32" height="32" fill="white"/>
                        </clipPath>
                        </defs>
                        </svg>
                </div>
                    <div class="text">
                        <p class="title">Update your score to get 1 ticket per day</p>
                        <p class="description">You haven't updated your score today</p>
                    </div>
            </div>
            <div class="prize">
                <p>Lottery Prize: $1000</p>
            </div>
        </div>
    {/if}
    <div class="stats">
        <div class="points">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_1404_47227)">
                <path d="M8 22.4H1.6C1.17565 22.4 0.768687 22.5686 0.468629 22.8686C0.168571 23.1687 0 23.5757 0 24V32H9.6V24C9.6 23.5757 9.43143 23.1687 9.13137 22.8686C8.83131 22.5686 8.42435 22.4 8 22.4ZM19.2 12.8H12.8C12.3757 12.8 11.9687 12.9686 11.6686 13.2686C11.3686 13.5687 11.2 13.9757 11.2 14.4V32H20.8V14.4C20.8 13.9757 20.6314 13.5687 20.3314 13.2686C20.0313 12.9686 19.6243 12.8 19.2 12.8ZM30.4 17.6H24C23.5757 17.6 23.1687 17.7686 22.8686 18.0686C22.5686 18.3687 22.4 18.7757 22.4 19.2V32H32V19.2C32 18.7757 31.8314 18.3687 31.5314 18.0686C31.2313 17.7686 30.8243 17.6 30.4 17.6ZM16 0L14.4 3.2L11.2 3.6672L13.8672 5.8672L13.0336 9.6L16 7.4672L18.9664 9.6L18.1328 5.8672L20.8 3.6672L17.6 3.2L16 0Z" fill="#4CBB25"/>
                </g>
                <defs>
                <clipPath id="clip0_1404_47227">
                <rect width="32" height="32" fill="white"/>
                </clipPath>
                </defs>
                </svg>
            <p class="pointstext">{calcScore(
                $contest.participants.find((p) => p._id === $user._id)
            )} {totalScore() > 1 ? 'point' : 'points'}</p>
            <p class="ranking">Your ranking: #{$contest.participants.findIndex((participant)=>participant._id == $user._id) + 1}</p>                
        </div>
        <div class="tickets">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_1404_47233)">
                <path d="M15.9998 0.00146755C7.17553 0.00146755 0.123047 7.18187 0.123047 16.0001C0.123047 24.8198 7.17553 32 15.9998 32C24.7068 32 31.8765 24.8259 31.8765 16.0001C31.8767 15.9587 31.8726 15.9174 31.8645 15.8768C31.7969 7.1157 24.782 0 15.9998 0V0.00146755ZM12.9236 1.55835V5.1155C12.0912 5.34862 11.2885 5.67689 10.5312 6.0938L8.03361 3.59769C9.52401 2.62238 11.1819 1.93093 12.9236 1.55835ZM19.0759 1.55835C20.8177 1.93093 22.4756 2.62238 23.966 3.59769L21.4954 6.0683C20.7323 5.63975 19.9198 5.30552 19.0759 5.07331V1.55835ZM15.9998 5.90889C16.0038 5.90893 16.0078 5.90893 16.0118 5.90889C21.5705 5.79318 26.0909 10.4263 26.0909 16.0001C26.0911 17.3253 25.8302 18.6376 25.3231 19.8619C24.8161 21.0863 24.0728 22.1988 23.1357 23.1359C22.1986 24.0729 21.0861 24.8164 19.8617 25.3234C18.6373 25.8305 17.325 26.0913 15.9998 26.0911C14.6745 26.0913 13.3623 25.8305 12.1379 25.3234C10.9135 24.8164 9.80095 24.0729 8.86387 23.1359C7.92679 22.1988 7.18349 21.0863 6.67644 19.8619C6.16938 18.6376 5.9085 17.3253 5.9087 16.0001C5.9085 14.6749 6.16938 13.3625 6.67644 12.1381C7.18349 10.9137 7.92679 9.80124 8.86387 8.86416C9.80095 7.92708 10.9135 7.18365 12.1379 6.6766C13.3623 6.16955 14.6745 5.90869 15.9998 5.90889ZM3.67409 8.00987L6.09354 10.5315C5.67709 11.2888 5.34933 12.0914 5.11674 12.9238H1.6724C2.03622 11.1784 2.7134 9.51366 3.67108 8.00987H3.67409ZM28.324 8.00987C29.2828 9.51341 29.961 11.1782 30.3257 12.9238H26.8392C26.6116 12.0993 26.2925 11.303 25.888 10.5495L28.3225 8.00987H28.324ZM15.2619 9.10832V9.96941C13.9094 10.2159 13.1686 11.3233 13.1686 12.9238C13.1686 16.3696 16.9856 16.6162 16.9856 19.0777C16.9856 19.9388 16.6144 20.3085 15.9998 20.3085C15.3836 20.3085 15.014 19.9389 15.014 19.0763V18.0919H13.1686V18.9545C13.1686 20.6781 13.9079 21.6624 15.2619 21.9088V22.7684H16.8609V21.9088C18.2134 21.6624 18.9542 20.5549 18.9542 18.9545C18.9542 15.5086 15.1387 15.3854 15.1387 12.8007C15.1387 11.9396 15.5069 11.5698 16.123 11.5698C16.7376 11.5698 17.1073 11.9395 17.1073 12.8021V13.2936H18.9542V12.9238C18.9542 11.3233 18.2134 10.2159 16.8609 9.96941V9.10832H15.2619ZM1.6739 19.0777H5.11374C5.34735 19.9097 5.67612 20.7119 6.09354 21.4685L3.67709 23.9918C2.71835 22.4882 2.04016 20.8233 1.67541 19.0777H1.6739ZM26.8858 19.0777H30.3181C29.9478 20.8165 29.2656 22.4737 28.3044 23.9692L25.906 21.4671C26.3234 20.7104 26.6522 19.9082 26.8858 19.0763V19.0777ZM10.5312 25.9062C11.2883 26.3243 12.0911 26.6537 12.9236 26.8876V30.4417C11.182 30.0696 9.52412 29.3786 8.03361 28.4038L10.5312 25.9062ZM21.4684 25.9062H21.4729L23.9419 28.3768C22.4591 29.3525 20.8098 30.0478 19.0759 30.4281V26.8816C19.9084 26.6481 20.7112 26.3193 21.4684 25.9018V25.9062Z" fill="#EA3D09"/>
                </g>
                <defs>
                <clipPath id="clip0_1404_47233">
                <rect width="32" height="32" fill="white"/>
                </clipPath>
                </defs>
                </svg>
                <p>{lotteryTickets} {lotteryTickets > 1 ? 'tickets' : 'ticket'}</p>
        </div>
    </div>
    <div class="scorewrapper">
        {#each score as criteria, index}
                <UpdateScoreBlock
                    {criteria}
                />
        {/each}
    </div>
</div>

<style>

    .stats {
        display: flex;
        align-items: center;
        gap: 32px;
        justify-content: space-evenly;
    }
    .lottery .info{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row !important;
    }
    .stats .points{
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .stats .points .pointstext{
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--green1);
    }
    .stats .ranking{
        font-size: 1rem;
        font-weight: 600;
    }
    .stats .tickets{
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .stats .tickets p{
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--red1);
    }

	.container {
		width: 1200px;
		height: fit-content;
        max-height: 100vh;
		border: 2px solid var(--gray3);
		padding: 40px;
		border-radius: 7px;
        gap: 32px;
        display: flex;
        flex-direction: column;
		position: relative;
        overflow: auto;
		background-color: #ffffff;
	}
	
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	h1 {
		font-size: 1.4rem;
		font-weight: 600;
	}
    .header svg{
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
	.text {
		display: flex;
	}
	.text {
		display: flex;
		width: 100%;
	}


    .lottery{
        width: 100%;
        height: 100%;
        display: flex;
        padding: 20px;
        background-color: var(--red4);
        border-radius: 7px;
    }
    .lottery .info{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 20px;
    }
    .text{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .title{
        font-size: 1rem;
        font-weight: 600;
        color: var(--white);
    }
    .description{
        font-size: 0.9rem;
        font-weight: 400;
        color: #000000;
    }
    .prize p{
        white-space: nowrap;
        color: var(--red1);
        font-weight: 600;
    }


    .scorewrapper{
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    

</style>
