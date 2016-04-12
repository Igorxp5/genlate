var object = {
	lang: 'pt',
	title: 'Titulo',
	description: 'Descrição'
}

var iTemplate = require('../index.js')({
	method: '-d' //-d directory and -f file
	object: object,
	template: '_template',
	output: 'outputFolder',
	replacer: '{{@%s%}}'
});

iTemplate.generate();
