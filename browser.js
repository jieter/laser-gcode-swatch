import * as gcode from './index.js';
import * as opentype from 'opentype.js';
import * as $ from 'jquery';

import createObjectFromGCode from './lib/gcode-model.js';
import createScene from './lib/renderer.js';

// make bootstrap stop emitting errors about tether.
window.Tether = {};

var options = Object.assign({}, gcode.options);

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

var scene, object;
function visualize(code) {
    if (object) {
        scene.remove(object);
    }
    object = createObjectFromGCode(code);
    scene.add(object);
    console.log(object);
}

$(function () {
    scene = createScene($('#visualizer'));

    function update() {
        var code = gcode.swatch(options);
        visualize(code);
        document.querySelector('.gcode').innerHTML = code;
    }
    opentype.load(gcode.options.fontName, function (err, font) {
        if (err) {
            console.error(err);
        }
        options['font_settings']['font'] = font;

        update();
    });

    $('input').each(function () {
        var input = $(this);
        var name = input.attr('name');
        input.val(gcode.options[name]);

        input.on('input', function (e) {
            // update options, convert to number.
            options[name] = +e.target.value;
            console.log(`updated ${name}=${options[name]}\n options: `, options);
            visualize(gcode.swatch(options));
        });
    });



    $('button.gcode-generate').on('click', function (e) {
        e.preventDefault();
        update();
    });

    $('button.gcode-download').on('click', function (e) {
        e.preventDefault();
        download('swatch.gcode', gcode.swatch(options));
    });


});
