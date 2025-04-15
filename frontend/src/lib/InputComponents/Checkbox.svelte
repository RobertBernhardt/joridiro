<script lang="ts">
	export let text: string = '';
	export let value: boolean = false;
	export let error: boolean = false;
	export let name: string = '';
	export let onChange: (e: Event) => void = () => {};
</script>

<div>
	<label for={name}>
		<input on:change={onChange} bind:checked={value} {name} type="checkbox" />
		{@html text}
	</label>
</div>

<style>
	div {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	input {
		width: 20px;
		height: 20px;
	}
	/* Make the checkbox red with a white tick in it */
	input:checked {
		background-color: red;
	}

	/* Make the checkbox red with a white tick in it */
	input:checked {
		background-color: red;
	}
	label{
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
	}
</style>
