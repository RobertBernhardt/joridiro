import type Register from "$lib/Register/Register.svelte";
import { writable, type Writable } from "svelte/store";

export const modal:any = writable('');
export const props:any = writable({});