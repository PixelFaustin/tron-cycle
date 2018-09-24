import * as glm from 'gl-matrix';

export default class BoundingBox {
  constructor() {
    let minx = 0;
    let miny = 0;
    let minz = 0;
    let maxx = 1;
    let maxy = 1;
    let maxz = 1;

    this.backBottomLeft = glm.vec3.fromValues(minx, miny, minz);
    this.backBottomRight = glm.vec3.fromValues(maxx, miny, minz);
    this.frontBottomLeft = glm.vec3.fromValues(minx, miny, maxz);
    this.frontBottomRight = glm.vec3.fromValues(maxx, miny, maxz);

    this.backTopLeft = glm.vec3.fromValues(minx, maxy, minz);
    this.backTopRight = glm.vec3.fromValues(maxx, maxy, minz);
    this.frontTopLeft = glm.vec3.fromValues(minx, maxy, maxz);
    this.frontTopRight = glm.vec3.fromValues(maxx, maxy, maxz);
  }

  setMinMax(min, max, transform) {
    let minx = min[0];
    let miny = min[1];
    let minz = min[2];
    let maxx = max[0];
    let maxy = max[1];
    let maxz = max[2];

    this.backBottomLeft = glm.vec3.fromValues(minx, miny, minz);
    this.backBottomRight = glm.vec3.fromValues(maxx, miny, minz);
    this.frontBottomLeft = glm.vec3.fromValues(minx, miny, maxz);
    this.frontBottomRight = glm.vec3.fromValues(maxx, miny, maxz);

    this.backTopLeft = glm.vec3.fromValues(minx, maxy, minz);
    this.backTopRight = glm.vec3.fromValues(maxx, maxy, minz);
    this.frontTopLeft = glm.vec3.fromValues(minx, maxy, maxz);
    this.frontTopRight = glm.vec3.fromValues(maxx, maxy, maxz);

    this.backBottomLeft = glm.vec3.transformMat4(
      glm.vec3.create(),
      this.backBottomLeft,
      transform
    );

    this.backBottomRight = glm.vec3.transformMat4(
      glm.vec3.create(),
      this.backBottomRight,
      transform
    );

    this.frontBottomLeft = glm.vec3.transformMat4(
      glm.vec3.create(),
      this.frontBottomLeft,
      transform
    );

    this.frontBottomRight = glm.vec3.transformMat4(
      glm.vec3.create(),
      this.frontBottomRight,
      transform
    );

    this.backTopLeft = glm.vec3.transformMat4(
      glm.vec3.create(),
      this.backTopLeft,
      transform
    );

    this.backTopRight = glm.vec3.transformMat4(
      glm.vec3.create(),
      this.backTopRight,
      transform
    );

    this.frontTopLeft = glm.vec3.transformMat4(
      glm.vec3.create(),
      this.frontTopLeft,
      transform
    );

    this.frontTopRight = glm.vec3.transformMat4(
      glm.vec3.create(),
      this.frontTopRight,
      transform
    );

    this.vertices = [
      this.backBottomLeft,
      this.backBottomRight,
      this.frontBottomLeft,
      this.frontBottomRight,
      this.backTopLeft,
      this.backTopRight,
      this.frontTopLeft,
      this.frontTopRight
    ];

    return this.vertices;
  }

  setAxesTransform = mat4 => {
    let transform = glm.mat3.fromMat4(glm.mat3.create(), mat4);

    let x = glm.vec3.fromValues(1, 0, 0);
    let y = glm.vec3.fromValues(0, 1, 0);
    let z = glm.vec3.fromValues(0, 0, 1);

    this.upAxis = glm.vec3.transformMat3(glm.vec3.create(), y, transform);
    this.upAxis = glm.vec3.normalize(this.upAxis, this.upAxis);
    this.forwardAxis = glm.vec3.transformMat3(glm.vec3.create(), z, transform);
    this.forwardAxis = glm.vec3.normalize(this.forwardAxis, this.forwardAxis);
    this.rightAxis = glm.vec3.transformMat3(glm.vec3.create(), x, transform);
    this.rightAxis = glm.vec3.normalize(this.rightAxis, this.rightAxis);

    return this.getAxes();
  };

  getAxes = () => {
    return [this.rightAxis, this.upAxis, this.forwardAxis];
  };

  project = axis => {
    let min = glm.vec3.len(
      glm.vec3.scale(
        glm.vec3.create(),
        this.vertices[0],
        glm.vec3.dot(axis, this.vertices[0])
      )
    );
    let max = min;

    for (let i = 1; i < this.vertices.length; i++) {
      let p = glm.vec3.len(
        glm.vec3.scale(
          glm.vec3.create(),
          this.vertices[i],
          glm.vec3.dot(axis, this.vertices[i])
        )
      );
      if (p < min) {
        min = p;
      } else if (p > max) {
        max = p;
      }
    }

    return { min, max };
  };
}
