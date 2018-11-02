'use strict';
let sSaveIn;

function Load(NumberL) {
	document.getElementById('idTextarea').value = localStorage.getItem('Note' + NumberL);
}

function writeNote() {
	console.log('Out');
	RemindMeFormate();
	localStorage.setItem('Note' + sSaveIn, document.getElementById('idTextarea').value);
	LoadReminders();
	NoteHasFocus = !NoteHasFocus;
	console.log('NoteHasFocus', NoteHasFocus);

}

function DefinVariables(activeTab) {
	let vTab1 = document.getElementById('tab' + activeTab);
	let nOffsetLeft = vTab1.offsetLeft;
	let nOffsetWidth = vTab1.offsetWidth;
	document.getElementById('lineId').style = 'left: ' + nOffsetLeft + 'px; width:' + nOffsetWidth + 'px;';
	document.querySelector('.active').classList.remove('active');
	vTab1.classList.add('active');
	Load(activeTab);
	sSaveIn = activeTab;
}
DefinVariables(1);

function ToggleMenu() {
	console.log('Toggle');
	document.getElementById('wrapperWrapper').classList.toggle('MenuMoveIn');
	document.activeElement.blur();
}

var NoteHasFocus = false;

function NoteFocus() {
	NoteHasFocus = !NoteHasFocus;
	console.log('NoteHasFocus', NoteHasFocus);
}

let IsMouseOverNotes = false;

function NotesUp() {
	if (sSaveIn < 3) {
		writeNote();
		DefinVariables(1 + sSaveIn);
	}
}

function NotesDown() {
	if (sSaveIn > 1) {
		writeNote();
		DefinVariables(sSaveIn - 1);
	}
}
