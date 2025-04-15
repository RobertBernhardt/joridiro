<script lang="ts">
	import Button from "$lib/InputComponents/Button.svelte";
	import RuleBlock from "./RuleBlock.svelte";
    import ScoreBlock from "./ScoreBlock.svelte";
    import SectionHeader from "./SectionHeader.svelte";
    import { createForm } from 'svelte-forms-lib';
    import * as yup from 'yup';
	import { contestCreation } from "$lib/stores/contestCreation";
	import { createEventDispatcher } from "svelte";
	import { editedContest } from "$lib/stores/editContest";
	import { page } from "$app/stores";
    export let globalFormErrors: any;
    const dispatch = createEventDispatcher()

    const {form, handleChange, errors, touched, handleSubmit, updateField, validateField} = createForm({
        initialValues: {
            rules: $editedContest ? $editedContest.rules.map((rule: string)=>{
                return {
                    name: rule,
                    editable: false,
                    showCancelBtn: false
                }
            }) : [
                {
                    name: "",
                    editable: true,
                    showCancelBtn: false
                }
            ]
        },
        validationSchema: yup.object().shape({
            rules: yup.array().of(
                yup.object().shape({
                    name: yup.string(),
                    editable: yup.boolean(),
                    showCancelBtn: yup.boolean()
                })
            )
        }),
        onSubmit: (values) => {
                values.rules = values.rules.map((rule: any) => {
                    delete rule.editable
                    delete rule.showCancelBtn
                    return rule
                })
                $contestCreation.rules = values.rules.map((rule: any) => {
                    return rule.name
                })
                dispatch("next", $contestCreation.step)
        }
    });

    const save = (value: any, index: number) => {
        if($form.rules.length > 1) {
            updateField('rules', [...$form.rules.slice(0, index), value, ...$form.rules.slice(index + 1)])
        } else {
            updateField('rules', [value])
        }
        $contestCreation.rules = $form.rules.map((rule: any) => {
            return rule.name
        })
    }

    const edit = (index: number) => {
        let rules = $form.rules[index]
        rules.editable = true
        rules.showCancelBtn = true
        save(rules, index)
    }
    const cancel = (index: number) => {
        let rules = $form.rules[index]
        rules.editable = false
        rules.showCancelBtn = false
        save(rules, index)
    }
    const add = () => {
        let rules = {
            name: "",
            editable: true,
            showCancelBtn: false
        }
        updateField('rules', [...$form.rules, rules])
    }

    const deleterules = (index: number) => {
            updateField('rules', [...$form.rules.slice(0, index), ...$form.rules.slice(index + 1)])
            $contestCreation.rules = $form.rules.map((rule: any) => {
                return rule.name
            })
    }

    $: $contestCreation.rules = $form.rules.map((rule: any) => {
        return rule.name
    })
    $: globalFormErrors['rules'] = $errors;

    $: if($page.url.pathname.split("/")[3] === "edit"){
        $editedContest.rules = $form.rules
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
<SectionHeader 
    title="Rules"
    tooltip="Define the rules for your contest. When participants break the rules you can exclude them from your contest"
/>

<div class="score">
    {#each $form.rules as rule, i}
            {#if !rule.editable}
                <div class="block">
                    <div class="icon">
                        <svg width="8" height="18" viewBox="0 0 8 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.145455 8.68645C0.145455 8.02065 0.277056 7.45548 0.54026 6.99097C0.817316 6.52645 1.13593 6.15484 1.4961 5.87613C1.06667 5.56645 0.734199 5.19484 0.498701 4.76129C0.263204 4.32774 0.145455 3.82452 0.145455 3.25161C0.145455 2.27613 0.519481 1.49419 1.26753 0.905807C2.02944 0.301936 3.02684 0 4.25974 0C4.95238 0 5.59654 0.0929034 6.19221 0.27871C6.78788 0.449032 7.3697 0.673548 7.93766 0.952258L7.10649 3.11226C6.64935 2.86452 6.17836 2.64774 5.69351 2.46194C5.22251 2.26064 4.72381 2.16 4.1974 2.16C3.64329 2.16 3.24156 2.24516 2.99221 2.41548C2.74286 2.58581 2.61818 2.84903 2.61818 3.20516C2.61818 3.4529 2.69437 3.67742 2.84675 3.87871C2.99913 4.08 3.23463 4.27355 3.55325 4.45936C3.87186 4.64516 4.28052 4.85419 4.77922 5.08645C5.4303 5.36516 5.99134 5.69032 6.46234 6.06194C6.94719 6.41806 7.32121 6.82839 7.58442 7.2929C7.86147 7.75742 8 8.29935 8 8.91871C8 9.41419 7.94459 9.84774 7.83377 10.2194C7.7368 10.591 7.59134 10.9084 7.3974 11.1716C7.20346 11.4348 6.98182 11.6594 6.73247 11.8452C7.14805 12.1394 7.45974 12.4877 7.66753 12.8903C7.88918 13.2929 8 13.7729 8 14.3303C8 15.4452 7.59827 16.3355 6.79481 17.0013C5.99134 17.6671 4.9039 18 3.53247 18C2.79827 18 2.14026 17.9226 1.55844 17.7677C0.990476 17.6129 0.470996 17.3884 0 17.0942V14.7484C0.360173 14.9497 0.741126 15.1355 1.14286 15.3058C1.55844 15.4761 1.97403 15.6155 2.38961 15.7239C2.8052 15.8168 3.18615 15.8632 3.53247 15.8632C4.29437 15.8632 4.81385 15.7394 5.09091 15.4916C5.36797 15.2284 5.50649 14.911 5.50649 14.5394C5.50649 14.2761 5.45108 14.0516 5.34026 13.8658C5.24329 13.68 5.04242 13.4942 4.73766 13.3084C4.44675 13.1071 4.00346 12.8671 3.40779 12.5884C2.71515 12.2632 2.12641 11.9381 1.64156 11.6129C1.15671 11.2723 0.782684 10.8697 0.519481 10.4052C0.27013 9.94065 0.145455 9.36774 0.145455 8.68645ZM2.41039 8.43097C2.41039 8.74065 2.49351 9.0271 2.65974 9.29032C2.82597 9.55355 3.08225 9.80903 3.42857 10.0568C3.78874 10.289 4.23203 10.529 4.75844 10.7768L4.9039 10.8465C5.09784 10.6761 5.27792 10.4594 5.44416 10.1961C5.61039 9.9329 5.69351 9.60774 5.69351 9.22064C5.69351 8.91097 5.62424 8.62452 5.48571 8.36129C5.36104 8.09806 5.12554 7.85032 4.77922 7.61806C4.44675 7.37032 3.96191 7.12258 3.32468 6.87484C3.08918 6.98323 2.87446 7.17677 2.68052 7.45548C2.50043 7.71871 2.41039 8.04387 2.41039 8.43097Z" fill="black"/>
                        </svg>
                    </div>
                    <div class="text">
                        <p class="label">{rule.name}</p>
                    </div>
                    
                    <div on:click={()=>edit(i)} on:keydown={()=>edit(i)} class="edit">
                        <svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_1579_101896)">
                            <path d="M14.166 6.49993C14.3849 6.28106 14.6447 6.10744 14.9307 5.98899C15.2167 5.87054 15.5232 5.80957 15.8327 5.80957C16.1422 5.80957 16.4487 5.87054 16.7347 5.98899C17.0206 6.10744 17.2805 6.28106 17.4993 6.49993C17.7182 6.7188 17.8918 6.97863 18.0103 7.2646C18.1287 7.55057 18.1897 7.85706 18.1897 8.16659C18.1897 8.47612 18.1287 8.78262 18.0103 9.06859C17.8918 9.35455 17.7182 9.61439 17.4993 9.83326L6.24935 21.0833L1.66602 22.3333L2.91602 17.7499L14.166 6.49993Z" stroke="#6A7584" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </g>
                            <defs>
                            <clipPath id="clip0_1579_101896">
                            <rect width="20" height="20" fill="white" transform="translate(0 4)"/>
                            </clipPath>
                            </defs>
                            </svg>
                    </div>
                </div>
            {/if}
        {/each}
    {#each $form.rules as rule, i}
    {#if rule.editable}
        <RuleBlock
            index={i}
            value={$form.rules[i]}
            deleteRules={deleterules}
            {save}
            {cancel}
        />
    {/if}
    {/each}
</div>
<div class="addMethodBtn">
    <Button showLoaderOnDisable={false} type="button" onClick={add} disabled={$form.rules.length==3} style="style3">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.334 9.16658V9.66658H10.834H15.834C15.9224 9.66658 16.0072 9.7017 16.0697 9.76422C16.1322 9.82673 16.1673 9.91151 16.1673 9.99992C16.1673 10.0883 16.1322 10.1731 16.0697 10.2356C16.0072 10.2981 15.9224 10.3333 15.834 10.3333H10.834H10.334V10.8333V15.8333C10.334 15.9217 10.2989 16.0064 10.2364 16.069C10.1738 16.1315 10.0891 16.1666 10.0007 16.1666C9.91224 16.1666 9.82746 16.1315 9.76495 16.069C9.70244 16.0064 9.66732 15.9217 9.66732 15.8333V10.8333V10.3333H9.16732H4.16732C4.07891 10.3333 3.99413 10.2981 3.93162 10.2356C3.8691 10.1731 3.83398 10.0883 3.83398 9.99992C3.83398 9.91151 3.8691 9.82673 3.93162 9.76422C3.99413 9.7017 4.07891 9.66658 4.16732 9.66658H9.16732H9.66732V9.16658V4.16659C9.66732 4.07818 9.70244 3.9934 9.76495 3.93088C9.82746 3.86837 9.91225 3.83325 10.0007 3.83325C10.0891 3.83325 10.1738 3.86837 10.2364 3.93088C10.2989 3.9934 10.334 4.07818 10.334 4.16659V9.16658Z" fill="#EA3D09" stroke="#EA3D09"/>
        </svg>
        <p>Add Rule</p>
    </Button>
</div>
    {#if $contestCreation.step == 2}
        <div class="next">
                <Button>Next Step</Button>
        </div>
    {/if}
</form>

<style>
    .next, .addMethodBtn{
        margin-top: 40px;
    }
    .block{
        display: flex;
        padding: 16px 24px;
        border: 1px solid var(--gray3);
        border-radius: 7px;
        gap: 20px;
        align-items: center;
    }
    .error{
        color: var(--red1);
        background-color: var(--red4);
        border-radius: 7px;
        padding: 4px 24px;
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 10px;
    }
    .icon{
        width: 40px;
        min-width: 40px;
        height: 40px;
        background-color: var(--gray4);
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
    }
    .label{
        font-weight: 600;
    }
    .text{
        width: 100%;
    }
    button{
        padding: 8px 18px;
        display: flex;
        gap: 6px;
        font-weight: 600;
        font-size: 0.9rem;
        outline: none;
        border: none;
        border-radius: 7px;
        margin-top: 20px;
        cursor: pointer;
    }
    button:disabled{
        opacity: 1;
        cursor: not-allowed;
    }
    button:disabled svg{
        opacity: 0.4;
    }
    .score{
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
</style>