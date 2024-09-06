class Board
{
    grid = [];
    revealedTiles = [];
    indicators = [[], []];
    
    size = 10;
    lives = 3;
    totalPoints = 0;
    points = 0;
    
    isCommenting = false;
    isUserCommenting = true;
    
    constructor(_size) {
        this.size = _size;
        
        this._generateGrid();
        this._generateIndicators();
        
        $("#0_0").focus();
        this.keyboardHandler = new KeyboardHandler(this);
    }
    
    /**
     * Fills in all the cells in the row and column which are a part of a completed section.
     * 
     * @param {number} x The x-coordinate of the cell which is being filled.
     * @param {number} y The y-coordinate of the cell which is being filled.
     * @param {_mode} _mode A boolean indicating whether the fill is being done as a result of the user's action or not.
     */
    _fill(x, y, _mode=false) {
        // Calculate the sum of all the hints in the row
        var rowHints = this.indicators[1][y]
        .reduce((a, b) => a + b, 0);

        // Calculate the sum of all the hints in the column
        var colHints = this.indicators[0][x]
        .reduce((a, b) => a + b, 0);

        // Calculate the sum of all the revealed tiles in the row
        var pointsX = this.revealedTiles[y]
        .filter((e) => {
            return e == 1;
        })
        .reduce((a, b) => a + b, 0);

        // Calculate the sum of all the revealed tiles in the column
        var col = [];
        this.revealedTiles.forEach(element => {
            col.push(element[x]);
        })
        var pointsY = col
        .filter((e) => {
            return e == 1;
        })
        .reduce((a, b) => a + b, 0);
        
        // Fill in all the cells in the row and column which are a part of a completed section
        for (var i = 0; i < this.size; i++)
        {
            this.isCommenting = true;
            this.isUserCommenting = false;
            
            var tileH = document.getElementById(i + "_" + y);
            var tileV = document.getElementById(x + "_" + i);

            if (rowHints == pointsX) {
                if (this.revealedTiles[y][i] == 0) {
                    this.reveal(i, y, false);
                }
                if (tileH.innerHTML == "?") {
                    tileH.innerHTML = "!";
                }
            }
            if (colHints == pointsY) {
                if (this.revealedTiles[i][x] == 0) {
                    this.reveal(x, i, false);
                }
                if (tileV.innerHTML == "?") {
                    tileV.innerHTML = "!";
                }
            }
        }
        
        // Reset the commenting flags
        this.isUserCommenting = true;
        this.isCommenting = _mode;
    }
    
    _generateGrid(_size=this.size) {
        // Returns an two-dimensional array directly proportional to _size
        console.log("Randomizing grid");
        for (var y=0; y < _size; y++)
        {
            this.grid.push([]);
            this.revealedTiles.push([]);

            for (var x=0; x < _size; x++)
            {
                var r = Math.floor(Math.random() * 2);  // generate 0 or 1
                this.grid[y].push(r);
                this.revealedTiles[y].push(0);
                
                if (r == 1) { this.totalPoints++; }
            }
        }
        console.log(this.grid);
    }
    
    _generateIndicators() {
        // Generates a two-dimensional array containing the lenghts of non-bomb tiles
        console.log("Generating indicators");
        for (var i = 0; i < this.size; i++)
        {
            // filter out lengths from non-bomb tiles from row array
            var row = this._getRow(i, this.grid);

            // retreive all values on column with x = i
            var col = this._getColumn(i, this.grid)
            
            // adding up the ones per element to actual length of free space
            for (var l = 0; l < row.length; l++) {
                row[l] = Array.from(row[l]).map(Number).reduce((a, b) => a + b, 0);
            }
            for (var l = 0; l < col.length; l++) {
                col[l] = Array.from(col[l]).map(Number).reduce((a, b) => a + b, 0)
            }

            this.indicators[0].push(col);
            this.indicators[1].push(row);
        }

        console.log(this.indicators);
    }

    _getColumn(_x, map) {
        /*
            Retreives the live tiles in a specific column from the generated map.
        */
        var col = [];
        for (var _y = 0; _y < this.size; _y++) {
            col.push(map[_y][_x]);
        }
        // filter out bomb tiles from column array
        col = col.join()
        .replace(/,/g, "").split("0")
        .filter((value, index, arr) => {    
            return value != "";
        });

        return col;
    }

    _getRow(_y, map=this.grid) {
        /*
            Retreives the live tiles in a specific row from the generated map.
        */
        var row = map[_y].join()
        .replace(/,/g, "").split("0")       // ['','','','1','1','','','1''1''1']
        .filter((value, index, arr) => {    // removing empty strings from array
            return value != "";
        });

        return row;
    }

    build() {
        $("#livesCounter").html("❤️".repeat(this.lives));

        var t = $("<table/>", {
            //  fixing the focus conflict when switching between m/kb
            mouseout: () => {
                let id = document.activeElement.id;
                board.keyboardHandler.posx = parseInt(id[0]);
                board.keyboardHandler.posy = parseInt(id[2]);
            }
        });

        for (var y = -1; y < this.size; y++)
        {
            var tr = $("<tr/>");
            
            for (var x = -1; x < this.size + 1; x++)
            {
                var td = $("<td/>");
                
                const isSideColumn = (x == -1 || x == this.size); 
                if (isSideColumn) {
                    td.addClass("side-column");
                }

                // upper left corner
                if ((y == -1 && x == -1) || (x == this.size)) {
                    tr.append(td);
                    continue;
                }

                if (y == -1 && x != -1) {
                    // write col hints
                    
                    var hintlist = "";
                    var p = $("<p/>", {"class": "verticalHints"});

                    for (var i = 0; i < this.indicators[0][x].length; i++) {
                        hintlist += this.indicators[0][x][i] + "<br/>";
                    }
                    p.html(hintlist);
                    td.append(p);
                }
                else if (x == -1)
                {
                    // write row hints
                    var hintlist = "";
                    var p = $("<p/>");

                    for (var i = 0; i < this.indicators[1][y].length; i++) {
                        hintlist += this.indicators[1][y][i] + " ";
                    }
                    p.html(hintlist);
                    td.append(p);
                }
                else {
                    var btn = $("<button/>", {
                        "class": "shadow tile btn btn-default",
                        id: x+"_"+y,
                        text: " ",

                        // event.target on event https://stackoverflow.com/a/13252233
                        click: (e) => {
                            let eid = e.target.id;
                            let _x = parseInt(eid[0]);
                            let _y = parseInt(eid[2]);

                            board.reveal(_x, _y);
                        },
                        contextmenu: (e) => {
                            e.preventDefault();
                            board.isCommenting = true;

                            let eid = e.target.id;
                            let _posx = parseInt(eid[0]);
                            let _posy = parseInt(eid[2]);
                            
                            board.reveal(_posx, _posy, false);
                            board.isCommenting = false;
                        },
                        mouseenter: (e) => {
                            let eid = e.target.id;
                            let _x = parseInt(eid[0]);
                            let _y = parseInt(eid[2]);

                            board.keyboardHandler.posx = _x;
                            board.keyboardHandler.posy = _y;
                            $(_x + "_" + _y).focus();
                        }
                    });

                    td.append(btn);
                }
                tr.append(td);
            }
            t.append(tr);
        }
        $("#board").append(t);
    }

    reveal(x, y, _isFilling=false) {
        if (this.lives == 0)
        {
            return; // GAME OVER
        }
    
        var tile = document.getElementById(x + "_" + y);
        var color = "#000";
        var bg = "";
    
        if (this.isCommenting == false) {
            var content = this.grid[y][x].toString();
            if (tile.innerHTML != ' ') {
                return;
            }
            
            if (content == 0) {
                document.getElementById('livesCounter').innerHTML = "❤️".repeat(--this.lives);
                bg = "#ff726f";
                color = bg;
                content = '💣';
                this.revealedTiles[y][x] = -1;
            }
            else {
                this.points++;
                bg = "#90EE90";
                color = "#000";
                content = "✔"
                this.revealedTiles[y][x] = 1;
            }
        }
        else
        {
            var comment_symbol = (this.isUserCommenting) ? '?' : '!';
    
            if (tile.innerHTML == comment_symbol && !_isFilling)
            {
                var content = " ";
                bg = "";
                this.revealedTiles[y][x] = 0;
            }
            else if (tile.innerHTML == " ")
            {
                var content = comment_symbol;
                color = "#333";
                bg = "#bbb";
                this.revealedTiles[y][x] = 2;
            }
            else 
            {
                return;
            }
        }
        
        tile.setAttribute("style", "color: " + color + "; background-color: "+ bg);
        tile.innerHTML = content;
        
        if (this.points == this.totalPoints)
        {
            var pgm = document.getElementById("postgameMessage");
            pgm.innerHTML = "YOU WON!!";
            pgm.setAttribute("style", "display: block; color: #0f0");
        }
        
        if (this.lives == 0)
        {
            var pgm = document.getElementById("postgameMessage");
            pgm.innerHTML = "GAME OVER";
            pgm.setAttribute("style", "display: block; color: rgb(255, 204, 36)");
        }

        if (!_isFilling) { this._fill(x, y, this.isCommenting); }
    }
}

