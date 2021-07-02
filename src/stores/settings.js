import { writable } from 'svelte/store';

const colors = [
    { id: 0, name: "red", code: "#F00" },
    { id: 1, name: "green", code: "#0F0" },
    { id: 2, name: "blue", code: "#00F" },
    { id: 3, name: "white", code: "#FFF" },
    { id: 4, name: "black", code: "#000" },
    { id: 5, name: "yellow", code: "yellow" },
];

const styles = [
    { id: 0, thickness: 2, dash: 0 },
    { id: 1, thickness: 3, dash: 0 },
    { id: 2, thickness: 5, dash: 0 },
    { id: 3, thickness: 8, dash: 0 },
    { id: 4, thickness: 2, dash: 10 },
    { id: 5, thickness: 3, dash: 15 },
]

export const line = writable({
    colors,
    styles,
    color: colors[3],
    style: styles[1],
})

