const FLAG_TILE_TEXT = '<i class="fa-solid fa-flag"></i>';

const FLAG_TILE = document.createElement('i');
FLAG_TILE.classList.add('fa-solid', 'fa-flag', 'text-dark');

const FLAG_TILE_BG = "#ffbe70";


class Board
{
    size = 10;
    
    constructor(_size) {
        this.size = _size;

        this.reset();
        
        this._generateGrid();
        this._generateIndicators();
        
        $("#0_0").focus();
        this.livesCounter = document.getElementById('livesCounter');

        this.keyboardHandler = new KeyboardHandler(this);
    }
    
    /**
     * Fills in all the cells in the row and column which are a part of a completed section.
     * 
     * @param {number} x The x-coordinate of the cell which is being filled.
     * @param {number} y The y-coordinate of the cell which is being filled.
     * @param {_mode} _mode A boolean indicating whether the fill is being done as a result of the user's action or not.
     */
    revealAdjacentTiles(x, y, _mode=false) {
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
                    tileH.setAttribute('style', 'background-color: ' + FLAG_TILE_BG + ' !important;');
                    tileH.appendChild(FLAG_TILE);
                    // tileH.innerHTML = "!";
                    // tileH.setAttribute('style', 'background-color: #333; color: #bbb;');
                }
            }
            if (colHints == pointsY) {
                if (this.revealedTiles[i][x] == 0) {
                    this.reveal(x, i, false);
                }
                if (tileV.innerHTML == "?") {
                    tileV.setAttribute('style', 'background-color: ' + FLAG_TILE_BG + ' !important;');
                    tileV.appendChild(FLAG_TILE);
                    // tileV.innerHTML = "!";
                    // tileV.setAttribute('style', 'background-color: #333; color: #bbb;');
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


    // https://poe.com/preview/EIx5PtjBqWOaWyWXepEW
    build() {
        this.updateLivesCounter();
        document.documentElement.style.setProperty('--grid-size', this.size);

        this.container = document.getElementById('board');
        // Add top-left empty cell
        this.container.appendChild(this.createCell('indicator', ''));

        // Add top indicators
        for (let x = 0; x < this.size; x++) {
            const indicator = this.indicators[0][x].join('<br>');
            this.container.appendChild(this.createCell('vertical-hint-cell verticalHints', indicator));
        }

        // Add rows
        for (let y = 0; y < this.size; y++) {
            // Add left indicator
            const rowIndicator = this.indicators[1][y].join(' ');
            this.container.appendChild(this.createCell('horizontal-hint-cell horizontalHints', rowIndicator));

            // Add cells
            for (let x = 0; x < this.size; x++) {
                const cell = this.createCell('tile', '', `${x}_${y}`);
                cell.addEventListener('click', (e) => this.handleCellClick(e, x, y));
                cell.addEventListener('contextmenu', (e) => this.handleCellRightClick(e, x, y));
                cell.addEventListener('mouseenter', () => this.handleCellHover(x, y));
                // Add keydown event listener for Enter key
                cell.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.handleCellClick(e, x, y);
                    }
                    if (e.key === 'Space') {
                        this.handleCellRightClick(e, x, y);
                    }
                });
                
                // Make the cell focusable
                cell.setAttribute('tabindex', '0');
                this.container.appendChild(cell);
            }
        }
    }

    createCell(className, content, id = null) {
        const cell = document.createElement(className === 'tile' ? 'button' : 'div');
        cell.className = className;
        cell.innerHTML = content;
        if (id) cell.id = id;
        return cell;
    }

    updateLivesCounter() {
        const livesCounter = document.getElementById('livesCounter');
        livesCounter.innerHTML = '';

        const heartIcon = document.createElement('i');
        heartIcon.classList.add('fa-solid', 'fa-heart', 'px-1');

        for (let i = 0; i < this.lives; i++) {
            livesCounter.appendChild(heartIcon.cloneNode());
        }
    }

    handleCellClick(e, x, y) {
        console.log(`Cell clicked: ${x}, ${y}`);
        // Implement your reveal logic here
        this.reveal(x, y);
    }

    handleCellRightClick(e, x, y) {
        e.preventDefault();
        console.log(`Cell right-clicked: ${x}, ${y}`);
        // Implement your comment logic here

        this.isCommenting = true;
        this.isUserCommenting = true;
        this.reveal(x, y);
        this.isUserCommenting = false;
        this.isCommenting = false;
    }

    handleCellHover(x, y) {
        // console.log(`Cell hovered: ${x}, ${y}`);
        // Implement your hover logic here
    }

    reset() {
        this.grid = [];
        this.revealedTiles = [];
        this.indicators = [[], []];
        this.lives = 3;
        this.totalPoints = 0;
        this.points = 0;
        this.isCommenting = false;
        this.isUserCommenting = true;

        this._generateGrid();
        this._generateIndicators();
    }

    reveal(x, y, _isFilling = false) {
        if (this.isGameOver()) return;
    
        const tile = document.getElementById(`${x}_${y}`);
        if (this.isTileAlreadyRevealed(tile)) return;
    
        let content, color, backgroundColor;
    
        if (!this.isCommenting) {
            ({ content, color, backgroundColor } = this.handleNormalReveal(x, y));
        } else {
            ({ content, color, backgroundColor } = this.handleCommentReveal(x, y, tile, _isFilling));
        }
    
        if (content === null) return; // No change to tile
    
        this.updateTileAppearance(tile, content, color, backgroundColor);
        this.checkGameStatus();
    
        if (!_isFilling) {
            this.revealAdjacentTiles(x, y, this.isCommenting);
        }
    }
    
    isGameOver() {
        return this.lives === 0;
    }
    
    isTileAlreadyRevealed(tile) {
        const allowedContents = ['', '?'];
        return allowedContents.indexOf(tile.innerHTML.trim()) === -1;
    }
    
    handleNormalReveal(x, y) {
        const content = this.grid[y][x].toString();
        console.log("Found content: ", content);
    
        if (content === '0') {
            return this.handleBombReveal(x, y);
        } else {
            return this.handleCorrectReveal(x, y);
        }
    }
    
    handleBombReveal(x, y) {
        this.lives--;
        this.updateLivesCounter();
        this.revealedTiles[y][x] = -1;
        const bombTile = document.createElement('i');
        bombTile.classList.add('fa-solid', 'fa-bomb', 'text-dark');
        return { content: bombTile, color: '#ff726f', backgroundColor: '#ff726f' };
    }
    
    handleCorrectReveal(x, y) {
        this.points++;
        this.revealedTiles[y][x] = 1;
        const checkTile = document.createElement('i');
        checkTile.classList.add('text-dark');
        checkTile.innerHTML = '✔';
        return { content: checkTile, color: '#000', backgroundColor: '#90EE90' };
    }
    
    handleCommentReveal(x, y, tile, _isFilling) {
        const commentSymbol = this.isUserCommenting ? '?' : '!';
    
        if (this.isCommentTile(tile, commentSymbol) && !_isFilling) {
            this.revealedTiles[y][x] = 0;
            return { content: '', color: '', backgroundColor: '' };
        } else if (this.isUnmarkedTile(tile)) {
            this.revealedTiles[y][x] = 2;
            if (commentSymbol === '!') {
                const flagTile = document.createElement('i');
                flagTile.classList.add('fa-solid', 'fa-flag', 'text-dark');
                return { content: flagTile, color: '#333', backgroundColor: FLAG_TILE_BG };
            }
            return { content: commentSymbol, color: '#333', backgroundColor: '#bbb' };
        } else {
            return { content: null }; // No change to tile
        }
    }
    
    isCommentTile(tile, commentSymbol) {
        const isComment = tile.innerHTML === commentSymbol;
        console.log("Is comment: ", isComment);
        return isComment;
    }
    
    isUnmarkedTile(tile) {
        const innerHTML = tile.innerHTML.trim();
        console.log("Is unmarked tile: ", innerHTML === '');
        return innerHTML === '';
    }
    
    updateTileAppearance(tile, content, color, backgroundColor) {
        tile.style.color = color;
        tile.style.backgroundColor = backgroundColor;

        if (typeof(content) === 'string') {
            tile.innerHTML = content;
        } else {
            tile.appendChild(content);
        }
    }
    
    checkGameStatus() {
        if (this.points === this.totalPoints) {
            this.displayPostgameMessage("YOU WON!!", "#0f0");
        } else if (this.lives === 0) {
            this.displayPostgameMessage("GAME OVER", "rgb(255, 204, 36)");
        }
    }
    
    displayPostgameMessage(message, color) {
        const pgm = document.getElementById("postgameMessage");
        pgm.innerHTML = message;
        pgm.style.display = "block";
        pgm.style.color = color;
    }
}

