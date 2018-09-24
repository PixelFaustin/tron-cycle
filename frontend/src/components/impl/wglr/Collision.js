import * as glm from 'gl-matrix';

function intersect(amin, amax, bmin, bmax) {
  let aminx = amin[0];
  let aminy = amin[1];
  let aminz = amin[2];
  let amaxx = amax[0];
  let amaxy = amax[1];
  let amaxz = amax[2];

  aminx = Math.min(aminx, amaxx);
  amaxx = Math.max(aminx, amaxx);
  aminy = Math.min(aminy, amaxy);
  amaxy = Math.max(aminy, amaxy);
  aminz = Math.min(aminz, amaxz);
  amaxz = Math.max(aminz, amaxz);

  let bminx = bmin[0];
  let bminy = bmin[1];
  let bminz = bmin[2];
  let bmaxx = bmax[0];
  let bmaxy = bmax[1];
  let bmaxz = bmax[2];

  bmaxx = Math.max(bminx, bmaxx);
  bminx = Math.min(bminx, bmaxx);
  bminy = Math.min(bminy, bmaxy);
  bmaxy = Math.max(bminy, bmaxy);
  bminz = Math.min(bminz, bmaxz);
  bmaxz = Math.max(bminz, bmaxz);

  return (
    aminx <= bmaxx &&
    amaxx >= bminx &&
    (aminy <= bmaxy && amaxy >= bminy) &&
    (aminz <= bmaxz && amaxz >= bminz)
  );
}

function intervalOverlap(a, b) {
  let x1 = a.min;
  let x2 = a.max;
  let y1 = b.min;
  let y2 = b.max;
  return Math.max(x1, y1) <= Math.min(x2, y2);
}

function satCollision(BB1, BB2) {
  let axes1 = BB1.getAxes();
  let axes2 = BB2.getAxes();

  for (let i = 0; i < axes1.length; i++) {
    let axis = axes1[i];

    let p1 = BB1.project(axis);
    let p2 = BB2.project(axis);

    if (!intervalOverlap(p1, p2)) {
      return false;
    }
  }

  for (let i = 0; i < axes2.length; i++) {
    let axis = axes2[i];

    let p1 = BB1.project(axis);
    let p2 = BB2.project(axis);

    if (!intervalOverlap(p1, p2)) {
      return false;
    }
  }

  return true;
}

function sphereOverlap(a, b) {
  let distance = glm.vec3.distance(a.c, b.c);
  return distance < a.r + b.r;
}
export { intersect, satCollision, sphereOverlap };
