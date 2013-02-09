/*** Utility functions *******************************************************/

function _default(vrbl, value) {
    if (typeof vrbl === "undefined") {
        return value;
    } else {
        return vrbl;
    }
}

function _is(type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
}

function _must_set(vrbl, message, type) {
    if (typeof vrbl === "undefined") {
        _must_set(message, "Undefined Message.");
        throw new Error(message);
    }
}

/*** Game/Scene Management Classes *******************************************/

function Scene(graph) {
    this.graph = _default(graph, []);

    this.iterate = (function (pane) {
        for (var i=0; i < graph.length; i++) {
            graph[i].march();
            graph[i].render(pane);
        }
    });
}

function FrameSet(frames) {
    _must_set(frames, "FrameSet initialized without frames array.");
    if (frames.length < 1) {
        throw new Error("FrameSet initialized with empty frames array.");
    }

    this.frames = frames;
    this.current = 0;
    this.march = (function() {
        this.current = (this.current + 1) % this.frames.length;
    });

    this.current_frame = (function() {
        return this.frames[this.current];
    });
}

function StateSet() {
    this.add_state = (function(state, frame_set) {
        _must_set(state, "Name of new state is unset.");
        _must_set(frame_set, "FrameSet unprovided for new state.");

        this[state] = frame_set;
    });
}

function BitmapSprite(state_set, state) {
    _must_set(state_set, "Sprite initialized without frame object.");
    _must_set(state, "Sprite initialized without known state.");

    this.state_set = state_set;
    this.state = state;

    this.x = 0;
    this.y = 0;

    this.move = (function() {;});

    this.march = (function() {
        this.move();
        this.state_set[state].march();
    });

    this.render = (function(pane) {
        pane.drawImage(this.state_set[state].current_frame(), this.x, this.y);
    });
}

function Game(pane, frame_rate) {
    // 30 Frames per second
    this.frame_rate = _default(frame_rate, 1000/30);

    // Canvas context to which we are rendering
    this.pane = pane;

    // Step game forward by one iteration
    this.iterate = (function () {
        this.scene.iterate(this.pane);
    });
}

/*** Interface With Actual Page **********************************************/

function setup() {
    
}

setup();
