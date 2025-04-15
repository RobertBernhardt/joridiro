<script lang="ts">
	import { page } from "$app/stores";
	import Input from "$lib/InputComponents/Input.svelte";
	import { alert } from "$lib/Notifications/notifications";
	import API from "../../utils/API";
    import { createForm } from 'svelte-forms-lib';
    import * as yup from 'yup';
	import Button from "$lib/InputComponents/Button.svelte";
	import { contest } from "$lib/stores/contests";

    export let announcement: any
    let editable = false
    $: announcementLocalText = announcement.announcement

    const saveAnnouncement = async () => {
        if(announcementLocalText == announcement.announcement || announcementLocalText == "") return
        editable = false
        try{
            let res = await API.post(`/contest/${$page.params.id}/announce/${announcement._id}/edit`, {announcement: announcementLocalText})
            $contest = res.data
        } catch(err: any){
            $alert = {
                type: 'ERROR',
                message: err.response.data.message
            }
        }
    }
    const cancelAnnouncement = () => {
        editable = false
        announcementLocalText = announcement.announcement
    }
    const deleteAnnouncement = async () => {
        try{
            let res = await API.post(`/contest/${$page.params.id}/announce/${announcement._id}/delete`, {announcement: announcementLocalText})
            $contest = res.data
            editable = false
        } catch(err: any){
            $alert = {
                type: 'ERROR',
                message: err.response.data.message
            }
        }
    }
</script>

{#if editable}
<div class="announcement">
    <div class="icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2H8.00001C7.20436 2 6.4413 2.31607 5.87869 2.87868C5.31608 3.44129 5.00001 4.20435 5.00001 5V21C4.99931 21.1762 5.04518 21.3495 5.13299 21.5023C5.22079 21.655 5.3474 21.7819 5.50001 21.87C5.65203 21.9578 5.82447 22.004 6.00001 22.004C6.17554 22.004 6.34799 21.9578 6.50001 21.87L12 18.69L17.5 21.87C17.6524 21.9564 17.8248 22.0012 18 22C18.1752 22.0012 18.3476 21.9564 18.5 21.87C18.6526 21.7819 18.7792 21.655 18.867 21.5023C18.9548 21.3495 19.0007 21.1762 19 21V5C19 4.20435 18.6839 3.44129 18.1213 2.87868C17.5587 2.31607 16.7957 2 16 2ZM17 19.27L12.5 16.67C12.348 16.5822 12.1755 16.536 12 16.536C11.8245 16.536 11.652 16.5822 11.5 16.67L7.00001 19.27V5C7.00001 4.73478 7.10536 4.48043 7.2929 4.29289C7.48044 4.10536 7.73479 4 8.00001 4H16C16.2652 4 16.5196 4.10536 16.7071 4.29289C16.8947 4.48043 17 4.73478 17 5V19.27Z" fill="#4CBB25"/>
            </svg>
    </div>
    <div class="text">
        <form class="inputField">
            <Input
                name="announcement"
                type="text"
                placeholder="Announcement"
                value={announcementLocalText}
                onChange={(e) => announcementLocalText = e.target.value}
                error={announcementLocalText == "" ? "Announcement cannot be empty" : ""}
            />
            <div class="button_group">
                <div class="btn">
                    <Button onClick={saveAnnouncement} style="style1" type="button">Save</Button>
                    <Button onClick={cancelAnnouncement} style="style3" type="button">Cancel</Button>
                </div>
                <div class="last_btn">
                    <Button onClick={deleteAnnouncement} style="style4" type="button">Delete</Button>
                </div>
            </div>
        </form>
    </div>
    <div on:click={() => editable = true} on:keydown={() => editable = true} class="edit_icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_1579_99730)">
            <path d="M14.167 2.49993C14.3859 2.28106 14.6457 2.10744 14.9317 1.98899C15.2176 1.87054 15.5241 1.80957 15.8337 1.80957C16.1432 1.80957 16.4497 1.87054 16.7357 1.98899C17.0216 2.10744 17.2815 2.28106 17.5003 2.49993C17.7192 2.7188 17.8928 2.97863 18.0113 3.2646C18.1297 3.55057 18.1907 3.85706 18.1907 4.16659C18.1907 4.47612 18.1297 4.78262 18.0113 5.06859C17.8928 5.35455 17.7192 5.61439 17.5003 5.83326L6.25033 17.0833L1.66699 18.3333L2.91699 13.7499L14.167 2.49993Z" stroke="#6A7584" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <defs>
            <clipPath id="clip0_1579_99730">
            <rect width="20" height="20" fill="white"/>
            </clipPath>
            </defs>
            </svg>
    </div>
    </div>

    {:else}
    <div class="announcement">
        <div class="icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2H8.00001C7.20436 2 6.4413 2.31607 5.87869 2.87868C5.31608 3.44129 5.00001 4.20435 5.00001 5V21C4.99931 21.1762 5.04518 21.3495 5.13299 21.5023C5.22079 21.655 5.3474 21.7819 5.50001 21.87C5.65203 21.9578 5.82447 22.004 6.00001 22.004C6.17554 22.004 6.34799 21.9578 6.50001 21.87L12 18.69L17.5 21.87C17.6524 21.9564 17.8248 22.0012 18 22C18.1752 22.0012 18.3476 21.9564 18.5 21.87C18.6526 21.7819 18.7792 21.655 18.867 21.5023C18.9548 21.3495 19.0007 21.1762 19 21V5C19 4.20435 18.6839 3.44129 18.1213 2.87868C17.5587 2.31607 16.7957 2 16 2ZM17 19.27L12.5 16.67C12.348 16.5822 12.1755 16.536 12 16.536C11.8245 16.536 11.652 16.5822 11.5 16.67L7.00001 19.27V5C7.00001 4.73478 7.10536 4.48043 7.2929 4.29289C7.48044 4.10536 7.73479 4 8.00001 4H16C16.2652 4 16.5196 4.10536 16.7071 4.29289C16.8947 4.48043 17 4.73478 17 5V19.27Z" fill="#4CBB25"/>
                </svg>
        </div>
        <div class="text">
            <p>{announcementLocalText}</p>
            <p class="date">- {new Date(announcement.date).toLocaleDateString(
                'en-US',
                {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }
           )}</p>
        </div>
        <div on:keydown={() => editable = true} on:click={() => editable = true} class="edit_icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_1579_99730)">
                <path d="M14.167 2.49993C14.3859 2.28106 14.6457 2.10744 14.9317 1.98899C15.2176 1.87054 15.5241 1.80957 15.8337 1.80957C16.1432 1.80957 16.4497 1.87054 16.7357 1.98899C17.0216 2.10744 17.2815 2.28106 17.5003 2.49993C17.7192 2.7188 17.8928 2.97863 18.0113 3.2646C18.1297 3.55057 18.1907 3.85706 18.1907 4.16659C18.1907 4.47612 18.1297 4.78262 18.0113 5.06859C17.8928 5.35455 17.7192 5.61439 17.5003 5.83326L6.25033 17.0833L1.66699 18.3333L2.91699 13.7499L14.167 2.49993Z" stroke="#6A7584" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
                <defs>
                <clipPath id="clip0_1579_99730">
                <rect width="20" height="20" fill="white"/>
                </clipPath>
                </defs>
                </svg>
        </div>
    </div>
{/if}

<style>
    .button_group{
        display: flex;
        gap: 10px;
        width: fit-content;
        width: 100%;
    }
    .btn{
        display: flex;
        width: fit-content;
        gap: 10px;
    }
    .last_btn{
        margin-left: auto;
    }
    .announcement{
		padding: 24px;
		border-radius: 7px;
		margin-top: 30px;
		font-weight: 600;
		display: flex;
		align-items: flex-start;
		border: 1px solid var(--gray3);
		gap: 20px;
	}
	.text{
		display: flex;
		flex-direction: column;
		margin-top: -4px;
		width: 100%;
	}
	.date{
		font-size: 0.95rem;
		opacity: 0.8;
		width: fit-content;
		margin-left: auto;
	}


</style>