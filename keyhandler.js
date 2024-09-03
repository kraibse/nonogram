class KeyboardHandler {
    posx = 0;
    posy = 0;

    counter = 0;

    inputDelay = 30;
    keys = ["Space", "ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"];

    constructor(_board) {
        this.board = _board;
        this.size = _board.size;

        $(document).keydown((e) => {
            if (this.keys.includes(e.code)) {
                e.preventDefault();
            }
        });
    
        // Begin custom controls

        kd.LEFT.down((e) => {
            if (this.counter <= this.inputDelay) { this.counter++; return; }
            else { this.counter = 0; }

            this._left();
        });

        kd.LEFT.press((e) => {
            this.counter = -15;
            this._left();
        });

        kd.RIGHT.down((e) => {
            if (this.counter <= this.inputDelay) { this.counter++; return; }
            else { this.counter = 0; }

            this._right();
        });

        kd.RIGHT.press((e) => {
            this.counter = -15;
            this._right();
        });
        
        kd.UP.down((e) => {
            if (this.counter <= this.inputDelay) { this.counter++; return; }
            else { this.counter = 0; }

            this._up();
        });

        kd.UP.press((e) => {
            this.counter = -15;
            this._up();
        });
        
        kd.DOWN.down((e) => {
            if (this.counter <= this.inputDelay) { this.counter++; return; }
            else { this.counter = 0; }

            this._down();
        });

        kd.DOWN.press((e) => {
            this.counter = -15;
            this._down();
        });

        kd.SPACE.press((e) => {   // scrolling by spacebar
            this.board.isCommenting = true;
            this.board.isUserCommenting = true;
            this.board.reveal(this.posx, this.posy, false);
            this.board.isUserCommenting = false;
            this.board.isCommenting = false;
        });

        kd.SPACE.up((e) => { e.preventDefault(); });

        setInterval(function() {
            kd.tick();
        }, 0);
    }

    _down() {
        if (this.posy < this.size - 1) {
            this.focus(this.posx, ++this.posy);
        }
    }

    _left() {
        if (this.posx != 0) {
            this.focus(--this.posx, this.posy);
        }
    }

    _right() {
        if (this.posx < this.size - 1) {
            this.focus(++this.posx, this.posy);
        }
    }

    _up() {
        if (this.posy != 0) {
            this.focus(this.posx, --this.posy);
        }
    }

    focus(x, y) {
        $("#" + x + "_" + y).focus();
    }
}