<div class="container">
    <div class="image">
        <img src="https://storage.googleapis.com/joridiro_resources/features2.svg" alt="">
    </div>
    <div class="text">
        <h2>Get your Platform rolling</h2>
        <p>It's hard to get a platform working. Maybe you even have solved this problem once but now you struggle with expanding your business into new markets. You know how to find your final customers with marketing. And you probably also know who could offer something on your platform and how you could reach these people. But you struggle in convincing them to come to your platform and getting active since it is unattractive for them to be first. Start a Joridiro contest and give them an offer they can't refuse!
        </p>
    </div>
</div>

<div class="container reverse">
    <div class="text">
        <h2>Incentives are everything</h2>
        <p>An online platform or marketplace is a great place to own if it's busy - and worthless if nobody is there yet. For the end customers it's clear that they need attractive offers and content. And you can reach them with normal ads and marketing. But it's much harder to convince the sellers or producers to come to a blank platform. Why should they? This egg-and-chicken problem has killed many ambitious startup projects. Joridiro offers a solution: giving your first users extraordinary incentives to get started and become active. Instead of having a first-user-disadvantage they can be a great winner. Of course the higher your prize is, the bigger the incentive effect</p>
    </div>
    <div class="image">
        <img src="https://storage.googleapis.com/joridiro_resources/features1.svg" alt="">
    </div>
</div>

<style>
    .container {
        width: 100%;
        max-width: 1670px;
        padding: 0 30px;
        height: 100%;
        display: flex;
        align-items: center;
        margin-left: auto;
        margin-right: auto;
        justify-content: space-between;
        gap: 100px;
    }

    .image {
        width: 50vw;
        min-width: 500px;
        max-width: 550px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .text {
        width: fit-content;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
    }

    .image img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .text:nth-child(2) {
        padding-right: 50px;
    }

    .text:nth-child(1) {
        padding-left: 50px;
    }

    .text h2 {
        font-size: 2.2rem;
        font-weight: 600;
        opacity: 0.8;
    }

    .text p {
        max-width: 700px;
        font-size: 1rem;
        font-weight: 500;
        opacity: 0.7;
        margin-top: 20px;
    }

    @media only screen and (max-width: 1100px) {
        .container {
            flex-direction: column;
            gap: 50px;
            justify-content: unset;
            align-items: center;
        }

        .text p {
            width: 100%;
            max-width: unset;
        }

        .container.reverse {
            display: flex;
            flex-direction: column-reverse;
        }

        .text:nth-child(2) {
            padding-right: unset;
        }

        .text:nth-child(1) {
            padding-left: unset;
        }
        .image{
            width: 100%;
            max-width: unset;
            min-width: unset;
        }
    }
</style>