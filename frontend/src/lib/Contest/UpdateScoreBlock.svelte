<script lang="ts">
	import { page } from "$app/stores";
	import Button from "$lib/InputComponents/Button.svelte";


	import Input from "$lib/InputComponents/Input.svelte";
	import { contest } from "$lib/stores/contests";
	import { user } from "$lib/stores/user";
	import { calcScore } from "../../utils/getTotalScore";
	import API from "../../utils/API";
	import { alert } from "$lib/Notifications/notifications";
    $: type = $contest.type
    export let criteria: any
    let updatedScore = 0
    let error = false
    let isSubmitting = false

    const updateScore = (id: string) => {
        isSubmitting = true
        // If the updatedScore is less than 0, return
        if (updatedScore < 0) {
            return error = true
        }
        API.post(`/contest/${$page.params.id}/score`, {
            score_id: id, 
            score: updatedScore 
        })
        .then(res => {
            isSubmitting = false
            $contest = res.contest
            $alert = {
                type: res.type,
                message: res.message
            }
        })
        .catch(err => {
            isSubmitting = false
            $alert = {
                type: err.type,
                message: err.message
            }
        })
    }
    $: points = $contest.participants.find((p: any) => p._id === $user._id).score.find((s: any)=>s.category === criteria._id).points
    $: value = $contest.participants.find((p: any) => p._id === $user._id).score.find((s: any)=>s.category === criteria._id).value
</script>
<div class="block">
    <div class="info">
        <div class="icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="20" fill="{type==="DEALINE" ? 'var(--green4)' : "var(--purple4)"}"/>
                <g clip-path="url(#clip0_1359_59041)">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.504 22.8787C12.5038 23.0293 12.5036 23.1799 12.5036 23.3305C12.5036 23.4682 12.5037 23.6058 12.5038 23.7434C12.504 24.0873 12.5042 24.4309 12.5031 24.7742C12.5021 25.0216 12.5057 25.268 12.5625 25.5107C12.7307 26.2279 13.1641 26.768 13.7187 27.2221C14.5005 27.8617 15.4083 28.256 16.3641 28.5482C17.6469 28.9404 18.964 29.1154 20.3015 29.1523C22.0021 29.1997 23.6786 29.0435 25.312 28.5466C26.3385 28.2346 27.3068 27.8023 28.1182 27.0773C28.8125 26.457 29.1974 25.7029 29.1724 24.7456C29.1555 24.1054 29.1594 23.4646 29.1633 22.8238C29.1651 22.5339 29.1668 22.2441 29.1667 21.9544C29.1667 21.9268 29.1671 21.8991 29.1676 21.8714C29.1689 21.7946 29.1702 21.7178 29.1614 21.6424C29.0328 20.5195 28.4838 19.669 27.5 19.1075C27.4135 19.0581 27.3812 19.0226 27.4125 18.9164C27.4745 18.7039 27.4989 18.4841 27.4984 18.2612C27.4963 17.1945 27.4969 16.1273 27.4979 15.0601C27.4979 14.8643 27.4792 14.6716 27.4349 14.4805C27.2698 13.769 26.8385 13.2346 26.2911 12.7831C25.5745 12.1919 24.7458 11.8107 23.8703 11.5232C22.5198 11.0794 21.1276 10.8877 19.7109 10.8466C17.9578 10.7956 16.2307 10.9633 14.5521 11.4956C13.5672 11.8081 12.6385 12.2362 11.8625 12.9393C11.1833 13.5544 10.8057 14.2992 10.8292 15.2414C10.8453 15.8817 10.8418 16.5228 10.8383 17.1639C10.8366 17.4729 10.8349 17.7819 10.8354 18.0909C10.8354 18.2075 10.8391 18.3252 10.8542 18.4409C10.9963 19.5336 11.551 20.3513 12.5042 20.8987C12.5927 20.9497 12.6172 20.993 12.5854 21.094C12.5187 21.306 12.5016 21.5263 12.5026 21.7492C12.5048 22.1257 12.5044 22.5022 12.504 22.8787ZM23.8104 13.2851C22.3171 12.7034 20.7567 12.5153 19.1677 12.5028C18.7895 12.4935 18.4125 12.5159 18.0369 12.5435C16.7671 12.6372 15.5255 12.8622 14.3453 13.3601C13.7677 13.6039 13.2151 13.8935 12.7921 14.3731C12.4036 14.8138 12.4088 15.1966 12.7979 15.6388C13.1125 15.9966 13.5088 16.2435 13.9302 16.4523C15.0078 16.9872 16.1599 17.2554 17.3468 17.3929C19.2125 17.6086 21.0604 17.5247 22.8781 17.0289C23.7531 16.7898 24.5948 16.4664 25.3015 15.8726C25.9984 15.2872 25.9979 14.7284 25.3099 14.1377C24.8656 13.756 24.351 13.4955 23.8104 13.2851ZM19.6536 22.4935C17.7911 22.5586 15.9703 22.3232 14.1703 21.7054C14.1994 21.9304 14.289 22.0914 14.4073 22.2388C14.688 22.5924 15.0541 22.8388 15.4468 23.0461C16.6807 23.6976 18.0177 23.97 19.3906 24.0992C20.5807 24.2112 21.7692 24.1867 22.9531 24.0205C24.0583 23.8653 25.1323 23.5992 26.1317 23.0856C26.5854 22.8528 27.0151 22.5825 27.3171 22.1565C27.5609 21.8133 27.5593 21.5086 27.3197 21.1643C27.1114 20.8648 26.8213 20.6565 26.5197 20.4601C26.4484 20.4136 26.412 20.4461 26.371 20.4827C26.3657 20.4875 26.3603 20.4923 26.3546 20.4971C25.9093 20.8726 25.4125 21.1659 24.8838 21.4054C23.2224 22.1596 21.4588 22.4304 19.6536 22.4935ZM14.1729 24.2304C14.2775 24.2821 14.3798 24.3335 14.4808 24.3842L14.4811 24.3844C14.6939 24.4913 14.901 24.5953 15.1114 24.6924C16.8875 25.5133 18.7536 25.881 20.7099 25.8367C20.8766 25.8329 21.0433 25.8309 21.2099 25.8288L21.2104 25.8288C21.7584 25.822 22.3058 25.8152 22.852 25.7481C24.4296 25.5549 25.914 25.0752 27.3109 24.319C27.3522 24.2968 27.3937 24.2752 27.4426 24.2498L27.4429 24.2496C27.4593 24.2411 27.4765 24.2322 27.4947 24.2226C27.4947 24.3123 27.4958 24.3999 27.4969 24.4862C27.4993 24.6817 27.5016 24.87 27.4911 25.0575C27.4786 25.2794 27.3567 25.4617 27.2119 25.6247C26.8093 26.0773 26.2927 26.3612 25.7484 26.6008C24.7036 27.0601 23.601 27.294 22.4729 27.4122C21.1078 27.5554 19.7448 27.5278 18.3885 27.3018C17.3005 27.1205 16.2463 26.8315 15.2812 26.2778C14.9698 26.0992 14.6807 25.8898 14.4448 25.6148C14.2546 25.394 14.1515 25.1461 14.1708 24.8476C14.179 24.7117 14.177 24.5748 14.1748 24.4325C14.1739 24.3665 14.1729 24.2993 14.1729 24.2304ZM12.5717 17.5906L12.5036 17.5549C12.5036 17.6065 12.5052 17.6552 12.5068 17.7017C12.51 17.7965 12.5129 17.8824 12.501 17.9659C12.4166 18.5648 12.7145 18.97 13.1593 19.308C13.6609 19.6893 14.2234 19.9508 14.814 20.157C16.3432 20.6914 17.925 20.8575 19.5343 20.8242C21.0125 20.7935 22.4583 20.582 23.8416 20.0372C24.4359 19.8034 25.0026 19.5153 25.4604 19.0534C25.6317 18.881 25.7937 18.6903 25.814 18.4409C25.83 18.2445 25.8262 18.0461 25.8225 17.8466V17.8464C25.8209 17.7592 25.8192 17.6717 25.8192 17.5841C25.7526 17.5845 25.7026 17.616 25.654 17.6467C25.6376 17.6571 25.6213 17.6673 25.6046 17.6763C24.2479 18.407 22.8062 18.8695 21.2781 19.0737C20.5316 19.1733 19.783 19.1751 19.0339 19.177C18.9446 19.1772 18.8554 19.1774 18.7661 19.1778C16.9614 19.1856 15.2328 18.8304 13.5828 18.0945C13.2459 17.9439 12.919 17.7726 12.5717 17.5906Z" fill="{type==="DEALINE" ? 'var(--green1)' : "var(--purple1)"}"/>
                </g>
                <defs>
                <clipPath id="clip0_1359_59041">
                <rect width="20" height="20" fill="white" transform="translate(10 10)"/>
                </clipPath>
                </defs>
                </svg>
        </div>
        <div class="point_info_wrapper">
            <div class="points">
                <p>{criteria.points} {criteria.points > 1 ? 'points': 'point'}</p>                        
            </div>
            <p class="secondary_text">For every</p>
            <div class="action">
                <p class="action">{criteria.number > 1 ? criteria.number : ''} {criteria.measuring_unit}</p>
                <div class="tooltip">
                    <div class="svg_container">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.0001 9.16699C9.77907 9.16699 9.56711 9.25479 9.41083 9.41107C9.25455 9.56735 9.16675 9.77931 9.16675 10.0003V13.3337C9.16675 13.5547 9.25455 13.7666 9.41083 13.9229C9.56711 14.0792 9.77907 14.167 10.0001 14.167C10.2211 14.167 10.4331 14.0792 10.5893 13.9229C10.7456 13.7666 10.8334 13.5547 10.8334 13.3337V10.0003C10.8334 9.77931 10.7456 9.56735 10.5893 9.41107C10.4331 9.25479 10.2211 9.16699 10.0001 9.16699ZM10.3168 5.90033C10.1139 5.81698 9.8863 5.81698 9.68342 5.90033C9.58113 5.93999 9.48767 5.99946 9.40842 6.07533C9.33481 6.15633 9.27562 6.24934 9.23342 6.35033C9.18677 6.44922 9.16394 6.55768 9.16675 6.66699C9.16612 6.77666 9.18714 6.88538 9.22861 6.98691C9.27008 7.08845 9.33118 7.18079 9.40842 7.25866C9.48942 7.33227 9.58243 7.39146 9.68342 7.43366C9.80967 7.48553 9.94672 7.50559 10.0825 7.49209C10.2184 7.47858 10.3488 7.43193 10.4623 7.35622C10.5759 7.28051 10.6691 7.17806 10.7338 7.05789C10.7985 6.93771 10.8327 6.80348 10.8334 6.66699C10.8303 6.44635 10.744 6.23502 10.5918 6.07533C10.5125 5.99946 10.419 5.93999 10.3168 5.90033ZM10.0001 1.66699C8.35191 1.66699 6.74074 2.15573 5.37033 3.07141C3.99992 3.98709 2.93182 5.28858 2.30109 6.8113C1.67036 8.33401 1.50533 10.0096 1.82687 11.6261C2.14842 13.2426 2.94209 14.7274 4.10753 15.8929C5.27297 17.0583 6.75782 17.852 8.37433 18.1735C9.99084 18.4951 11.6664 18.3301 13.1891 17.6993C14.7118 17.0686 16.0133 16.0005 16.929 14.6301C17.8447 13.2597 18.3334 11.6485 18.3334 10.0003C18.3334 8.90598 18.1179 7.82234 17.6991 6.8113C17.2803 5.80025 16.6665 4.88159 15.8926 4.10777C15.1188 3.33395 14.2002 2.72012 13.1891 2.30133C12.1781 1.88254 11.0944 1.66699 10.0001 1.66699ZM10.0001 16.667C8.68154 16.667 7.39261 16.276 6.29628 15.5435C5.19996 14.8109 4.34547 13.7697 3.84089 12.5515C3.3363 11.3334 3.20428 9.99293 3.46152 8.69972C3.71875 7.40652 4.35369 6.21863 5.28604 5.28628C6.21839 4.35393 7.40628 3.71899 8.69948 3.46176C9.99269 3.20452 11.3331 3.33654 12.5513 3.84113C13.7695 4.34571 14.8107 5.2002 15.5432 6.29652C16.2758 7.39285 16.6668 8.68178 16.6668 10.0003C16.6668 11.7684 15.9644 13.4641 14.7141 14.7144C13.4639 15.9646 11.7682 16.667 10.0001 16.667Z" fill="#6A7584"/>
                            </svg>
                    </div>
                    <span class="tooltip-text">{criteria.description}</span>
                </div>
            </div>
        </div>
    </div>
    <div class="point_stats">
        <div class="pointblock">
            <p class="label">Your value</p>
            <p class="value">{value}</p>
        </div>
        <div class="pointblock">
            <p class="label">Points you've earned</p>
            <p class="value">{points}</p>
        </div>
        <div class="pointblock">
            <p class="label">Enter a new value</p>
            <Input
                type="number"
                name="points"
                value={updatedScore}
                placeholder="New Value"
                onChange={(e)=>{
                    if(e.target){
                    updatedScore = parseInt(e.target.value);
                    }
                }
                }
                error={error?'Please enter a valid value':''}
            />
        </div>
    </div>
    <div class="btn">
        <Button disabled={isSubmitting} onClick={()=>updateScore(criteria._id)}>Update my stats</Button>
    </div>
</div>

<style>
    .block{
        width: 100%;
        padding: 25px 32px;
        border-radius: 8px;
        border: 1px solid var(--gray3);
        display: flex;
        align-items: center;
        gap: 20px;
        justify-content: space-between;
    }
    .block .info{
        display: flex;
        margin-bottom: 10px;
        gap: 5px;
        width: 100%;
        max-width: 300px;
    }
    .svg_container{
        width: 24px;
        height: 24px;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #F7F7F9;
        border-radius: 50%;
    }
    .tooltip {
        position: relative;
        display: inline-block;
        cursor: pointer;
    }

    .tooltip .tooltip-text {
        visibility: hidden;
        width: 350px;
        background-color: #000000;
        color: #fff;
        border-radius: 6px;
        position: absolute;
        z-index: 1;
        padding: 20px 20px;
        bottom: 125%;
        left: -430%;
        margin-left: -60px;
        opacity: 0;
        transition: opacity 0.3s;
    }

    .tooltip .tooltip-text::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #000 transparent transparent transparent;
    }

    .tooltip:hover .tooltip-text {
        visibility: visible;
        opacity: 1;
    }
    .action{
        display: flex;
        align-items: center;
        gap: 5px;
    }
    .action p{
        font-size: 1rem;
        font-weight: 500;
    }
    .point_info_wrapper{
        display: flex;
        flex-direction: column;
        margin-left: 15px;
    }
    .points{
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        border-radius: 7px;
        width: fit-content;
    }
    .points p{
        font-size: 1rem;
        font-weight: 600;
    }
    .point_stats{
        display: flex;
        gap: 32px;
    }
    .label{
        font-size: 1rem;
        font-weight: 500;
    }
    .value{
        font-size: 1.4rem;
        font-weight: 600;
        color: black;
        text-align: center;
    }
</style>