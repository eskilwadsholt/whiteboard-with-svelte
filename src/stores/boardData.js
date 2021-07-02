import { writable } from 'svelte/store'
import { StrokeData } from '../models/strokeData'
import { line } from '../stores/settings'
import { view } from '../stores/view'

let ID = 0

// Subscribe to line store and save in local var
let $line
line.subscribe(value => $line = value)
// Subscribe to view store and save in local var
let $view
view.subscribe(value => $view = value)

const createNewStroke = () => {
    if ($line.style)
        return new StrokeData(
            ID++,
            $line.color, 
            $line.style.thickness * $view.zoom, 
            $line.style.dash * $view.zoom);
    return new StrokeData(ID++, line.color, 4, 0)
}

export const strokes = writable({
    list: [],
    current: createNewStroke(),
    new: function() {
        this.current = createNewStroke()
    },
    addPoint: function(point) {
        strokes.update($this => {
            $this.current.addPoint(point)

            return $this
        })
    },
    add: function(stroke) {
        strokes.update($this => {
            $this.list.push(stroke)

            return $this
        })
    },
    clear: function() { 
        strokes.update($this => {
            $this.list = []

            return $this
        })
    },
    pop: function() {
        strokes.update($this => {
            $this.list.pop()

            return $this
        })
    },
})

let $strokes
strokes.subscribe(value => $strokes = value)

line.subscribe(() => {
    console.debug($strokes)

    if ($line.color && $line.style && $strokes.current) {
        $strokes.current.color = $line.color
        $strokes.current.thickness = $line.style.thickness * $view.zoom
        $strokes.current.dash = $line.style.dash * $view.zoom

        console.debug(`Updated style:`)
        console.debug($strokes.current)
    }
})