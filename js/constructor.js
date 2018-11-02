'use strict';

/* eslint-disable */

const _ = {
	bodyClassAdd: c => _.el('body').classList.add(c),
	bodyClassHas: c => _.el('body').classList.contains(c),
	bodyClassRemove: c => _.el('body').classList.remove(c),
	el: s => document.querySelector(s),
	els: s => [].slice.call(document.querySelectorAll(s) || []),
	escapeRegex: s => s.replace(/[-\/\\^_*+?.()|[\]{}]/g, '\\_&'),
	ieq: (a, b) => a.toLowerCase() === b.toLowerCase(),
	iin: (a, b) => a.toLowerCase().indexOf(b.toLowerCase()) !== -1,
	isDown: e => [ 'c-n', 'down', 'tab' ].includes(_.key(e)),
	isRemove: e => [ 'backspace', 'delete' ].includes(_.key(e)),
	isUp: e => [ 'c-p', 'up', 's-tab' ].includes(_.key(e)),

	jsonp: url => {
		const script = document.createElement('script');
		script.src = url;
		_.el('head').appendChild(script);
	},

	key: e => {
		const ctrl = e.ctrlKey;
		const shift = e.shiftKey; // has This Button been pressed

		// Jump
		switch (e.which) { /* eslint-disable-line default-case */
		case 8:
			return 'backspace';
		case 9:
			return shift ? 's-tab' : 'tab';
		case 13:
			return 'enter';
		case 16:
			return 'shift';
		case 17:
			return 'ctrl';
		case 18:
			return 'alt';
		case 27:
			return 'escape';
		case 38:
			return 'up';
		case 40:
			return 'down';
		case 46:
			return 'delete';
		case 78:
			return ctrl ? 'c-n' : 'n';
		case 80:
			return ctrl ? 'c-p' : 'n';
		case 91:
			return 'super';
		}
	},
};


class Clock {
	constructor(options) {
		this._el = _.el('#clock');
		this._delimiter = options.delimiter;
		this._form = options.form;
		this._setTime = this._setTime.bind(this);
		this._registerEvents();
		this._start();
	}

	_pad(num) { /* eslint-disable-line class-methods-use-this */
		return ('0' + num.toString()).slice(-2);
	}

	_registerEvents() {
		this._el.addEventListener('click', this._form.show);
	}

	_setTime() {
		const date = new Date();
		const hours = this._pad(date.getHours());
		const minutes = this._pad(date.getMinutes());
		this._el.innerHTML = hours + this._delimiter + minutes;
	}

	_start() {
		this._setTime();
		setInterval(this._setTime, 1000);
	}
}

class Help {
	constructor(options) {
		this._el = _.el('#help');
		this._commands = options.commands;
		this._newTab = options.newTab;
		this._toggled = false;
		this._buildAndAppendLists();
		this._bindMethods();
		this._registerEvents();
	}

	toggle(show) {
		this._toggled = typeof show !== 'undefined' ? show : !this._toggled;
		this._toggled ? _.bodyClassAdd('help') : _.bodyClassRemove('help');
	}

	_bindMethods() {
		this._handleKeydown = this._handleKeydown.bind(this);
	}

	_buildAndAppendLists() {
		const lists = document.createElement('ul');
		lists.classList.add('categories');

		this._getCategories().forEach(category => {
			lists.insertAdjacentHTML(
				'beforeend',
				`<li class="category">
            <h2 class="category-name">${category}</h2>
            <ul>${this._buildListCommands(category)}</ul>
          </li>`
			);
		});

		this._el.appendChild(lists);
	}

	_buildListCommands(category) {
		return this._commands.map(([ cmdCategory, name, key, url ]) => {
			if (cmdCategory === category) {
				return (
					`<li class="command">
              <a href="${url}" target="${this._newTab ? '_blank' : '_self'}">
                <span class="command-key">${key}</span>
                <span class="command-name">${name}</span>
              </a>
            </li>`
				);
			}
		}).join('');
	}

	_getCategories() {
		const categories = this._commands
			.map(([ category ]) => category)
			.filter(category => category);

		return [ ...new Set(categories) ];
	}

	_handleKeydown(e) {
		if (_.key(e) === 'escape') this.toggle(false);
	}

	_registerEvents() {
		document.addEventListener('keydown', this._handleKeydown);
	}
}

class Influencer {
	constructor(options) {
		this._limit = options.limit;
		this._queryParser = options.queryParser;
	}

	addItem() {}
	getSuggestions() {}

	_addSearchPrefix(items, query) {
		const searchPrefix = this._getSearchPrefix(query);
		return items.map(s => searchPrefix ? searchPrefix + s : s);
	}

	_getSearchPrefix(query) {
		const {
			isSearch,
			key,
			split
		} = this._parseQuery(query);
		return isSearch ? `${key}${split} ` : false;
	}

	_parseQuery(query) {
		return this._queryParser.parse(query);
	}
}

class DefaultInfluencer extends Influencer {
	constructor({
		defaultSuggestions
	}) {
		super(...arguments);
		this._defaultSuggestions = defaultSuggestions;
	}

	getSuggestions(query) {
		return new Promise(resolve => {
			const suggestions = this._defaultSuggestions[query];
			resolve(suggestions ? suggestions.slice(0, this._limit) : []);
		});
	}
}

class DuckDuckGoInfluencer extends Influencer {
	constructor({
		queryParser
	}) {
		super(...arguments);
	}

	getSuggestions(rawQuery) {
		const {
			query
		} = this._parseQuery(rawQuery);
		if (!query) return Promise.resolve([]);

		return new Promise(resolve => {
			const endpoint = 'https://duckduckgo.com/ac/';
			const callback = 'autocompleteCallback';

			window[callback] = res => {
				const suggestions = res.map(i => i.phrase)
					.filter(s => !_.ieq(s, query))
					.slice(0, this._limit);

				resolve(this._addSearchPrefix(suggestions, rawQuery));
			};

			_.jsonp(`${endpoint}?callback=${callback}&q=${query}`);
		});
	}
}

class HistoryInfluencer extends Influencer {
	constructor() {
		super(...arguments);
		this._storeName = 'history';
	}

	addItem(query) {
		if (query.length < 2) return;
		let exists;

		const history = this._getHistory().map(([ item, count ]) => {
			const match = _.ieq(item, query);
			if (match) exists = true;
			return [ item, match ? count + 1 : count ];
		});

		if (!exists) history.push([ query, 1 ]);
		this._setHistory(this._sort(history));
	}

	getSuggestions(query) {
		return new Promise(resolve => {
			const suggestions = this._getHistory()
				.map(([ item ]) => item)
				.filter(item => this._itemContainsQuery(query, item))
				.slice(0, this._limit);

			resolve(suggestions);
		});
	}

	_fetch() {
		return JSON.parse(localStorage.getItem(this._storeName)) || [];
	}

	_getHistory() {
		this._history = this._history || this._fetch();
		return this._history;
	}

	_itemContainsQuery(query, item) {
		return query && !_.ieq(item, query) && _.iin(item, query);
	}

	_save(history) {
		localStorage.setItem(this._storeName, JSON.stringify(history));
	}

	_setHistory(history) {
		this._history = history;
		this._save(history);
	}

	_sort(history) {
		return history.sort((current, next) => current[1] - next[1]).reverse();
	}
}

class Suggester {
	constructor(options) {
		this._el = _.el('#search-suggestions');
		this._influencers = options.influencers;
		this._limit = options.limit;
		this._suggestionEls = [];
		this._bindMethods();
		this._registerEvents();
	}

	setOnClick(callback) {
		this._onClick = callback;
	}

	setOnHighlight(callback) {
		this._onHighlight = callback;
	}

	setOnUnhighlight(callback) {
		this._onUnhighlight = callback;
	}

	success(query) {
		this._clearSuggestions();
		this._influencers.forEach(i => i.addItem(query));
	}

	suggest(input) {
		input = input.trim();
		if (input === '') this._clearSuggestions();

		Promise.all(this._getInfluencerPromises(input)).then(res => {
			const suggestions = this._flattenAndUnique(res);
			this._clearSuggestions();

			if (suggestions.length) {
				this._appendSuggestions(suggestions, input);
				this._registerSuggestionEvents();
				_.bodyClassAdd('suggestions');
			}
		});
	}

	_appendSuggestions(suggestions, input) {
		suggestions.some((suggestion, i) => {
			const match = new RegExp(_.escapeRegex(input), 'ig');
			const suggestionHtml = suggestion.replace(match, `<u id="written">${input}</u>`);

			this._el.insertAdjacentHTML(
				'beforeend',
				`<li>
            <button
              type="button"
              class="button button button button Lined Thick search-suggestion"
              data-suggestion="${suggestion}"
              tabindex="-1"
            >
              ${suggestionHtml}
            </button>
          </li>`
			);

			return i + 1 >= this._limit;
		});

		this._suggestionEls = _.els('.button');
	}

	_bindMethods() {
		this._handleKeydown = this._handleKeydown.bind(this);
	}

	_clearClickEvents() {
		this._suggestionEls.forEach(el => {
			const callback = this._onClick.bind(null, el.value);
			el.removeEventListener('click', callback);
		});
	}

	_clearSuggestions() {
		_.bodyClassRemove('suggestions');
		this._clearClickEvents();
		this._suggestionEls = [];
		this._el.innerHTML = '';
	}

	// [[1, 2], [1, 2, 3, 4]] -> [1, 2, 3, 4]
	_flattenAndUnique(array) { /* eslint-disable-line class-methods-use-this */
		return [ ...new Set([].concat.apply([], array)) ];
	}

	_focusNext(e) {
		const exists = this._suggestionEls.some((el, i) => {
			if (el.classList.contains('highlight')) {
				this._highlight(this._suggestionEls[i + 1], e);
				return true;
			}
		});

		if (!exists) this._highlight(this._suggestionEls[0], e);
	}

	_focusPrevious(e) {
		const exists = this._suggestionEls.some((el, i) => {
			if (el.classList.contains('highlight') && i) {
				this._highlight(this._suggestionEls[i - 1], e);
				return true;
			}
		});

		if (!exists) this._unHighlight(e);
	}

	_getInfluencerPromises(input) {
		return this._influencers
			.map(influencer => influencer.getSuggestions(input));
	}

	_handleKeydown(e) {
		if (_.isDown(e)) this._focusNext(e);
		if (_.isUp(e)) this._focusPrevious(e);
	}

	_highlight(el, e) {
		this._unHighlight();

		if (el) {
			this._onHighlight(el.getAttribute('data-suggestion'));
			el.classList.add('highlight');
			e.preventDefault();
		}
	}

	_registerEvents() {
		document.addEventListener('keydown', this._handleKeydown);
	}

	_registerSuggestionEvents() {
		this._suggestionEls.forEach(el => {
			const value = el.getAttribute('data-suggestion');
			el.addEventListener('mouseover', this._highlight.bind(this, el));
			el.addEventListener('mouseout', this._unHighlight.bind(this));
			el.addEventListener('click', this._onClick.bind(null, value));
		});
	}

	_unHighlight(e) {
		const el = _.el('.highlight');

		if (el) {
			this._onUnhighlight();
			el.classList.remove('highlight');
			if (e) e.preventDefault();
		}
	}
}

class QueryParser {
	constructor(options) {
		this._commands = options.commands;
		this._searchDelimiter = options.searchDelimiter;
		this._pathDelimiter = options.pathDelimiter;
		this._protocolRegex = /^[a-zA-Z]+:\/\//i;
		this._urlRegex = /^((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)_/i;
	}

	parse(query) {
		const res = {
			query,
			split: null
		};

		if (query.match(this._urlRegex)) {
			const hasProtocol = query.match(this._protocolRegex);
			res.redirect = hasProtocol ? query : 'http://' + query;
		} else {
			const splitSearch = query.split(this._searchDelimiter);
			const splitPath = query.split(this._pathDelimiter);

			this._commands.some(([ category, name, key, url, searchPath ]) => {
				res.isKey = query === key;
				res.isSearch = !res.isKey && splitSearch[0] === key;
				res.isPath = !res.isKey && splitPath[0] === key;

				if (res.isKey || res.isSearch || res.isPath) {
					res.key = key;

					if (res.isSearch && searchPath) {
						res.split = this._searchDelimiter;
						res.query = this._shiftAndTrim(splitSearch, res.split);
						res.redirect = this._prepSearch(url, searchPath, res.query);
					} else if (res.isPath) {
						res.split = this._pathDelimiter;
						res.path = this._shiftAndTrim(splitPath, res.split);
						res.redirect = this._prepPath(url, res.path);
					} else {
						res.redirect = url;
					}

					return true;
				}

				if (key === '*') {
					res.redirect = this._prepSearch(url, searchPath, query);
				}
			});
		}

		res.color = this._getColorFromUrl(res.redirect);
		return res;
	}

	_getColorFromUrl(url) {
		const domain = this._getHostname(url);
		const color = this._commands
			.filter(c => this._getHostname(c[3]) === domain)
			.map(c => c[5])[0];

		return color || null;
	}

	_getHostname(url) {
		const parser = document.createElement('a');
		parser.href = url;
		return parser.hostname.replace(/^www./, '');
	}

	_prepPath(url, path) {
		return this._stripUrlPath(url) + '/' + path;
	}

	_prepSearch(url, searchPath, query) {
		if (!searchPath) return url;
		const baseUrl = this._stripUrlPath(url);
		const urlQuery = encodeURIComponent(query);
		searchPath = searchPath.replace('{}', urlQuery);
		return baseUrl + searchPath;
	}

	_shiftAndTrim(arr, delimiter) {
		arr.shift();
		return arr.join(delimiter).trim();
	}

	_stripUrlPath(url) {
		const parser = document.createElement('a');
		parser.href = url;
		return `${parser.protocol}//${parser.hostname}`;
	}
}

class Form {
	constructor(options) {
		this._formEl = _.el('#search-form');
		this._inputEl = _.el('#search-input');
		this._colors = options.colors;
		this._help = options.help;
		this._suggester = options.suggester;
		this._queryParser = options.queryParser;
		this._instantRedirect = options.instantRedirect;
		this._newTab = options.newTab;
		this._inputElVal = '';
		this._bindMethods();
		this._registerEvents();
		this._loadQueryParam();
	}

	hide() {
		_.bodyClassRemove('form');
		this._inputEl.value = '';
		this._inputElVal = '';
	}

	show() {
		_.bodyClassAdd('form');
		this._inputEl.focus();
		console.log('show');
	}

	_bindMethods() {
		this.hide = this.hide.bind(this);
		this.show = this.show.bind(this);
		this._clearPreview = this._clearPreview.bind(this);
		this._handleKeydown = this._handleKeydown.bind(this);
		this._handleInput = this._handleInput.bind(this);
		this._previewValue = this._previewValue.bind(this);
		this._submitForm = this._submitForm.bind(this);
		this._submitWithValue = this._submitWithValue.bind(this);
	}

	_clearPreview() {
		this._previewValue(this._inputElVal);
		this._inputEl.focus();
	}

	_handleKeydown(e) {
		if (_.isUp(e) || _.isDown(e) || _.isRemove(e) || NoteHasFocus || _.key(e) == 'tab') return;
		// Jump

		console.log('switch is done', _.key(e), _.key(e) == 'tab');
		switch (_.key(e)) { /* eslint-disable-line default-case */
		case 'alt':
		case 'ctrl':
		case 'enter':
		case 'shift':
		case 'super':
			return;
		case 'escape':
			this.hide();
			return;
		}

		this.show();
	}

	_handleInput() {
		const newQuery = this._inputEl.value;
		const isHelp = newQuery === '?';
		const {
			isKey
		} = this._queryParser.parse(newQuery);
		this._inputElVal = newQuery;
		this._setBackgroundFromQuery(newQuery);
		if (!newQuery || isHelp) this.hide();
		if (isHelp) this._help.toggle();
		if (this._instantRedirect && isKey) this._submitWithValue(newQuery);
		if (this._suggester) this._suggester.suggest(newQuery);
	}

	_loadQueryParam() {
		const q = new URLSearchParams(window.location.search).get('q');
		if (q) this._submitWithValue(q);
	}

	_previewValue(value) {
		this._inputEl.value = value;
		this._setBackgroundFromQuery(value);
	}

	_redirect(redirect) {
		if (this._newTab) window.open(redirect, '_blank');
		else window.location.href = redirect;
	}

	_registerEvents() {
		document.addEventListener('keydown', this._handleKeydown);
		this._inputEl.addEventListener('input', this._handleInput);
		this._formEl.addEventListener('submit', this._submitForm, false);

		if (this._suggester) {
			this._suggester.setOnClick(this._submitWithValue);
			this._suggester.setOnHighlight(this._previewValue);
			this._suggester.setOnUnhighlight(this._clearPreview);
		}
	}

	_setBackgroundFromQuery(query) {
		if (!this._colors) return;
		const {
			color
		} = this._queryParser.parse(query);
		this._formEl.style.backgroundColor = color;
	}

	_submitForm(e) { // Search Enter Maybe
		if (e) e.preventDefault();
		const query = this._inputEl.value;
		if (this._suggester) this._suggester.success(query);
		this.hide();
		this._redirect(this._queryParser.parse(query).redirect);
	}

	_submitWithValue(value) {
		this._inputEl.value = value;
		this._submitForm();
	}
}
