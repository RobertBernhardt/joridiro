<script lang="ts">
	import { page } from "$app/stores";


    const links = [
        "Status",
        "About",
        "How to score",
    ]
    export let contest: any
    if(Object.keys(contest.requirements).length > 0){
        links.push("Requirements")
    }
    if(contest.rules.length > 0){
        links.push("Rules")
    }
    if(contest.announcements.length > 0){
        links.push("Announcements")
    }
    links.push("FAQs")
    if(contest.participants.length > 0){
        links.push("Participants")
    }
    $: hash = $page.url.hash.replace('#','')
</script>

<div class="container {contest.type=="SCORE" ? 'score' : 'deadline'}">
    {#each links as link}
    <a href="#{link.toLowerCase().replaceAll(' ','_')}">
        <div class="link {link.toLowerCase().replaceAll(' ','_') == hash ? 'active' : ''}">
            {link}
        </div>
    </a>
    {/each}
</div>

<style>
    .container{
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: column;
        justify-content: center;
        z-index: 100;
    }
    a{
        text-decoration: none;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--gray1);
    }
    .link{
        width: 100%;
        padding: 8px 16px;
        gap: 10px;
        display: flex;
        align-items: center;
        background-color: #fff;
        border-radius: 7px;
        cursor: pointer;
    }
    .link:hover{
        background-color: var(--gray4);
    }
	@media only screen and (max-width: 1000px) {
		.container {
			flex-direction: row;
			justify-content: space-between;
            overflow: auto;
            gap: 15px;
		}
        .link{
            white-space: nowrap;
            background-color: var(--gray4);

        }
	}
</style>