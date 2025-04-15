<script lang="ts">
	import { onDestroy } from 'svelte';
	import { alert } from './notifications';

	export let ms = 30;
	let timeout: any;
	let width = 0;
	const onMessageChange = (message: any, ms: any) => {
		if (message != '') {
			width = 100;
			clearTimeout(timeout);
			//Set Interval to reduce width to 0
			if (ms > 0) timeout = setInterval(() => (width != 0 ? width-- : null), ms);
		}
	};
	$: onMessageChange($alert.message, ms);
	onDestroy(() => clearTimeout(timeout));

	const icon = (type: string) => {
		if (type === 'SUCCESS') return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.410156 13.41L6.00016 19L7.41016 17.58L1.83016 12M22.2402 5.57996L11.6602 16.17L7.50016 12L6.07016 13.41L11.6602 19L23.6602 6.99996M18.0002 6.99996L16.5902 5.57996L10.2402 11.93L11.6602 13.34L18.0002 6.99996Z" fill="#4CBB25"/>
</svg>
`;

		else if (type === 'ERROR') return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.27 3L3 8.27V15.73L8.27 21H15.73L21 15.73V8.27L15.73 3M8.41 7L12 10.59L15.59 7L17 8.41L13.41 12L17 15.59L15.59 17L12 13.41L8.41 17L7 15.59L10.59 12L7 8.41" fill="#EA3D09"/>
</svg>
`;
			
		else return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13 13H11V7H13M13 17H11V15H13M12 2C10.6868 2 9.38642 2.25866 8.17317 2.7612C6.95991 3.26375 5.85752 4.00035 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C5.85752 19.9997 6.95991 20.7362 8.17317 21.2388C9.38642 21.7413 10.6868 22 12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2Z" fill="black"/>
</svg>
`
    
	};
</script>
<div class="wrapper  {width==0?'hide':''}">
	<div class="container {$alert.type=="SUCCESS" ? 'greenbg' : $alert.type=="ERROR" ? 'redbg':'graybg'}">
		<div class="content">
			<div class="icon">
				{@html icon($alert.type)}
			</div>
			<div class="text">
				<div class="description">
					{$alert.message}
				</div>
			</div>
		</div>
	</div>
	<slot />
</div>

<style>
	.wrapper{
		width: fit-content;
		height: fit-content;
		position: fixed;
		z-index: 99999999999999;
		bottom: 20px;
        right: 50px;
	}
	.container {
		display: flex;
		width: 400px;
		max-width: 400px;
		z-index: 99999999999999;
		border-radius: 7px;
		display: flex;
		line-height: 25px;
		align-items: flex-start;
		flex-direction: column;
	}
	.greenbg{
		background-color: var(--green2);
	}
	.redbg{
		background-color: var(--red3);
	}
	.graybg{
		background-color: var(--gray4);
	}
	.content {
		width: 100%;
		display: flex;
		gap: 10px;
		padding: 7.5px 20px;
		align-items: flex-start;
	}
	.hide {
		opacity: 0;
		transition: all 0.3s ease-in-out;
	}
	.hide.wrapper{
		z-index: -1;
	}
	.icon {
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}
	.text{
		margin-top: 5px;
	}
	.description {
		font-size: 0.95rem;
		opacity: 1;
		font-weight: 600;
		display: flex;
		margin-top: -2px;
	}

	@media screen and (max-width: 768px) {
		.wrapper{
			width: 100%;
			right: 0;
		}
		.container{
			max-width: unset;
			width: 100%;
		}
	}
</style>
