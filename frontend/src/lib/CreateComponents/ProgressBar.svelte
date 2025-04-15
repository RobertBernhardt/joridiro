<script lang="ts">
    import { contestCreation } from "$lib/stores/contestCreation"

    const options = [
        'Contest Prize',
        'How to Score',
        'Contest Rules',
        'Requirements',
        'About Contest',
        'About Company'
    ]
</script>

<div class="container">
        {#each options as option, index}
    <div class="wrapper {index < $contestCreation.step ? '' : 'unvisited'} {index != $contestCreation.step ? '' : 'visited'}">
        <div class="block">
            {#if index < $contestCreation.step}
                <svg width="10" height="10" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_1303_49145)">
                <path d="M2.77935 6.98148L0.445312 4.60018L1.50897 3.51497L2.77935 4.81492L6.49276 1.02246L7.55642 2.10766L2.77935 6.98148Z" fill="white"/>
                </g>
                <defs>
                <clipPath id="clip0_1303_49145">
                <rect width="7.11111" height="7.11111" fill="white" transform="translate(0.445312 0.444336)"/>
                </clipPath>
                </defs>
                </svg>
            {/if}
        </div>
            <p class="option">{option}</p>
        </div>
        {/each}
    </div>

<style>

    .container{
        width: 100%;
        height: fit-content;
        border-radius: 7px;
        position: relative;
        display: flex;
        justify-content: center;
        position: relative;
        flex-direction: column;
        gap: 20px;
    }
    .wrapper{
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .block{
        width: 20px;
        height: 20px;
        background-color: var(--green1);
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 10px;
        border-radius: 3px;
        transform: rotate(45deg);
    }
    .block svg{
        transform: rotate(-45deg);
    }
    .unvisited .block{
        background-color: var(--red1);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: transparent;
        border: 2px solid var(--gray1);
    }
    .option{
        opacity: 1;
        font-weight: 600;
        font-size: 0.95rem;
    }
    
    .unvisited .option{
        font-weight: 400;
        opacity: 0.8;
    }
    .visited .block{
        width: 20px;
        height: 20px;
        background-color: var(--red1);
        border-radius: 3px;
        transform: rotate(45deg);
        border: none;
    }
    .visited .option{
        font-weight: 600;
        opacity: 1;
    }
</style>