//PointHelpers.js
//Helper functions to easy point maths

export function pointify(pointOrArray){
	if (pointOrArray instanceof Array)
		pointOrArray = {x: pointOrArray[0], y: pointOrArray[1]}

	return pointOrArray;
}


export function addPoints(p1,p2){

	p1 = pointify(p1);
	p2 = pointify(p2);

	// console.log(p1)
	// console.log(p2)

	return {x : p1.x + p2.x, y : p1.y + p2.y}
}

export function subPoints(p1,p2){

	p1 = pointify(p1);
	p2 = pointify(p2);

	return {x : p1.x - p2.x, y : p1.y - p2.y}
}