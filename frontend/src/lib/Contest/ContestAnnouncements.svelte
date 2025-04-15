<script lang="ts">
	import Button from "$lib/InputComponents/Button.svelte";
import { contest } from "$lib/stores/contests";
	import { modal } from "$lib/stores/modal";
	import AnnouncementModal from "./AnnouncementModal.svelte";

    let selected: number = -1
    
</script>

<section id="announcements" class="container">
    <div class="header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.5585 6.8418C4.57802 6.8418 2.97266 8.44716 2.97266 10.4276C2.97266 12.4081 4.57802 14.0135 6.5585 14.0135C6.88418 14.0135 7.15178 13.7742 7.20074 13.4624H7.21106V7.4946C7.21106 7.13436 6.91874 6.8418 6.5585 6.8418Z" fill="black"/>
            <path d="M21.0272 3.91623C21.0272 3.55599 20.7351 3.26367 20.3746 3.26367C20.2251 3.26367 20.089 3.31599 19.9791 3.40047L14.2368 6.71583H9.06052C8.70004 6.71583 8.40796 7.00791 8.40796 7.36839V13.5626H8.41612C8.4562 13.8844 8.72764 14.1345 9.06052 14.1345H13.6536L19.932 17.7592C20.0484 17.8672 20.2032 17.9346 20.3746 17.9346C20.7348 17.9346 21.0272 17.6423 21.0272 17.2821C21.0272 17.2574 21.0226 17.2338 21.02 17.2098H21.0272V16.1049V5.05863V3.95415H21.0233C21.024 3.94143 21.0272 3.92943 21.0272 3.91623Z" fill="black"/>
            <path d="M13.4906 19.0986L13.4814 19.0828C13.4783 19.077 13.4769 19.071 13.4735 19.0652C13.4702 19.0595 13.4658 19.0552 13.4625 19.0499L11.4693 15.598L11.4618 15.6023C11.3529 15.4525 11.1906 15.3608 11.0162 15.3392V15.332H9.28288V15.3364C9.18976 15.344 9.09688 15.3697 9.01048 15.4196C8.69824 15.5996 8.59144 15.999 8.77168 16.311C8.78704 16.3374 8.80576 16.3604 8.82424 16.3837L8.81656 16.3883L11.1393 20.4116C11.1395 20.4121 11.1395 20.4124 11.1398 20.4128C11.14 20.4133 11.1402 20.4136 11.1405 20.4138L11.1638 20.4541L11.1678 20.4517C11.3584 20.7313 11.7333 20.8235 12.0309 20.6514C12.0657 20.6312 12.0971 20.6075 12.1266 20.5825L12.1326 20.5928L13.3286 19.9026L13.323 19.893C13.5546 19.7017 13.6264 19.3734 13.4889 19.0996L13.4906 19.0986Z" fill="black"/>
            </svg>
        <p>Announcements</p>            
    </div>
    <div class="steps">
        {#each $contest.announcements as announcement, index}
            <div on:click={()=> selected!=index ? selected=index : selected=-1} on:keydown={()=>selected = index} class="step">
                <div class="text">
                    <div class="icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 2H8.00001C7.20436 2 6.4413 2.31607 5.87869 2.87868C5.31608 3.44129 5.00001 4.20435 5.00001 5V21C4.99931 21.1762 5.04518 21.3495 5.13299 21.5023C5.22079 21.655 5.3474 21.7819 5.50001 21.87C5.65203 21.9578 5.82447 22.004 6.00001 22.004C6.17554 22.004 6.34799 21.9578 6.50001 21.87L12 18.69L17.5 21.87C17.6524 21.9564 17.8248 22.0012 18 22C18.1752 22.0012 18.3476 21.9564 18.5 21.87C18.6526 21.7819 18.7792 21.655 18.867 21.5023C18.9548 21.3495 19.0007 21.1762 19 21V5C19 4.20435 18.6839 3.44129 18.1213 2.87868C17.5587 2.31607 16.7957 2 16 2ZM17 19.27L12.5 16.67C12.348 16.5822 12.1755 16.536 12 16.536C11.8245 16.536 11.652 16.5822 11.5 16.67L7.00001 19.27V5C7.00001 4.73478 7.10536 4.48043 7.2929 4.29289C7.48044 4.10536 7.73479 4 8.00001 4H16C16.2652 4 16.5196 4.10536 16.7071 4.29289C16.8947 4.48043 17 4.73478 17 5V19.27Z" fill="#4CBB25"/>
                            </svg>
                    </div>
                    <div class="step_title">
                        <p>{announcement.announcement}</p>
                    </div>
                </div>
                <div class="date">
                    - {
                        new Date(announcement.date).toLocaleDateString(
                            'en-US',
                            {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }
                       )
                    }
                </div>
            </div>

        {/each}
    </div>
	<div class="mobile">
		<Button onClick={() => $modal = AnnouncementModal}>Add Announcement</Button>
    </div>
</section>

<style>
    .container{
        width: 100%;
        padding: 0 20px;
    }
    .header{
        display: flex;
        align-items: center;
        margin-bottom: 20px;
    }
    .header p{
        font-size: 1.3rem;
        font-weight: 600;
        margin-left: 10px;
    }

    .steps{
        display: flex;
        gap: 20px;
        flex-direction: column;
    }
    .step{
        display: flex;
        flex-direction: column;
        padding: 16px;
        cursor: pointer;
        justify-content: baseline;
        border:  1px solid var(--gray3);
        border-radius: 7px;
    }
    .text{
        display: flex;
    }
    .icon{
        width: 40px;
        height: 40px;
        border-radius: 50%;
        color: var(--red1);
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20px;
    }
    .step_title{
        font-size: 1rem;
        transition: all 0.3s;
        font-weight: 600;
    }
    .date{
        margin-left: auto;
        font-weight: 500;
        opacity: 0.8;
        font-size: 0.95rem;
    }
    .mobile{
        display: none;
    }
    @media screen and (max-width: 768px){
        .container{
            width: 100%;
            margin: 0;
            padding: 0;
        }
        .mobile{
            display: block;
            width: fit-content;
            margin-left: auto;
            margin-right: auto;
            margin-top: 30px;
        }
    }

</style>