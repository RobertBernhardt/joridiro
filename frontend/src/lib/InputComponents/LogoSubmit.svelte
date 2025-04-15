<script lang="ts">
    export let required: boolean
    export let label: string
    export let name: string
    export let onChange: any
    export let value: any
    export let error: string
    export let accept: string
    export let updateField: any
    export let validateField: any
    export let title: string = "Drag and drop the competition banner to upload"
    export let description: string = "JPG, PNG, Recommended Size: 1680x400px"

    let files: string = ''
    
    const handleFile = (e: any) => {
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (e: any) => {
            files = e.target.result
        }
        reader.onerror = (e: any) => {
        }
        // When reading is done, update the value
        reader.onloadend = () => {
            updateField(name, files),
            validateField(name)
        }
    }

    const deleteFile = () => {
        files = ''
    }
</script>

<div class="container">
    <div class="wrapper">
        <div class="image">
            {#if files}
                <img src={files} alt="">
            {:else}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_1005_44848)">
                    <path d="M13.3327 13.3333L9.99935 10L6.66602 13.3333" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 10V17.5" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16.9909 15.3249C17.8037 14.8818 18.4458 14.1806 18.8158 13.3321C19.1858 12.4835 19.2627 11.5359 19.0344 10.6388C18.8061 9.7417 18.2855 8.94616 17.5548 8.37778C16.8241 7.80939 15.925 7.50052 14.9992 7.4999H13.9492C13.697 6.52427 13.2269 5.61852 12.5742 4.85073C11.9215 4.08295 11.1033 3.47311 10.181 3.06708C9.2587 2.66104 8.25636 2.46937 7.24933 2.50647C6.2423 2.54358 5.25679 2.80849 4.36688 3.28129C3.47697 3.7541 2.70583 4.42249 2.11142 5.23622C1.51701 6.04996 1.11481 6.98785 0.935051 7.9794C0.755293 8.97095 0.802655 9.99035 1.07358 10.961C1.3445 11.9316 1.83194 12.8281 2.49923 13.5832" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M13.3327 13.3333L9.99935 10L6.66602 13.3333" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_1005_44848">
                    <rect width="20" height="20" fill="white"/>
                    </clipPath>
                    </defs>
                </svg>
            {/if}
        </div>
        <div class="text">
            <p class="title">{title}</p>
            <p class="description">{description}</p>
        </div>
    </div>
    <div class="buttons">
        <button type="button">
            <input on:change={handleFile} type="file" {name} {accept} multiple={true} bind:files={value}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_1424_47703)">
                <path d="M13.3327 13.3333L9.99935 10L6.66602 13.3333" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 10V17.5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16.9909 15.3249C17.8037 14.8818 18.4458 14.1806 18.8158 13.3321C19.1858 12.4835 19.2627 11.5359 19.0344 10.6388C18.8061 9.7417 18.2855 8.94616 17.5548 8.37778C16.8241 7.80939 15.925 7.50052 14.9992 7.4999H13.9492C13.697 6.52427 13.2269 5.61852 12.5742 4.85073C11.9215 4.08295 11.1033 3.47311 10.181 3.06708C9.2587 2.66104 8.25636 2.46937 7.24933 2.50647C6.2423 2.54358 5.25679 2.80849 4.36688 3.28129C3.47697 3.7541 2.70583 4.42249 2.11142 5.23622C1.51701 6.04996 1.11481 6.98785 0.935051 7.9794C0.755293 8.97095 0.802655 9.99035 1.07358 10.961C1.3445 11.9316 1.83194 12.8281 2.49923 13.5832" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13.3327 13.3333L9.99935 10L6.66602 13.3333" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
                <defs>
                <clipPath id="clip0_1424_47703">
                <rect width="20" height="20" fill="white"/>
                </clipPath>
                </defs>
                </svg>
            <p>Upload Image</p>               
        </button>
        {#if files}
            <button on:click={deleteFile}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 5H4.16667H17.5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6.66602 4.99935V3.33268C6.66602 2.89065 6.84161 2.46673 7.15417 2.15417C7.46673 1.84161 7.89065 1.66602 8.33268 1.66602H11.666C12.108 1.66602 12.532 1.84161 12.8445 2.15417C13.1571 2.46673 13.3327 2.89065 13.3327 3.33268V4.99935M15.8327 4.99935V16.666C15.8327 17.108 15.6571 17.532 15.3445 17.8445C15.032 18.1571 14.608 18.3327 14.166 18.3327H5.83268C5.39065 18.3327 4.96673 18.1571 4.65417 17.8445C4.34161 17.532 4.16602 17.108 4.16602 16.666V4.99935H15.8327Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M11.666 9.16602V14.166" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8.33398 9.16602V14.166" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                <p>Delete Image</p>               
            </button>
        {/if}
    </div>
</div>

<style>
    .container{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: space-between;
    }
    .wrapper{
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
    }
    .image{
        width: 70px;
        min-width: 70px;
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--input_border);
        border-radius: 7px;
    }
    .image img{
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .text{
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin-left: 20px;
    }
    input{
        position: absolute;
        width: 100%;
        opacity: 0;
        cursor: pointer;
    }
    .title{
        font-size: 1rem;
        font-weight: 500;
        font-weight: 600;
    }
    .description{
        font-size: 0.9rem;
        font-weight: 400;
        opacity: 0.6;
    }
    .buttons{
        width: fit-content;
        height: 100%;
        display: flex;  
        align-items: center;
        justify-content: center;
    }
    button{
        position: relative;
        width: 100%;
        max-width: 150px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #FFF;
        border: none;
        border-radius: 5px;
        padding: 8px 15px;
        margin: 0.5rem;
        cursor: pointer;
        white-space: nowrap;
        border: 1px solid var(--input_border);
        cursor: pointer;
    }
    .buttons button p{
        font-size: 0.9rem;
        font-weight: 600;
        margin-left: 1rem;
    }
    @media only screen and (max-width: 768px) {
        .container{
            flex-direction: column;
        }
        .buttons{
            width: 100%;
            justify-content: space-between;
            gap: 1rem;
        }
        button{
            width: 100%;
            max-width: unset;
            margin: 0.5rem 0;
        }
    }
</style>


