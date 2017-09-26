
function number_format(n) {
    return (+n).toFixed(4).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/,'$1');
}

function coord(x, y) {
    return 'X' + number_format(x) + ' Y' + number_format(y);
}

function G1(x, y){ return 'G1 ' + coord(x, y); }
function G0(x, y){ return 'G0 ' + coord(x, y); }

function laser_on(intensity, feedrate, cmds) {
    if (Array.isArray(cmds)) {
        cmds = cmds.join(' ');
    }

    return `G1 F${feedrate} G04 P0 M03 S${intensity}\n ${cmds} M05 S0`;
}

function square(x, y, dx, dy, stepy, intensity, feedrate) {
    var cmds = [`( square feedrate=${feedrate}, power=${intensity} )`, G0(x, y)];
    var steps = (dy / stepy);
    for (var i = 0; i <= steps; i++) {
        var cury = y + (i * stepy);
        var direction  = (i + 1) % 2;
        var curx = x + direction * dx;

        cmds.push(G1(curx, cury));
        if (i < steps) {
            cmds.push(G1(curx, cury + stepy));
        }
    }

    return laser_on(intensity, feedrate, cmds);
}


var opentype = require('opentype.js');
var font;
opentype.load('Y14.5M-2009.ttf', function (err, loaded_font) {
    if (err) {
        console.error(err);
    }
    console.log('( Font loaded )');
    font = loaded_font;
});


function text(x, y, text, options) {
    options = Object.assign({}, {
        intensity: 1000,
        fontSize: 10,
        rotate: 0
    }, options);

    var alpha = options.rotate * Math.PI / 180;

    var R = function (p) {
        var x = p.x || p[0];
        var y = p.y || p[1];

        return [
            x * Math.cos(alpha) - y * Math.sin(alpha),
            x * Math.sin(alpha) + y * Math.cos(alpha)
        ]
    }

    var ret = [`( text "${text}" at [${x}, ${y}])\n`];
    var first;
    font.getPath(text, x, y, options.fontSize).commands.forEach(function (command) {
        var p = R(command);
        if (command['type'] != 'Z' && (isNaN(p[0]) || isNaN(p[1]))) {
            console.log(command, p);
        }
        if (first === undefined) {
            first = p;
        }
        switch (command.type) {
            case 'M':
                ret.push('M5');
                ret.push(G0(p[0], -p[1]));
                ret.push('M3 S' + options.intensity);
            break;
            case 'L':
                ret.push(G1(p[0], -p[1]));
            break;
            case 'Z':
                ret.push(G1(first[0], -first[1]));
                first = undefined;
            break;
            case 'Q':
                // Quadratic bezier curve from current position to given coordinate
                // with control point x1, y1
                var cp = R([command.x1, command.y1]);

                // TODO: make this actually do a q-bezier curve instead of just a line.
                ret.push(G1(p[0], -p[1])); break;

            break;
            default:
                console.log(command)
        }
    });
    return laser_on(options.intensity, options.feedrate, ret) + ' M5 ';
}

var default_options = {
    preamble: '( generated by laser-gcode-swatch )\nM05 S0 G90 G21',
    postamble: 'G1 X0 Y0 M18',
    intensity_min: 500,
    intensity_step: 100,
    intensity_max: 1200,
    feedrate_min: 1000,
    feedrate_step: 500,
    feedrate_max: 3500,

    size_x: 10,
    space_x: 2,

    size_y: 10,
    space_y: 2,

    stepover: 0.5,

    font_settings: {
        fontSize: 6,
        intensity: 1000,
        feedrate: 3000
    }
};

function swatch(options) {
    options = Object.assign({}, default_options, options);

    commands = [
        G0(0, 0),
        text(0, -12, 'speed -> = ', Object.assign({}, options.font_settings, {rotate: -90, fontSize: 10})),
        text(0, 18, 'Power ->', Object.assign({}, options.font_settings, {fontSize: 10}))
    ];

    var feedrate_steps = Math.ceil((options.feedrate_max - options.feedrate_min) / options.feedrate_step);
    var intensity_steps = Math.ceil((options.intensity_max - options.intensity_min) / options.intensity_step);
    for (var i = 0; i <= feedrate_steps; i++) {
        var x = 0;
        var y = i * (options.size_y + options.space_y);
        var feedrate = options.feedrate_min + i * options.feedrate_step;
        commands.push(text(y, x - 2, '' + feedrate, Object.assign({}, options.font_settings, {
            rotate: -90
        })));

        commands.push('(block for feedrate ' + feedrate + ' at ' + x + ',' + y + ')');

        for (var j = 0; j <= intensity_steps; j++) {
            var intensity = options.intensity_min + j * options.intensity_step;
            x = j * (options.size_x + options.space_x);
            if (i == 0) {
                commands.push(text(x, y + options.font_settings.fontSize, '' + intensity, options.font_settings));
            }
            commands.push(
                square(x, y, options.size_x, options.size_y, options.stepover, intensity, feedrate)
            );
        }
    }

    var gcode = options.preamble + '\n\n' + commands.join('\n') + '\n\n' + options.postamble;

    return gcode;
};

if (typeof window !== 'undefined') {
    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
    document.querySelectorAll('input').forEach(function (input) {
        console.log(input.name);
        input.value = default_options[input.name];
    });
    document.querySelector('button.gcode-generate').addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector('.gcode').innerHTML = swatch();
    });
    document.querySelector('button.gcode-download').addEventListener('click', function (e) {
        e.preventDefault();
        download('swatch.gcode', swatch());
    });
} else {
    setTimeout(function () {
        console.log(swatch());
    }, 100);
}
