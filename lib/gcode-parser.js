/**
 * Parses a string of gcode instructions, and invokes handlers for
 * each type of command.
 *
 * Special handler:
 *   'default': Called if no other handler matches.
 */


class GCodeParser {
    constructor(handlers) {
        this.handlers = handlers || {};
    }

    parseLine (text, info) {
        // Remove comments
        text = text.replace(/;.*$/, '').trim();
        text = text.replace(/\(.*\)$/, '').trim();

        if (text) {
            var tokens = text.split(' ');
            if (tokens) {
                var cmd = tokens[0];
                var args = {
                    'cmd': cmd
                };
                tokens.splice(1).forEach(function(token) {
                    var key = token[0].toLowerCase();
                    var value = parseFloat(token.substring(1));
                    args[key] = value;
                });
                var handler = this.handlers[tokens[0]] || this.handlers['default'];
                if (handler) {
                    return handler(args, info);
                }
            }
        }
    }

    parse (gcode) {
        var lines = gcode.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if (this.parseLine(lines[i], i) === false) {
                break;
            }
        }
    }
}


export default GCodeParser;
