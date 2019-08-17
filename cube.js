//coordinates of vertices of the cube in 3-space
let vertices = [[-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, -1, -1]]

//amount cube is rotated each frame, in radians
const dTheta = 0.02

//defines coord system on plane, with vectors/points in 3 space
//plane is defined to create isometric projection
const planeY = normalize([-Math.tan(0.615479), 1 , 0])
const planeX = normalize([0, 0 , -1])
const planeCenter = [0.338203829097, 0.338203829097, 0]

let length = 0

window.onload = function init() {
	window.requestAnimationFrame(updateSvg)

}

function updateSvg() {

	//get size of svg element if not yet loaded
	if (length == 0) {
		length = document.getElementById("cube").getBoundingClientRect().width
	}

	svgSpacePts = []
	//for each vertex
	for (let i = 0; i < vertices.length; i++) {
		//rotate by dTheta
		vertices[i] = rotateY(vertices[i], dTheta)

		//compute point in plane space
		let vertexVector = subtract(planeCenter, vertices[i])
		let xCoord = dot(vertexVector, planeX)
		let yCoord = dot(vertexVector, planeY)


		//compute point in svg space
		let transformLength = length/3.75
		let xTrans = (transformLength * xCoord) + transformLength * 2
		let yTrans = (-transformLength * yCoord) + transformLength * 2
		svgSpacePts.push([xTrans, yTrans])
	}

	//create string for path from points in svg space
	let firstPathPts = svgSpacePts.slice(0,4)
	firstPathPts.push(svgSpacePts[0])
	firstPathPts = firstPathPts.concat(svgSpacePts.slice(4,8))
	firstPathPts.push(svgSpacePts[4])
	let pathString = generatePathString(firstPathPts)
	pathString += generatePathString([svgSpacePts[1], svgSpacePts[5]])
	pathString += generatePathString([svgSpacePts[2], svgSpacePts[6]])
	pathString += generatePathString([svgSpacePts[3], svgSpacePts[7]])

	document.getElementById("cube_path").setAttribute("d", pathString)
	window.requestAnimationFrame(updateSvg)
}

//rotates point angle radians around y axis
function rotateY(point, angle) {
	let newX = Math.cos(angle) * point[0] + Math.sin(angle) * point[2]
	let newZ = Math.cos(angle) * point[2] - Math.sin(angle) * point[0]
	return [newX, point[1], newZ]
}

//svg path string for path created by moving to first point and drawing a line to subsequent points 
function generatePathString(pointsArr) {
	let pathString = `M${pointsArr[0][0]} ${pointsArr[0][1]} `

	for (let i = 1; i < pointsArr.length; i++) {
		pathString += `L${pointsArr[i][0]} ${pointsArr[i][1]} `
	}

	return pathString
}

//subtracts vector2 from vector 1
//precondition: vectors are same length
function subtract(vector1, vector2) {
	let res = []
	for (let j = 0; j < vector1.length; j++) {
		res.push(vector2[j] - vector1[j])
	}
	return res
}

//finds dot product of vector1 and vector2
//precondition: vectors are same length
function dot(vector1, vector2) {
	let res = 0
	for (let j = 0; j < vector1.length; j++) {
		res += vector1[j] * vector2[j]
	} 
	return res
}

//creates a unit vector
function normalize(vector) {
	let mag = 0
	for (let j = 0; j < vector.length; j++) {
		mag += vector[j] * vector[j]
	}  
	mag = Math.sqrt(mag)

	let res = []
	for (let j = 0; j < vector.length; j++) {
		res.push(vector[j] / mag)
	} 
	return res

}