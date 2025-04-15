<script lang="ts">
    export let name: string = 'name';
    export let type: string = 'text';
    export let placeholder: string = 'Placeholder Text';
    export let error: string = '';
    export let required: boolean = false;
    export let icon_left: string = '';
    export let icon_right: string = '';
    export let maxlength: number = -1;
    export let value: any;
    export let label: string = '';
    export let hideErrorText: boolean = false;
    export let onFocus: (e: Event) => void = () => {};
	export let onChange: (e: Event) => void = () => {};
    export let onBlur: (e: Event) => void = () => {};
    export let disabled: boolean = false;
	let touched: boolean = false
    function typeAction(node: { type: string }) {
		node.type = type;
	}

    const errorValidateAction = (e: any) => {
		if (e.target.value != '') touched = true;
		if (touched) onChange;
	};

    let fieldActive = false

</script>

<div class="wrapper">
    {#if label}
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
    {/if}
    <div class="inputfield {fieldActive? 'focused' : ''} {error ? 'inputerror' : ''}">
        {#if icon_left}
            <div class="icon">
                <img src={icon_left} alt="">
            </div>
        {/if}
        <input 
            {name} 
            use:typeAction
		    on:focus={onFocus}
		    on:blur={errorValidateAction}
		    on:change={onChange}
            on:blur={onBlur}
		    on:input={touched || error ? onChange : undefined}
		    bind:value={value}
		    disabled={disabled}
            maxlength="{maxlength}"
		    autocomplete="off" type="text" {placeholder}>
        {#if icon_right}
            <div class="icon">
                <img src={icon_right} alt="">
            </div>
        {/if}
        
    </div>
    {#if  !hideErrorText}
        {#if error}
            <p class="error">{error}</p>
            {:else}
            <p>&nbsp</p>
        {/if}
    {/if}
</div>

<style>
    .wrapper{
        width: 100%;
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
    .label span:not(.required){
        color: var(--text_secondary);
    }
    .inputfield{
        display: flex;
        padding: 10px 16px;
        border: 1px solid var(--input_border);
        border-radius: 7px;
        align-items: center;
        justify-content: center;
        background-color: white;
    }
    .inputerror{
        border: 1px solid var(--error);
    }
    input{
        flex: 1;
        border: none;
        outline: none;
        font-size: 0.9rem;
        background-color: transparent;
        width: 100%;
    }
    .focused{
        border: 1px solid var(--input_focused);
    }
    .icon{
        width: 18px;
        display: flex;
    }
    .icon:nth-child(1){
        margin-right: 10px;
    }
    .icon img{
        width: 100%;
    }
    .error{
        color: var(--error);
        font-size: 0.9rem;
        font-weight: 400;
        height: 30px;
    }
</style>
