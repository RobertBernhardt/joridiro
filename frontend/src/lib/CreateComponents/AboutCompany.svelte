<script lang="ts">
	import Input from "$lib/InputComponents/Input.svelte";
    import { createForm } from 'svelte-forms-lib';
    import * as yup from 'yup';
    import { contestCreation } from "$lib/stores/contestCreation";
	import SectionHeader from "./SectionHeader.svelte";
	import { createEventDispatcher } from "svelte";
	import LogoSubmit from "$lib/InputComponents/LogoSubmit.svelte";
	import API from "../../utils/API";
	import Button from "$lib/InputComponents/Button.svelte";
	import { alert } from "$lib/Notifications/notifications";
	import { goto } from "$app/navigation";
	import { editedContest } from "$lib/stores/editContest";
	import { page } from "$app/stores";
	import Checkbox from "$lib/InputComponents/Checkbox.svelte";
    const dispatch = createEventDispatcher();
    export let globalFormErrors: any;
    const {form, handleChange, errors, touched, handleSubmit, updateField, validateField, isSubmitting} = createForm({
        initialValues: $editedContest ? $editedContest.about_company : {
            name: "",
            link: "",
            logo: '',
            description: "",
            terms: false
        },
        validationSchema: yup.object().shape({
            name: yup.string(),
            link: yup.string().url('Must be a valid URL with http(s)://'),
            logo: yup.string(),
            description: yup.string(),
            terms: yup.boolean().oneOf([true], 'You must agree to the terms and conditions')
        }),
        onSubmit: async (values) => {
            try{
                $contestCreation.about_company = values;
                const res = await API.post('/contest/create', $contestCreation)
                $alert = {
                    type: "SUCCESS",
                    message: res.message
                }
                let res2 = await API.post(`/payment/${res.contest._id}`,{})
                goto(res2.data.url)
                $contestCreation.step = 0;
            } catch(err){
                $alert = {
                    type: "ERROR",
                    message: "Something went wrong"
                }
            }
        }
    });
    const checkIfAnyError = () => {
        let hasError = false;
        // Deep check for errors using recursion
        const checkForErrors = (obj: any) => {
            for (const key in obj) {
                if (typeof obj[key] === 'object') {
                    checkForErrors(obj[key]);
                } else {
                    if (obj[key]) {
                        hasError = true;
                        break;
                    }
                }
            }
        }
        return hasError;
    }
    $: globalFormErrors['ABOUT_COMPANY'] = $errors;
    $: $contestCreation.about_company = checkIfAnyError() ? $contestCreation.ABOUT_COMPANY : $form;

    $: if($page.url.pathname.split("/")[3] === "edit"){
        $editedContest.about_company = $form
    }

    $: console.log($errors)
</script>

<div>
    <SectionHeader
        title="About the company"
        tooltip="Participants want to know something about your company to decide whether they want to join your contest"
    />
    <form on:submit={handleSubmit}>
        <LogoSubmit
            label="Add your logo"
            name="logo"
            required = {true}
            onChange={handleChange}
            error={$errors.logo}
            accept="any"
            value={$form.logo}
            title="Add files or image for your contest"
            description="Max size 10mb for one file"
            {updateField}
            {validateField}
        />
        <Input
            label="Company Name"
            name="name"
            onChange={handleChange}
            value={$form.name}
            error={$errors.name}
            placeholder="Enter your company name"
        />

        <Input
            label="Company Link"
            name="link"
            value={$form.link}
            onChange={handleChange}
            error={$errors.link}
            placeholder="Add a link to your homepage"
        />

        <Input
            label="Company Description"
            name="description"
            value={$form.description}
            onChange={handleChange}
            error={$errors.description}
            placeholder="Tell participants something about your company"
            maxlength={200}
        />
        {#if $contestCreation.step > 4}
            <Checkbox
                text="I agree to the <a style='color: blue' href='https://drive.google.com/uc?id=1ByMN54wCW3he6fz7Bylk17a1lILEJ129&export=download'>terms and conditions</a>"
                name="terms"
                value={$form.terms}
                onChange={handleChange}
                error={$errors.terms ? true : false}
            />
            <Button disabled={$isSubmitting} type="submit" onClick={handleSubmit}>Create Contest</Button>
        {/if}
    </form>
</div>

<style>
    button{
        margin-top: 40px;
        width: 100%;
        padding: 8px;
        border-radius: 7px;
        background-color: var(--red1);
        color: white;
        font-weight: 600;
        font-size: 0.9rem;
        border: none;
        cursor: pointer;
    }
</style>