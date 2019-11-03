#include "simplegui.h"

go::simplegui::BoardSimpleGUI::BoardSimpleGUI(){}

//Blocks waiting for input from user, and return when he enters position
uint32_t go::simplegui::BoardSimpleGUI::generate_move(const Game& game){
    
    std::string user_input;
    std::stringstream stream;

    std::string command;
    uint32_t x,y;
    
    print_board(game.get_board_state());

    while(true){
        get_user_input(user_input);

        stream.clear();
        stream << user_input;
        stream >> command;
        
        to_lower(command);

        if(command== "board"){
            print_board(game.get_board_state());
        }
        else if(command == "mv"){
            read_position(stream,x,y);
            return go::engine::BoardState::index(x,y);
        }
        else if(command == "lib"){
            read_position(stream,x,y);
            uint32_t index = go::engine::BoardState::index(x,y);
            print_liberties(get_cluster(game.get_cluster_table(),index));
        }
        else if(command == "cluster"){
            read_position(stream,x,y);
            uint32_t index = go::engine::BoardState::index(x,y);
            print_cluster_info(index,game.get_cluster_table());
        }
        else if(command == "state"){
            print_game_state(game.get_game_state());
        }
    }
}

void go::simplegui::BoardSimpleGUI::read_position(std::stringstream& stream, uint32_t& x,uint32_t &y){
    std::string position;
    stream >> position;
    
    to_lower(position);

    char column = position[0];
    uint32_t row = atoi(position.substr(1).c_str());

    get_index(column,row,x,y);
}

void go::simplegui::BoardSimpleGUI::to_lower(std::string& str){
    for_each(str.begin(),str.end(),[] (char& c){
                c = std::tolower(c);
    });
}

void go::simplegui::BoardSimpleGUI::get_index(char column, uint32_t row, uint32_t& x, uint32_t& y){
    assert(column >= 'a' && column <= 't' && column != 'i');
    assert(row >= 1 && row <= 19);

    const char MIN_CHAR = 'a';

    //board doesn't have letter i, so I decrement column to remove the gap
    if(column >= 'j')
        column--;

    x = BOARD_SIZE - row;
    y = column - MIN_CHAR;
}

// clears console
void go::simplegui::BoardSimpleGUI::clear_screen(){
    // Hacky solution, but crossplatform :D
    std::cout << "\x1B[2J\x1B[H";
}

inline bool go::simplegui::BoardSimpleGUI::is_special(uint32_t idx){
    return idx == 3 || idx == 9 || idx == 15;
}

inline char go::simplegui::BoardSimpleGUI::get_board_symbol(go::engine::Cell cell, uint32_t x, uint32_t y){

    if(cell == go::engine::Cell::WHITE)
        return '@';
    else if(cell == go::engine::Cell::BLACK)
        return '#';
    else if(is_special(x) && is_special(y))
        return '_';
    else
        return '.';
}

void go::simplegui::BoardSimpleGUI::print_board(const go::engine::BoardState& board){
    clear_screen();
    std::cout<<"\t\t   ";
    for(char i='A';i<='T';++i){
        if(i=='I') //for some reason, go boatd doesn't have letter i
            continue;
        std::cout<<i<<" ";
    }

    std::cout<<std::endl;

    const int LAST_TWO_DIGIT_NUMBER = 10;

    for(int i=0;i<BOARD_SIZE;++i){

        std::cout<<"\t  \t";
        if(BOARD_SIZE - i < LAST_TWO_DIGIT_NUMBER)
            std::cout<<" ";

        std::cout<<BOARD_SIZE - i<<" ";

        for(int j=0;j<BOARD_SIZE;++j)
            std::cout<<get_board_symbol(board(i,j),i,j)<<" ";

        std::cout<<BOARD_SIZE - i<<std::endl;
        
    }

    std::cout<<"\t\t   ";
    for(char i='A';i<='T';++i){
        if(i=='I') //for some reason, go boatd doesn't have letter i
            continue;
        std::cout<<i<<" ";
    }

    std::cout<<std::endl;
}

void go::simplegui::BoardSimpleGUI::print_game_state(const go::engine::GameState& game_state){
    clear_screen();
    print_board(game_state.board_state);
    std::cout<<"Players turn: "<<game_state.number_played_moves<<"\t\t\t";
    std::cout<<"Number of played moves: "<<game_state.number_played_moves<<std::endl;

    std::cout<<"\tPlayer 0 \t\t\t Player 1"<<std::endl;

    std::cout<<"Number of Captured: "<<game_state.players[0].number_captured_enemies;
    std::cout<<"\t\t\tNumber of Captured: "<<game_state.players[1].number_captured_enemies<<std::endl;

    std::cout<<"Number of Alive: "<<game_state.players[0].number_alive_stones;
    std::cout<<"\t\t\tNumber of Alive: "<<game_state.players[1].number_alive_stones<<std::endl;

    std::cout<<"Total Score: "<<game_state.players[0].total_score;
    std::cout<<"\t\t\t\tTotal Score: "<<game_state.players[1].total_score<<std::endl;
}

void go::simplegui::BoardSimpleGUI::print_liberties(const go::engine::Cluster& cluster){
    clear_screen();
    std::cout<<"Liberty map"<<std::endl;
    std::cout<<"\t\t   ";
    for(char i='A';i<='T';++i){
        if(i=='I')
            continue;
        std::cout<<i<<" ";
    }

    std::cout<<std::endl;

    const int LAST_TWO_DIGIT_NUMBER = 10;

    for(int i=0;i<BOARD_SIZE;++i){

        std::cout<<"\t  \t";
        if(BOARD_SIZE - i < LAST_TWO_DIGIT_NUMBER)
            std::cout<<" ";

        std::cout<<BOARD_SIZE - i<<" ";

        for(int j=0;j<BOARD_SIZE;++j)
            std::cout<<cluster.liberties_map[go::engine::BoardState::(i,j)]<<" ";

        std::cout<<BOARD_SIZE - i<<std::endl; 
    }  

    

}

void go::simplegui::BoardSimpleGUI::print_cluster_info(uint32_t index,const go::engine::ClusterTable& table){
    clear_screen();
    const go::engine::Cluster& cluster = go::engine::get_cluster(table,);

    std::cout<<"Parent idx = "<<cluster.parent_idx;

    uint32_t x = cluster.parent_idx / BOARD_SIZE;
    uint32_t y = cluster.parent_idx % BOARD_SIZE;

    std::cout<<" = "<<get_alphanumeric_position(x,y)<<" ";
    std::cout<<"Player idx = "<<cluster.player<<std::endl;
    std::cout<<"Cluster size = "<<cluster.size<<std::endl;
    std::cout<<"Number of liberties"<<cluster.num_liberties<<std::endl;
    std::cout<<"Cluster positions: "<<std::endl;
    std::cout<<"[";

    std::vector<uint32_t> indices;
    get_cluster_indices(indices,table,cluster.parent_idx);

    for(uint32_t i = 0 ; i < indices.size() ; ++i){
        x = indices[i] / BOARD_SIZE;
        y = indices[i] % BOARD_SIZE;
        std::cout<<get_alphanumeric_position(x,y);
        if(i != indices.size() - 1)
            std::cout<<",";
    }
    std::cout<<"]"<<std::endl;

}

void go::simplegui::BoardSimpleGUI::get_cluster_indices(std::vector<uint32_t>& indices,const go::engine::ClusterTable& table,uint32_t parent_idx){
    
    indices.clear();
    for(uint32_t i = 0; i < BOARD_SIZE*BOARD_SIZE; ++i){
        if(go::engine::get_cluster_idx(table,i) == parent_idx)
            indices.push_back(i);
    }

}

inline std::string go::simplegui::BoardSimpleGUI::get_alphanumeric_position(uint32_t x,uint32_t y){
    uint32_t row = BOARD_SIZE - x;
    char column = 'A' + y;

    return std::to_string(row) + column;
}

void go::simplegui::BoardSimpleGUI::get_user_input(std::string& user_input){
    std::cout<<"Enter Input: ";
    std::getline(std::cin,user_input);
}