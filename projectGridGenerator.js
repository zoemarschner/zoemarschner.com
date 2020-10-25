//data storage
let projectData = null
let curCols = null
let cachedNoOdd = null

//layout constants
const TILE_MAX_WIDTH = 250
const TILE_MIN_WIDTH = 200
const TILE_GUTTER = 10
const GRID_MARGIN = 50

//gets project data from json file
fetch('dynamic_data.json')
  .then(function(response) {
    return response.json()
  })
  .then(function(json) {
  	projectData = json
  	processJson(json)
  });

//add resize listener
window.addEventListener("resize", winResized)

//------- CODE FOR LAYING OUT ELEMNTS IN PAGE ------- 

//called when the window is resized, determines whether layout needs to be altered
//if so, fixes the layout
function winResized() {
	let newCols = numCols()

	if ((newCols != curCols) && (projectData != null)) {

		//we need to rearrange the columns, call layout method again
		curCols = newCols
		//setColsStyle(newCols)
		let newRows = createGrid(projectData, newCols)
		resetGridStyle(newRows, curCols)

		//loop through children nodes of grid
		let tiles = document.getElementById("project_grid").childNodes
		tiles.forEach(function(element){
			//get index data, only process if its not null 
			let index = element.getAttribute("data-index")
			if (index != null) {
				//update layout
				updateElementStyle(projectData[index], element)

			}
		})
			
	}

}


//calculates number of columns needed based on the size of the window and whether data will fit in odd number of cols
function numCols() {
	let width = window.innerWidth
	let cols = Math.floor((width - (2 * GRID_MARGIN + TILE_GUTTER)) / (TILE_MIN_WIDTH + TILE_GUTTER))
	
	//if columns is an odd number and all projects are even number width, they're never going to fit in that many columns
	if (cols % 2 !== 0) {
		if (cachedNoOdd === null) {

			let foundOdd = false

			projectData.forEach(function(project){
				if (project.width % 2 !== 0) {
					foundOdd = true
				}
			})

			cachedNoOdd = !foundOdd
		}

		if (cachedNoOdd) {
			cols -= 1
		}
		
	}

	return Math.max(2, Math.min(4,  cols))
}


//set up row style, once algorithm has been called
function resetGridStyle(rows, cols) {
	//set up grid template/spacing
	let gridElem = document.getElementById("project_grid")
	gridElem.style.setProperty('grid-template-rows', `repeat(${rows}, 1fr)`)
	gridElem.style.setProperty('grid-template-columns', `repeat(${cols}, 1fr)`)


	//set the height to what it should be if the 80vw case is met
	gridElem.style.setProperty('height', `calc(calc(calc(calc(80vw - ${TILE_GUTTER * (cols - 1)}px) / ${cols}) * ${rows}) + ${TILE_GUTTER * (rows - 1)}px)`)

	//add height media query if cols == 4 (that is, if its possible to reach point where we want to display constant width)
	if (cols == 4) {
		let styleSheet = getStyleSheet()
		let curBlockWidth = (5 * TILE_MIN_WIDTH + TILE_GUTTER) / 4
		styleSheet.insertRule(`@media screen and (min-width: ${minWidthFor(5)}px) {#project_grid{height: ${curBlockWidth * rows + TILE_GUTTER * (rows - 1)}px !important;}}`, styleSheet.cssRules.length - 2)
	}
	
}


//updates the style for the given element based on position data stored in project
function updateElementStyle(project, element) {
	element.style.gridColumn = `${project.position.col + 1} / span ${project.width}`
	element.style.gridRow = `${project.position.row + 1} / span ${project.height}`

}

//gets the stylesheet that already has cssRules in it
function getStyleSheet() {
	let sheets = document.styleSheets
	let styleSheet = sheets[0]
	let i = 1

	while (styleSheet.cssRules === null && i < sheets.length) {
		if (sheets[i].cssRules !== null) {
			styleSheet = sheets[i]
			break
		}

		i++
	}

	return styleSheet
}

function minWidthFor(columns) {
	return TILE_MIN_WIDTH * columns + TILE_GUTTER * (columns - 1) + GRID_MARGIN * 2
}

//processes json, adding proper elements to DOM and assigning index to ids to each element
function processJson(jsonObj) {
	let index = 0

	//perform grid algorithm and update style
	let cols = numCols()
	curCols = cols
	//setColsStyle(cols)

	let rows = createGrid(jsonObj, cols)
	resetGridStyle(rows, curCols)

	let gridElem = document.getElementById("project_grid")

	//traverse through array of projects
	jsonObj.forEach(function(project) {

		//add new div of class project_container
		let outerDiv = document.createElement("div")
		outerDiv.classList.add("project_container")
		updateElementStyle(project, outerDiv)

		//set index as id and increment
		outerDiv.setAttribute("data-index", index)
		project.id = index
		index++

		//create link element
		let projectLink = document.createElement("a")
		projectLink.classList.add("project_link")
		projectLink.setAttribute("href", project.page_link)
		outerDiv.appendChild(projectLink)

		//add p of class tag for each tag
		let tagDiv = document.createElement("div")
		tagDiv.classList.add("tag_container") 
		project.tags.forEach(function(tag) {
			tagDiv.appendChild(createText("tag", tag))
		})

		//add image
		if (project.image !== undefined) {
			outerDiv.style.setProperty("background-image", `url(project_images/${project.image})`)
		}

		outerDiv.appendChild(tagDiv)

		//add p of type project_title for title
		outerDiv.appendChild(createHighlightedText("project_title", project.title))

		//add node to the grid
		gridElem.appendChild(outerDiv)		
	})
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

//create text node
function createText(ofClass, text) {
	let pNode = document.createElement("p")
	pNode.classList.add(ofClass)
	let spanNode = document.createElement("span")
	pNode.appendChild(spanNode)
	let textNode = document.createTextNode(text)
	spanNode.appendChild(textNode)
	return pNode
}


//------- CODE FOR CREATING GRID LAYOUT ------- 

const MAX_SWAPS = 2

//places projects into grid with given number of columns
//trys to put projects with higher priority at higher rows and to pack rows tightly
//returns the number of rows, position property added to projects in array
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

	return results.rows

}

//projarray is assumed to be sorted from low priority -> high priorty
//helper for generating permutations, returns object with values decribing best permutation order, the disorder num
// of that permutation and the int rows & positions array of this permutation after looking at given number of swaps
function recursiveSwaps(projArray, columns, recursionDepth, rowThreshold) {

	//base case: reached maximum depth
	if (recursionDepth >= MAX_SWAPS) {
		//call position elements, return results
		let baseResults = positionElements(projArray, columns, rowThreshold)

		if (baseResults != null) { //there is valid ordering that doesn't go over threshold
			
			//calculate disorder number
			let difference = 0
			for (let i = 0; i < projArray.length - 1; i++) {
				difference += Math.abs(i - projArray[i].priority)
			}

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
	if (unswappedRes != null) {
		curResults = unswappedRes
	}

	//for each possible adjacent swap, find best option out of recursive calls
	for (let i = 0; i < projArray.length - 1; i++) {
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
	let rows = 0
	let positions = []
	//initialize matrix
	let matrixRep = [new Array(columns)]

	for (let col = 0; col < columns; col++) {
		matrixRep[0][col] = false
	}

	//loop through projects
	for (let i = projectPerm.length - 1; i >= 0; i--) {
		position = positionElemHelper(projectPerm[i], matrixRep, columns, rowThreshold)
		
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

	let position = {}

	//find topmost then leftmost spot where the piece fits
	//add rows where needed
	let row = 0
	rowLoop: while(true) {
		for (let col = 0; col < columns; col++) {
			if (row >= matrixRep.length || !matrixRep[row][col]) {
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

