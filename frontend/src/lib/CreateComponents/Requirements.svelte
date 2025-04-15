<script lang="ts">
	import MultipleSelect from "$lib/InputComponents/MultipleSelect.svelte";
    import RadioButtons from "$lib/InputComponents/RadioButtons.svelte";
    import ToggleSwitch from "$lib/InputComponents/ToggleSwitch.svelte";
	import RequirementBlock from "./RequirementBlock.svelte";
    import SectionHeader from "./SectionHeader.svelte";
    import { createForm } from 'svelte-forms-lib';
    import * as yup from 'yup';
    import { contestCreation } from "$lib/stores/contestCreation";
	import { createEventDispatcher } from "svelte";
	import Tags from "$lib/InputComponents/Tags.svelte";
	import Button from "$lib/InputComponents/Button.svelte";
	import Input from "$lib/InputComponents/Input.svelte";
	import { page } from "$app/stores";
	import { editedContest } from "$lib/stores/editContest";
    export let globalFormErrors: any;
    const dispatch = createEventDispatcher()
    const {form, handleChange, errors, touched, handleSubmit, updateField, validateField, updateInitialValues} = createForm({
        initialValues: $editedContest ? {
                countriesFieldExists: $editedContest.requirements.countries?.length > 0 ? true : false,
                categoryFieldExists: $editedContest.requirements.categories?.length > 0 ? true : false,
                roleFieldExists: $editedContest.requirements.roles?.length > 0 ? true : false,
                categories: $editedContest.requirements.categories,
                countries: $editedContest.requirements.countries,
                additional: $editedContest.requirements.additional.map((requirement: any) => {
                    return {
                        name: requirement.name,
                        description: requirement.description,
                        editable: false,
                        showCancelBtn: false
                    }
                }),
                roles: $editedContest.requirements.roles
        } : {
                countriesFieldExists: true,
                categoryFieldExists: true,
                roleFieldExists: true,
                categories: [],
                countries: [],
                additional: [
                    
                ],
                roles: []
        },
        validationSchema: yup.object().shape({
                countriesFieldExists: yup.boolean().required("Required"),
                roleFieldExists: yup.boolean().required("Required"),
                roles: yup.array().of(yup.string()).when('roleFieldExists', {
                    is: true,
                    then: yup.array().of(yup.string()).required("Required").min(1, "Required")
                }),
                categoryFieldExists: yup.boolean().required("Required"),
                categories: yup.array().of(yup.string()).when('categoryFieldExists', {
                    is: true,
                    then: yup.array().of(yup.string()).required("Required").min(1, "Required")
                }),
                countries: yup.array().of(yup.string()).when('countriesFieldExists', {
                    is: true,
                    then: yup.array().of(yup.string()).required("Required").min(1, "Required")
                }),
                additional: yup.array().of(
                    yup.object().shape({
                        name: yup.string().required("Required"),
                        description: yup.string().required("Required"),
                        editable: yup.boolean(),
                        showCancelBtn: yup.boolean()
                    })
                )
        }),
        onSubmit: (values) => {
            $contestCreation.requirements = values
            dispatch("next", $contestCreation.step)
        }
    });
    $: $contestCreation.requirements = $form

    const save = (value: any, index: number) => {
        if($form.additional.length > 1) {
            updateField('additional', [...$form.additional.slice(0, index), value, ...$form.additional.slice(index + 1)])
            
        } else {
            updateField('additional', [value])
        }
    }

    const edit = (index: number) => {
        let requirement: any = $form.additional[index]
        requirement.editable = true
        requirement.showCancelBtn = true
        save(requirement, index)
    }
    const cancel = (index: number) => {
        let rules: any = $form.additional[index]
        rules.editable = false
        rules.showCancelBtn = false
        save(rules, index)
    }
    const add = () => {
        let rules = {
            name: "",
            description: "",
            editable: true,
            showCancelBtn: false
        }
        updateField('additional', [...$form.additional, rules])
    }

    const deleteRequirement = (index: number) => {
            updateField('additional', [...$form.additional.slice(0, index), ...$form.additional.slice(index + 1)])
    }
    $: $contestCreation.requirements = $form
    $: globalFormErrors['REQUIREMENTS'] = $errors;

    $: if($page.url.pathname.split("/")[3] === "edit"){
        $editedContest.requirements = $form
    }
</script>
<form on:submit|preventDefault={handleSubmit}>
<SectionHeader 
    title="Requirements"
    tooltip="Set requirements to exclude specific participants from joining your contest. If you find that someone joined your contest but didn't fulfill the requirements you can exclude him from the contest"
/>

<div class="container">
    <div class="block" style="margin-top: -30px;">
        <ToggleSwitch
            label="Are there specific categories that the participants need to be focused on?"
            name="categoryFieldExists"
            required={true}
            onChange={handleChange}
            placeholder="Enter the demographic"
            fields={$form}
            error={$errors.categoryFieldExists}
            value={$form.categoryFieldExists}
        />
        {#if $form.categoryFieldExists}
            <Tags
                name="categories"
                placeholder="e.g. Food Trucks, Fast Food etc"
                value={$form.categories}
                updateField={updateField}
                validateField={validateField}
                error={$errors.categories}
                globalField={$contestCreation.requirements}
            />
        {/if}
    </div>
    <div class="block">
        <ToggleSwitch
            label="Do you want to limit participants to specific regions?"
            name="countriesFieldExists"
            required={true}
            onChange={handleChange}
            placeholder="Enter the demographic"
            fields={$form}
            error={$errors.countriesFieldExists}
            value={$form.countriesFieldExists}
        />
        {#if $form.countriesFieldExists}
            <Tags
                name="countries"
                placeholder="e.g. London-Soho, Bavaria etc"
                value={$form.countries}
                updateField={updateField}
                validateField={validateField}
                error={$errors.countries}
            />
        {/if}
    </div>
    <div>
        <ToggleSwitch
            label="Do participants need to have certain roles to be able to participates in your contest?"
            name="roleFieldExists"
            required={true}
            onChange={handleChange}
            placeholder="e.g. CEO, CTO, etc."
            fields={$form}
            error={$errors.roleFieldExists}
            value={$form.roleFieldExists}
        />
        {#if $form.roleFieldExists}
            <Tags
                name="roles"
                placeholder="e.g. Restaurant Owner, Shop Owner etc"
                value={$form.roles}
                updateField={updateField}
                validateField={validateField}
                error={$errors.roles}
            />
        {/if}
    </div>
    {#each $form.additional as requirement, i}
    {#if !requirement.editable}
        <div class="additionalblock">
            <div class="text">
                <p class="label">{requirement.name}</p>
                <p class="value">{requirement.description}</p>
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
{#each $form.additional as requirement, i}
    {#if requirement.editable}
        <RequirementBlock 
        index={i}
        value={requirement}
        deleteRequirement={deleteRequirement}
        {save}
        {cancel}
        />
    {/if}
{/each}

<div style="margin-top: -30px">
<div class="addMethodBtn">
    <Button showLoaderOnDisable={false} type="button" onClick={add} disabled={$form.additional.length==3} style="style3">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.334 9.16658V9.66658H10.834H15.834C15.9224 9.66658 16.0072 9.7017 16.0697 9.76422C16.1322 9.82673 16.1673 9.91151 16.1673 9.99992C16.1673 10.0883 16.1322 10.1731 16.0697 10.2356C16.0072 10.2981 15.9224 10.3333 15.834 10.3333H10.834H10.334V10.8333V15.8333C10.334 15.9217 10.2989 16.0064 10.2364 16.069C10.1738 16.1315 10.0891 16.1666 10.0007 16.1666C9.91224 16.1666 9.82746 16.1315 9.76495 16.069C9.70244 16.0064 9.66732 15.9217 9.66732 15.8333V10.8333V10.3333H9.16732H4.16732C4.07891 10.3333 3.99413 10.2981 3.93162 10.2356C3.8691 10.1731 3.83398 10.0883 3.83398 9.99992C3.83398 9.91151 3.8691 9.82673 3.93162 9.76422C3.99413 9.7017 4.07891 9.66658 4.16732 9.66658H9.16732H9.66732V9.16658V4.16659C9.66732 4.07818 9.70244 3.9934 9.76495 3.93088C9.82746 3.86837 9.91225 3.83325 10.0007 3.83325C10.0891 3.83325 10.1738 3.86837 10.2364 3.93088C10.2989 3.9934 10.334 4.07818 10.334 4.16659V9.16658Z" fill="#EA3D09" stroke="#EA3D09"/>
        </svg>
        <p>Add Requirements</p>
    </Button>
</div>
    {#if $contestCreation.step == 3}
        <div class="next">
                <Button>Next Step</Button>
        </div>
    {/if}
</div>
</div>
</form>
<style>
    .next, .addMethodBtn{
        margin-top: 40px;
    }
    .container{
        display: flex;
        flex-direction: column;
        gap: 30px;
        margin-top: 60px;
    }
    .additionalblock{
        display: flex;
        padding: 16px 24px;
        border: 1px solid var(--gray3);
        border-radius: 7px;
        gap: 20px;
    }
    .label{
        font-weight: 600;
    }
    .text{
        width: 100%;
    }
    button{
        width: fit-content;
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
</style>