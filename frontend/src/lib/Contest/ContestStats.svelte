<script lang="ts">
	import { contest } from "$lib/stores/contests";
	import { calcScore } from "../../utils/getTotalScore";


    export let grandPrize = 0;
    export let size: 'SMALL' | 'MEDIUM' | 'LARGE'
    export let bestResult = 0;
    export let totalParticipants = 0;
    export let type: 'SCORE' | 'DEADLINE'
    const getLevelColor = () => {
        if(type === 'SCORE'){
            return 'var(--purple1)'
        } else {
            return 'var(--green1)'
        }
    }
    let levelCount = 0
    if(size=='MEDIUM') levelCount = 1
    if(size=='LARGE') levelCount = 2

</script>

<div class="container">
    <div class="block">
        <p class="label">Grand Prize</p>
        <p class="value">{grandPrize}</p>
    </div>
    <div class="block">
        <p class="label">Level</p>
        <p class="value level">
            {#each ['','',''] as level, index}
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.66 12.18C12.69 12.29 12.7 12.4 12.7 12.5C12.73 13.15 12.44 13.85 11.97 14.28C11.75 14.47 11.39 14.67 11.11 14.75C10.23 15.06 9.35 14.62 8.83 14.11C9.77 13.89 10.32 13.21 10.5 12.5C10.62 11.89 10.37 11.38 10.27 10.78C10.17 10.2 10.19 9.71 10.4 9.18C10.55 9.47 10.71 9.77 10.9 10C11.5 10.78 12.45 11.12 12.66 12.18ZM20 10C20 15.5 15.5 20 10 20C4.5 20 0 15.5 0 10C0 4.5 4.5 0 10 0C15.5 0 20 4.5 20 10ZM15.16 10.56L15.06 10.36C14.9 10 14.45 9.38 14.45 9.38C14.27 9.15 14.05 8.94 13.85 8.74C13.32 8.27 12.73 7.94 12.22 7.45C11.05 6.31 10.79 4.44 11.54 3C10.79 3.18 10.14 3.58 9.58 4.03C7.55 5.65 6.75 8.5 7.71 10.95C7.74 11.03 7.77 11.11 7.77 11.21C7.77 11.38 7.65 11.53 7.5 11.6C7.31 11.67 7.13 11.63 7 11.5C6.93 11.46 6.9 11.42 6.87 11.37C6 10.26 5.84 8.66 6.43 7.39C5.12 8.45 4.41 10.24 4.5 11.92C4.56 12.31 4.6 12.7 4.74 13.09C4.85 13.56 5.06 14 5.3 14.44C6.14 15.78 7.61 16.75 9.19 16.94C10.87 17.15 12.67 16.85 13.96 15.7C15.4 14.4 15.9 12.33 15.16 10.56Z" fill="{index > levelCount ? '#FAFAFA' : getLevelColor()}" />
                </svg>
            {/each}
        </p>
    </div>
    <div class="block">
        <p class="label">Best Result</p>
        <p class="value">{$contest.participants[0] ? calcScore($contest.participants[0]) : 0} points</p>
    </div>
    <div class="block">
        <p class="label">Total Participants</p>
        <p class="value">{$contest.participants.length}</p>
    </div>
</div>

<style>
    .container {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        margin-top: 20px;
        gap: 70px;
    }
    .block {
        display: flex;
        flex-direction: column;
    }
    .level{
        display: flex;
        gap: 8px;
        margin-top: 7px;
    }
    .label {
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray1);
    }
    .value {
        font-size: 1.4rem;
        font-weight: 600;
    }
</style>