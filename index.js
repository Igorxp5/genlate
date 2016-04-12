//Import Modules

var $ = new Object();
	$.fs = require('fs-extra');
	$.path = require('path');
	$._ = require('underscore');
	$.walk = require('walk');

var genlate = function(){

	var self = this;

	//Private Properties
	var method = {
		file: '-f',
		folder: '-d'
	}
	var extTemplateFile = '.gen';

	var settings = {
		method: method.folder, // -d or -f
		replacer: '{{@%s%}}',
		object: false, //required
		output: $.path.dirname( process.argv[1] ),
		template: false //required
	}

	//Public Properties


	//Private Methods
	var errorHandler = function(error) {
		throw new Error('genlate - ' + error);
	}

	var settingsValidation = function() {

		var validations = {
			method: function(m){
				return ( m === method.folder || m === method.file );
			},
			replacer: function(s){
				return ( s.search('%s%') !== -1 && s.length > 3 );
			},
			object: function(v){
				return ( typeof v === 'object' );
			},
			output: function(o){
				return ( typeof o === 'string' );
			},
			template: function(f){
				return ( typeof f == 'string' && ( ( settings.method == method.file && $.path.extname(f) === extTemplateFile ) || ( settings.method == method.folder && $.path.extname(f) == '' ) ) );
			}
		}

		var errorMensages = {
			method: 'The method must be ' + $._.values(method).join(' or '),
			replacer: 'The replacer must be type string and must contain "%s%"',
			object: 'The property: object must be a object',
			output: 'The output must be type string',
			template: 'The property: template must be type string'
		}

		for( var i in settings ) {
			if( !validations[i](settings[i]) )
				errorHandler(errorMensages[i]);
		}


	}

	var filter = function() {
		var filters = {
			output: function(o) {
				return $.path.resolve(o);
			},
			template: function(t) {
				return $.path.resolve(t);
			}
		}

		for( var i in filters ) {
			settings[i] = filters[i](settings[i]);
		}
	}

	var initializate = function() {
		settings = $._.extendOwn(settings, arguments[0]);

		for( var i in settings ) {
			if( settings[i] === false )
				errorHandler('Left the property: ' + i);
		}

		settingsValidation();

		filter();

	}

	//----End Intializate Methods

	var createContentFromTemplate = function(file) {

		if ( settings.method == '-d' )
			var file = $.path.resolve(settings.template, file);
		else
			var file = $.path.resolve(settings.template);


		var content = $.fs.readFileSync(file, 'utf-8');

		for ( var k in settings.object ) {

			var replacer = settings.replacer.split('%');

			var findReplacer = replacer[0]+k+replacer[2];

			var regex = new RegExp(findReplacer, 'g');

			content = content.replace(regex, settings.object[k]);

		}

		return content;

	}

	var createOutputFolder = function() {
		$.fs.ensureDir(settings.output);
	}

	//Public Methods
	this.generate = function() {

		if ( settings.method == method.file ) {
			//Method File, output is filename
			var content = createContentFromTemplate(settings.output);
			$.fs.ensureFile(settings.output);
			$.fs.writeFileSync(settings.output, content);

			return true;
		}

		//Else if settings.method is equal -d
		createOutputFolder();

		var walker = $.walk.walk(settings.template, {followLinks: false});

		//Creating Folders
		walker.on("directories", function (root, path, next) {
			for (var i = 0; i < path.length; i++) {

				var folder = ( $.path.basename(root) == $.path.basename(settings.template) ) ? $.path.resolve(settings.output, path[i].name) : $.path.resolve(settings.output, $.path.basename(root), path[i].name);

				$.fs.ensureDir(folder);
			}
		    next();
		});

		//Creating Files
		walker.on("file", function (root, fileStats, next) {
			var fileTemplate = ( $.path.basename(root) == $.path.basename(settings.template) ) ? $.path.resolve(settings.template, fileStats.name) : $.path.resolve(settings.template, $.path.basename(root), fileStats.name);

			var fileOutput = ( $.path.basename(root) == $.path.basename(settings.template) ) ? $.path.resolve(settings.output, fileStats.name) : $.path.resolve(settings.output, $.path.basename(root), fileStats.name);
				fileOutput = ( $.path.extname(fileOutput) == extTemplateFile ) ? fileOutput.substr(0, fileOutput.length -4) : fileOutput;

			if( $.path.extname(fileTemplate) == extTemplateFile ) {
				var contentFile = createContentFromTemplate(fileTemplate);

				$.fs.writeFileSync(fileOutput, contentFile);
			} else {
				$.fs.copy(fileTemplate, fileOutput);
			}


			next();
		});

	}

	initializate.apply(initializate, arguments);

}

module.exports = function(){
	return new genlate(arguments[0]);
};
