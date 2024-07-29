window.addEventListener('load', function() {
	let dataToLoad = {'data/paper_data.json': 'research-list', 'data/course_data.json': 'teaching-list'}

	for (const [data, container_id] of Object.entries(dataToLoad)) {
		//gets project data from json file
		fetch(data)
		  .then(function(response) {
		    return response.json()
		  })
		  .then(function(json) {
		  	researchData = json;
		  	processResearchJson(json, container_id);
		  });
	}
	
});

function processResearchJson(jsonObj, list_id) {
	let container = document.getElementById(list_id);

	jsonObj.forEach(function(paper) {
		let outerDiv = document.createElement("div");
		outerDiv.classList.add("research-container");

		let img = document.createElement("div");
		img.classList.add("research-image");
		img.style.setProperty("background-image", `url(public/img/project_images/${paper.image})`);
		outerDiv.appendChild(img);

		let info = document.createElement("div");
		info.classList.add("research-info");

		let title = document.createElement("p");
		title.classList.add("research-title");
		title.innerHTML = paper.title;
		info.appendChild(title);

		let pubinfo = document.createElement("p");
		pubinfo.innerHTML = `${paper.authors.join(", ")}</br> <i>${paper.conference}</i>, ${paper.year}`
		info.appendChild(pubinfo);
		outerDiv.appendChild(info);

		if (paper.note !== undefined) {
			let note = document.createElement("p");
			note.classList.add("author-note");
			note.innerHTML = paper.note;
			info.appendChild(note);
		}	


		let links = document.createElement("div");
		links.classList.add("links");

		for (const [key, value] of Object.entries(paper.links)) {
 			 let this_link = document.createElement("a");
 			 this_link.href = value;
 			 this_link.innerHTML = key;
 			 links.appendChild(this_link)
		}
		info.appendChild(links);

		
		container.appendChild(outerDiv);
	

	});

}