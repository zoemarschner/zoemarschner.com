window.addEventListener('load', function init() {
	fetch('public/img/spotlight_pictures/manifest.json')
	  .then(function(response) {
	    return response.json();
	  })
	  .then(function(json) {
	  	image_list = json;
	  	chosen_image = image_list[Math.floor(Math.random()*image_list.length)];
	  	console.log(chosen_image);

	  	title = chosen_image.substr(0, chosen_image.indexOf('.'));

	  	portrait = document.getElementById("portrait");
	  	portrait.title = title;
	  	portrait.src = "public/img/spotlight_pictures/" + chosen_image;

	  });

});
