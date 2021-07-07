window.addEventListener('load', function() {
	//gets project data from json file
	fetch('data/paper_data.json')
	  .then(function(response) {
	    return response.json()
	  })
	  .then(function(json) {
	  	researchData = json;
	  	processResearchJson(json);
	  });
});

function processResearchJson(jsonObj) {
	let container = document.getElementById("research-list");
	console.log(jsonObj)

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

		console.log(paper.authors)
		let pubinfo = document.createElement("p");
		pubinfo.innerHTML = `${paper.authors.join(", ")}</br> <i>${paper.conference}</i>, ${paper.year}`
		info.appendChild(pubinfo);
		outerDiv.appendChild(info);


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