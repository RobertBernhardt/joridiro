<script lang="ts">
	import FileSubmit from "$lib/InputComponents/FileSubmit.svelte";
    import Input from "$lib/InputComponents/Input.svelte";
    import { createForm } from 'svelte-forms-lib';
	import * as yup from 'yup';
    
    const {form, handleChange, errors, touched, handleSubmit} = createForm({
        initialValues: {
            title: '',
            banner: []
        },
        validationSchema: yup.object().shape({
            title: yup.string().required(),
            banner: yup.string()
        }),
        onSubmit: (values) => {
        }
    });
</script>
<form on:submit|preventDefault={handleSubmit}>
    <Input
        name="title"
        label="Contest Name"
        placeholder="Enter the contest name"
        required = {true}
        type="text"
        value={$form.title}
        onChange={handleChange}
        error={$errors.title}
    />


</form>
