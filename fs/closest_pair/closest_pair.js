//constants
const svgns = "http://www.w3.org/2000/svg";
const RES = 100;
const ANIMATION_SPEED = 1000/2; //ms/frame

const YELLOW = '#f0e9d5';
const BLUE = '#489acc';
const LIGHT_BLUE = '#85aec7';
const GREY = '#d9d9d9';
const RED = '#e36262';
const DARK_GREY = '#757575';
const BLACK = '#000000';

// global vars
let pts = [];
let generator = undefined;
let background_stack = 0; // number of backgrounds drawn
let animationID = undefined;

// drawing objects. We will have to clear these at times
let reset_bg = make_rect(0,0,RES,RES,YELLOW);
let cp_scratch_objects = []; // objects currently drawn by algorithm, so that we can stop at any time

window.onload = function () {
	draw_elem_after(reset_bg);
	background_stack++;
	reset_all();

	// add click listeners
	const svg = document.getElementById("svg");
	svg.onmouseup = onCanvasClick

	const step = document.getElementById("step");
	step.onmouseup = onStepClick

	const play = document.getElementById("play");
	play.onmouseup = onPlayClick

	const pause = document.getElementById("pause");
	pause.onmouseup = onPauseClick

	const fast_forward = document.getElementById("fast_forward");
	fast_forward.onmouseup = onFFClick

	const reset = document.getElementById("reset");
	reset.onmouseup = reset_all

	const help = document.getElementById("help");
	help.onmouseup = onHelpClick

}

// actual algorithm, which draws as it goes
// Impelement as generator, which yields at each step
function* closest_pair() {
	pts.sort((first, second) => first[0] >= second[0])
	yield* closest_pair_helper(pts, 0, RES)
}

// same as closest pair, but we sort the points, and pass in the range
// returns [d, [p1, p2], line]
function* closest_pair_helper(pts, left, right) {
	const region = make_rect(left, 0, right-left, RES, GREY, alpha=0.9, stroke=true);
	cp_draw_bg(region);
	yield;

	if (pts.length <= 1) {
		cp_remove_bg(region);
		return [Number.POSITIVE_INFINITY, undefined, undefined];
	} else if (pts.length == 2) {
		const line = make_line(pts[0], pts[1], RED)
		cp_draw_elem(line);

		yield;
		cp_remove_bg(region);

		return [pt_dist(pts[0], pts[1]), [pts[0], pts[1]], line];

	} else {
		//compute medianm
		const l_pt = Math.floor(pts.length/2 - 1) ;
		const r_pt = Math.floor(pts.length/2);

		let med_x = (pts[l_pt][0] + pts[r_pt][0])/2

		//recursive
		hide_elem(region);
		const l_res = yield* closest_pair_helper(pts.slice(0, l_pt+1), left, med_x);
		const r_res = yield* closest_pair_helper(pts.slice(r_pt), med_x, right);
		show_elem(region);

		// calculate min of d1, d2
		let d;
		let cur_line;
		let cur_pair;
		if (l_res[0] > r_res[0]) {
			if (l_res[2] !== undefined){
				cp_remove_elem(l_res[2]);
			}
			cur_line = r_res[2];
			cur_pair = r_res[1];
			d = r_res[0];
		} else {
			if (r_res[2] !== undefined){
				cp_remove_elem(r_res[2]);
			}
			cur_line = l_res[2];
			cur_pair = l_res[1];
			d = l_res[0];
		}
		yield;

		// draw intersection region
		const med_line = make_line([med_x, 0], [med_x, RES], BLACK, dashed=true, width=0.1);
		const strip = make_rect(med_x-d, 0, 2*d, RES, RED, alpha=0.25);
		cp_draw_elem(med_line);
		cp_draw_bg(strip);

		// we keep track of the pts in/not in strip to visualize the strip by dimming
		// points outside strip (note: this isn't going to end in an O(nlogn) algorithm)
		// but its just for visualization!
		pts_in_strip = [];
		pts_not_in_strip = [];
		for (pt of pts) {
			if (pt[0] >= med_x - d && pt[0] <= med_x + d) {
				pts_in_strip.push(pt);
			} else {
				pt[2].setAttribute('fill', LIGHT_BLUE);
				pt[2].setAttribute('stroke', GREY);
				pts_not_in_strip.push(pt);
			}
		}
		yield;

		// go through points in strip
		pts_in_strip.sort((pt1, pt2)=>pt1[1]-pt2[1]);
		
		for (let i=0; i < pts_in_strip.length; i++) {
			let j = i-1;
			while (j >= 0 && -pts_in_strip[j][1] + pts_in_strip[i][1] < d) {
				const pi = pts_in_strip[i];
				const pj = pts_in_strip[j];
				cur_dist = pt_dist(pi, pj);
				const test_line = make_line(pi, pj, DARK_GREY, dashed=false, width=0.25);
				cp_draw_elem(test_line);
				yield;

				if (cur_dist < d) {
					d = cur_dist;
					cp_remove_elem(cur_line);
					cur_line = test_line;
					cur_pair = [pi, pj];

					test_line.setAttribute('stroke', RED);
					test_line.setAttribute('stroke-width', 0.5);
					yield;
				} else {
					cp_remove_elem(test_line);
				}

				j--;
			}
		}

		for (pt of pts_not_in_strip) {
			pt[2].setAttribute('fill', BLUE);
			pt[2].setAttribute('stroke', BLACK);
		}

		cp_remove_elem(med_line);
		cp_remove_bg(strip);

		cp_remove_bg(region);

		return [d, cur_pair, cur_line];
	}
}


// reset. we clear all the added objects while algorithm was going on,
// and points are allowed again
function reset_all() {
	clearTimeout(animationID);
	generator = undefined;

	background_stack = 0;

	for (elem of cp_scratch_objects) {
		remove_elem(elem);
	}
	cp_scratch_objects = [];

	for (pt of pts) {
		remove_elem(pt[2]);
	}
	pts = [];

	// color background in yellow, which means we can add points
	reset_bg.style.display = 'block'
} 

// start the generator
function start_gen() {
	generator = closest_pair();
	reset_bg.style.display = 'none'
}

function pt_dist(p1, p2) {
	return Math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2);
}


// **** DRAWING UTILITIES ****

// make rectangle, but don't draw it
function make_rect(x, y, width, height, color, alpha=1, stroke=false) {
	let rect = document.createElementNS(svgns, "rect");
	rect.setAttribute("x", x);
	rect.setAttribute("y", y);
	rect.setAttribute("width", width);
	rect.setAttribute("height", height);
	rect.setAttribute("fill", color);
	rect.setAttribute("fill-opacity", alpha);

	return rect;
}

function make_point(cx, cy, r, color, stroke=false) {
	let circle = document.createElementNS(svgns, "circle");
	circle.setAttribute("cx", cx);
	circle.setAttribute("cy", cy);
	circle.setAttribute("r", r);
	circle.setAttribute("fill", color);

	if (stroke) {
		circle.setAttribute("stroke", '#000000');
		circle.setAttribute("stroke-width", 0.1);
	}

	return circle;
}

function make_line(p1, p2, color, dashed=false, width=0.5) {
	let line = document.createElementNS(svgns, "line");
	line.setAttribute("x1", p1[0]);
	line.setAttribute("y1", p1[1]);
	line.setAttribute("x2", p2[0]);
	line.setAttribute("y2", p2[1]);
	line.setAttribute("stroke", color);
	line.setAttribute("stroke-width", width);

	if (dashed) {
		line.setAttribute("stroke-dasharray", 1);
	}

	return line;
}

function draw_elem_before(elem) {
	const svg = document.getElementById("svg");
	svg.insertBefore(elem, svg.children[background_stack]);
}

function draw_elem_first(elem) {
	const svg = document.getElementById("svg");
	svg.insertBefore(elem, svg.children[0]);
}

function draw_elem_after(elem) {
	const svg = document.getElementById("svg");
	svg.appendChild(elem);
}

function remove_elem(elem) {
	const svg = document.getElementById("svg");
	svg.removeChild(elem);
}


function cp_draw_elem(elem) {
	cp_scratch_objects.push(elem);
	draw_elem_before(elem);
}

function cp_remove_elem(elem) {
	const index = cp_scratch_objects.indexOf(elem);
	cp_scratch_objects.splice(index, 1);
	remove_elem(elem);
}

function cp_draw_bg(elem) {
	cp_scratch_objects.push(elem);
	draw_elem_before(elem);
	background_stack++;
}

function cp_remove_bg(elem) {
	cp_remove_elem(elem);
	background_stack--;

}

function hide_elem(elem) {
	elem.style.display = 'none';
}

function show_elem(elem) {
	elem.style.display = 'block';
}


// **** CLICK DETECTOR ****

function onCanvasClick(event) {
	if (generator === undefined) {
		const svg = document.getElementById("svg");

		const rect = svg.getBoundingClientRect();
    	const x = (event.clientX - rect.left)/rect.width * RES;
    	const y = (event.clientY - rect.top)/rect.height * RES;
    	
    	let circle = make_point(x, y, 0.75, BLUE, stroke=true);
    	
    	pts.push([x, y, circle]);
    	draw_elem_after(circle);

	}
}


function onStepClick(event) {
	if (generator === undefined) {
		start_gen();
	}

	generator.next();
}

function playAt(speed) {
	if (generator === undefined) {
		start_gen();
		generator.next();
	}
	
	clearTimeout(animationID);

	animationID = setTimeout(() => {
		generator.next();
		onPlayClick(undefined);
	}, ANIMATION_SPEED);
}


function onPlayClick(event) {
	playAt(ANIMATION_SPEED);
}

function onFFClick(event) {
	playAt(ANIMATION_SPEED/10);
}

function onPauseClick(event) {
	clearTimeout(animationID);
}


function onHelpClick(event) {
	text = `This app lets you run the closest pair algorithm on a set of points.
\nWhen the background is yellow, the app is accepting input: clicking anywhere in the yellow rectangle will add a point.
\nOnce you've added your points, begin the algorithm with the playback controls: you can step forward, play the animation, fast forward the animation, or pause the animation. At anytime, the reset button will completely reset the app, and allow you to input new points.
\nWhen running, the algorithm will proceed recursivly, showing the region it is working on in grey. The closest pairs it has found so far in each region are shown by a red line. When the results of two regions are combined, the strip where closest pairs may still reside is shown in red, and the algorithm searches for these pairs, showing the pairs it is considering with a grey line. At the end of the function, the global closest pair is shown with a red line.
\nCoded by Zoë Marschner. Icons from Google Material Icons.
	`
	alert(text);
}


