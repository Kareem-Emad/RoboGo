#include "gtp.h"
#include <algorithm>
#include <iterator>
#include <sstream>
#include <stdexcept>
using namespace gtp;

/**
 * @param   {string}    command Command Name
 * @param   {Array}     args    Array of objects that contains command arguments
 * @returns {string}    request string containing required request
 */
string gtp::make_request(string command, vector<string> args, int id)
{
	std::map<string, int> commands_args = {{"protocol_version", 0},
	                                       {"name", 0},
	                                       {"version", 0},
	                                       {"known_command", 1},
	                                       {"list_commands", 0},
	                                       {"quit", 0},
	                                       {"boardsize", 1},
	                                       {"clear_board", 0},
	                                       {"komi", 1},
	                                       {"fixed_handicap", 1},
	                                       {"place_free_handicap", 1},
	                                       {"set_free_handicap", 1},
	                                       {"play", 1},
	                                       {"genmove", 1},
	                                       {"undo", 0},
	                                       {"time_settings", 3},
	                                       {"time_left", 3},
	                                       {"final_score", 0},
	                                       {"final_status_list", 1},
	                                       {"loadsgf", 2},
	                                       {"reg_genmove", 1},
	                                       {"showboard", 0}};

	// Validate Command
	std::map<std::string, int>::iterator it;
	it = commands_args.find(command);
	if (it == commands_args.end())
		throw std::invalid_argument("Invalid Argument: command doesn't exist");

	// Validate id
	if (id <= 0 && id != -1)
		throw std::invalid_argument(
		    "Invalid Argument: id must be a positive integer");

	// Validate arguments
	int required_args = commands_args[command];
	int given_args = args.size();
	if (given_args != required_args)
	{
		throw std::invalid_argument(
		    "Invalid Argument: " + command + " arguments list should be " +
		    to_string(required_args) + ", however, " + to_string(given_args) +
		    " was provided");
	}

	// Costruct request
	string request = "";
	if (id > 0)
		request += to_string(id) + " ";

	request += command;

	// concatenate arguments
	for (uint32_t i = 0; i < args.size(); i++)
		request += " " + args[i];

	request += "\n";
	return request;
}

/**
 * @param   {string}    request     GTP command
 * @returns {string}    response    string containing GTP response in case of
 * success or GTP error in case of failure
 */
string gtp::take_request(string request)
{
	vector<string> result;
	std::istringstream iss(request);
	for (string req; iss >> req;)
		result.push_back(req);
	// To Do
	// assign command and arg
	// string command = result[0];
	// Check if there is an id
	vector<string> args(result.begin() + 1, result.end());

	// call corresponding functions
	return "";
}
