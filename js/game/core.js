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

    this.add_node = (function (node) {
        _must_set(node, "Tried to add unset node to Scene object.");

        this.graph.push(node);
    });

    this.iterate = (function (pane) {
        for (var i=0; i < this.graph.length; i++) {
            this.graph[i].march();
            this.graph[i].render(pane);
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

    this.add_frame = (function(img) {
        _must_set(img, "Tried to add frame but did not pass in an image.");
        this.frames.push(img);
    });
}

function StateSet() {
    this.add_state = (function(state, frame_set) {
        _must_set(state, "Name of new state is unset.");
        _must_set(frame_set, "FrameSet unprovided for new state.");

        this[state] = frame_set;
    });
}

function BitmapSprite(state_set, current_state) {
    _must_set(state_set, "Sprite initialized without frame object.");
    _must_set(current_state, "Sprite initialized without known state.");

    this.state_set = state_set;
    this.state = current_state;

    this.x = 0;
    this.y = 0;

    this.move = (function() {;});

    this.march = (function() {
        this.move();
        this.state_set[this.state].march();
    });

    this.render = (function(pane) {
        pane.drawImage(this.state_set[this.state].current_frame(),
            this.x, this.y);
    });
}

function Game(canvas, frame_rate, size) {
    // 30 Frames per second
    this.frame_rate = _default(frame_rate, 1000/30);
    this.size = _default(size, {width:100, height:100});

    this.is_running = false;

    // Canvas context to which we are rendering
    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    this.scene = new Scene();

    this.add_sprite = (function (sprite) {
        _must_set(sprite, "Tried to add unset sprite to game.");

        this.scene.add_node(sprite);
    });

    // Step game forward by one iteration
    this.iterate = (function () {
        this.context.clearRect(0, 0, game.canvas.width, game.canvas.height);
        this.scene.iterate(this.context);
    });

    this.run = (function () {
        this.is_running = true;
        this.loop();
    });

    this.stop = (function () {
        this.is_running = false;
    });

    this.loop = (function () {
        console.log("Game step.");
        if (this.is_running) {
            this.iterate();
            // Must create closure to capture "this"
            setTimeout((function (game) {
                return function() {game.loop()};
                })(this), this.frame_rate);
        }
    });
}

/*** Interface With Actual Page **********************************************/

function initialize_game(canvas) {
    var game = new Game(canvas, 1000/30);
    var assets = [
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk00.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk01.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk02.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk03.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk04.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk05.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk06.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk07.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk08.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk09.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk10.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk11.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk12.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk13.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk14.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk15.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk16.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk17.png',
        '/media/js/standalone/libs/gamedev_assets/robowalk/robowalk18.png'
        ];

    var txtr = new Image();
    txtr.src = "https://www.udacity.com" + assets[0];
    var frames = new FrameSet([txtr]);
    for (var i=1; i<assets.length; i++) {
        var txtr = new Image();
        txtr.src = "https://www.udacity.com" + assets[i];
        frames.add_frame(txtr);
    }

    var states = new StateSet();
    states.add_state("cruising", frames);
    var roamer = new BitmapSprite(states, "cruising");
    roamer.xdir = 1;
    roamer.move = (function () {
        this.x += this.xdir
        if (this.xdir > 0 && this.x > 100) {
            this.xdir = -1;
        } else if (this.xdir < 0 && this.x < 0) {
            this.xdir = 1;
        }
    });

    game.add_sprite(roamer);

    return game;
}

function bind_game_handlers(game) {
    $("#stop").unbind('click');
    $("#run").unbind('click');
    $("#reset").unbind('click');

    $("#stop").click(function() {game.stop(); return false;});
    $("#run").click(function() {game.run(); return false;});
    $("#reset").click(function() {
        game.stop();
        state['game'] = reset_game(game);
        return false;
        });
}

function reset_game(game) {
    game.context.clearRect(0, 0, game.canvas.width, game.canvas.height);
    var game = initialize_game(game.canvas, game.frame_rate);

    bind_game_handlers(game);

    return game;
}

function bind_handlers(state) {
    game = state['game'];
    bind_game_handlers(game);
}

function setup() {
    canvas = document.getElementById('main_pane');

    state = {};
    state['game'] = initialize_game(canvas);
    bind_handlers(state);
}

$.ready(setup());
