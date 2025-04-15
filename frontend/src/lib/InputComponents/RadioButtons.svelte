<script lang="ts">
	import { createEventDispatcher } from "svelte";


    const dispatch = createEventDispatcher()
    export let options: Array<{name: string, description?: string, value: string}>;
    export let label: string;
    export let required: boolean
    export let value: any;
    export let error: any = {};
    export let name: string;
    export let onChange = (e: Event) => {};
    export let optionsperrow: number = 2;
    export let fields: any;
    export let updateField: any;
    export let validateField: any;
    const handleChange = (value: string) => {
        updateField(name, value);
        validateField(name);
        dispatch('change', value);
    }
</script>


<div class="wrapper">
    <!-- Radio buttons -->
    <div class="radio-buttons">
        <div class="label">
            <label for="radio-buttons">{label}
                {#if required}
                <span class="required">*</span>
            {/if}
            </label>
        </div>
        <div class="inputfield" style="grid-template-columns: repeat({optionsperrow}, 1fr)">
            {#each options as option}
                <label class="radio-button {value === option.value ? 'active' : ''}">
                    <div class="check_circle">
                        <div class="dot"></div>
                    </div>
                    <input on:change={()=>handleChange(option.value)} bind:group={value} value={option.value} type="radio" {name}>
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
    .required{
        color: var(--required);
    }
    .wrapper{
        width: 100%;
    }
    .label{
        font-size: 0.9rem;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }
    .block{
        margin-top: -3px;
    }
    .radio-button {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        padding: 16px;
        background-color: white;
        border: 1px solid var(--input_border);
        border-radius: 7px;
        position: relative;
        width: 100%;
    }
    .inputfield{
        display: grid;
        align-items: center;
        gap: 20px;
    }
    .option_name{
        font-size: 1rem;
        font-weight: 600;
    }
    .option_description{
        font-size: 0.9rem;
        color: var(--text_secondary);
    }
    input{
        width: 100%;
        height: 100%;
        position: absolute;
        margin-top: -16px;
        cursor: pointer;
        opacity: 0;
    }
    .active{
        border: 1px solid var(--red1);
        transition: all 0.2s ease-in-out;
    }
    .active .check_circle{
        border: 2px solid var(--red1);
        transition: all 0.2s ease-in-out;
    }
    .active .dot{
        background-color: var(--red1);
        transition: all 0.2s ease-in-out;
    }
    .check_circle{
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid var(--input_border);
        background-color: white;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .dot{
        width: 6px;
        height: 6px;
        border-radius: 50%;
    }
</style>