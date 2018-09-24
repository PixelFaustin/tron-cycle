import Mesh from './wglr/Mesh';
import Device from './wglr/Device';
import Context from './wglr/Context';
import ShaderManager from './wglr/ShaderManager';
import TextureManager from './wglr/TextureManager';
import DrawState from './wglr/state/DrawState';
import RenderState from './wglr/state/RenderState';
import SceneState from './wglr/state/SceneState';
import Frustum from './wglr/Frustum';
import Grid from './Grid';
import * as glm from 'gl-matrix';
import { intersect, satCollision, sphereOverlap } from './wglr/Collision';
import BoundingBox from './wglr/BoundingBox';

export default class Player {
  constructor() {
    this.playerWidth = 1;
    this.playerHeight = 1;
    this.playerDepth = 4;

    this.tombWidth = 1;
    this.tombHeight = 1;
    this.tombDepth = 0.08;

    this.position = glm.vec3.fromValues(2250, 20, 2250);
    this.defaultForward = glm.vec3.fromValues(0, 0, 1);
    this.forward = glm.vec3.clone(this.defaultForward);
    this.isAlive = true;
    this.yaw = 0;
    this.yawDelta = 0;
    this.yawDivisor = 5;
    this.yawClamp = 45;
    this.cameraYaw = this.yaw;
    this.cameraForward = glm.vec3.clone(this.forward);

    this.tombs = [];
    this.tombTimer = 0;
    this.tombInterval = 0.5;

    this.normal = glm.mat4.create();
    this.normal = glm.mat4.fromRotationTranslationScale(
      glm.mat4.create(),
      glm.quat.fromEuler(glm.quat.create(), 0, -this.yaw, 0),
      glm.vec3.sub(glm.vec3.create(), glm.vec3.create(), this.position),
      glm.vec3.fromValues(1 / 50, 1 / 50, 1 / 50)
    );

    this.boostTimerInterval = 10;
    this.boostTimerOrigin = performance.now() / 1000;
    this.boostStart = 0;
    this.boostTimeLength = 3;
    this.isBoosting = false;

    this.gridCount = 18;
    this.grid = new Grid(this.gridCount, this.gridCount, 250);
  }

  initialize = (gl, shaderManager) => {
    this.shaderManager = shaderManager;
    let vertices = constructPlayer(
      this.playerWidth,
      this.playerHeight,
      this.playerDepth
    );

    this.playerMesh = new Mesh().copyFromRaw(
      vertices.vertices.length,
      vertices.vertices,
      vertices.normals,
      vertices.uvs,
      vertices.indices
    );

    vertices = constructPlayer(this.tombWidth, this.tombHeight, this.tombDepth);

    this.tombMesh = new Mesh().copyFromRaw(
      vertices.vertices.length,
      vertices.vertices,
      vertices.normals,
      vertices.uvs,
      vertices.indices
    );
  };

  transformToQuadSpace = val => {
    return val + 2250;
  };

  boost = () => {
    const now = performance.now() / 1000;
    if (now - this.boostTimerOrigin >= this.boostTimerInterval) {
      this.isBoosting = true;
      this.boostTimerOrigin = now;
      this.boostStart = now;
    }
  };

  camera = () => {
    let center = this.position;
    let springHeight = 400;
    let springOffset = glm.vec3.add(
      glm.vec3.create(),
      glm.vec3.scale(glm.vec3.create(), this.forward, -700),
      glm.vec3.fromValues(0, springHeight, 0)
    );
    let eye = glm.vec3.add(glm.vec3.create(), this.position, springOffset);
    let forward = glm.vec3.sub(glm.vec3.create(), center, eye);
    forward = glm.vec3.normalize(forward, forward);
    let right = glm.vec3.cross(
      glm.vec3.create(),
      forward,
      glm.vec3.fromValues(0, -1, 0)
    );
    right = glm.vec3.normalize(right, right);
    let up = glm.vec3.cross(glm.vec3.create(), forward, right);
    up = glm.vec3.normalize(up, up);
    return glm.mat4.lookAt(glm.mat4.create(), eye, center, up);
  };

  movementSpeed = () => {
    return this.isBoosting ? 1000 : 350;
  };

  renderPlayer = (context, program, view) => {
    program.bind();
    const drawState = Object.create(DrawState);
    drawState.renderState = Object.create(RenderState);
    drawState.shaderProgram = program;

    drawState.vertexArray = this.playerMesh.toVertexArray();

    let indexCount = this.playerMesh.indexCount;

    let model = glm.mat4.fromRotationTranslationScale(
      glm.mat4.create(),
      glm.quat.fromEuler(glm.quat.create(), 0, this.yaw, 0),
      this.position,
      glm.vec3.fromValues(50, 50, 50)
    );

    let normal = glm.mat4.create();
    normal = glm.mat4.fromRotationTranslationScale(
      glm.mat4.create(),
      glm.quat.fromEuler(glm.quat.create(), 0, -this.yaw, 0),
      glm.vec3.sub(glm.vec3.create(), glm.vec3.create(), this.position),
      glm.vec3.fromValues(1 / 50, 1 / 50, 1 / 50)
    );

    normal = glm.mat4.transpose(normal, normal);

    program.setUniform('u_model', model);
    program.setUniform('u_normal', normal);
    program.setUniform('u_color', [0.3, 0.5, 0.7]);

    context.draw(
      Device.gl.TRIANGLES,
      0,
      indexCount,
      drawState,
      Object.create(SceneState)
    );
  };

  renderTomb = (tomb, context, program, view) => {
    program.bind();
    const drawState = Object.create(DrawState);
    drawState.renderState = Object.create(RenderState);
    drawState.shaderProgram = program;

    drawState.vertexArray = this.tombMesh.toVertexArray();

    let indexCount = this.tombMesh.indexCount;

    let model = glm.mat4.fromRotationTranslationScale(
      glm.mat4.create(),
      tomb.rotation,
      tomb.translation,
      glm.vec3.fromValues(75, 75, 75)
    );

    let normal = this.normal;
    normal = glm.mat4.transpose(normal, normal);

    program.setUniform('u_model', model);
    program.setUniform('u_normal', normal);
    program.setUniform(
      'u_color',
      tomb.isOverlapped ? [0.2, 0.8, 0.5] : [0.8, 0.3, 0.5]
    );

    context.draw(
      Device.gl.TRIANGLES,
      0,
      indexCount,
      drawState,
      Object.create(SceneState)
    );
  };

  updateCursor = (dx, dy) => {
    const dampener = 0.1;
    const delta =
      Math.sqrt(dx * dx + dy * dy) * (-1 * Math.sign(dx)) * dampener;

    this.yawDelta += delta;

    if (Math.abs(this.yawDelta) >= this.yawDivisor) {
      let yawDelta =
        Math.floor(this.yawDelta / this.yawDivisor) * this.yawDivisor;
      yawDelta = Math.min(10, Math.abs(yawDelta)) * Math.sign(yawDelta);

      this.yawDelta = 0;
      this.yaw = (this.yaw + yawDelta) % 360;
      let mat = glm.mat4.rotateY(
        glm.mat4.create(),
        glm.mat4.create(),
        yawDelta * (Math.PI / 180)
      );

      let forward4 = glm.vec4.fromValues(
        this.forward[0],
        this.forward[1],
        this.forward[2],
        0.0
      );

      forward4 = glm.vec4.transformMat4(glm.vec4.create(), forward4, mat);
      this.forward = glm.vec3.fromValues(forward4[0], forward4[1], forward4[2]);
    }
  };

  updateCamera = dt => {
    let distance = this.yaw - this.cameraYaw;
    let step = distance * 5 * dt;

    if (Math.abs(distance) > 3) {
      this.cameraYaw = this.cameraYaw + step;
    }

    let mat = glm.mat4.rotateY(
      glm.mat4.create(),
      glm.mat4.create(),
      this.cameraYaw * (Math.PI / 180)
    );

    let forward4 = glm.vec4.fromValues(
      this.defaultForward[0],
      this.defaultForward[1],
      this.defaultForward[2],
      0.0
    );

    forward4 = glm.vec4.transformMat4(glm.vec4.create(), forward4, mat);
    this.cameraForward = glm.vec3.fromValues(
      forward4[0],
      forward4[1],
      forward4[2]
    );
  };

  isCollidingWithTomb = () => {
    const playerX = this.position[0];
    const playerZ = this.position[2];

    let broadphase = this.grid.retrieveNeighborsWorld(playerX, playerZ);
    let overlapped = [];
    let playerSphere = { c: this.position, r: 100 };
    for (let i = 0; i < broadphase.length; i++) {
      let tomb = broadphase[i];
      let tombSphere = { c: tomb.translation, r: 50 };
      if (sphereOverlap(playerSphere, tombSphere)) {
        overlapped.push(tomb);
      }
    }

    let model = glm.mat4.fromRotationTranslationScale(
      glm.mat4.create(),
      glm.quat.fromEuler(glm.quat.create(), 0, this.yaw, 0),
      this.position,
      glm.vec3.fromValues(50, 50, 50)
    );

    let omin = glm.vec3.fromValues(-0.5, 0, -2);
    let omax = glm.vec3.fromValues(0.5, 1, 2);

    let playerBB = new BoundingBox();
    let v = playerBB.setMinMax(omin, omax, model);
    let axes = playerBB.setAxesTransform(model);

    let oTombMin = glm.vec3.fromValues(-0.5, 0, -0.04);
    let oTombMax = glm.vec3.fromValues(0.5, 1, 0.04);

    for (let i = 0; i < overlapped.length; i++) {
      let tomb = overlapped[i];
      let tombModel = glm.mat4.fromRotationTranslationScale(
        glm.mat4.create(),
        tomb.rotation,
        tomb.translation,
        glm.vec3.fromValues(30, 30, 30)
      );

      let tombBB = new BoundingBox();
      v = tombBB.setMinMax(oTombMin, oTombMax, tombModel);
      axes = tombBB.setAxesTransform(tombModel);

      if (satCollision(playerBB, tombBB)) {
        tomb.isOverlapped = true;
        return true;
      }
    }

    return false;
  };

  update = dt => {
    let collision = this.isCollidingWithTomb();

    let velocity = glm.vec3.scale(
      glm.vec3.create(),
      this.forward,
      dt * this.movementSpeed()
    );

    this.position = glm.vec3.add(glm.vec3.create(), this.position, velocity);

    this.updateCamera(dt);

    this.tombTimer += dt;
    const tombPosition = glm.vec3.sub(
      glm.vec3.create(),
      this.position,
      glm.vec3.scale(glm.vec3.create(), this.forward, 100)
    );
    if (this.tombTimer >= this.tombInterval) {
      let tomb = {
        rotation: glm.quat.fromEuler(glm.quat.create(), 0, this.yaw + 90, 0),
        translation: glm.vec3.clone(tombPosition),
        isOverlapped: false
      };
      let x = tombPosition[0];
      let z = tombPosition[2];
      this.grid.insertWorld(x, z, tomb);
      this.tombs.push(tomb);

      this.tombTimer = 0;
    }

    const now = performance.now() / 1000;

    if (this.isBoosting) {
      if (now - this.boostStart >= this.boostTimeLength) {
        this.isBoosting = false;
        this.boostStart = now;
      }
    }
  };

  render = (context, view) => {
    const program = this.shaderManager.shaderMap['three'];
    this.renderPlayer(context, program, view);

    for (let tomb of this.tombs) {
      this.renderTomb(tomb, context, program, view);
    }
  };
}

function constructPlayer(x, y, z) {
  const LEFT = -x / 2;
  const RIGHT = x / 2;
  const FORWARD = z / 2;
  const BACKWARD = -z / 2;
  const BOTTOM = 0;
  const TOP = y;

  const vertices = [
    LEFT,
    BOTTOM,
    BACKWARD,
    RIGHT,
    BOTTOM,
    BACKWARD, //BOTTOM
    RIGHT,
    BOTTOM,
    FORWARD,
    LEFT,
    BOTTOM,
    FORWARD,

    LEFT,
    BOTTOM,
    BACKWARD,
    LEFT,
    BOTTOM,
    FORWARD, //LEFT
    LEFT,
    TOP,
    FORWARD,
    LEFT,
    TOP,
    BACKWARD,

    RIGHT,
    BOTTOM,
    BACKWARD,
    RIGHT,
    BOTTOM,
    FORWARD, //RIGHT
    RIGHT,
    TOP,
    FORWARD,
    RIGHT,
    TOP,
    BACKWARD,

    LEFT,
    TOP,
    BACKWARD,
    RIGHT,
    TOP,
    BACKWARD, //TOP
    RIGHT,
    TOP,
    FORWARD,
    LEFT,
    TOP,
    FORWARD,

    LEFT,
    BOTTOM,
    FORWARD,
    RIGHT,
    BOTTOM,
    FORWARD,
    RIGHT,
    TOP,
    FORWARD, //FRONT
    LEFT,
    TOP,
    FORWARD,

    LEFT,
    BOTTOM,
    BACKWARD,
    RIGHT,
    BOTTOM,
    BACKWARD,
    RIGHT,
    TOP,
    BACKWARD, //BACK
    LEFT,
    TOP,
    BACKWARD
  ];

  const uvs = [
    0.0,
    0.0, //BOTTOM
    x,
    0.0,
    x,
    z,
    0.0,
    z,

    0.0,
    0.0, //left
    z,
    0.0,
    z,
    y,
    0.0,
    y,

    0.0,
    0.0, //right
    z,
    0.0,
    z,
    y,
    0.0,
    y,

    0.0,
    0.0, //top
    x,
    0.0,
    x,
    z,
    0.0,
    z,

    0.0,
    0.0, //front
    x,
    0.0,
    x,
    y,
    0.0,
    y,

    0.0,
    0.0,
    x,
    0.0,
    x,
    y,
    0.0,
    y
  ];

  const normals = [
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,

    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,

    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,

    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,

    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,

    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0
  ];

  const indices = [
    0,
    2,
    1,
    2,
    0,
    3,
    4 + 0,
    4 + 2,
    4 + 1,
    4 + 2,
    4 + 0,
    4 + 3,
    8 + 0,
    8 + 2,
    8 + 1,
    8 + 2,
    8 + 0,
    8 + 3,
    12 + 0,
    12 + 2,
    12 + 1,
    12 + 2,
    12 + 0,
    12 + 3,
    16 + 0,
    16 + 2,
    16 + 1,
    16 + 2,
    16 + 0,
    16 + 3,
    20 + 0,
    20 + 2,
    20 + 1,
    20 + 2,
    20 + 0,
    20 + 3
  ];

  return {
    vertices,
    normals,
    indices,
    uvs
  };
}
