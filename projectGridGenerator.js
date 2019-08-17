
//gets project data from json file
fetch('project_data.json')
  .then(function(response) {
    return response.json()
  })
  .then(function(json) {
  	processJson(json)
  });


//processes json, adding proper elements to DOM
function processJson(jsonObj) {
	let i = 0

	

	//traverse through array of projects
	jsonObj.forEach(function(project) {
		//add new div of class project_container
		let outerDiv = document.createElement("div")
		outerDiv.classList.add("project_container")
		outerDiv.classList.add(`debugging_${i}`)

		//add p of class tag for each tag
		let tagDiv = document.createElement("div")
		tagDiv.classList.add("tag_container") 
		project.tags.forEach(function(tag) {
			tagDiv.appendChild(createHighlightedText("tag", tag))
		})
		outerDiv.appendChild(tagDiv)

		//add p of type project_title for title
		outerDiv.appendChild(createHighlightedText("project_title", project.title))

		//add node to the grid
		document.getElementById("project_grid").appendChild(outerDiv)
		i++
		console.log(project)
	})
}
const MAX_SWAPS = 1

//places projects into grid with given number of columns
//trys to put projects with higher priority at higher rows and to pack rows tightly
//returns notiong, location property added to projects in array
function createGrid(projects, columns) {
	//sort the array of projects
	projects.sort(function(project1, project2) {
		return project1.priority - project2.priority
	})

	//keep track of current best permutation and its rows/locations
	let curBest = null
	let bestArrangment = null //object with locations (array) and rows (int)


}

//helper for generating permutations, returns object with values decribing best permutation order and 
//the arrangment (int rows & locations array) of this permutation after looking at given number of swaps
function recursiveSwaps(projArray, columns, recursionDepth) {
	//base case: reached maximum depth
	if (recursionDepth == MAX_SWAPS) {
		return {bestPermutation: curBest, bestArrangment: bestArrangment}
	}

	let unswappedRes = recursiveSwaps(projArray.slice(0), columns, recursionDepth + 1)
	let curBest = unswappedRes.bestPermutation
	let bestArrangment = unswappedRes.bestArrangment

	//for each possible adjacent swap, find best option out of recursive calls
	for (let i = 0; i < projArray.length - 1; i++) {
		//swap i and i + 1 
		let curPermutation = 
	}

}

//positions elements in order they are in projectPerm (from end of list first)
//into grid with given number of columns
//row threshold is the current min number of rows, null is returned if this arrangment is more rows than this 
//if there is a valid arrangment or reasonable length, returns object with following properties:
//	locations: ordered array of where each project is stored in this permutation
//	rows: number of rows this arrangment uses
function positionElements(projectPerm, columns, rowThreshold) {
	let rows = 0
	let locations = []
	//initialize matrix
	let matrixRep = [new Array(columns)]

	for (let col = 0; col < row.length; col++) {
		matrixRep[0][col] = false
	}

	//loop through projects
	projectPerm.forEach(function(project){
		position = positionElemHelper(project, matrixRep, columns, rowThreshold)

		//if null is returned, return null
		if (!position) {
			return null
		}

		//otherwise add location and update rows
		locations.push(position)
		rows = Math.max(project.height + position.row, rows)
	})

	return {locations: locations, rows: rows}
		
}

//finds the position the element should be in the grid, returns location
//or null if it would be placed over the rowThreshold 
function positionElemHelper(element, matrixRep, columns, rowThreshold) {
	let position = {}

	//find topmost then leftmost spot where the piece fits
	//add rows where needed
	let row = 0
	rowLoop: while(true) {
		for (let col = 0; col < columns; col++) {
			if (!matrixRep[row][col]) {
				//loop through the blocks this piece would take up
				let isValid = true
				blockLoop: for (let width = 0; width < element.width; width++) {
					for (let height = 0; height < element.height; height++) {

						//break if this piece would not fit
						if (width + col > row.length || matrixRep[row + height][col + width]) {
							isValid = false
							break blockLoop
						}
					}
				}

				//if is valid is true, piece can be placed here.
				//add rows, store the position and break out of the loop
				if (isValid) {
					//return if its greater than rowThreshold
					if (row + block.height > rowThreshold) {
						return null
					}

					while (row + block.height > matrixRep.length) {
						matrixRep.push(new Array(columns))

						for (let col = 0; col < row.length; col++) {
							matrixRep[matrixRep.length - 1][col] = false
						} 
					}

					position.row = row
					position.col = col

					break rowLoop
				}
			}
		}
		row++
	}

	//update the matrix and placed array, and then return position
	for (let width = 0; width < block.width; width++) {
		for (let height = 0; height < block.height; height++) {
			matrixRep[position.row + height][position.col + width] = true
		}
	}

	return position
}

//returns node with p element of given class containing given text
//marked to be highlighted with a span
function createHighlightedText(ofClass, text) {
	let pNode = document.createElement("p")
	pNode.classList.add(ofClass)
	let spanNode = document.createElement("span")
	spanNode.classList.add("highlighted")
	pNode.appendChild(spanNode)
	let textNode = document.createTextNode(text)
	spanNode.appendChild(textNode)
	return pNode
}