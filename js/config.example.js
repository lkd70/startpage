'use strict';

/* eslint-disable sort-keys*/
const config = {};

config.categories = [
	{
		title: 'social',
		url: '',
		color: '#223349',
		sites: [
			{
				url: 'https://facebook.com',
				name: 'Facebook'
			},
			{
				url: 'https://twitter.com',
				name: 'Twitter'
			}
		]
	},
	{
		title: 'Development',
		url: '',
		color: '#1A2832',
		sites: [
			{
				url: 'https://github.com',
				name: 'GitHub'
			},
			{
				url: 'https://gitlab.com',
				name: 'GitLab'
			}
		]
	},
	{
		title: 'Other',
		url: '',
		color: '#1C323B',
		sites: [
			{
				url: 'https://youtube.com',
				name: 'YouTube'
			}
		]
	}
];

config.commands = [
	[ null, 'Google', '*', 'https://encrypted.google.com', '/search?q={}', '#10161f' ],
	[ 'Work', 'GitHub', 'g', 'https://github.com', '/search?q={}', '#333' ],
	[ 'Work', 'Inbox', 'I', 'https://inbox.google.com', '/search/{}', '#4285f4' ],
	[ 'Work', 'Keep', 'k', 'https://keep.google.com', '/#search/text={}', '#fb0' ],
	[ 'Look', 'Photos', 'F', 'https://photos.google.com', '/search/{}', '#34a853' ],
	[ 'Lurk', 'Reddit', 'r', 'https://www.reddit.com', '/search?q={}', '#223349' ],
	[ 'Watch', 'YouTube', 'y', 'https://youtube.com/feed/subscriptions', '/results?search_query={}', '#1A2832' ],
	[ 'Send', 'Telegram', 't', 'https://api.telegram.org', '/botTOKEN/sendMessage?chat_id=CHAT_ID&disable_notification=true&text={}', '179CDE' ]
];

config.clock = {
	delimiter: ':'
};

config.search = {
	delimiter: ':',
	pathDelimiter: '/',
	colourMatchedDomains: true,
	newTab: false,
	instantRedirect: false,
	suggestions: true,
	suggestionsLimit: 5,
	defaultSuggestions: {
		g: [ 'g/issues', 'g/pulls', 'gist.github.com' ],
	},
	influencers: [ {
		limit: 5,
		name: 'Default',
	},
	{
		limit: 1,
		name: 'History',
	},
	{
		limit: 5,
		name: 'DuckDuckGo',
	},
	],
};

config.weather = {
	location: '', // http://bulk.openweathermap.org/sample/ - Find your city ID.
	api_key: '', // https://openweathermap.org/appid - https://home.openweathermap.org/api_keys
	units: 'metric' // 'standard' (Kelvin), 'metric' (Celsius), or 'imperial' (Fahrenheit)
};
