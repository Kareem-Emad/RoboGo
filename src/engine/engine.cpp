#include "interface.h"

bool go::engine::is_valid_move(const BoardState& board_state, const Action& action)
{
    Cell cell = board_state(action.x, action.y);
    return is_empty_cell(cell) && !is_suicidal_cell(cell, action.player_index) && !is_dead_cell(cell, action.player_index);

}

bool go::engine::make_move(GameState& game_state, const Action& action)
{
    if(game_state.player_turn == action.player_index && make_move(game_state.board_state, action))
    {
        game_state.player_turn = 1 - action.player_index;
        game_state.number_played_moves++;

        return true;
    }
    else
    {
        return false;
    }
}

bool go::engine::make_move(BoardState& board_state, const Action& action){
    if(is_valid_move(board_state, action))
    {
        board_state(action.x, action.y) = PLAYERS[action.player_index] == BLACK_BIT ?  Cell::BLACK : Cell::WHITE;
        return true;
    }
    else
    {
        return false;
    }
}

void go::engine::update_dead_cells(BoardState& board_state)
{
    
}

void go::engine::update_suicide_cells(BoardState& board_state)
{

}

bool go::engine::is_empty_cell(Cell cell)
{
    return (cell & (WHITE_BIT | BLACK_BIT)) == 0;
}

bool go::engine::is_suicidal_cell(Cell cell, uint32_t player)
{
    return (cell & (SUICIDE_BITS[player]) ) != 0;
}

bool go::engine::is_dead_cell(Cell cell, uint32_t player_index)
{
    return (cell & (DEAD_BIT | PLAYERS[player_index]) ) != 0;
}

bool go::engine::is_dead_cell(Cell cell)
{
    return (cell & DEAD_BIT) != 0;
}