'use strict';

/* global DefinVariables */
/* global math */
const InputBlur = () => { /* eslint-disable-line no-unused-vars */
	const userInput = document.getElementById('search-input').value;
	if (userInput.length === 0) {
		document.getElementById('OutputID').style.visibility = 'hidden';
	}
};

let TimesWrong = 0;

const getMathsAnswer = (eq) => {
	try {
		return math.eval(eq);
	} catch (e) {
		return null;
	}
};

const generatePassword = (length) => {
	const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let retVal = '';
	for (let i = 0, n = charset.length; i < length; ++i) {
		retVal += charset.charAt(Math.floor(Math.random() * n));
	}
	return retVal;
};

const handleNotes = (contents, note = 1) => {
	if (note === 'c') {
		// Credit: https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
		console.log('Creating Textarea to copy');
		const el = document.createElement('textarea');
		el.value = contents;
		el.setAttribute('readonly', '');
		el.style.position = 'absolute';
		el.style.left = '-9999px';
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
	} else {
		const CurrentStorage = localStorage.getItem('Note' + note);
		localStorage.setItem('Note' + note, CurrentStorage + '\n' + contents);
		document.getElementById('wrapperWrapper').classList.remove('MenuMoveIn');
		DefinVariables(note);
	}
};

const InputDo = () => { /* eslint-disable-line no-unused-vars */
	const userInput = document.getElementById('search-input').value;
	if (userInput.length > 0) {
		const parts = userInput.split(/:([1-3]|c)/);
		const answer = getMathsAnswer(parts[0]);

		if (/password ?[0-9]+/.test(userInput.toLowerCase())) {
			TimesWrong = 0;
			let number = Number(parts[0].match(/\d+/)[0]);
			number = number < 6 ? 6 : number > 32 ? 32 : number;
			const password = generatePassword(number);

			document.getElementById('OutputID').innerHTML = password;
			document.getElementById('OutputIDBefore').innerHTML = password;
			document.getElementById('OutputID').style.visibility = 'visible';

			if (parts.length > 1) {
				const CurrentStorage = localStorage.getItem('Note' + parts[1]);
				localStorage.setItem('Note' + parts[1], CurrentStorage + '\n' + password);
				document.getElementById('wrapperWrapper').classList.remove('MenuMoveIn');
				DefinVariables(parts[1]);
			}
			// AddToClipboard(password);
		} else if (/number ?(?:[0-9]+)?/.test(userInput.toLowerCase())) {
			TimesWrong = 0;
			let number = Number(userInput.match(/\d+/));
			number = number ? number : 3;
			let GenNumber = '';
			for (let i = 0; i < number; i++) {
				const x = Math.floor(Math.random() * 10);
				GenNumber += x;
			}

			document.getElementById('OutputID').innerHTML = GenNumber;
			document.getElementById('OutputIDBefore').innerHTML = GenNumber;
			document.getElementById('OutputID').style.visibility = 'visible';

			if (parts.length > 1) handleNotes(GenNumber, parts[1]);
		} else if (answer) {
			TimesWrong = 0;
			document.getElementById('OutputID').innerHTML = answer;
			document.getElementById('OutputIDBefore').innerHTML = answer;
			document.getElementById('OutputID').style.visibility = 'visible';
			if (parts.length > 1) handleNotes(answer, parts[1]);
		} else if (TimesWrong >= 5) {
			document.getElementById('OutputID').style.visibility = 'hidden';
			TimesWrong = 0;
		} else {
			TimesWrong++;
		}
	} else {
		document.getElementById('OutputID').style.visibility = 'hidden';
	}
};
