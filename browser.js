import * as gcode from './index.js';

var opentype = require('opentype.js');
var options = Object.assign({}, gcode.options);

opentype.load(gcode.options.fontName, function (err, font) {
    if (err) {
        console.error(err);
    }
    options['font_settings']['font'] = font;
});

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
    input.value = gcode.options[input.name];
    input.addEventListener('change', function (e) {
        // update options, convert to number.
        options[input.name] = +e.target.value;
        console.log('updated', input.name, 'options', options);
    });

});
document.querySelector('button.gcode-generate').addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector('.gcode').innerHTML = gcode.swatch(options);
});
document.querySelector('button.gcode-download').addEventListener('click', function (e) {
    e.preventDefault();
    download('swatch.gcode', gcode.swatch(options));
});
