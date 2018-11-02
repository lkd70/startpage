'use strict';
/* eslint-disable no-undef */
/* global config */

const getHelp = () => new Help({
	commands: config.commands,
	newTab: config.search.newTab,
});

const getQueryParser = () => new QueryParser({
	commands: config.commands,
	pathDelimiter: config.search.pathDelimiter,
	searchDelimiter: config.search.delimiter,
});

const getInfluencers = () => {
	const availableInfluencers = {
		Default: DefaultInfluencer,
		DuckDuckGo: DuckDuckGoInfluencer,
		History: HistoryInfluencer,
	};

	return config.search.influencers.map(i => new availableInfluencers[i.name]({
		defaultSuggestions: config.search.defaultSuggestions,
		limit: i.limit,
		queryParser: getQueryParser(),
	}));
};

const getSuggester = () => new Suggester({
	influencers: getInfluencers(),
	limit: config.search.suggestionsLimit,
});

const getForm = () => new Form({
	colors: config.search.colourMatchedDomains,
	help: getHelp(),
	instantRedirect: config.search.instantRedirect,
	newTab: config.search.newTab,
	queryParser: getQueryParser(),
	suggester: config.search.suggestions ? getSuggester() : false,
});

new Clock({ /* eslint-disable-line no-new */
	delimiter: config.clock.delimiter,
	form: getForm(),
});
