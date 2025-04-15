<script lang="ts">
    let selected: number = -1
    const steps = [
        {
            title: 'You have to create an account at the organizers platform',
            description: 'You can create an account at the organizers platform by clicking the button below. You will be redirected to the platform where you can create an account. After you have created an account, you will be redirected back to the contest page.',
        },
        {
            title: 'Join the contest',
            description: 'Join the contest by clicking the button.',
        },
        {
            title: 'Compete and score points',
            description: 'Compete and score points. The more points you score, the higher your chances of winning.',
        },
        {
            title: 'Update your score regularly',
            description: ' Update your score regularly. The more often you update your score, the more lottery tickets you will get which increases your chances of winning.',
        },
        {
            title: 'Win!',
            description: 'Get the spoils of victory!',
        }
    ]
</script>

<section id="steps_to_win" class="container">
    <div class="header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_1319_44082)">
            <path d="M19.1408 4.15373C19.3633 2.00043 19.3845 0.461426 19.3845 0.461426H4.6155C4.6155 0.461426 4.6365 2.00043 4.85919 4.15373C3.31189 4.15373 0.461426 4.15373 0.461426 4.15373V4.84604C0.461426 13.3827 6.65573 15.5413 8.72273 16.0233C9.44873 16.7909 10.3026 17.3163 11.3076 17.482V19.1537C11.3076 20.7691 7.84604 22.1537 6.46143 22.1537C6.07927 22.1537 5.76912 22.4639 5.76912 22.846C5.76912 23.2282 6.07927 23.5383 6.46143 23.5383H11.9999H17.5383C17.9205 23.5383 18.2307 23.2282 18.2307 22.846C18.2307 22.4639 17.9205 22.1537 17.5383 22.1537C16.1537 22.1537 12.6922 20.7691 12.6922 19.1537V17.482C13.6972 17.3161 14.5515 16.7911 15.2775 16.0233C17.345 15.5408 23.5383 13.3822 23.5383 4.84604V4.15373C23.5383 4.15373 20.3604 4.15373 19.1408 4.15373ZM1.86127 5.53835H5.02212C5.39089 8.33019 6.0922 11.7128 7.42258 14.1756C5.23281 13.2622 2.1052 11.006 1.86127 5.53835ZM13.322 6.48496L14.1393 8.99989L11.9999 7.44566L9.86043 8.99989L10.6776 6.48496L8.53835 4.93073H11.1827L11.9999 2.41581L12.817 4.93073H15.4614L13.322 6.48496ZM16.5774 14.1756C17.908 11.7128 18.6093 8.32996 18.9774 5.53835H22.1383C21.8946 11.006 18.767 13.2624 16.5774 14.1756Z" fill="black"/>
            </g>
            <defs>
            <clipPath id="clip0_1319_44082">
            <rect width="24" height="24" fill="white"/>
            </clipPath>
            </defs>
            </svg>
        <p>5 steps to win</p>            
    </div>
    <div class="steps">
        {#each steps as step, index}
            <div on:click={()=> selected!=index ? selected=index : selected=-1} on:keydown={()=>selected = index} class="step">
                <div class="text">
                    <div class="step_number {selected == index ? 'active' : ''}">
                        <p>{index + 1}</p>
                    </div>
                    <div class="step_title">
                        <p>{step.title}</p>
                    </div>
                </div>
                <div class="icon">
                    {#if selected != index}
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.3333 19.1666V19.6666H20.8333H25.8333C25.9217 19.6666 26.0064 19.7017 26.069 19.7642C26.1315 19.8267 26.1666 19.9115 26.1666 19.9999C26.1666 20.0883 26.1315 20.1731 26.069 20.2356C26.0064 20.2981 25.9217 20.3333 25.8333 20.3333H20.8333H20.3333V20.8333V25.8333C20.3333 25.9217 20.2981 26.0064 20.2356 26.069C20.1731 26.1315 20.0883 26.1666 19.9999 26.1666C19.9115 26.1666 19.8267 26.1315 19.7642 26.069C19.7017 26.0064 19.6666 25.9217 19.6666 25.8333V20.8333V20.3333H19.1666H14.1666C14.0782 20.3333 13.9934 20.2981 13.9309 20.2356C13.8684 20.1731 13.8333 20.0883 13.8333 19.9999C13.8333 19.9115 13.8684 19.8267 13.9309 19.7642C13.9934 19.7017 14.0782 19.6666 14.1666 19.6666H19.1666H19.6666V19.1666V14.1666C19.6666 14.0782 19.7017 13.9934 19.7642 13.9309C19.8267 13.8684 19.9115 13.8333 19.9999 13.8333C20.0883 13.8333 20.1731 13.8684 20.2356 13.9309C20.2981 13.9934 20.3333 14.0782 20.3333 14.1666V19.1666Z" fill="black" stroke="black"/>
                        </svg>
                    {:else}
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.1666 19.6667H25.8333C25.9217 19.6667 26.0064 19.7019 26.069 19.7644C26.1315 19.8269 26.1666 19.9117 26.1666 20.0001C26.1666 20.0885 26.1315 20.1733 26.069 20.2358C26.0064 20.2983 25.9217 20.3334 25.8333 20.3334H14.1666C14.0782 20.3334 13.9934 20.2983 13.9309 20.2358C13.8684 20.1733 13.8333 20.0885 13.8333 20.0001C13.8333 19.9117 13.8684 19.8269 13.9309 19.7644C13.9934 19.7019 14.0782 19.6667 14.1666 19.6667Z" fill="#EA3D09" stroke="#EA3D09"/>
                        </svg>
                    {/if}                        
                </div>
            </div>
            <div class="description {selected == index ? 'active' : ''}">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur sapiente deleniti mollitia delectus, nam dolores totam dignissimos ea laborum, eos maiores earum odit deserunt sunt reprehenderit corrupti consectetur laboriosam nesciunt.
            </div>
        {/each}
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
        flex-direction: column;
    }
    .step{
        display: flex;
        align-items: center;
        padding: 20px 0;
        justify-content: space-between;
        cursor: pointer;
        border-top:  1px solid var(--gray2);
    }
    .text{
        display: flex;
        align-items: center;
    }
    .step_number{
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
    .step_title{
        font-size: 1.1rem;
        font-weight: 600;
        transition: all 0.3s;
    }
    .description{
        height: 0px;
        overflow: hidden;
        transition: all 0.3s ease;
        opacity: 0;
    }
    .description.active{
        height: auto;
        margin-bottom: 20px;
        transition: all 0.3s ;
        opacity: 1;
    }
    .step_number.active{
        background-color: var(--red1);
        color: #ffffff;
        transition: all 0.3s;
    }
</style>