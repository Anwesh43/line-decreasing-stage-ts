const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
const k : number = 4

const divideScale = (scale : number, j : number) : number => {
    return Math.min(0.5, Math.max(0, scale - j * 0.5)) * 2
}
class LineDisappearingStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#BDBDBD'
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : LineDisappearingStage = new LineDisappearingStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    prevScale : number = 0
    dir : number = 0

    update(cb : Function) {
        this.scale += (0.1/k) * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number
    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class LDSNode {
    next : LDSNode
    prev : LDSNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new LDSNode(this.i + 1)
            this.next.prev = this
        }
    }


    draw(context : CanvasRenderingContext2D) {
        const gap : number = w / (nodes + 1)
        const size : number = (gap) / 3
        context.save()
        context.translate(gap * (1 + this.i), h / 2)
        for (var j = 0; j < 2; j++) {
            const sc : number = divideScale(this.state.scale, j)
            const sc1 : number = divideScale(sc, 0)
            const sc2 : number = divideScale(sc, 1)
            const sf : number = 1 - 2 * j
            context.save()
            context.translate(-size, h/2 * sf * sc2)
            context.rotate(Math.PI/2 * sc1 * sf)
            context.beginPath()
            context.moveTo(0, 0)
            context.lineTo(0, 2 * size)
            context.stroke()
            context.restore()
        }
        context.restore()
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : LDSNode {
        var curr : LDSNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedDisappearingStep {
    curr : LDSNode = new LDSNode(0)

    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
