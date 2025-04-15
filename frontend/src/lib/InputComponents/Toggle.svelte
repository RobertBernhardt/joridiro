<!-- Make a toggle switch -->
<script lang="ts">
	import { countryListAllIsoData } from "../../utils/countries";
	import Input from "./Input.svelte";
	import MultipleSelect from "./MultipleSelect.svelte";
	import Tags from "./Tags.svelte";

    export let fields: any = {}
    export let name: string
    export let label: string
    export let required: boolean = false
    export let options: any = []
    export let onChange: any
    export let value: any
    export let placeholder = ''
</script>
<div class="container">
    <div class="inputwrapper">
        <p>{options[0]}</p>
        <label class="switch">
            <input {name} on:change={onChange} type="checkbox" bind:checked={value}>
            <span class="slider round"></span>
        </label>
        <p>{options[1]}</p>
    </div>
</div>

<style>
    .container{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .inputwrapper{
        width: fit-content;
        display: flex;
        justify-content: space-between;
        gap: 20px;
    }
    label{
        font-size: 0.9rem;
        font-weight: 600;
    }
    input{
        flex: 1;
        border: none;
        outline: none;
        font-size: 0.9rem;
        background-color: transparent;
        padding: 10px 16px;
        border: 1px solid var(--input_border);
        border-radius: 7px;
        margin-top: 20px;
    }
    .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 32px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--gray3);
        -webkit-transition: .4s;
        transition: .4s;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 25px;
        width: 25px;
        left: 5px;
        bottom: 3.6px;
        background-color: white;
        -webkit-transition: .4s;
        transition: .4s;
    }

    input:checked+.slider {
        background-color: var(--red1);
    }

    input:focus+.slider {
        box-shadow: 0 0 1px var(--red1);
    }

    input:checked+.slider:before {
        transform: translateX(26px);
    }

    /* Rounded sliders */
    .slider.round {
        border-radius: 34px;
    }

    .slider.round:before {
        border-radius: 50%;
    }
    @media only screen and (max-width: 768px) {
        .switch {
            width: 50px;
            height: 28px;
            min-height: 28px;
            min-width: 50px;
        }
        .slider:before {
            height: 20px;
            width: 20px;
            left: 4px;
            bottom: 4px;
        }
        input:checked+.slider:before {
            transform: translateX(22px);
        }
    }
</style>