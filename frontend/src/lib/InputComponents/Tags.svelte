<script lang="ts">
	import { clickOutside } from "$lib/stores/clickOutside";
	import { onMount } from "svelte";

    export let name: string = '';
    export let label: string = '';
    export let placeholder: string = '';
    export let maxlength: number = 0;
    export let required: boolean = false;
    export let fields: any = [];
    export let validateField: any = () => {}
    export let updateField: any = () => {}
    export let globalField: any = ''
    export let value: any = []
    export let error: any = []

    $: error = typeof(error) != 'string' ? error.length != 0 ? error.filter((item: any) => item != "") ? error.filter((item: any) => item != "") : [] : [] : error

    let showDropdown: boolean = false;
    $: search = ''
    let selection: any[] = value;
    const handleFocus = (e: any) => {
        showDropdown = true;
    }
    const handleSelection = (e: any, isBlur: any = false) => {
        if(e.keyCode === 13 || isBlur) {
            e.preventDefault()
            if(search == '') return
            if(!selection.find((item: any) => item === search)) {
                if(selection.length <= 5){
                    selection = [...selection, search]
                    updateField(name, [...value, search])
                    validateField(name)
                    globalField = value
                    search = ''
                }
            } 
        }
    }
    
    const handleRemove = (val: string) => {
        selection = selection.filter((item: any) => item !== val)
        updateField(name, value.filter((item: any) => item !== val))
        validateField(name)
    }
</script>

<svelte:window on:keydown={handleSelection} />
<div class="wrapper">
    <div class="label">
        <label for={name}>{label}
            {#if required}
                <span class="required">*</span>
            {/if}
        </label>
        {#if maxlength > 0}
            <span>{maxlength - fields.requirements.countries.length}</span>
        {/if}
    </div>
    <div class="input_container {error != '' ? 'errorField' : ''} ">
        <div class="inputandselection ">
            <div class="selections">
                {#each selection as option}
                <div class="selection">
                    <p>{option}</p>
                    <div on:click={() => handleRemove(option)} on:keydown={()=> handleRemove(option.value)} class="close">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4L12 12" stroke="#6A7584" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M4 12L12 4" stroke="#6A7584" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                {/each}
            <input disabled={selection.length>=5} {placeholder} type="text" bind:value={search} on:focus={handleFocus} on:blur={(e)=>handleSelection(e, true)} />
            </div>
        </div>
    </div>
    {#if error != ''}
        <p class="error">{error}</p>
    {/if}
</div>
    
<style>
    .error{
        color: var(--error);
        font-size: 0.9rem;
        font-weight: 400;
    }

    .wrapper{
        width: 100%;
        height: fit-content;
        position: relative;
    }
    .required{
        color: var(--required);
    }
    .label{
        font-size: 0.9rem;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }
    .inputandselection{
        display: flex;
        width: calc(100% - 40px);
    }
    .input_container{
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid var(--input_border);
        border-radius: 7px;
        padding: 10px;
        position: relative;
        background-color: white;
    }
    input{
        width: 100%;
    }
    input:disabled{
        display: none;
    }
    input{
        flex: 1;
        border: none;
        outline: none;
        font-size: 0.9rem;
        background-color: transparent;
        padding: 0 12px;
        border-radius: 7px;
    }
    .selections{
        display: flex;
        width: 100%;
        flex-wrap: wrap;
    }
    .selection{
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--input_border);
        border-radius: 7px;
        padding: 5px 10px;
        margin-right: 5px;
        width: fit-content;
    }
    .close{
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: var(--input_border);
        cursor: pointer;
        margin-left: 2px;
    }
    .errorField{
        border: 1px solid var(--red1);
    }
</style>