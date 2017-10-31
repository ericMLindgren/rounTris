//PointHelpers.js
//Helper functions to easy point maths

export function pointify(pointOrArray) {
    if (pointOrArray instanceof Array)
        return { x: pointOrArray[0], y: pointOrArray[1] };
    else return pointOrArray;
}

export function addPoints(p1, p2) {
    // console.log('p1', p1, 'p2', p2)
    p1 = pointify(p1);
    p2 = pointify(p2);

    return { x: p1.x + p2.x, y: p1.y + p2.y };
}

export function subPoints(p1, p2) {
    p1 = pointify(p1);
    p2 = pointify(p2);

    return { x: p1.x - p2.x, y: p1.y - p2.y };
}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

export function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function coinToss(){
  return getRandomInt(0,2);
}

