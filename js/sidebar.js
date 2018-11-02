'use strict';
/* eslint-disable no-unused-vars*/
/* global config */

const root = document.documentElement;
let goVar, out = '';

document.addEventListener('mousemove', evt => {
	const x = evt.clientX / innerWidth;

	root.style.setProperty('--mouse-x', x);
});

const speedEnter = (id = 0) => {
	goVar = setTimeout(() => {
		document.getElementById('SpeedId' + id).classList.add('Fast');
	}, 200);
};

const speedLeave = (id = 0) => {
	document.getElementById('SpeedId' + id).classList.remove('Fast');
	clearTimeout(goVar);
};


for (let c = 0; c < config.categories.length; c++) {
	const category = config.categories[c];
	out += `<div class="approx" onmouseover="speedEnter(id = ${c})" onclick="speedEnter(id = ${c})" onmouseout="speedLeave(id = ${c})"></div>`;
	out += `<div class="stripe" id="SpeedId${c}" style="background-color:${category.color}">`;
	out += `<a href="${category.url}"><div class="title"><span>${category.title}</span></div></a>`;
	out += `<div class="content">`;
	for (let s = 0; s < category.sites.length; s++) {
		const site = category.sites[s];
		out += `<span class="itemStripes buttonS"><a href="${site.url}">/r/${site.name}</a></span>`;
	}
	out += `</div></div>`;
}
document.getElementById('side').innerHTML += out;
