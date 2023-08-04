window.addEventListener('load', function init() {
	fetch('public/img/spotlight_pictures/manifest.json')
	  .then(function(response) {
	    return response.json();
	  })
	  .then(function(json) {
	  	image_list = json;
	  	chosen_image = image_list[Math.floor(Math.random()*image_list.length)];

	  	title = chosen_image.substr(0, chosen_image.indexOf('.'));
	  	extra_info_ind = title.indexOf("_");
	  	title = extra_info_ind == -1 ? title : title.substr(0, extra_info_ind);

	  	portrait = document.getElementById("portrait");
	  	portrait.title = title;
	  	portrait.src = "public/img/spotlight_pictures/" + encodeURIComponent(chosen_image);

	  });

});
