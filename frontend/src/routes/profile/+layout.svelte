<script lang="ts">
	import { page } from '$app/stores';
	import { user } from '$lib/stores/user';
	import contestTypes from '../../utils/contstTypes';

	$: currentPage = $page.route.id
	
</script>

<div class="container">
	<div class="header">
		<div class="box1">
			<svg
				width="572"
				height="579"
				viewBox="0 0 572 579"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					opacity="0.1"
					d="M556.377 391.3C570.726 383.016 575.642 364.668 567.358 350.319L374.327 15.9803C366.043 1.63154 347.695 -3.2847 333.347 4.99957L15.9806 188.231C1.63183 196.515 -3.28441 214.863 4.99986 229.212L198.03 563.55C206.315 577.899 224.662 582.815 239.011 574.531L556.377 391.3Z"
					fill="url(#paint0_linear_1358_53753)"
				/>
				<defs>
					<linearGradient
						id="paint0_linear_1358_53753"
						x1="285.787"
						y1="-9.69909"
						x2="285.787"
						y2="475.559"
						gradientUnits="userSpaceOnUse"
					>
						<stop stop-color="white" />
						<stop offset="1" stop-color="white" stop-opacity="0" />
					</linearGradient>
				</defs>
			</svg>
		</div>
		<div class="box2">
			<svg
				width="456"
				height="231"
				viewBox="0 0 456 231"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					opacity="0.1"
					d="M450.977 38.2341C459.261 52.5829 454.345 70.9306 439.996 79.2148L185.268 226.282C170.92 234.566 152.572 229.65 144.288 215.301L5.00009 -25.9517C-3.28418 -40.3005 1.63209 -58.6482 15.9809 -66.9324L270.709 -214C285.058 -222.284 303.405 -217.368 311.69 -203.019L450.977 38.2341Z"
					fill="url(#paint0_linear_1358_53752)"
				/>
				<defs>
					<linearGradient
						id="paint0_linear_1358_53752"
						x1="108.845"
						y1="211.883"
						x2="301.471"
						y2="-121.757"
						gradientUnits="userSpaceOnUse"
					>
						<stop stop-color="white" />
						<stop offset="1" stop-color="white" stop-opacity="0" />
					</linearGradient>
				</defs>
			</svg>
		</div>
	</div>
</div>
<div class="wrapper">
	<div class="menu">
        <div class="profile">
            <div class="image">
				{#if $user.pfp}
                	<img src={$user.pfp} alt="Profile" />
				{:else}
					<img src="./images/defaultcontest.png" alt="Profile" />
				{/if}
            </div>
            <div class="userdetails">
                <p class="name">{$user.fullName}</p>
                <p class="email">{$user.email}</p>
            </div>
        </div>
		<ul>
			<li class="{currentPage == '/profile' ? 'active' : ''}">
				<a href="/profile/">
					<div class="icon">
						<svg
							width="20"
							height="20"
							viewBox="0 0 20 20"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M7.93251 10.6809L8.53176 10.3825L8.07556 9.89259C7.63356 9.41792 7.38428 8.79564 7.3763 8.14717C7.37705 7.44537 7.65616 6.77246 8.15247 6.27616C8.64944 5.77919 9.32348 5.49999 10.0263 5.49999C10.7291 5.49999 11.4032 5.77919 11.9001 6.27616C12.3964 6.77246 12.6756 7.44537 12.6763 8.14717C12.6683 8.79564 12.419 9.41792 11.977 9.89259L11.5276 10.3753L12.1137 10.6777C12.7652 11.0137 13.3235 11.5055 13.7391 12.1094C14.1545 12.7128 14.4145 13.4095 14.4959 14.1376C14.505 14.2247 14.4794 14.3119 14.4247 14.3804C14.3744 14.4432 14.3032 14.4856 14.2245 14.5H14.168H14.1515L14.1351 14.5011C14.0493 14.5067 13.9646 14.479 13.8988 14.4237C13.8329 14.3685 13.791 14.2899 13.7817 14.2044L13.7818 14.2044L13.7809 14.1972C13.6665 13.2687 13.2166 12.4141 12.5158 11.7943C11.815 11.1746 10.9118 10.8325 9.9763 10.8325C9.04079 10.8325 8.13757 11.1746 7.4368 11.7943C6.73603 12.4141 6.28608 13.2687 6.17172 14.1972L6.17168 14.1972L6.17097 14.2037C6.16115 14.2929 6.11631 14.3745 6.0463 14.4306C5.97629 14.4868 5.88684 14.5128 5.79764 14.503C5.70844 14.4932 5.62679 14.4483 5.57065 14.3783C5.51493 14.3088 5.48887 14.2202 5.4981 14.1316C5.58628 13.4003 5.85462 12.7023 6.27905 12.1003C6.70406 11.4974 7.27224 11.0097 7.93251 10.6809ZM8.89942 9.79907C9.22558 10.017 9.60904 10.1333 10.0013 10.1333C10.5273 10.1333 11.0318 9.92437 11.4037 9.55242C11.7757 9.18047 11.9846 8.676 11.9846 8.14999C11.9846 7.75772 11.8683 7.37427 11.6504 7.04811C11.4325 6.72195 11.1227 6.46774 10.7603 6.31763C10.3979 6.16751 9.9991 6.12824 9.61437 6.20477C9.22964 6.28129 8.87625 6.47019 8.59887 6.74756C8.3215 7.02494 8.13261 7.37833 8.05608 7.76306C7.97955 8.14779 8.01883 8.54657 8.16894 8.90898C8.31906 9.27139 8.57326 9.58114 8.89942 9.79907ZM4.16797 2.16666H15.8346C16.3651 2.16666 16.8738 2.37737 17.2488 2.75244C17.6239 3.12752 17.8346 3.63622 17.8346 4.16666V15.8333C17.8346 16.3638 17.6239 16.8725 17.2488 17.2475C16.8738 17.6226 16.3651 17.8333 15.8346 17.8333H4.16797C3.63754 17.8333 3.12883 17.6226 2.75376 17.2475C2.37868 16.8725 2.16797 16.3638 2.16797 15.8333V4.16666C2.16797 3.63622 2.37868 3.12752 2.75376 2.75244C3.12883 2.37737 3.63754 2.16666 4.16797 2.16666ZM16.7774 16.7761C17.0275 16.5261 17.168 16.1869 17.168 15.8333V4.16666C17.168 3.81304 17.0275 3.4739 16.7774 3.22385C16.5274 2.9738 16.1883 2.83332 15.8346 2.83332H4.16797C3.81435 2.83332 3.47521 2.9738 3.22516 3.22385C2.97511 3.4739 2.83464 3.81303 2.83464 4.16666V15.8333C2.83464 16.1869 2.97511 16.5261 3.22516 16.7761C3.47521 17.0262 3.81435 17.1667 4.16797 17.1667H15.8346C16.1883 17.1667 16.5274 17.0262 16.7774 16.7761Z"
								stroke="black"
							/>
						</svg>
					</div>
					<p>My Details</p>
				</a>
			</li>
			<li class = "{currentPage == '/profile/contests' ? 'active' : ''}">
				<a href="/profile/contests">
					<div class="icon">
						<svg
							width="20"
							height="20"
							viewBox="0 0 20 20"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M6.66797 17.5H13.3346"
								stroke="#6A7584"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M10 14.1667V17.5"
								stroke="#6A7584"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M16.668 2.5H3.33464C2.41416 2.5 1.66797 3.24619 1.66797 4.16667V12.5C1.66797 13.4205 2.41416 14.1667 3.33464 14.1667H16.668C17.5884 14.1667 18.3346 13.4205 18.3346 12.5V4.16667C18.3346 3.24619 17.5884 2.5 16.668 2.5Z"
								stroke="#6A7584"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</div>
					<p>Contests</p>
				</a>
			</li>
			<li class = "{currentPage == '/profile/logout' ? 'active' : ''}">
				<a href="/profile/logout">
					<div class="icon">
						<svg
							width="20"
							height="20"
							viewBox="0 0 20 20"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M13.332 14.1666L17.4987 9.99998L13.332 5.83331"
								stroke="#6A7584"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M17.5 10H7.5"
								stroke="#6A7584"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5"
								stroke="#6A7584"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</div>
					<p>Logout</p>
				</a>
			</li>
		</ul>
	</div>
	<div class="data">
        <slot></slot>
	</div>
</div>

<style>
	.wrapper {
		display: flex;
        max-width: 1600px;
        margin-left: auto;
        margin-right: auto;
	}
	.active{
		background-color: var(--gray3);
		border-radius: 7px;
		font-weight: 600;
	}
    .data{
        width: 100%;
        padding: 0 20px;
        margin-top: 20px;
    }
    .profile{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 20px 0;
    }
    .userdetails{
        display: flex;
        flex-direction: column;
        align-items: center;
    }
	.container {
		color: white;
		display: flex;
		justify-content: center;
		background: linear-gradient(161.15deg, #6714cc 12.73%, #2f08ce 72.95%);
		padding: 100px 0 80px 0;
		flex-direction: column;
		align-items: center;
	}
	.header {
		gap: 30px;
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 920px;
	}
	.box1 {
		position: absolute;
		bottom: 120px;
		right: 0;
	}
	.box2 {
		position: absolute;
		top: 0;
		left: 0;
	}
    .menu{
        width: 100%;
        max-width: 300px;
    }
	ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 250px;
	}
	li {
		width: 100%;
		display: flex;
		align-items: center;
        cursor: pointer;
	}
	li a{
		display: flex;
		align-items: center;
		gap: 20px;
		text-decoration: none;
        color: inherit;
		padding: 8px;
	}
    .name{
        margin-top: 10px;
        font-size: 1.2rem;
        font-weight: 600;
    }
	.icon{
		width: 20px;
		height: 20px;
	}
    .image{
        width: 160px;
        overflow: hidden;
        border-radius: 50%;
        height: 160px;
    }
    .image img{
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
	@media only screen and (max-width: 1155px) {
		.header {
			width: 100%;
			padding: 0 30px;
		}
		.box1 {
			display: none;
		}
		.box2 {
			display: none;
		}
	}
</style>
