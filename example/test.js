var object = {
	lang: 'pt',
	title: 'Titulo',
	description: 'Descrição'
}

var iTemplate = require('../index.js')({
	object: object,
	template: '_template',
	output: 'outputFolder',
	replacer: '{{@%s%}}'
});

iTemplate.generate();