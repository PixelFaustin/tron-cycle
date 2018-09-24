import * as glm from 'gl-matrix';

class Plane {
  constructor(a, b, c) {
    let v1 = glm.vec3.clone(a);
    let v2 = glm.vec3.clone(b);
    let v3 = glm.vec3.clone(c);
    let aux1 = glm.vec3.sub(glm.vec3.create(), v1, v2);
    let aux2 = glm.vec3.sub(glm.vec3.create(), v3, v2);
    aux1 = glm.vec3.normalize(aux1, aux1);
    aux2 = glm.vec3.normalize(aux2, aux2);

    let normal = glm.vec3.cross(glm.vec3.create(), aux2, aux1);
    normal = glm.vec3.normalize(normal, normal);
    this.normal = normal;
    this.point = v2;
    this.d = -glm.vec3.dot(this.normal, this.point);
  }

  distance = p => {
    return this.d + glm.vec3.dot(this.normal, p);
  };
}

export default class Frustum {
  constructor() {
    this.planes = {
      top: null,
      bottom: null,
      left: null,
      right: null,
      near: null,
      far: null
    };
  }

  updatePerspective = (fov, aspectRatio, near, far) => {
    this.aspectRatio = aspectRatio;
    this.fov = fov;
    this.near = near;
    this.far = far;

    let tanAng = Math.tan(fov * 0.5);
    this.nearHeight = near * tanAng;
    this.nearWidth = this.nearHeight * aspectRatio;
    this.farHeight = far * tanAng;
    this.farWidth = this.farHeight * aspectRatio;
  };

  updateCamera = (eye, center, up) => {
    let Z = glm.vec3.sub(glm.vec3.create(), eye, center);
    Z = glm.vec3.normalize(Z, Z);

    let X = glm.vec3.cross(glm.vec3.create(), up, Z);
    X = glm.vec3.normalize(X, X);

    let Y = glm.vec3.cross(glm.vec3.create(), Z, X);

    this.nearCenter = glm.vec3.sub(
      glm.vec3.create(),
      eye,
      glm.vec3.scale(glm.vec3.create(), Z, this.near)
    );
    this.farCenter = glm.vec3.sub(
      glm.vec3.create(),
      eye,
      glm.vec3.scale(glm.vec3.create(), Z, this.far)
    );

    // compute the 4 corners of the frustum on the near plane

    this.nearTopLeft = glm.vec3.add(
      glm.vec3.create(),
      glm.vec3.sub(
        glm.vec3.create(),
        glm.vec3.scale(glm.vec3.create(), Y, this.nearHeight),
        glm.vec3.scale(glm.vec3.create(), X, this.nearWidth)
      ),
      this.nearCenter
    );
    this.nearTopRight = glm.vec3.add(
      glm.vec3.create(),
      glm.vec3.add(
        glm.vec3.create(),
        glm.vec3.scale(glm.vec3.create(), Y, this.nearHeight),
        glm.vec3.scale(glm.vec3.create(), X, this.nearWidth)
      ),
      this.nearCenter
    );

    this.nearBottomLeft = glm.vec3.sub(
      glm.vec3.create(),
      this.nearCenter,
      glm.vec3.sub(
        glm.vec3.create(),
        glm.vec3.scale(glm.vec3.create(), Y, this.nearHeight),
        glm.vec3.scale(glm.vec3.create(), X, this.nearWidth)
      )
    );
    this.nearBottomRight = glm.vec3.sub(
      glm.vec3.create(),
      this.nearCenter,
      glm.vec3.add(
        glm.vec3.create(),
        glm.vec3.scale(glm.vec3.create(), Y, this.nearHeight),
        glm.vec3.scale(glm.vec3.create(), X, this.nearWidth)
      )
    );

    // compute the 4 corners of the frustum on the far plane
    this.farTopLeft = glm.vec3.add(
      glm.vec3.create(),
      this.farCenter,
      glm.vec3.sub(
        glm.vec3.create(),
        glm.vec3.scale(glm.vec3.create(), Y, this.farHeight),
        glm.vec3.scale(glm.vec3.create(), X, this.farWidth)
      )
    );

    this.farTopRight = glm.vec3.add(
      glm.vec3.create(),
      this.farCenter,
      glm.vec3.add(
        glm.vec3.create(),
        glm.vec3.scale(glm.vec3.create(), Y, this.farHeight),
        glm.vec3.scale(glm.vec3.create(), X, this.farWidth)
      )
    );
    this.farBottomLeft = glm.vec3.sub(
      glm.vec3.create(),
      this.farCenter,
      glm.vec3.sub(
        glm.vec3.create(),
        glm.vec3.scale(glm.vec3.create(), Y, this.farHeight),
        glm.vec3.scale(glm.vec3.create(), X, this.farWidth)
      )
    );
    this.farBottomRight = glm.vec3.sub(
      glm.vec3.create(),
      this.farCenter,
      glm.vec3.add(
        glm.vec3.create(),
        glm.vec3.scale(glm.vec3.create(), Y, this.farHeight),
        glm.vec3.scale(glm.vec3.create(), X, this.farWidth)
      )
    );

    this.planes.top = new Plane(
      this.nearTopRight,
      this.nearTopLeft,
      this.farTopLeft
    );
    this.planes.bottom = new Plane(
      this.nearBottomLeft,
      this.nearBottomRight,
      this.farBottomRight
    );
    this.planes.left = new Plane(
      this.nearTopLeft,
      this.nearBottomLeft,
      this.farBottomLeft
    );
    this.planes.right = new Plane(
      this.nearBottomRight,
      this.nearTopRight,
      this.farBottomRight
    );
    this.planes.near = new Plane(
      this.nearTopLeft,
      this.nearTopRight,
      this.nearBottomRight
    );
    this.planes.far = new Plane(
      this.farTopRight,
      this.farTopLeft,
      this.farBottomLeft
    );
  };

  isBoxInFrustum = box => {
    let outCount = 0;
    let inCount = 0;

    let result = false;

    for (let p in this.planes) {
      outCount = 0;
      inCount = 0;

      let plane = this.planes[p];

      for (let k = 0; k < 8 && (inCount === 0 || outCount === 0); k++) {
        if (plane.distance(box.vertices[k]) < 0) {
          outCount++;
        } else {
          inCount++;
        }
      }

      if (inCount === 0) {
        return false;
      } else if (outCount > 0) {
        result = true;
      }
    }

    return result;
  };
}
