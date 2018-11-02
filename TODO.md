# Todo list for [startpage]


[startpage]: https://gitlab.com/LKD70/startpage

## fixes
[] Kill JQuery

## constructor.js
- [] full rewrite
- [] enable linting
- [] Add no follow option for commands QueryParser

## input.js
- [] end the line with :{Command-Shorthand} to send the preceeding value as the search parameter of a command
	Example: `5+5:t` would send the result of `5+5` as the query of the command 't' (telegram).

## features
- [] Add (optional) location to weather
- [] Add (optional) rain animation based on weather
- [] star animation based on time of day (optional)
- [] RSS stream support
- [] world clock
- [] notes command - Add note based on text before '>' like with the calculator

## Customizability
- [] fonts
- [] background
- [] keybindings/mapping
- [] dynamic notes - Allow for adding/removing note tabs

## rewrite
- [] move all CSS in to individual files
- [] Pure javascript? Remove JQuery...

## documentation
- [] document how commands work, how use queries, etc...
