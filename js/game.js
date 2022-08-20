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
        for (let i = 4; i > this.left; --i) result += '▗';
        for (let i = this.left; i >= 1; --i) result += '▐';
        return result;
    }
    FormatRightHand() {
        let result = ''
        for (let i = 1; i <= this.right; ++i) result += '▌';
        for (let i = this.right; i < 4; ++i) result += '▖';
        return result;
    }

    GetMove() { return null; }
}

function Print(message) {
    $("#console").append('\n' + message);
}

class HumanPlayer extends Player {
}

const Turn = {
    Player1: Symbol("player1"),
    Player2: Symbol("player2"),
}

function NextTurn(turn) {
    switch (turn) {
        case Turn.Player1:
            return Turn.Player2;
        default:
            Turn.Player1
    }
}

class State {
    constructor(player1, player2, turn) {
        this.player1 = player1;
        this.player2 = player2;
        this.turn = turn;
    }

    Next() {
        let currentPlayer = (turn == Turn.Player1) ? this.player1 : this.player2;
        const move = currentPlayer.GetMove();
        this.player2.AcceptDamage(move);
    }

    Display() {
        Print("Player 1: " + this.player1.Format());
        Print("Player 2: " + this.player2.Format());
    }
}

function DisplayCommand() {
    Print('Enter your move: `(source | number_of_fingers) > number_of_fingers`. Source = ml/mr; dest = yl/yr. Examples:');
    Print(' * To split 2 fingers from your left hand to your right hand:  2 > mr');
    Print(' * To use your left hand to tap their right hand:              ml > yr');
}

$(document).ready(function () {
    let state = new State(new HumanPlayer(), new HumanPlayer());
    state.Display();
    DisplayCommand();
});