<script lang="ts">
    export let required: boolean
    export let height: string = "174px"
    export let label: string
    export let name: string
    export let onChange: any
    export let value: any
    export let error: string
    export let accept: string
    export let updateField: any
    export let validateField: any
    export let count: number = 1
    export let title: string = "Drag and drop the competition banner to upload"
    export let description: string = "JPG, PNG, Recommended Size: 1680x400px"

    let files: any = []
    
    const handleFile = (e: any) => {
        if (files.length === count) {
            return alert(`You can only upload ${count} file`)
        }
        for(let i = 0; i < count; i++) {
            const file = e.target.files[i]
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = (e: any) => {
                files = [...files, {name: file.name, src: e.target.result}]
            }
            reader.onerror = (e: any) => {
            }
            // When reading is done, update the value
            reader.onloadend = () => {
                updateField(name, files),
                validateField(name)
            }
        }
        
    }

    const deleteFile = (index: number) => {
        files = files.filter((file: any, i: number) => i !== index)
        updateField(name, files),
        validateField(name)
    }
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg']
</script>


<div class="container">
    <label for="file">{label}
        {#if required}
            <span class="required">*</span>
        {/if}
    </label>
    <div class="wrapper" style="height:{height}">
        <input on:change={handleFile} type="file" {name} {accept} multiple={true} bind:files={value}  />
        {#if count === 1 && files.length === 1}
            <div class="imagepreview">
                <img src={files[0].src} alt="">
            </div>
        {/if}
        <div class="block">
            <p class="title">{title}</p>
            <p class="description">{description}</p>
            <button>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_1_205)">
                    <path d="M16 16L12 12L8 16" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 12V21" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M20.39 18.39C21.3653 17.8583 22.1358 17.0169 22.5799 15.9986C23.0239 14.9804 23.1162 13.8432 22.8422 12.7667C22.5682 11.6901 21.9435 10.7355 21.0667 10.0534C20.1899 9.37138 19.1109 9.00073 18 9H16.74C16.4373 7.82924 15.8732 6.74233 15.0899 5.82099C14.3067 4.89965 13.3248 4.16785 12.2181 3.68061C11.1114 3.19336 9.90855 2.96336 8.70012 3.00788C7.49168 3.05241 6.30907 3.3703 5.24118 3.93766C4.17328 4.50503 3.24791 5.3071 2.53462 6.28358C1.82133 7.26006 1.33869 8.38554 1.12298 9.57539C0.907268 10.7653 0.964104 11.9885 1.28921 13.1533C1.61432 14.318 2.19924 15.3939 3 16.3" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 16L12 12L8 16" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_1_205">
                    <rect width="24" height="24" fill="white"/>
                    </clipPath>
                    </defs>
                </svg>
                Upload Image  
            </button>
        </div>
    </div>
</div>

<div class="upload">
{#each files as file, i}
    <div class="uploadedFiles">
        <div class="imageandname">
            <div class="image">
                {#if imageExtensions.includes(file.name.split('.').pop())}
                    <img src={file.src} alt="">
                {:else}
                <svg class="pdficon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.6667 24H4" stroke="#6A7584" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M28 18.666H4" stroke="#6A7584" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22.6667 13.334H4" stroke="#6A7584" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M28 8H4" stroke="#6A7584" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                {/if}                    
            </div>
            <div class="info">
                <p class="name">{file.name}</p>
            </div>
        </div>
        <div class="delete_icon">
            <svg on:click={()=>deleteFile(i)} on:keydown={()=>deleteFile(i)} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 5H4.16667H17.5" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.66602 4.99935V3.33268C6.66602 2.89065 6.84161 2.46673 7.15417 2.15417C7.46673 1.84161 7.89065 1.66602 8.33268 1.66602H11.666C12.108 1.66602 12.532 1.84161 12.8445 2.15417C13.1571 2.46673 13.3327 2.89065 13.3327 3.33268V4.99935M15.8327 4.99935V16.666C15.8327 17.108 15.6571 17.532 15.3445 17.8445C15.032 18.1571 14.608 18.3327 14.166 18.3327H5.83268C5.39065 18.3327 4.96673 18.1571 4.65417 17.8445C4.34161 17.532 4.16602 17.108 4.16602 16.666V4.99935H15.8327Z" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M11.666 9.16602V14.166" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8.33398 9.16602V14.166" stroke="#EA3D09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
    </div>
{/each}
</div>
<style>
    .pdficon{
        margin-right: unset;
    }
    .upload{
        margin-top:20px;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .imagepreview{
        position: absolute;
        z-index: 9999;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    .imagepreview img{
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .delete_icon{
        cursor: pointer;
    }
    .uploadedFiles{
        width: 100%;
        display: flex;
        padding: 8px;
        gap: 10px;
        border-radius: 7px;
        border: 1px solid var(--input_border);
        justify-content: space-between;
        align-items: center;
    }
    .imageandname{
        width: 100%;
        display: flex;
        gap: 10px;
    }
    .image{
        width: 64px;
        height: 64px;
        min-height: 64px;
        min-width: 64px;
        border-radius: 7px;
        overflow: hidden;
        background-color: var(--gray4);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .name{
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text);
    }
    .image img{
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .container{
        width: 100%;
        border-radius: 7px;
        height: fit-content;
        position: relative;
        display: flex;
        flex-direction: column;
    }
    .wrapper{
        width: 100%;
        border-radius: 7px;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    input{
        width: 100%;
        height: 100%;
        cursor: pointer;
        opacity: 0;        
        z-index: 9999999;
        background-color: turquoise;
    }
    .block{
        width: 100%;
        height: 100%;
        position: absolute;
        color: var(--text);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        border: 2px dashed var(--input_border);
        background-color: var(--file_submit_background);
    }
    .title{
        font-size: 1rem;
        font-weight: 600;
    }
    .description{
        font-size: 0.9rem;
        font-weight: 400;
        margin: 2px 0 10px 0;
    }
    button{
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 8px 16px;
        background-color: #FFFFFF;
        outline:none;
        border: 1px solid var(--input_border);
    }
    svg{
        opacity: 0.8;
        margin-right: 10px;
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
</style>


