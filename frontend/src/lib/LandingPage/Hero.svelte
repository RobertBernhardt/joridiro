<script>
	import Button from "$lib/InputComponents/Button.svelte";

</script>
<div class="hero">
	<div class="background">
	</div>
    <div class="text">
        <h1>Create the extra boost for your project</h1>
        <p>Collect entries, incentivize participants, and select random winners</p>
        <div class="cta"> 
            <Button>Create an account</Button>
        </div>
    </div>
</div>

<style>
	.hero {
		width: 100%;
		height: 120vh;
	}
    .hero .background{
        width: 100%;
        height: 100%;
        background-image: url("https://storage.googleapis.com/joridiro_resources/hero.svg");
        background-size: cover;
        background-position: bottom;
        background-repeat: no-repeat;
        
    }
    .text{
        position: absolute;
        top: 30%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: white;
        width: 45%;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .text h1{
        font-size: 4rem;
        font-weight: 500;
        line-height: 70px;
    }
    .cta{
        width: fit-content;
        margin-left: auto;
        margin-right: auto;
    }
    @media only screen and (max-width: 1260px) {
        .text{
            width: 60%;
        }
        .text h1{
            font-size: 3.2rem;
            line-height: 50px;
        }
    }
    @media only screen and (max-width: 800px) {
        .text{
            width: 100%;
            padding: 0 20px;
        }
        .text h1{
            font-size: 2.5rem;
            line-height: 50px;

        }
    }
</style>
