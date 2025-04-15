<script lang="ts">
    export let type: "button" | "submit" | "reset" | null | undefined = 'submit';
    export let disabled: boolean = false;
    export let onClick: any = () => {};
    export let style: "style1" | "style2" | "style3" | "style4" | 'style5' | 'style6' = 'style1';
    export let showLoaderOnDisable = true;
</script>

<button class={style} {type} {disabled} on:click={onClick} on:keydown={onClick}>
    {#if disabled && showLoaderOnDisable}
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40px" height="30px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <path fill="none" stroke="{style === 'style1' ? 'var(--red1)' : 'var(--gray1)'}" stroke-width="8" stroke-dasharray="42.76482137044271 42.76482137044271" d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z" stroke-linecap="round" style="transform:scale(0.8);transform-origin:50px 50px">
          <animate attributeName="stroke-dashoffset" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="0;256.58892822265625"/>
        </path>
    </svg>
    {:else}
    <slot />
    {/if}
</button>

<style>
    button{
        width: 100%;
        padding: 8px 16px;
        border: none;
        border-radius: 7px;
        cursor: pointer;
        display: flex;
        gap: 10px;
        justify-content: center;
        align-items: center;
        font-size: 0.9rem;
        font-size: 0.9rem;
        font-weight: 600;
        white-space: nowrap;
        transform: scale(1);
        transition: all 0.2s ease-in-out;
    }
    button:active{
        transform: scale(0.95);
        transition: all 0.2s ease-in-out;
    }


    .style1{
        background-color: var(--red2);
        color: #FFFFFF;
    }
    .style1:hover{
        background-color: var(--red1);
        transition: all 0.2s ease-in-out;
    }
    .style1:active{
        transition: all 0.2s ease-in-out;
    }
    .style1:disabled{
        background-color: var(--red3);
        cursor: not-allowed;
    }

    .style2{
        border: 1px solid var(--gray3);
        background-color: #FFFFFF;
        color: #000000;
        font-weight: 600;
    }
    .style2:disabled{
        background-color: var(--gray3);
        cursor: not-allowed;
    }
    .style3{
        background-color: var(--gray3);
        color: #000000;
        font-weight: 600;
    }
    .style3:disabled{
        background-color: var(--gray4);
        opacity: 0.6;
        cursor: not-allowed;
    }
    .style4{
        background-color: transparent;
        border: 1px solid var(--red1);
        color: var(--red1);
        font-weight: 600;
    }
    .style5{
        background-color: var(--green1);
        color: #FFFFFF;
        font-weight: 600;
    }
    .style6{
        background-color: var(--purple1);
        color: #FFFFFF;
        font-weight: 600;
    }
</style>