// #include "SGF_GNU_library/SGFinterface.h"
#include "SimpleGUI/simplegui.h"
#include "agents/mcts_agent.h"
#include "controller/game.h"
#include "engine/board.h"
#include <memory>

using namespace go::engine;
using namespace go;
using namespace go::simplegui;

int main()
{
	Game game;
	auto agent = std::make_shared<BoardSimpleGUI>();
	auto agent2 = std::make_shared<MCTSAgent>();
	agent->set_player_idx(0);
	agent2->set_player_idx(1);
	game.register_agent(agent, 0);
	game.register_agent(agent2, 1);
	std::cout << "Do you want to initialize the game? Y/N ";
	char choice;
	std::cin >> choice;
	if (choice == 'Y' || choice == 'y') {
		GameState game_state = game.get_game_state();
		auto actions = agent->read_moves(game_state);
		game.force_moves(actions);
	}
	game.main_loop();
}
