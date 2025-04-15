<script lang="ts">
	import Button from "$lib/InputComponents/Button.svelte";
import Input from "$lib/InputComponents/Input.svelte";
	import RadioButtons from "$lib/InputComponents/RadioButtons.svelte";
	import { contestCreation } from "$lib/stores/contestCreation";
    import { createForm } from 'svelte-forms-lib';
    import * as yup from 'yup';

    export let save: any
    export let index: any
    export let value: any
    export let deleteQuestion: any
    export let cancel: any
    export let edit: boolean = false
    
    const {form, handleChange, errors, touched, handleSubmit, isValid, updateField ,validateField, updateInitialValues} = createForm({
        initialValues: {
            isRequired: value.isRequired,
            question: value.question,
            numAnswers: value.numAnswers,
            answers: value.answers,
            editable: false,
            showCancelBtn: value.showCancelBtn
        },
        validationSchema: yup.object().shape({
            isRequired: yup.boolean(),
            question: yup.string().required("Question is required"),
            numAnswers: yup.string().required("Number of answers is required"),
            answers: yup.array().of(yup.string().required("Answer is required"))
        }),
        onSubmit: async (values) => {
            save(values, index)
            $contestCreation.questions[index] = values
        }
    });
    const update = (value: any) => {
        // Make sure the number of answers is equal to the number of answers in the array. If no answers are present, add empty strings to the array. Value is a number
        if(value > $form.answers.length) {
            let diff = value - $form.answers.length
            let newAnswers = [...$form.answers]
            for(let i = 0; i < diff; i++) {
                newAnswers.push("")
            }
            updateField('answers', newAnswers)
        } else if(value < $form.answers.length) {
            let diff = $form.answers.length - value
            let newAnswers = [...$form.answers]
            for(let i = 0; i < diff; i++) {
                newAnswers.pop()
            }
            updateField('answers', newAnswers)
        }

    }
    
</script>

<form class="container" on:submit={handleSubmit}>
    <div class="content">
        <div class="block">
            <Input
                label="Question {index + 1}"
                name="question"
                placeholder="Specify the action"
                required = {false}
                type="text"
                onChange={handleChange}
                value={$form.question}
                error={$errors.question}
            />
        </div>
        <div class="block">
            <RadioButtons
            options={[
                {
                    name:"2",
                    value: '2'
                },
                {
                    name: "3",
                    value: '3'
                },
                {
                    name: "4",
                    value: '4'
                }
            ]}
            name="numAnswers"
            required={false}
            label="How many answers?"
            optionsperrow={3}
            value={$form.numAnswers}
            on:change={(e)=>update(e.detail)}
            {validateField}
            {updateField}
            fields={$form}
        />

        </div>
        <div class="block answers">
            <p class="label">Answers</p>
            {#each Array(parseInt($form.numAnswers)) as _, i}
                <Input
                    name="answers[{i}]"
                    placeholder="This is the {i+1} answer"
                    required = {true}
                    type="text"
                    onChange={handleChange}
                    bind:value={$form.answers[i]}
                    error={$errors.answers[i]}
                />
            {/each}
        </div>
    </div>
    <div class="buttons">
        <div class="save_cancel">
            <Button type="submit">
                Save
            </Button>
            {#if $form.showCancelBtn}
                <Button type="button" style="style2" onClick={()=>cancel(index)}>
                    Cancel
                </Button>
            {/if}
        </div>
        <div class="delete">
            <Button type="button" style="style2" onClick={()=>deleteQuestion(index)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 5H4.16667H17.5" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6.66602 5.00033V3.33366C6.66602 2.89163 6.84161 2.46771 7.15417 2.15515C7.46673 1.84259 7.89065 1.66699 8.33268 1.66699H11.666C12.108 1.66699 12.532 1.84259 12.8445 2.15515C13.1571 2.46771 13.3327 2.89163 13.3327 3.33366V5.00033M15.8327 5.00033V16.667C15.8327 17.109 15.6571 17.5329 15.3445 17.8455C15.032 18.1581 14.608 18.3337 14.166 18.3337H5.83268C5.39065 18.3337 4.96673 18.1581 4.65417 17.8455C4.34161 17.5329 4.16602 17.109 4.16602 16.667V5.00033H15.8327Z" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M11.666 9.16699V14.167" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8.33398 9.16699V14.167" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                <p style="color: var(--red1)">Delete</p>                    
            </Button>
        </div>
    </div>
    
</form>

<style>
    .label{
        font-size: 0.9rem;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        margin-top: 10px;
    }
    .container{
        padding: 24px;
        background-color: var(--gray4);
        border-radius: 7px;
        display: flex;
        flex-direction: column;
    }
    .answers{
        flex-direction: column;

    }
    .save_cancel{
        display: flex;
        gap: 10px;
    }
    .content{
        width: 100%;
    }
    .content{
        flex: 0.9;
    }
    .buttons{
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
    }
    .icon{
        display: flex;
        justify-content: center;
        flex: 0.1;
    }
    .block{
        display: flex;
        gap: 10px;
    }
    svg{
        cursor: pointer;
    }
</style>