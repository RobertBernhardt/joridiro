<script lang="ts">
    export let tags: string[]
</script>

<div class="container">
    {#each tags as tag}
        <div class="tag">
            {tag}
        </div>
    {/each}
</div>

<style>
    .container {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }

    .tag {
        background-color: var(--gray4);
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 0.9rem;
        font-weight: 600;
    }
</style>