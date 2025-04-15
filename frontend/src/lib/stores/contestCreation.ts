import { writable } from 'svelte/store'

export let contestCreation: any = writable({
    step: 0,
    score: [],
    rules: [],
    requirements: {},
    about_contest: {},
    questions: [],
    about_company: []
})