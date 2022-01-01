let stylesheet_init = false

window.addEventListener('load', function init() {
	
	// cube click function
	let cube = document.getElementById("cube");
	if (cube !== null) {
		cube.addEventListener('click', function() { 
			localStorage.darkMode = !(localStorage.darkMode === 'true');
			update_darkmode(localStorage.darkMode === 'true');
			localStorage.hello2 = localStorage.darkMode
		});
	}
});

window.addEventListener('DOMContentLoaded', function() {
	if (localStorage.darkMode == undefined) {
		localStorage.darkMode = false;
	}
	update_darkmode(localStorage.darkMode === 'true');
})

function update_darkmode(new_mode_dark) {
	// find darkmode stylesheet
	for (var i = 0; i < document.styleSheets.length; i++) {
		ss = document.styleSheets[i];
		if (ss.href.includes("darkmode")) {
			ss.disabled = !new_mode_dark;
			break;
		}
	}
}
