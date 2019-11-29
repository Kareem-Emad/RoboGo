'use strict';

const validTypes = ["number", "Boolean", "string", "Color", "Vertex", "Move", "List", "MultiLineList", "Alternative"];

class Color {
    constructor(color) {
        if (typeof color === "string") {
            color = color.toLowerCase();
            if (color === "w" || color === "white" || color === "b" || color === "black")
                this.color = color;
        }
        else
            throw "Parameter is not a color value";
    
    }

    toString() {
        return this.color;
    }
}

class Vertex {
    constructor(value) {
        if (typeof value === "string") {
            if (!(value === "pass")) {
                if (value.length > 3)
                    throw "invalid vertex value";

                if (value[0] === 'i' || value[0] === 'I')
                    throw "invalid vertex value";

                let row = value.slice(1, 3);
                if (!isNaN(row) && row > 25)
                    throw "Invalid vertex value: protocol doesn't support boards larger than 25x25";

                let columnCharCode = value.charCodeAt(0);
                let column = 26;
                if (columnCharCode >= 65 && columnCharCode <= 90)
                    column = (columnCharCode[0] < 73) ? columnCharCode - 64 : columnCharCode - 65;
                else if (columnCharCode >= 97 && columnCharCode <= 122)
                    column = (columnCharCode < 105) ? columnCharCode - 96 : columnCharCode - 97;

                if (column > 25)
                    throw "Invalid vertex value: protocol doesn't support boards larger than 25x25";
            }
            this.vertex = value;
        }
        else
            throw "Invalid Vertex Value";
    }

    toString() {
        return this.vertex;
    }
};

class Move {
    constructor(move) {
        if (typeof move === "string") {
            move = move.split(' ');
            if (move.length !== 2)
                throw "Invalid Move must be string containing a Color and a Vertex separated by a space";
    
            let color = null;
            let vertex = null;
            try {
                color = new Color(move[0]);
                vertex = new Vertex(move[1]);
            }
            catch (exception) {
                throw "Invalid Move must be string containing a Color and a Vertex separated by a space";
            }

            this.move = `${color.toString()} ${vertex.toString()}`;
        }
        else
            throw "Invalid Move must be string containing a Color and a Vertex separated by a space";
    }

    toString() {
        return this.move;
    }
};

class List {
    constructor(type) {
        if (!validTypes.includes(type))
            throw "Invalid List type";
        
        this.type = type;
        this.items = [];
    }

    append(item) {
        if (typeof item !== this.type)
            throw "Invalid List Type";

        this.items.push(item);
    }

    appendAll(items) {
        for (index in items) {
            if (typeof items[index] !== this.type)
                throw "Invalid List Type";

            this.items.push(items[index]);
        }
    }

    toString() {
        let result = "";
        for (let i = 0; i < this.items.length; i++) {
            if (result === "")
                result = this.items[i].toString();
            else
                result += " " + this.items[i].toString();
        }

        return result;
    }

    apply(func) {
        for (let index in this.items) {
            this.items[index] = func(this.items[index]);
        }
    }
};

class MultiLineList {
    constructor(type) {
        if (!validTypes.includes(type))
            throw "Invalid MultiLineList type";
        
        this.type = type;
        this.items = [];

    }

    append(item) {
        if (typeof item !== this.type)
            throw "Invalid List Type";

        this.items.push(item);
    }

    appendAll(items) {
        for (index in items) {
            if (typeof items[index] !== this.type)
                throw "Invalid List Type";

            this.items.push(items[index]);
        }
    }

    toString() {
        let result = "";
        for (let i = 0; i < this.items.length; i++)
            result += this.items[i].toString() + "\n";

        return result;
    }

    apply(func) {
        for (let index in this.items) {
            this.items[index] = func(this.items[index]);
        }
    }
};

/**
 * @param   {function}  func    Function that is define in ES6 arrow functoin style
 * @returns {Array}     args    Array containing argument list of the function
 */
let getArrowFunctionArgList = (func) => {
    let firstLine = func.toString().split('\n')[0];
    let args = firstLine.match(/\((.*?)\)/)[1].replace(/ /g,'').split(',');

    args = (args.length === 1 && args[0] === "") ? [] : args;
    return args;
}

/**
 * @param   {Array}     arr1        First Array
 * @param   {Array}     arr2        Second Array
 * @returns {Boolean}   matched     "true" if both array are indentical, "false" otherwise
 */
let arraysMatch = (arr1, arr2) => {
	// Check if the arrays are the same length
	if (arr1.length !== arr2.length) return false;

	// Check if all items exist and are in the same order
	for (var i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) return false;
	}

	// Otherwise, return true
	return true;

};

/**
 * 
 * @param   {string}    num     String that contains a float value
 * @returns {float}     float   integer value of num
 */
let toFloat = (num) => {
    let float = parseFloat(num, 10);
    if (float.toString() !== num)
        throw "not a float value";

    return float;
};

/**
 * 
 * @param   {string}    num    String that contains an integer value
 * @returns {int}       int    integer value of num
 */
let toInt = (num) => {
    let int = parseInt(num, 10);
    if (int.toString() !== num)
        throw "not an integer value";

    return int;
};

/**
 * 
 * @param   {number}    num     Variable to check if it's integer or not
 * @returns {Boolean}   isInt   "true" if num is an integer, "false" otherwise
 */
let isInt = (num) => {
    if (typeof num === "number" && num === parseInt(num, 10) && parseInt(num, 10) >= 0)
        return true;

	return false;
};
const commandsList = [
    "protocol_version",
    "name",
    "version",
    "known_command",
    "list_commands",
    "quit",
    "boardsize",
    "clear_board",
    "komi",
    "fixed_handicap",
    "place_free_handicap",
    "set_free_handicap",
    "play",
    "genmove",
    "undo",
    "time_settings",
    "time_left",
    "final_score",
    "final_status_list",
    "loadsgf",
    "reg_genmove",
    "showboard"
];

// Adminstrative Commands
/**
 * @param   none
 * @returns {int}   version_number    Protocol Version Number
 */
let protocol_version = () => {
    return 2;
}

/**
 * @param   none
 * @returns {List<string>}   name    Engine Name
 */
let name = () => {
    let name = entities.List("string");
    name.append("Go");
    name.append("Slayer");

    return name;
}

/**
 * @param   none
 * @returns {List<string>}   version    Engine Version Name
 */
let version = () => {
    let version = List("string");
    version.append("1.0.0");

    return version;
}

/**
 * @param   {string}    command_name    Name of the command to check that it exist
 * @returns {Boolean}   known           "true" if command is known, "false" otherwise
 */
let known_command = (command_name) => {
    return commandsList.includes(command_name);
}

/**
 * @param   none
 * @returns {MultiLineList<string>}   commands  List of commands, one per row
 */
let list_commands = () => {
    let commands = MultiLineList("string");
    commands.appendAll(commandsList);

    return commands;
}

/**
 * @param   none
 * @returns {void}
 */
let quit = () => {
    // do nothing
}

// Setup Commands
/**
 * @param   {int}   size    New size of the board
 * @returns {void}
 */
let boardsize = (size) => {
    try {
        size = toInt(size);
    }
    catch(exception) {
        throw `Invalid board size is ${exception}`;
    }

    if (size > 25)
        throw "Invalid board size protocol doesn't support boards bigger than 25x25";
    // set board size to new size
}

/**
 * @param   none
 * @returns {void}
 */
let clear_board = () => {
    // clear board
}

/**
 * @param   {float}    new_komi    new komi value
 * @returns {void}
 */
let komi = (new_komi) => {
    try {
        new_komi = toFloat(new_komi);
    }
    catch(exception) {
        throw `Invalid Komi is ${exception}`;
    }

    // set komi to new komi value
}

/**
 * @param   {int}           number_of_stones    Number of handicap stones
 * @returns {List<Vertex>}  vertices            A list of the vertices where handicap stones have been placed
 */
let fixed_handicap = (number_of_stones) => {
    try {
        number_of_stones = toInt(number_of_stones);
    }
    catch(exception) {
        throw `Invalid number of stones is ${exception}`;
    }

    let vertices = List("Vertex");
    // place fixed handicaps
    return vertices;
}

/**
 * @param   {int}           number_of_stones    Number of handicap stones
 * @returns {List<Vertex>}  vertices            A list of the vertices where handicap stones have been placed
 */
let place_free_handicap = (number_of_stones) => {
    try {
        number_of_stones = toInt(number_of_stones);
    }
    catch(exception) {
        throw `Invalid number of stones is ${exception}`;
    }

    let vertices = List("Vertex");
    //  place free handicaps
    return vertices;
}

/**
 * @param   {List<Vertex>}  vertices  A list of vertices where handicap stones should be placed on the board
 * @returns {void}
 */
let set_free_handicap = (vertices) => {
    if (!List.prototype.isPrototypeOf(vertices) || vertices.type !== "Vertex")
        throw "Invalid List of vertices";

    // set free handicaps
}

// Core Play Commands
/**
 * @param   {Move}  move  a move (Color and vertex) to play
 * @returns {void}
 */
let play = (move) => {
    move = new Move(move.toString());
}

/**
 * @param   {Color}         color   Color for which to generate a move
 * @returns {Vertex|string} vertex  Vertex where the move was played or the string \resign"
 */
let genmove = (color) => {
    color = new Color(color.toString());

    let vertex = "resign";
    // try to genrate of move and if possiple assign the vertex to vertex if not pass

    return vertex;
}

/**
 * @param   none
 * @returns {void}
 */
let undo = () => {
    // undo
}

// Tournament Commands
/**
 * @param   {int}   main_time       Main time measured in seconds
 * @param   {int}   byo_yomi_time   Byo yomi time measured in seconds
 * @param   {int}   byo_yomi_stones Number of stones per byo yomi period
 * @returns {void}
 */
let time_settings = (main_time, byo_yomi_time, byo_yomi_stones) => {
    try {
        main_time = toInt(main_time);
        byo_yomi_time = toInt(byo_yomi_time);
        byo_yomi_stones = toInt(byo_yomi_stones);
    }
    catch(exception) {
        throw "Invalid parameters must be integer values";
    }

    // does something
}

/**
 * @param   {Color} color   Color for which the information applies
 * @param   {int}   time    Number of seconds remaining
 * @param   {int}   stones  Number of stones remaining
 * @returns {void}
 */
let time_left = (color, time, stones) => {
    try {
        time = toInt(time);
        stones = toInt(stones);
    }
    catch(exception) {
        throw "Invalid parameters must be integer values";
    }
    color = new Color(color.toString());

    // does something
}

/**
 * @param   none
 * @returns {string}    score   final game score
 */
let final_score = () => {
    let score = "";

    // get game score

    return score;
}

/**
 * @param   {string}                        status  Requested status
 * @returns {MultiLineList<List<Vertex>>}   stones  Stones with the requested status
 */
let final_status_list = (status) => {
    if (typeof status !== "string")
        throw "invalid status value";

    let stones = MultiLineList("List");

    return stones;
}

// Regression Commands
/**
 * @param   {string}  filename    Name of an sgf file.
 * @param   {int}     move_number Optional move number.
 * @returns {void}
 */
let loadsgf = (filename, move_number) => {
    if (typeof filename !== "string")
        throw "Invalid filename";

    try {
        move_number = toInt(move_number);
    }
    catch(exception) {
        throw `Invalid move number is ${exception}`;
    }

    // load sgf file
}

/**
 * @param   none
 * @returns {Vertex|string}    Vertex    where the engine would want to play a move or the string \resign"
 */
let reg_genmove = (color) => {
    if (typeof color !== "Color")
        throw "Invalid Argument: provided color is not of type color";

    let vertex = "resign";
    // try to genrate of move and if possiple assign the vertex to vertex if not pass

    return vertex;
}
// Debug Commands
/**
 * @param   none
 * @returns {MultiLineList<List<string>>}   A diagram of the board position
 */
let showboard = () => {
    let board = MultiLineList("List");
    
    // fill list with baord posions

    return board;
}

let commands = {
    protocol_version: protocol_version,
    name: name,
    version: version,
    known_command: known_command,
    list_commands: list_commands,
    quit: quit,
    boardsize: boardsize,
    clear_board: clear_board,
    komi: komi,
    fixed_handicap: fixed_handicap,
    place_free_handicap: place_free_handicap,
    set_free_handicap: set_free_handicap,
    play: play,
    genmove: genmove,
    undo: undo,
    time_settings: time_settings,
    time_left: time_left,
    final_score: final_score,
    final_status_list: final_status_list,
    loadsgf: loadsgf,
    reg_genmove: reg_genmove,
    showboard: showboard
}

/**
 * @param   {string}    command Command Name
 * @param   {Array}     args    Array of objects that contains command arguments
 * @returns {string}    request string containing required request
 */
let makeRequest = (command, args, id=null) => {
    if (!commandsList.includes(command))
        throw "Invalid Argument: command doesn't exist";
    
    if (id !== null && !isInt(id))
        throw "Invalid Argument: id must be an integer";
    
    let commandArgs = getArrowFunctionArgList(commands[command]);

    if (!arraysMatch(commandArgs, Object.keys(args)))
        throw `Invalid Argument: ${command} arguments list should be [${commandArgs}], however, [${Object.keys(args)}] was provided`;

    let request = "";
    if (id !== null)
        request += `${id} `;
    
    request += command;
    let argValues = Object.values(args);

    for (let index in argValues)
        request += ` ${argValues[index].toString()}`;

    request += "\n"
    return request;
}

/**
 * @param   {string}    command Command Name
 * @param   {Array}     args    Array of objects that contains command arguments
 * @returns {string}    request string containing required request
 */
let parseRequest = (request) => {
    if (typeof request !== "string")
        throw `request must be string, however ${typeof request} was passed`;

    request = request.replace(/\r?\n|\r/g, '');
    request = request.split(' ');
    let id = null;
    let command = null;
    let args = null;
    if (isInt(request[0])) {
        id = parseInt(request[0], 10);
        command = request[1];
        args = request.slice(2);
    }
    else {
        command = request[1];
        args = request.slice(2);
    }
    
    
    return { id: id, command: command, args: args };
}

/**
 * @param   {string}    request     GTP command
 * @returns {string}    response    string containing GTP response in case of success or GTP error in case of failure
 */
let takeRequest = (request) => {
    let parsedRequest = null;
    try {
        parsedRequest = parseRequest(request);
    }
    catch(exception) {
        return `? ${exception}\n\n`;
    }
    
    let id = parsedRequest.id;
    let command = parsedRequest.command;
    let args = parsedRequest.args;
    let errorPrefix = (id !== null) ? `?${id}` : "?";
    let responsePrefix = (id !== null) ? `=${id}` : "=";

    if (!commandsList.includes(command))
        return `${errorPrefix} command doesn't exist\n\n`;
    
    let commandArgs = getArrowFunctionArgList(commands[command]);
    if (commandArgs.length === args.length)
        return `${errorPrefix} ${command} arguments doesn't match\n\n`;
    
    try {
        return `${responsePrefix} ${(commands[command](...args)).toString()}\n\n`;
    }
    catch(exception) {
        return `? ${exception}\n\n`;
    }
}

let socket = new WebSocket("ws://localhost:9002");

socket.onopen = function (e) {
    alert("[open] Connection established");
};

socket.onmessage = function (event) {
    alert(`[message] Data received from server: ${event.data}`);
};

socket.onclose = function (event) {
    if (event.wasClean) {
        alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        alert('[close] Connection died');
    }
};

socket.onerror = function (error) {
    alert(`[error] ${error.message}`);
};

// sendMessage = function() {
//     let message = document.getElementById("message").value;
//     alert("sending message to server!!!");
//     socket.send(message);
// }

var c = document.getElementById("go-canvas");
var ctx = c.getContext("2d");
var black = document.getElementById("black");
var white = document.getElementById("white");

const startOffset = 20;
const arraySize = 18;
const endOffset = c.width - startOffset;
const step = (c.width - 2 * startOffset) / arraySize;

var board = new Array(arraySize + 1)
    .fill(0)
    .map(() => new Array(arraySize + 1).fill(0));

const drawBoard = () => {
    for (let xAxis = startOffset; xAxis <= endOffset; xAxis += step) {
        ctx.moveTo(xAxis, startOffset);
        ctx.lineTo(xAxis, endOffset);
        ctx.stroke();
    }

    for (let yAxis = startOffset; yAxis <= endOffset; yAxis += step) {
        ctx.moveTo(startOffset, yAxis);
        ctx.lineTo(endOffset, yAxis);
        ctx.stroke();
    }
};

const drawAllPieces = () => {
    let row = 0;
    for (let xAxis = startOffset - step / 2; xAxis < endOffset; xAxis += step) {
        let col = 0;
        for (let yAxis = startOffset - step / 2; yAxis < endOffset; yAxis += step) {
            if (board[row][col]) {
                if (board[row][col] == "w") {
                    ctx.drawImage(white, xAxis, yAxis, step, step);
                } else {
                    ctx.drawImage(black, xAxis, yAxis, step, step);
                }
            }
            col++;
        }
        row++;
    }
};

board[0][0] = "w";
board[7][12] = "w";
board[9][13] = "w";
board[8][16] = "b";
board[7][17] = "b";
board[5][16] = "b";
board[18][18] = "b";

drawBoard();
drawAllPieces();
