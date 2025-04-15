<script lang="ts">
	export let fields: any;
	const prices: any = [
		{
			id: 'SMALL',
			max_score: 5,
			grand_prize: 250,
			days: 7,
			milestones: [],
			lottery_prize: 0,
			platform_fees: 45,
            platform_fees_percentage: 18
		},
		{
			id: 'MEDIUM',
			max_score: 25,
			grand_prize: 1500,
			days: 25,
			milestones: [
				{
					same_type: true,
					days: 7,
					points: 5,
					prize: 300
				}
			],
			lottery_prize: 222,
			platform_fees: 273,
            platform_fees_percentage: 13.5
		},
		{
			id: 'LARGE',
			max_score: 100,
			grand_prize: 5000,
			days: 45,
			milestones: [
				{
					same_type: true,
					days: 7,
					points: 10,
					prize: 500
				},
				{
					same_type: true,
					days: 15,
					points: 30,
					prize: 1000
				},
				{
					same_type: true,
					days: 30,
					points: 50,
					prize: 1500
				}
			],
			lottery_prize: 666,
			platform_fees: 829,
            platform_fees_percentage: 9.5
		}
	];
	$: selectedPrice = $fields.size;
	$: selectedPriceObj = prices.find((price: any) => price.id === selectedPrice);
	$: total =
		selectedPriceObj.grand_prize +
		selectedPriceObj.lottery_prize +
		selectedPriceObj.platform_fees +
		selectedPriceObj.milestones.reduce((acc: any, milestone: any) => acc + milestone.prize, 0);
</script>

<div class="container {$fields.type === 'SCORE' ? 'score' : ''}">
	<div class="details">
		<div class="block">
			<div class="icon grandprize">
				<svg
					width="22"
					height="22"
					viewBox="0 0 22 22"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g clip-path="url(#clip0_1329_45662)">
						<path
							d="M17.5466 3.80759C17.7505 1.83372 17.77 0.422974 17.77 0.422974H4.23173C4.23173 0.422974 4.25098 1.83372 4.45512 3.80759C3.03675 3.80759 0.423828 3.80759 0.423828 3.80759V4.4422C0.423828 12.2674 6.10194 14.2462 7.99669 14.6881C8.66219 15.3916 9.44489 15.8733 10.3661 16.0252V17.5576C10.3661 19.0384 7.19306 20.3076 5.92383 20.3076C5.57352 20.3076 5.28921 20.5919 5.28921 20.9422C5.28921 21.2925 5.57352 21.5768 5.92383 21.5768H11.0008H16.0777C16.428 21.5768 16.7123 21.2925 16.7123 20.9422C16.7123 20.5919 16.428 20.3076 16.0777 20.3076C14.8084 20.3076 11.6354 19.0384 11.6354 17.5576V16.0252C12.5566 15.8731 13.3397 15.3919 14.0052 14.6881C15.9004 14.2457 21.5777 12.267 21.5777 4.4422V3.80759C21.5777 3.80759 18.6646 3.80759 17.5466 3.80759ZM1.70702 5.07682H4.60446C4.9425 7.63601 5.58537 10.7367 6.80489 12.9943C4.7976 12.157 1.93062 10.0888 1.70702 5.07682ZM12.2127 5.94455L12.9619 8.2499L11.0008 6.82519L9.03958 8.2499L9.78864 5.94455L7.82767 4.51984H10.2517L11.0008 2.21449L11.7498 4.51984H14.1738L12.2127 5.94455ZM15.1968 12.9943C16.4166 10.7367 17.0594 7.6358 17.3968 5.07682H20.2943C20.0709 10.0888 17.2039 12.1572 15.1968 12.9943Z"
							fill="#F7F7F9"
						/>
					</g>
					<defs>
						<clipPath id="clip0_1329_45662">
							<rect width="22" height="22" fill="white" />
						</clipPath>
					</defs>
				</svg>
			</div>
			<div class="text">
				<p class="name">{new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR'
                }).format(selectedPriceObj.grand_prize)}</p>
				<p class="description">Grand Prize</p>
			</div>
		</div>

		<div class="block">
			<div class="icon duration">
				{#if $fields.type === 'SCORE'}
					<svg
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M17.0548 8.20528C16.8257 7.72987 16.3711 7.43441 15.8685 7.43441H11.4316V2.42482C11.4316 1.79697 11.0698 1.26571 10.51 1.07252C9.94764 0.878389 9.36741 1.08199 9.02159 1.58768H9.0207L3.05356 10.319C2.75766 10.7536 2.71666 11.319 2.94572 11.7963C3.17478 12.2707 3.62934 12.5662 4.13202 12.5662H8.56793V17.5767C8.56793 18.2036 8.92979 18.7339 9.48952 18.9271C9.63034 18.9764 9.77295 19 9.91288 19C10.3282 19 10.7213 18.7917 10.9797 18.4129L16.9469 9.68164C17.2428 9.24697 17.2838 8.68161 17.0548 8.20528Z"
							fill="#F7F7F9"
						/>
					</svg>
				{:else}
					<svg
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<g clip-path="url(#clip0_1329_45513)">
							<path
								d="M9.99935 18.3334C14.6017 18.3334 18.3327 14.6024 18.3327 10C18.3327 5.39765 14.6017 1.66669 9.99935 1.66669C5.39698 1.66669 1.66602 5.39765 1.66602 10C1.66602 14.6024 5.39698 18.3334 9.99935 18.3334Z"
								stroke="white"
								stroke-width="1.66667"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M10 5V10L13.3333 11.6667"
								stroke="white"
								stroke-width="1.66667"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</g>
						<defs>
							<clipPath id="clip0_1329_45513">
								<rect width="20" height="20" fill="white" />
							</clipPath>
						</defs>
					</svg>
				{/if}
			</div>
			<div class="text">
				<p class="name">
					{#if $fields.type === 'SCORE'}
						{selectedPriceObj?.max_score} points
					{:else}
						{selectedPriceObj?.days} days
					{/if}
				</p>
				<p class="description">
					{#if $fields.type === 'SCORE'}
						Target score
					{:else}
						Total duration
					{/if}
				</p>
			</div>
		</div>
		{#if selectedPriceObj?.milestones.length > 0}
			{#each selectedPriceObj?.milestones as milestone, index}
				<div class="block">
					<div class="icon milestone">
						<svg
							width="22"
							height="22"
							viewBox="0 0 22 22"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M18.9065 9.72053L16.3233 2.51549C16.239 2.27899 16.0291 2.11033 15.7816 2.07091C15.5332 2.03424 15.2811 2.13508 15.1271 2.33308C15.0739 2.40274 13.7732 4.01791 10.1908 3.80524C5.72207 3.54674 4.4259 6.15283 4.37365 6.26374C4.29573 6.42874 4.28657 6.61758 4.34798 6.78991L8.56832 18.5599H3.74023C3.36073 18.5599 3.05273 18.8679 3.05273 19.2474C3.05273 19.6269 3.36073 19.9349 3.74023 19.9349H14.9126C15.2921 19.9349 15.6001 19.6269 15.6001 19.2474C15.6001 18.8679 15.2921 18.5599 14.9126 18.5599H10.0286L8.33823 13.8437C8.7104 13.3505 9.88743 12.2139 12.6906 12.3816C17.0741 12.641 18.7443 10.4539 18.813 10.3594C18.9487 10.1761 18.9835 9.93595 18.9065 9.72053Z"
								fill="white"
							/>
						</svg>
					</div>
					<div class="text">
						<p class="name">
							{new Intl.NumberFormat('de-DE', {
								style: 'currency',
								currency: 'EUR'
							}).format(milestone?.prize)}
						</p>
						<p class="description">
							Milestone {index + 1}
						</p>
					</div>
				</div>
			{/each}
		{:else}
			<div class="block">
				<div class="icon milestone empty">
					<svg
						width="22"
						height="22"
						viewBox="0 0 22 22"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M18.9065 9.72053L16.3233 2.51549C16.239 2.27899 16.0291 2.11033 15.7816 2.07091C15.5332 2.03424 15.2811 2.13508 15.1271 2.33308C15.0739 2.40274 13.7732 4.01791 10.1908 3.80524C5.72207 3.54674 4.4259 6.15283 4.37365 6.26374C4.29573 6.42874 4.28657 6.61758 4.34798 6.78991L8.56832 18.5599H3.74023C3.36073 18.5599 3.05273 18.8679 3.05273 19.2474C3.05273 19.6269 3.36073 19.9349 3.74023 19.9349H14.9126C15.2921 19.9349 15.6001 19.6269 15.6001 19.2474C15.6001 18.8679 15.2921 18.5599 14.9126 18.5599H10.0286L8.33823 13.8437C8.7104 13.3505 9.88743 12.2139 12.6906 12.3816C17.0741 12.641 18.7443 10.4539 18.813 10.3594C18.9487 10.1761 18.9835 9.93595 18.9065 9.72053Z"
							fill="white"
						/>
					</svg>
				</div>
				<div class="text">
					<p class="name">No milestones</p>
					<p class="description">Milestones are available for Medium and Large contests</p>
				</div>
			</div>
		{/if}
		{#if selectedPriceObj?.lottery_prize > 0}
			<div class="block">
				<div class="icon lottery">
					<svg
						width="28"
						height="28"
						viewBox="0 0 28 28"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M13.9992 0.692383C6.65922 0.692383 0.792969 6.66503 0.792969 14C0.792969 21.3363 6.65922 27.3087 13.9992 27.3087C21.2417 27.3087 27.2055 21.3413 27.2055 14C27.2056 13.9656 27.2022 13.9312 27.1955 13.8975C27.1392 6.60999 21.3042 0.691162 13.9992 0.691162V0.692383ZM11.4405 1.9874V4.94623C10.7481 5.14014 10.0803 5.41319 9.45047 5.75998L7.37297 3.68372C8.61268 2.87246 9.99168 2.29731 11.4405 1.9874ZM16.558 1.9874C18.0068 2.29731 19.3858 2.87246 20.6255 3.68372L18.5705 5.73877C17.9357 5.3823 17.2599 5.10429 16.558 4.91113V1.9874ZM13.9992 5.60617C14.0026 5.6062 14.0059 5.6062 14.0092 5.60617C18.633 5.50992 22.393 9.36378 22.393 14C22.3931 15.1024 22.1761 16.1939 21.7544 17.2123C21.3326 18.2308 20.7143 19.1561 19.9349 19.9355C19.1554 20.715 18.23 21.3334 17.2116 21.7552C16.1931 22.1769 15.1015 22.3939 13.9992 22.3937C12.8969 22.3939 11.8053 22.1769 10.7869 21.7552C9.76842 21.3334 8.84304 20.715 8.06357 19.9355C7.28411 19.1561 6.66584 18.2308 6.24407 17.2123C5.8223 16.1939 5.6053 15.1024 5.60547 14C5.6053 12.8977 5.8223 11.806 6.24407 10.7876C6.66584 9.76915 7.28411 8.84383 8.06357 8.06436C8.84304 7.2849 9.76842 6.66652 10.7869 6.24475C11.8053 5.82298 12.8969 5.60601 13.9992 5.60617ZM3.74672 7.35376L5.75922 9.45123C5.41282 10.0811 5.14018 10.7488 4.94672 11.4411H2.08172C2.38435 9.98937 2.94762 8.60461 3.74422 7.35376H3.74672ZM24.2505 7.35376C25.048 8.60441 25.6121 9.98918 25.9155 11.4411H23.0155C22.8261 10.7554 22.5607 10.093 22.2242 9.46619L24.2492 7.35376H24.2505ZM13.3855 8.26746V8.9837C12.2605 9.1887 11.6442 10.1099 11.6442 11.4411C11.6442 14.3074 14.8192 14.5125 14.8192 16.56C14.8192 17.2762 14.5105 17.5837 13.9992 17.5837C13.4867 17.5837 13.1792 17.2763 13.1792 16.5588V15.74H11.6442V16.4575C11.6442 17.8912 12.2592 18.7099 13.3855 18.9149V19.6299H14.7155V18.9149C15.8405 18.7099 16.4567 17.7887 16.4567 16.4575C16.4567 13.5912 13.283 13.4887 13.283 11.3387C13.283 10.6225 13.5892 10.3149 14.1017 10.3149C14.613 10.3149 14.9205 10.6225 14.9205 11.34V11.7487H16.4567V11.4411C16.4567 10.1099 15.8405 9.1887 14.7155 8.9837V8.26746H13.3855ZM2.08297 16.56H4.94422C5.13854 17.252 5.41201 17.9193 5.75922 18.5487L3.74922 20.6475C2.95174 19.3968 2.38762 18.0119 2.08422 16.56H2.08297ZM23.0542 16.56H25.9092C25.6012 18.0063 25.0337 19.3848 24.2342 20.6288L22.2392 18.5475C22.5864 17.9181 22.8599 17.2508 23.0542 16.5588V16.56ZM9.45047 22.2399C10.0802 22.5877 10.7479 22.8616 11.4405 23.0563V26.0125C9.99177 25.703 8.61277 25.1282 7.37297 24.3174L9.45047 22.2399ZM18.548 22.2399H18.5517L20.6055 24.295C19.372 25.1066 18.0002 25.6849 16.558 26.0012V23.0512C17.2504 22.857 17.9182 22.5836 18.548 22.2363V22.2399Z"
							fill="white"
						/>
					</svg>
				</div>
				<div class="text">
					<p class="name">
						{new Intl.NumberFormat('de-DE', {
							style: 'currency',
							currency: 'EUR'
						}).format(selectedPriceObj?.lottery_prize)}
					</p>
					<p class="description">Lottery</p>
				</div>
			</div>
		{:else}
			<div class="block">
				<div class="icon empty">
					<svg
						width="28"
						height="28"
						viewBox="0 0 28 28"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M13.9992 0.692383C6.65922 0.692383 0.792969 6.66503 0.792969 14C0.792969 21.3363 6.65922 27.3087 13.9992 27.3087C21.2417 27.3087 27.2055 21.3413 27.2055 14C27.2056 13.9656 27.2022 13.9312 27.1955 13.8975C27.1392 6.60999 21.3042 0.691162 13.9992 0.691162V0.692383ZM11.4405 1.9874V4.94623C10.7481 5.14014 10.0803 5.41319 9.45047 5.75998L7.37297 3.68372C8.61268 2.87246 9.99168 2.29731 11.4405 1.9874ZM16.558 1.9874C18.0068 2.29731 19.3858 2.87246 20.6255 3.68372L18.5705 5.73877C17.9357 5.3823 17.2599 5.10429 16.558 4.91113V1.9874ZM13.9992 5.60617C14.0026 5.6062 14.0059 5.6062 14.0092 5.60617C18.633 5.50992 22.393 9.36378 22.393 14C22.3931 15.1024 22.1761 16.1939 21.7544 17.2123C21.3326 18.2308 20.7143 19.1561 19.9349 19.9355C19.1554 20.715 18.23 21.3334 17.2116 21.7552C16.1931 22.1769 15.1015 22.3939 13.9992 22.3937C12.8969 22.3939 11.8053 22.1769 10.7869 21.7552C9.76842 21.3334 8.84304 20.715 8.06357 19.9355C7.28411 19.1561 6.66584 18.2308 6.24407 17.2123C5.8223 16.1939 5.6053 15.1024 5.60547 14C5.6053 12.8977 5.8223 11.806 6.24407 10.7876C6.66584 9.76915 7.28411 8.84383 8.06357 8.06436C8.84304 7.2849 9.76842 6.66652 10.7869 6.24475C11.8053 5.82298 12.8969 5.60601 13.9992 5.60617ZM3.74672 7.35376L5.75922 9.45123C5.41282 10.0811 5.14018 10.7488 4.94672 11.4411H2.08172C2.38435 9.98937 2.94762 8.60461 3.74422 7.35376H3.74672ZM24.2505 7.35376C25.048 8.60441 25.6121 9.98918 25.9155 11.4411H23.0155C22.8261 10.7554 22.5607 10.093 22.2242 9.46619L24.2492 7.35376H24.2505ZM13.3855 8.26746V8.9837C12.2605 9.1887 11.6442 10.1099 11.6442 11.4411C11.6442 14.3074 14.8192 14.5125 14.8192 16.56C14.8192 17.2762 14.5105 17.5837 13.9992 17.5837C13.4867 17.5837 13.1792 17.2763 13.1792 16.5588V15.74H11.6442V16.4575C11.6442 17.8912 12.2592 18.7099 13.3855 18.9149V19.6299H14.7155V18.9149C15.8405 18.7099 16.4567 17.7887 16.4567 16.4575C16.4567 13.5912 13.283 13.4887 13.283 11.3387C13.283 10.6225 13.5892 10.3149 14.1017 10.3149C14.613 10.3149 14.9205 10.6225 14.9205 11.34V11.7487H16.4567V11.4411C16.4567 10.1099 15.8405 9.1887 14.7155 8.9837V8.26746H13.3855ZM2.08297 16.56H4.94422C5.13854 17.252 5.41201 17.9193 5.75922 18.5487L3.74922 20.6475C2.95174 19.3968 2.38762 18.0119 2.08422 16.56H2.08297ZM23.0542 16.56H25.9092C25.6012 18.0063 25.0337 19.3848 24.2342 20.6288L22.2392 18.5475C22.5864 17.9181 22.8599 17.2508 23.0542 16.5588V16.56ZM9.45047 22.2399C10.0802 22.5877 10.7479 22.8616 11.4405 23.0563V26.0125C9.99177 25.703 8.61277 25.1282 7.37297 24.3174L9.45047 22.2399ZM18.548 22.2399H18.5517L20.6055 24.295C19.372 25.1066 18.0002 25.6849 16.558 26.0012V23.0512C17.2504 22.857 17.9182 22.5836 18.548 22.2363V22.2399Z"
							fill="white"
						/>
					</svg>
				</div>
				<div class="text">
					<p class="name">No Lottery</p>
					<p class="description">Lotteries are available for Medium and Large contests</p>
				</div>
			</div>
		{/if}
	</div>
	<div class="invoice">
		<div class="priceblock">
			<p class="label">Grand Prize</p>
			<p class="price">
				{new Intl.NumberFormat('de-DE', {
					style: 'currency',
					currency: 'EUR'
				}).format(selectedPriceObj.grand_prize)}
			</p>
		</div>
		{#if selectedPriceObj?.milestones}
			<div class="priceblock milestones">
				{#each selectedPriceObj?.milestones as milestone, index}
					<div class="pricecontainer">
						<p class="label">Milestone {index + 1}</p>
						<p class="price">
							{new Intl.NumberFormat('de-DE', {
								style: 'currency',
								currency: 'EUR'
							}).format(milestone.prize)}
						</p>
					</div>
				{/each}
			</div>
		{/if}
		{#if selectedPriceObj?.lottery_prize}
			<div class="priceblock">
				<div class="pricecontainer">
					<p class="label">Lottery</p>
					<p class="price">
						{new Intl.NumberFormat('de-DE', {
							style: 'currency',
							currency: 'EUR'
						}).format(selectedPriceObj.lottery_prize)}
					</p>
				</div>
			</div>
		{/if}
		<div class="priceblock">
			<div class="pricecontainer">
				<p class="label">Platform Fees ({selectedPriceObj.platform_fees_percentage}%)</p>
				<p class="price">
					{new Intl.NumberFormat('de-DE', {
						style: 'currency',
						currency: 'EUR'
					}).format(selectedPriceObj.platform_fees)}
				</p>
			</div>
		</div>
		<div class="priceblock">
			<div class="pricecontainer total">
				<p class="label">You will pay</p>
				<p class="price">
					{new Intl.NumberFormat('de-DE', {
						style: 'currency',
						currency: 'EUR'
					}).format(total)}
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.score .grandprize {
		background-color: var(--purple1);
	}
	.score .icon:not(.empty, .duration, .lottery) {
		background-color: var(--purple1);
	}
	.total {
		display: flex;
		border-top: 1px solid var(--gray3);
		padding-top: 10px;
		margin-top: 10px;
	}
	.total .price {
		font-size: 1.3rem;
		font-weight: 600;
		color: var(--black1);
	}
	.invoice {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.pricecontainer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		height: 100%;
	}
	.milestones {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.priceblock {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		height: 100%;
		padding: 0 10px;
	}
	.label {
		color: var(--gray1);
	}
	.price {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--black1);
	}
	.invoice {
		padding: 28px;
		width: 100%;
		height: 100%;
		border: var(--gray3) 1px solid;
		border-radius: 7px;
	}
	.container {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		width: 100%;
		height: 100%;
		gap: 40px;
	}
	.block {
		display: flex;
		gap: 20px;
	}
	.text {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
	}
	.name {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--black1);
	}
	.description {
		font-size: 0.9rem;
		font-weight: 400;
		color: var(--black2);
	}
	.details {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 15px;
		width: 100%;
		height: 100%;
	}
	.icon {
		width: 40px;
		min-width: 40px;
		height: 40px;
		border-radius: 50%;
		background-color: var(--green1);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.icon.duration {
		background-color: black;
	}
	.empty {
		background-color: var(--gray2);
	}
	.lottery {
		background-color: var(--red1);
	}
	@media only screen and (max-width: 764px) {
		.container {
			flex-direction: column;
		}
	}
</style>
