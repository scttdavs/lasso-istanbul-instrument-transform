"use strict";
/* eslint-disable no-param-reassign */
const path = require('path');
const istanbul = require('istanbul-lib-instrument');
const resolve = require('lasso-resolve-from');

module.exports = {
    id: __filename,
    stream: false,
    createTransform(transformConfig) {
        let extensions = transformConfig.extensions;

        if (!extensions) {
            extensions = ['.js', '.es6'];
        }

        extensions = extensions.reduce((lookup, ext) => {
            if (ext.charAt(0) !== '.') {
                ext = `.${ext}`;
            }
            lookup[ext] = true;
            return lookup;
        }, {});

        return function lassoInstrumentTransform(code, lassoContext) {
            const filename = lassoContext.filename;

            if (!filename || !extensions.hasOwnProperty(path.extname(filename))) {
                // This shouldn't be the case
                return code;
            }

            if (!filename || filename.includes('node_modules/')
                     || (filename.includes('test/') && !transformConfig.allowTests)
                     || filename.includes('coverage/')
                     || filename.includes('benchmark/')
            ) {
                console.log("YEP");
                return code;
            }

            const instrumenter = istanbul.createInstrumenter({});

            const actualFile = resolve(__dirname, filename).path;
            const instrumentedCode = instrumenter.instrumentSync(code, actualFile);

            return instrumentedCode;
        };
    }
};
