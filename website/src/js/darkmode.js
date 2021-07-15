let stylesheet_init = false

window.addEventListener('load', function init() {
	
	// cube click function
	let cube = document.getElementById("cube");
	if (cube !== null) {
		cube.addEventListener('click', function() { 
			localStorage.darkMode = !(localStorage.darkMode === 'true');
			update_darkmode(localStorage.darkMode === 'true');
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
	// !! this assumes that the darkmode stylesheet is always the second to last
	let stylesheet = document.styleSheets[document.styleSheets.length - 2];
	stylesheet.disabled = !new_mode_dark; 
}
