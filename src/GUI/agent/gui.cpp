#include "gui.h"
#include <mutex>
#include <vector>
#include <stdexcept>
#include <functional>
using namespace go::gui;
using namespace go::engine;


BoardGUI::BoardGUI(Server* s, char m, std::string c, Agent* a)
{
    if (s == NULL)
        throw std::invalid_argument("invalid argment expected Server but found NULL");

    if (!(m == 'h' || m == 'H' || m == 'a' || m == 'A'))
        throw std::invalid_argument("mode must be either h for human or a for agent");

    if ((m == 'a' || m == 'A') && a == NULL)
        throw std::invalid_argument("invalid argment expected Agent but found NULL");
    
    server = s;
    to_lower(c);
    color = Color(c);
    agent = a;
    mode = (m == 'h' || m == 'H') ? 'h' : 'a';

    using std::placeholders::_1;
    std::function<void(std::string)> res_handler = std::bind(&BoardGUI::response_handler, this, _1);
    server->add_message_handler(res_handler);
}

uint32_t BoardGUI::generate_move(const Game& game)
{
    if (mode == 'a')
    {
        uint32_t move = agent->generate_move(game);
        uint32_t row = BOARD_SIZE - (move / BOARD_SIZE);
        uint32_t column = (move % BOARD_SIZE) + 1;
        Move m = Move(color, Vertex(row, column));
        
        std::vector<std::string> args;
        args.push_back(m.val());
        int id = (color.val() == "w") ? 1 : 2;
        server->send(gtp::make_request("play", args, id));

        return move;
    }
    else
    {
        std::vector<std::string> args;
        args.push_back(color.val());
        int id = (color.val() == "w") ? 1 : 2;
        server->send(gtp::make_request("genmove", args, id));
        wait_response = true;

        std::mutex m;
        std::unique_lock<std::mutex> lk(m);
        lock_gen_move.wait(lk, [this]{return !this->waiting();});
        if (response == "resign")
            return 0;

        Vertex v = Vertex(response);
        uint32_t row = 0;
        uint32_t column = 0;
        Vertex::indecies(v, row, column);

        return engine::BoardState::index(row-1, column-1);
    }
}

bool BoardGUI::waiting()
{
    return wait_response;
}

void BoardGUI::response_handler(string res)
{
    if (!wait_response)
        return;

    res = gtp::parse_response(res).second;
    response = res;
    wait_response = false;
    lock_gen_move.notify_one();
}

void BoardGUI::to_lower(std::string& str)
{
	for_each(str.begin(), str.end(), [](char& c) { c = std::tolower(c); });
}
