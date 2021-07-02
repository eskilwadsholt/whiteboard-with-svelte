import { writable } from 'svelte/store'

export const view = writable({
    zoom: 1,
})