<script lang="ts">
	import { clickOutside } from "$lib/stores/clickOutside";

    export let validateField: any;
    export let name: string = '';
    export let label: string = '';
    export let maxlength: number = 0;
    export let required: boolean = false;
    export let value: any;
    export let fields: any = [];
    export let updateField: any;
    export let options: any = [];
    export let error: any = '';
    let showDropdown: boolean = false;
    $: filteredList = options
    $: search = ''
    let selection: any[] = [];
    const handleFocus = (e: any) => {
        showDropdown = true;
    }
    const handleSelection = (val: string, label: string) => {
        if(!selection.find((item: any) => item.value === val)) {
            // Avoid duplicates using sets
            selection = [...selection, {value: val, label: label}];
            updateField('countries', [...value, val])
            validateField('countries')
        } else {
            selection = selection.filter((item: any) => item.value !== val);
            updateField('countries', value.filter((item: any) => item !== val))
            validateField('countries')
        }
    }
    
    const handleRemove = (val: string) => {
        selection = selection.filter((item: any) => item.value !== val);
        updateField('countries', value.filter((item: any) => item !== val))
        validateField('countries')
    }
    $: if(search.length > 0) {
        filteredList = options.filter((item: any) => item.label.toLowerCase().includes(search.toLowerCase()));
    } else {
        filteredList = options;
    }
    const handleClickOutside = () => {
        showDropdown = false;
    }
</script>

<div use:clickOutside on:click_outside={handleClickOutside} class="wrapper">
    <div class="label">
        <label for={name}>{label}
            {#if required}
                <span class="required">*</span>
            {/if}
        </label>
        {#if maxlength > 0}
            <span>{maxlength - value.length}</span>
        {/if}
    </div>
    <div class="input_container">
        <div class="inputandselection">
            <div class="selections">
                {#each selection as option}
                <div class="selection">
                    <p>{option.label}</p>
                    <div on:click={() => handleRemove(option.value)} on:keydown={()=> handleRemove(option.value)} class="close">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4L12 12" stroke="#6A7584" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M4 12L12 4" stroke="#6A7584" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                {/each}
            <input type="text" bind:value={search} on:focus={handleFocus} name={name} />
            </div>
        </div>
        <div class="dropdown_icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L8 10L12 6" stroke="#6A7584" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
    </div>
    <div class="dropdown {showDropdown ? 'active' : ''}">
        {#each filteredList as option}
            <label class="dropdown_item">
                <input checked={false} value={option.value} on:change={()=> handleSelection(option.value, option.label)} type="checkbox">
                <p class={selection.find(
                    (item) => item.value === option.value
                ) ? 'selected' : ''}>{option.label}</p>
            </label>
        {/each}
    </div>
    <p class="error">{error}</p>
</div>
    
<style>
    .error{
        color: var(--error);
        font-size: 0.9rem;
        font-weight: 400;
        height: 30px;
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
    }
    input{
        width: 100%;
    }
    .dropdown_icon{
        display: flex;
    }
    input{
        flex: 1;
        border: none;
        outline: none;
        font-size: 0.9rem;
        background-color: transparent;
        padding: 5px 16px;
        border-radius: 7px;
    }
    input[type="checkbox"]{
        flex: 0;
        position: absolute;
        width: 1px;
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
    .selected{
        font-weight: 600;
        color: var(--red1);
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
    .dropdown{
        position: absolute;
        bottom: 100%;
        left: 0;
        width: 100%;
        background-color: white;
        border: 1px solid var(--input_border);
        border-radius: 7px;
        z-index: 1;
        display: none;
        width: 100%;
        height: 400px;
        overflow-y: scroll;
        padding: 5px;
    }
    .dropdown.active{
        display: block;
    }
    .dropdown_item{
        display: flex;
        padding: 10px 20px;
        gap: 20px;
        border-radius: 7px;
        cursor: pointer;
    }
    .dropdown_item:hover{
        background-color: var(--gray4);
    }
</style>