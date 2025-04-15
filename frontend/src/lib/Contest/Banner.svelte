<script lang="ts">
    export let image: string
</script>

<div class="container">
    <img src={image} alt="">
</div>

<style>
    .container {
        width: 100%;
        height: 400px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>