<script lang="ts">
    export let fields: any
    export let errors: any
    export let name: string
    export let value: string
    export let onChange: any
    
    const options = [{
        name:"Score Contest",
        description: "First to reach the target wins",
        value: "SCORE"
    },{
        name:"Deadline Contest",
        description: "Highest Scorer wins",
        value: "DEADLINE"
    }]
</script>

<div class="wrapper {value === 'SCORE' ? 'score' : ''}">
    <!-- Radio buttons -->
    <label for={name}>Contest Type<span class="required">*</span></label>
    <div class="radio-buttons">
        <div class="inputfield">
            {#each options as option}
                <label class="radio-button {value === option.value ? 'active' : ''}">
                    <div class="check_circle">
                        <div class="dot"></div>
                    </div>
                    <input on:change={onChange} bind:group={value} value={option.value} type="radio" {name}>
                    <div class="block">
                        <p class="option_name">{option.name}</p>
                        {#if option.description}
                            <p class="option_description">{option.description}</p>
                        {/if}
                    </div>
                </label>
            {/each}
        </div>
    </div>
</div>

<style>
    .score .radio-button.active{
        background-color: var(--purple3);
        border: 1px solid var(--purple1);
    }
    .score .radio-button.active .check_circle {
        background: #fff;
    }
    .score .radio-button.active .check_circle .dot {
        background: var(--purple1);
    }
    .score .radio-button.active .check_circle  {
        border: 1px solid var(--purple1);
    }
    .required{
        color: var(--required);
        margin-left: 3px;
    }
    label{
        font-size: 0.9rem;
        font-weight: 600;
        display: flex;
        margin-bottom: 10px;
    }
    .block{
        margin-top: -3px;
        cursor: pointer;
    }
    .radio-button {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        padding: 16px;
        border: 1px solid var(--input_border);
        border-radius: 7px;
    }
    .radio-button.active {
        background-color: var(--green2);
        border: 1px solid var(--green1);
    }
    .radio-button.active .check_circle {
        background: #fff;
    }
    .radio-button.active .check_circle .dot {
        background: var(--green1);
    }
    .radio-button.active .check_circle  {
        border: 1px solid var(--green1);
    }
    .radio-button .check_circle {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 1px solid var(--input_border);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .radio-button .check_circle .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--white);
    }
    .radio-button input {
        display: none;
    }
    .radio-button .option_name {
        font-size: 1rem;
        font-weight: 600;
    }
    .radio-button .option_description {
        font-size: 0.9rem;
        opacity: 0.7;
    }
    .radio-buttons {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .inputfield {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }
    .container {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .wrapper {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    @media only screen and (max-width: 764px) {
        .inputfield {
            grid-template-columns: 1fr;
        }
    }
</style>