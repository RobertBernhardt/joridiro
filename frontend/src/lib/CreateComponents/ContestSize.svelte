<script lang="ts">
    export let fields: any
    export let errors: any
    export let name: string
    export let value: string
    export let onChange: any
    export let style: any = ""
    const options: Array<{id: string, logo: string, name: string, prize: number, description: string}> = [{
        id:"SMALL",
        logo: "S",
        name: "Small Contest",
        description: "Small contest with a small prize pool for testing out our servicesSmall contest with a small prize pool for testing out our servicesSmall contest with a small prize pool for testing out our services",
        prize: 250
    },{
        id:"MEDIUM",
        logo: "M",
        name: "Medium Contest",
        description: "Small contest with a small prize pool for testing out our servicesSmall contest with a small prize pool for testing out our servicesSmall contest with a small prize pool for testing out our services",
        prize: 1500
    },{
        id:"LARGE",
        logo:"L",
        name: "Large Contest",
        description: "Small contest with a small prize pool for testing out our servicesSmall contest with a small prize pool for testing out our servicesSmall contest with a small prize pool for testing out our services",
        prize: 5000
    }]
</script>

<div class="wrapper {$fields.type==='SCORE'?'score' : ''}">
    <!-- Radio buttons -->
    <label for={name}>Contest Size<span class="required">*</span></label>
    <div class="radio-buttons">
        <div class="inputfield">
            {#each options as option}
                <label class="radio-button {value === option.id ? 'active' : ''}">
                    <div class="logo">
                        <img src="../icons/{option.id}.svg" alt="">
                    </div>
                    <input on:change={onChange} bind:group={value} value={option.id} type="radio" {name}>
                    <div class="wrapper">
                        <div class="block">
                            <p class="option_name">{option.name}</p>
                        </div>
                        {#if style!="style2"}
                            <div class="prize">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.9517 3.46117C16.1371 1.66666 16.1548 0.384094 16.1548 0.384094H3.84667C3.84667 0.384094 3.86417 1.66666 4.04975 3.46117C2.76027 3.46117 0.384766 3.46117 0.384766 3.46117V4.03812C0.384766 11.1523 5.54694 12.9512 7.26953 13.353C7.87455 13.9926 8.58613 14.4305 9.42367 14.5686V15.9618C9.42367 17.308 6.53891 18.4619 5.38501 18.4619C5.06653 18.4619 4.80806 18.7204 4.80806 19.0389C4.80806 19.3573 5.06653 19.6158 5.38501 19.6158H10.0006H14.6162C14.9347 19.6158 15.1932 19.3573 15.1932 19.0389C15.1932 18.7204 14.9347 18.4619 14.6162 18.4619C13.4623 18.4619 10.5776 17.308 10.5776 15.9618V14.5686C11.4151 14.4304 12.1271 13.9928 12.7321 13.353C14.4551 12.9509 19.6165 11.1519 19.6165 4.03812V3.46117C19.6165 3.46117 16.9681 3.46117 15.9517 3.46117ZM1.55136 4.61507H4.18553C4.49285 6.94172 5.0773 9.76071 6.18601 11.8131C4.36111 11.0519 1.75464 9.17164 1.55136 4.61507ZM11.1024 5.40395L11.7836 7.49983L10.0006 6.20457L8.21765 7.49983L8.89864 5.40395L7.11586 4.1087H9.31962L10.0006 2.01283L10.6816 4.1087H12.8854L11.1024 5.40395ZM13.8154 11.8131C14.9243 9.76071 15.5088 6.94153 15.8155 4.61507H18.4497C18.2466 9.17164 15.6401 11.0521 13.8154 11.8131Z" fill="{value === option.id ? 'var(--green1)' : '#000000'}"/>
                                </svg>
                                <p class="prizeamt">€ {option.prize}</p>
                            </div>
                        {/if}
                    </div>
                </label>
            {/each}
        </div>
    </div>
</div>

<style>
    .score .radio-button.active .prize{
        color: var(--purple1);
    }
    .score .radio-button.active .prize svg path{
        fill: var(--purple1);
    }
    .score .radio-button.active .prizeamt{
        color: var(--purple1);
    }
    .score .radio-button.active{
        border: 2px solid var(--purple1);
    }
    .logo{
        width: 70px;
        height: 70px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
        font-weight: 800;
        font-size: 1rem;
        color: rgb(110, 110, 110);
    }
    .logo img{
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .active .logo{
        color: var(--green1);
    }
    .required{
        color: var(--required);
        margin-left: 3px;
    }
    label{
        font-size: 0.9rem;
        font-weight: 600;
        display: flex;
        margin-bottom: 10px;
    }
    .block{
        margin-top: -3px;
        cursor: pointer;
    }
    .radio-button {
        display: flex;
        align-items: flex-start;
        align-items: center;
        gap: 15px;
        padding: 16px;
        border: 2px solid var(--input_border);
        border-radius: 7px;
        flex-direction: column;
    }
    
    .radio-button.active {
        border: 2px solid var(--green1);
    }
    
    .radio-button input {
        display: none;
    }
    .radio-button .option_name {
        font-size: 1rem;
        font-weight: 600;
    }
    .radio-buttons {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .inputfield {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
    }
    .wrapper {
        display: flex;
        flex-direction: column;
        gap: 10px;
        justify-content: center;
    }
    .prize{
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .prizeamt{
        font-size: 1.1rem;
        font-weight: 600;
    }
    .active .prizeamt{
        color: var(--green1);
    }
    @media only screen and (max-width: 764px) {
        .inputfield {
            grid-template-columns: 1fr;
        }
        .radio-button{
            flex-direction: row;
        }
    }
</style>