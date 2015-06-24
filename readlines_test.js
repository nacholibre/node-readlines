'use strict';

var lineByLine = require('./readlines.js');

var assert = require('assert');

describe.only('Line by line', function() {
    it('should get all lines', function () {
        var filename = __dirname + '/dummy_files/twoLineFile.txt';

        var liner = new lineByLine(filename);

        assert(liner.next().toString('ascii') === 'hello');
        assert(liner.next().toString('ascii') === 'hello2');
        assert(liner.next() === false);
        assert(liner.next() === false);
        assert(liner.fd === null);
    });

    it('should get all lines even if the file doesnt end with new line', function () {
        var filename = __dirname + '/dummy_files/badEndFile.txt';

        var liner = new lineByLine(filename);

        assert(liner.next().toString('ascii') === 'google.com');
        assert(liner.next().toString('ascii') === 'yahoo.com');
        assert(liner.next() === false);
        assert(liner.fd === null);
    });

    it('should read right between two chunks', function () {
        var filename = __dirname + '/dummy_files/normalFile.txt';
        var liner = new lineByLine(filename, {'readChunk': 16});

        assert(liner.next().toString('ascii') === 'google.com');
        assert(liner.next().toString('ascii') === 'yahoo.com');
        assert(liner.next().toString('ascii') === 'yandex.ru');
        assert(liner.next() === false);
        assert(liner.fd === null);
    });

    it('should read right between two chunks with small readChunkSize', function () {
        var filename = __dirname + '/dummy_files/normalFile.txt';
        var liner = new lineByLine(filename, {'readChunk': 3});

        assert(liner.next().toString('ascii') === 'google.com');
        assert(liner.next().toString('ascii') === 'yahoo.com');
        assert(liner.next().toString('ascii') === 'yandex.ru');
        assert(liner.next() === false);
        assert(liner.next() === false);
        assert(liner.fd === null);
    });

    it('should read right between two chunks with big readChunkSize', function () {
        var filename = __dirname + '/dummy_files/normalFile.txt';
        var liner = new lineByLine(filename, {'readChunk': 1024});

        assert(liner.next().toString('ascii') === 'google.com');
        assert(liner.next().toString('ascii') === 'yahoo.com');
        assert(liner.next().toString('ascii') === 'yandex.ru');
        assert(liner.next() === false);
        assert(liner.next() === false);
        assert(liner.fd === null);
    });

    it('should read big line', function () {
        var filename = __dirname + '/dummy_files/bigLinesFile.txt';
        var liner = new lineByLine(filename, {'readChunk': 1024});

        assert(liner.next().toString('ascii') === 'asdcmac320931c0293m8c12039c812039cm18039c182309c1m23c01923c123cj12m3hcj123ch12u3ch21mio3uc12yo3icu12o3icmu12o3icm12u3oic123umc1o2i3muc1oi3muc1oi3umc1oiuasdoicasmudcoasdmcuaoicu3oi21u3c1o3cum12i3ucmoiasudocisdumcaomudcoi2um31oic2i12o3uc1ocumoiasumdcoiasmuc');
        assert(liner.next().toString('ascii') === 'asdva3j21lk3vj12vlk3vj12lk3vj12lk3vj12lk3vj1k2asdcmac320931c0293m8c12039c812039cm18039c182309c1m23c01923c123cj12m3hcj123ch12u3ch21mio3uc12yo3icu12o3icmu12o3icm12u3oic123umc1o2i3muc1oi3muc1oi3umc1oiuasdoicasmudcoasdmcuaoicu3oi21u3c1o3cum12i3ucmoiasudocisdumcaomudcoi2um31oic2i12o3uc1ocumoiasumdcoiasmuc');
        assert(liner.next() === false);
        assert(liner.next() === false);
        assert(liner.fd === null);
    });
});
