NUM_FINGERS = 5;

class Move {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}

class Player {
    constructor() {
        this.left = 1
        this.right = 1
    }

    Format() {
        return this.FormatLeftHand() + ' -- ' + this.FormatRightHand()
    }

    FormatLeftHand() {
        let result = ''
        for (let i = NUM_FINGERS - 1; i > this.left; --i) result += '▗';
        for (let i = this.left; i >= 1; --i) result += '▐';
        return result;
    }
    FormatRightHand() {
        let result = ''
        for (let i = 1; i <= this.right; ++i) result += '▌';
        for (let i = this.right; i < NUM_FINGERS - 1; ++i) result += '▖';
        return result;
    }

    GetMove() { return null; }
    SetKeyboardCommand(keyboardCommand) { }

    AcceptDamage(move) {
        this.left = (this.left + move.left) % NUM_FINGERS;
        this.right = (this.right + move.right) % NUM_FINGERS;
    }

    Lost() {
        return this.left === 0 && this.right === 0;
    }
}

function Print(message) {
    $("#console").append('\n' + message);
}

function PrintInvalidNumberOfFingersToSplit() {
    Print('Invalid number of fingers to split');
}

function PrintInvalidTap() {
    Print('Invalid number of fingers to split');
}

class HumanPlayer extends Player {
    GetMove() {
        const components = this.keyboardCommand.replace(/\s+/g, '').toLowerCase().split('>');
        if (components[0] === 'ml') {
            if (this.left === 0) {
                throw new Error("Tapping with left hand is not possible because it is empty.");
            }
            if (components[1] === 'yl') {
                return new Move(this.left, 0);
            } else if (components[1] === 'yr') {
                return new Move(0, this.left);
            }
            throw new Error(`Unrecognized destination of the tap: '${components[1]}'. Must be yl or yr.`);
        } else if (components[0] === 'mr') {
            if (this.right === 0) {
                throw new Error("Tapping with right hand is not possible because it is empty.");
            }
            if (components[1] === 'yl') {
                return new Move(this.right, 0);
            } else if (components[1] === 'yr') {
                return new Move(0, this.right);
            }
            throw new Error(`Unrecognized destination of the tap: '${components[1]}'. Must be yl or yr.`);
        }
        const numFingersSplit = Number.parseInt(components[0], 10);
        if (Number.isNaN(numFingersSplit)) {
            throw new Error(`Unrecognized first parameter ${components[0]}. Must be ml, mr or number of fingers to split.`);
        }
        if (numFingersSplit <= 0) {
            throw new Error('Number of finger to split must be positive.');
        }

        if (components[1] === 'ml') {
            if (numFingersSplit >= this.right) {
                if (this.right <= 1) {
                    throw new Error('Too few fingers on right hand to split.');
                }
                throw new Error(`Number of finger to split to left hand must be between 1 and ${this.right - 1}.`);
            }
            this.AcceptDamage(new Move(numFingersSplit, -numFingersSplit));
            return new Move(0, 0);
        } else if (components[1] === 'mr') {
            if (numFingersSplit >= this.left) {
                if (this.right <= 1) {
                    throw new Error('Too few fingers on left hand to split.');
                }
                throw new Error(`Number of fingers to split to right hand must be between 1 and ${this.left - 1}.`);
            }
            this.AcceptDamage(new Move(-numFingersSplit, numFingersSplit));
            return new Move(0, 0);
        }
        throw new Error(`Unrecognized destination of the split: '${components[1]}'. Must be ml or mr.`);
    }
    SetKeyboardCommand(keyboardCommand) { this.keyboardCommand = keyboardCommand; }
}

const Turn = {
    Player1: Symbol("player1"),
    Player2: Symbol("player2"),
}

function NextTurn(turn) {
    return turn === Turn.Player1 ? Turn.Player2 : Turn.Player1;
}

class State {
    constructor(player1, player2, turn) {
        this.player1 = player1;
        this.player2 = player2;
        this.turn = turn;
    }

    Next(keyboardCommand) {
        let currentPlayer = this.player1;
        let otherPlayer = this.player2;
        if (this.turn === Turn.Player2) {
            currentPlayer = this.player2;
            otherPlayer = this.player1;
        }
        currentPlayer.SetKeyboardCommand(keyboardCommand);
        try {
            const move = currentPlayer.GetMove();
            otherPlayer.AcceptDamage(move);
            this.turn = NextTurn(this.turn);
            this.Display();
        } catch (err) {
            Print(err.message);
        }
    }

    GameOver() {
        return this.player1.Lost() || this.player2.Lost();
    }

    Display() {
        if (this.player1.Lost()) {
            Print("Player 2 won!");
        } else if (this.player2.Lost()) {
            Print("Player 1 won!");
        } else {
            Print("Player 1: " + this.player1.Format());
            Print("Player 2: " + this.player2.Format());
            Print("It's Player " + ((this.turn == Turn.Player1) ? 1 : 2) + "'s turn!");
        }
    }
}

$(document).ready(function () {
    let state = new State(new HumanPlayer(), new HumanPlayer(), Turn.Player1);
    state.Display();

    $('#command').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode === 13) {
            $('#command').prop("disabled", true);
            state.Next($('#command').val());
            $('#command').val("");
            if (!state.GameOver()) {
                $('#command').prop("disabled", false);
                $('#command').focus();
            }
        }
    });
});