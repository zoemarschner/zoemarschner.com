
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
	console.log("STARTING PROCESSING")
	let i = 0

	//perform grid algorithm
	createGrid(jsonObj, 4)


	//traverse through array of projects
	jsonObj.forEach(function(project) {
		//add new div of class project_container
		let outerDiv = document.createElement("div")
		outerDiv.classList.add("project_container")

		outerDiv.style.gridColumn = `${project.position.col + 1} / span ${project.width}`
		outerDiv.style.gridRow = `${project.position.row + 1} / span ${project.height}`

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

		console.log(project)
	})
}
const MAX_SWAPS = 1

//places projects into grid with given number of columns
//trys to put projects with higher priority at higher rows and to pack rows tightly
//returns notiong, position property added to projects in array
function createGrid(projects, columns) {
	//sort the array of projects
	projects.sort(function(project1, project2) {
		return project1.priority - project2.priority
	})

	//normalizes priority values so that they range from 0 to number of proj - 1
	for (let i = 0; i < projects.length; i++) {
		projects[i].priority = i
	}

	let results = recursiveSwaps(projects, columns, 0, Number.MAX_SAFE_INTEGER)

	//put position data into projects object
	for (let i = 0; i < projects.length; i++) {
		//get position in original list from permutation list
		let orgI = results.bestPermutation[i].priority

		//position and permutation arrays match indicies
		projects[orgI].position = results.bestPos[i]
	} 

}

//projarray is assumed to be sorted from low priority -> high priorty
//helper for generating permutations, returns object with values decribing best permutation order, the disorder num
// of that permutation and the int rows & positions array of this permutation after looking at given number of swaps
function recursiveSwaps(projArray, columns, recursionDepth, rowThreshold) {
	console.log(`IN recursiveSwaps (depth = ${recursionDepth}). rowThreshold is ${rowThreshold}`)
	console.log(projArray)
	//base case: reached maximum depth
	if (recursionDepth >= MAX_SWAPS) {
		//call position elements, return results
		let baseResults = positionElements(projArray, columns, rowThreshold)

		console.log(`return from positionElements is`)
		console.log(baseResults)

		if (baseResults) { //there is valid ordering that doesn't go over threshold
			
			//calculate disorder number
			let difference = 0
			for (let i = 0; i < projArray.length - 1; i++) {
				difference += Math.abs(i - projArray[i].priority)
			}

			console.log(`computed disorder ${difference}`)

			return {bestPermutation: projArray, disorderNum: difference, bestPos: baseResults.positions, rows: baseResults.rows}
		} else {
			//there is no valid ordering, return null
			return null
		}
		
	}

	//row threshold quantifies how far off this ordering is from true ordering
	let curResults = {bestPermutation: null, disorderNum: null, bestPos: null, rows: rowThreshold}

	//first, call on unswapped array
	let unswappedRes = recursiveSwaps(projArray.slice(), columns, recursionDepth + 1, rowThreshold)
	if (unswappedRes) {
		curResults = unswappedRes
	}

	//for each possible adjacent swap, find best option out of recursive calls
	for (let i = 0; i < projArray.length - 1; i++) {
		console.log("CURRENT RESULTS ARE")
		console.log(curResults)
		//swap i and i + 1 
		let thisPermutation = projArray.slice(0, i)
		thisPermutation.push(projArray[i + 1], projArray[i])
		if (i + 2 < projArray.length) {
			thisPermutation = thisPermutation.concat(projArray.slice(i + 2))
		}

		//make recursive call

		let results = recursiveSwaps(thisPermutation, columns, recursionDepth + 1, curResults.rows)

		//decide if this is better than current best

		if (results && (curResults.bestPermutation == null || curResults.rows > results.rows 
			|| (curResults.rows == results.rows && results.disorderNum < curResults.disorderNum))) {
			console.log("replacing results: old")
			console.log(curResults)
			console.log("new")
			console.log(results)
			curResults = results
		}
	}

	return curResults

}

//positions elements in order they are in projectPerm (from end of list first)
//into grid with given number of columns
//row threshold is the current min number of rows, null is returned if this arrangment is more rows than this 
//if there is a valid arrangment or reasonable length, returns object with following properties:
//	positions: ordered array of where each project is stored in this permutation
//	rows: number of rows this arrangment uses
function positionElements(projectPerm, columns, rowThreshold) {
	console.log(`IN position elements`)
	let rows = 0
	let positions = []
	//initialize matrix
	let matrixRep = [new Array(columns)]

	for (let col = 0; col < columns; col++) {
		matrixRep[0][col] = false
	}

	//loop through projects
	for (let i = projectPerm.length - 1; i >= 0; i--) {
		console.log(`looking at element`)
		console.log(projectPerm[i])
		position = positionElemHelper(projectPerm[i], matrixRep, columns, rowThreshold)
		console.log(`got position`)
		console.log(position)
		//if null is returned, return null
		if (!position) {
			return null
		}

		//otherwise add position and update rows
		positions.unshift(position)
		rows = Math.max(projectPerm[i].height + position.row, rows)
	}

	return {positions: positions, rows: rows}
		
}

//finds the position the element should be in the grid, returns position
//or null if it would be placed over the rowThreshold 
function positionElemHelper(element, matrixRep, columns, rowThreshold) {
	console.log("IN positionElemHelper looking at")
	console.log(element)
	console.log("grid is")
	console.log(matrixRep)
	let position = {}

	//find topmost then leftmost spot where the piece fits
	//add rows where needed
	let row = 0
	rowLoop: while(true) {
		for (let col = 0; col < columns; col++) {
			if (row >= matrixRep.length || !matrixRep[row][col]) {
				console.log(`possibility at ${row} ${col}`)
				//loop through the blocks this piece would take up
				let isValid = true
				blockLoop: for (let width = 0; width < element.width; width++) {
					for (let height = 0; height < element.height; height++) {
						if(height + row >= matrixRep.length && width + col < columns) {
							break
						}

						//break if this piece would not fit
						if (width + col >= columns || matrixRep[row + height][col + width]) {
							isValid = false
							break blockLoop
						}
					}
				}

				//if is valid is true, piece can be placed here.
				//add rows, store the position and break out of the loop
				if (isValid) {
					console.log("found valid position")
					//return if its greater than rowThreshold
					if (row + element.height > rowThreshold) {
						return null
					}

					while (row + element.height > matrixRep.length) {
						matrixRep.push(new Array(columns))

						for (let c = 0; c < columns; c++) {
							matrixRep[matrixRep.length - 1][c] = false
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
	for (let width = 0; width < element.width; width++) {
		for (let height = 0; height < element.height; height++) {
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