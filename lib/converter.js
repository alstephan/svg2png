"use strict";
/*global phantom: false*/

var webpage = require("webpage");

if (phantom.args.length !== 2) {
    console.error("Usage: converter.js source scale");
    phantom.exit();
} else {
    convert(phantom.args[0], Number(phantom.args[1]));
}

function convert(source, scale) {
    var page = webpage.create();

    console.error(source);

    page.open(source, function (status) {
        if (status !== "success") {
            console.error("Unable to load the source file.");
            phantom.exit();
            return;
        }

        console.error('success');

        try {
            var dimensions = getSvgDimensions(page);
            page.viewportSize = {
                width: Math.round(dimensions.width * scale),
                height: Math.round(dimensions.height * scale)
            };
            if (dimensions.shouldScale) {
                page.zoomFactor = scale;
            }
        } catch (e) {
            console.error("Unable to calculate dimensions.");
            console.error(e);
            phantom.exit();
            return;
        }

        // This delay is I guess necessary for the resizing to happen?
        setTimeout(function () {
            console.error('rendering base64');
            base64 = page.renderBase64('PNG');
            console.error(base64);
            console.log(base64);
            phantom.exit();
        }, 0);
    });
}

function getSvgDimensions(page) {
    return page.evaluate(function () {
        /*global document: false*/

        var el = document.documentElement;
        var bbox = el.getBBox();

        var width = parseFloat(el.getAttribute("width"));
        var height = parseFloat(el.getAttribute("height"));
        var hasWidthOrHeight = width || height;
        var viewBoxWidth = el.viewBox.animVal.width;
        var viewBoxHeight = el.viewBox.animVal.height;
        var usesViewBox = viewBoxWidth && viewBoxHeight;

        if (usesViewBox) {
            if (width && !height) {
                height = width * viewBoxHeight / viewBoxWidth;
            }
            if (height && !width) {
                width = height * viewBoxWidth / viewBoxHeight;
            }
            if (!width && !height) {
                width = viewBoxWidth;
                height = viewBoxHeight;
            }
        }

        if (!width) {
            width = bbox.width + bbox.x;
        }
        if (!height) {
            height = bbox.height + bbox.y;
        }

        return { width: width, height: height, shouldScale: hasWidthOrHeight || !usesViewBox };
    });
}
