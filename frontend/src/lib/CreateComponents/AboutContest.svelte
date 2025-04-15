<script lang="ts">
	import FileSubmit from "$lib/InputComponents/FileSubmit.svelte";
    import Input from "$lib/InputComponents/Input.svelte";
	import Tags from "$lib/InputComponents/Tags.svelte";
	import TextArea from "$lib/InputComponents/TextArea.svelte";
	import SectionHeader from "./SectionHeader.svelte";
    import { createForm } from 'svelte-forms-lib';
    import * as yup from 'yup';
    import { contestCreation } from "$lib/stores/contestCreation";
	import { createEventDispatcher } from "svelte";
	import Button from "$lib/InputComponents/Button.svelte";
	import { page } from "$app/stores";
	import { editedContest } from "$lib/stores/editContest";
    export let globalFormErrors: any;

    const dispatch = createEventDispatcher()
    const {form, handleChange, errors, touched, handleSubmit, updateField, validateField} = createForm({
        initialValues: $editedContest ? $editedContest.about_contest : {
            short_description: "",
            tags: [],
            target_audience: "",
            purpose: "",
            how_to_win:"",
            boost:""
        },
        validationSchema: yup.object().shape({
            short_description: yup.string().required("Required"),
            target_audience: yup.string(),
            purpose: yup.string(),
            how_to_win: yup.string(),
            boost: yup.string(),
            tags: yup.array().of(yup.string()).min(1, "Required").required("Required"),
        }),
        onSubmit: (values) => {
            $contestCreation.about_contest = values;
            dispatch("next", $contestCreation.step)
        }
    });
    $: $contestCreation.about_contest = $form
    $: globalFormErrors['ABOUT_CONTEST'] = $errors;

    $: if($page.url.pathname.split("/")[3] === "edit"){
        $editedContest.about_contest = $form
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <SectionHeader
        title="About the Contest"
        tooltip="Here you can add some information about the contest and your platform which makes it more attractive for potential participants to join"
    />

    <TextArea
        label="Short Description"
        name="short_description"
        placeholder="This description will be seen in your contest and in the contest browsing page"
        required = {true}
        type="text"
        onChange={handleChange}
        value={$form.short_description}
        error={$errors.short_description}
        maxlength={200}
    />

    <TextArea
        label="What is this contest for?"
        name="purpose"
        placeholder="Tell your participants about the purpose of this contest"
        required = {false}
        type="text"
        onChange={handleChange}
        value={$form.purpose}
        error={$errors.purpose}
        maxlength={600}
    />
    <TextArea
        label="Who is this contest for?"
        name="target_audience"
        placeholder="Tell your participants about your target audience"
        required = {false}
        type="text"
        onChange={handleChange}
        value={$form.target_audience}
        error={$errors.target_audience}
        maxlength={600}
    />
    <TextArea
        label="What do participants have to do to win?"
        name="how_to_win"
        placeholder="Tell your participants about the steps they have to take to win the contest"
        required = {false}
        type="text"
        onChange={handleChange}
        value={$form.how_to_win}
        error={$errors.how_to_win}
        maxlength={600}
    />
    <TextArea
        label="How do you support this contest?"
        name="boost"
        placeholder="Tell your participants about the steps you are taking to support this contest"
        required = {false}
        type="text"
        onChange={handleChange}
        value={$form.boost}
        error={$errors.boost}
        maxlength={600}
    />
    <Tags
        label="Keywords "
        name="tags"
        placeholder="Up to five keywords that describe your contest"
        required = {true}
        {validateField}
        {updateField}
        error={$errors.tags}
        value={$form.tags}
    />

    {#if $contestCreation.step == 4}
        <div class="next">
            <Button>Next Step</Button>
        </div>
    {/if}
</form>

<style>
    .next{
        margin-top: 40px;
    }
</style>