import Mesh from './wglr/Mesh';
import Device from './wglr/Device';
import Context from './wglr/Context';
import ShaderManager from './wglr/ShaderManager';
import TextureManager from './wglr/TextureManager';
import DrawState from './wglr/state/DrawState';
import RenderState from './wglr/state/RenderState';
import SceneState from './wglr/state/SceneState';
import Player from './Player';

import * as glm from 'gl-matrix';

class Scene {
  constructor() {
    this.cubeWidth = 1.8;
    this.cubeDepth = 1.8;
    this.cubeHeight = 1.8;
  }

  initialize = (gl, shaderManager) => {
    this.shaderManager = shaderManager;
    let vertices = constructCube(
      this.cubeWidth,
      this.cubeHeight,
      this.cubeDepth
    );

    this.cubeMesh = new Mesh().copyFromRaw(
      vertices.vertices.length,
      vertices.vertices,
      vertices.normals,
      vertices.uvs,
      vertices.indices
    );

    vertices = constructPlane(this.cubeWidth, this.cubeDepth);

    this.planeMesh = new Mesh().copyFromRaw(
      vertices.vertices.length,
      vertices.vertices,
      vertices.normals,
      vertices.uvs,
      vertices.indices
    );

    vertices = constructWall(
      this.cubeWidth,
      this.cubeHeight * 0.1,
      this.cubeDepth
    );

    this.wallMesh = new Mesh().copyFromRaw(
      vertices.vertices.length,
      vertices.vertices,
      vertices.normals,
      vertices.uvs,
      vertices.indices
    );

    this.localPlayer = new Player();
    this.localPlayer.initialize(gl, this.shaderManager);

    const programFlicker = this.shaderManager.shaderMap['flicker'];
    programFlicker.makeUniformAutomatic(
      'u_view',
      (context, drawState, sceneState) => this.camera()
    );

    const program3d = this.shaderManager.shaderMap['three'];
    program3d.makeUniformAutomatic('u_view', (context, drawState, sceneState) =>
      this.camera()
    );

    const programTron = this.shaderManager.shaderMap['tron'];

    programTron.makeUniformAutomatic(
      'u_view',
      (context, drawState, sceneState) => this.camera()
    );
  };

  handleClick = () => {
    if (this.localPlayer.isAlive) {
      this.localPlayer.boost();
    }
  };

  camera = () => {
    if (this.localPlayer.isAlive) {
      return this.localPlayer.camera();
    }

    return glm.mat4.lookAt(
      glm.mat4.create(),
      glm.vec3.fromValues(0, 2500, 0),
      glm.vec3.fromValues(0, 0, 0),
      glm.vec3.fromValues(0, 0, 1)
    );
  };

  renderEnvironment = (context, program) => {
    program.bind();
    const drawState = Object.create(DrawState);
    drawState.renderState = Object.create(RenderState);
    drawState.shaderProgram = program;

    drawState.vertexArray = this.cubeMesh.toVertexArray();

    let indexCount = this.cubeMesh.indexCount;

    program.setUniform(
      'u_model',
      glm.mat4.fromRotationTranslationScale(
        glm.mat4.create(),
        glm.quat.create(),
        glm.vec3.fromValues(4500 / 2, -2500, 4500 / 2),
        glm.vec3.fromValues(5000, 5000, 5000)
      )
    );

    context.draw(
      Device.gl.TRIANGLES,
      0,
      indexCount,
      drawState,
      Object.create(SceneState)
    );
  };

  renderFloor = (context, program) => {
    program.bind();
    const drawState = Object.create(DrawState);
    drawState.renderState = Object.create(RenderState);
    drawState.shaderProgram = program;

    drawState.vertexArray = this.planeMesh.toVertexArray();

    let indexCount = this.planeMesh.indexCount;

    program.setUniform(
      'u_model',
      glm.mat4.fromRotationTranslationScale(
        glm.mat4.create(),
        glm.quat.create(),
        glm.vec3.fromValues(2250, 0, 2250),
        glm.vec3.fromValues(2500, 2500, 2500)
      )
    );

    context.draw(
      Device.gl.TRIANGLES,
      0,
      indexCount,
      drawState,
      Object.create(SceneState)
    );
  };

  renderWall = (context, program) => {
    program.bind();
    const drawState = Object.create(DrawState);
    drawState.renderState = Object.create(RenderState);
    drawState.shaderProgram = program;

    drawState.vertexArray = this.wallMesh.toVertexArray();

    let indexCount = this.wallMesh.indexCount;

    program.setUniform(
      'u_model',
      glm.mat4.fromRotationTranslationScale(
        glm.mat4.create(),
        glm.quat.create(),
        glm.vec3.fromValues(2250, 0, 2250),
        glm.vec3.fromValues(2500, 2500, 2500)
      )
    );

    context.draw(
      Device.gl.TRIANGLES,
      0,
      indexCount,
      drawState,
      Object.create(SceneState)
    );
  };

  update = dt => {
    this.localPlayer.update(dt);
  };

  updateCursor = (dx, dy) => {
    if (this.localPlayer.isAlive) {
      this.localPlayer.updateCursor(dx, dy);
    }
  };

  render = context => {
    const program = this.shaderManager.shaderMap['tron'];

    this.renderEnvironment(context, program);
    this.renderFloor(context, program);

    this.localPlayer.render(context, this.camera());

    //Transparent, so render last
    this.renderWall(context, this.shaderManager.shaderMap['flicker']);
  };
}

function constructCube(x, y, z) {
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
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0
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

function constructPlane(x, z) {
  const LEFT = -x / 2;
  const RIGHT = x / 2;
  const FORWARD = z / 2;
  const BACKWARD = -z / 2;

  const vertices = [
    LEFT,
    0,
    BACKWARD,
    RIGHT,
    0,
    BACKWARD,
    RIGHT,
    0,
    FORWARD,
    LEFT,
    0,
    FORWARD
  ];

  const uvs = [0.0, 0.0, x, 0.0, x, z, 0.0, z];

  const normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];

  const indices = [0, 2, 1, 2, 0, 3];

  return {
    vertices,
    normals,
    uvs,
    indices
  };
}

function constructWall(x, y, z) {
  const LEFT = -x / 2;
  const RIGHT = x / 2;
  const FORWARD = z / 2;
  const BACKWARD = -z / 2;
  const BOTTOM = 0;
  const TOP = y;

  const vertices = [
    RIGHT,
    BOTTOM,
    FORWARD,
    LEFT,
    BOTTOM,
    FORWARD, //FRONT
    LEFT,
    TOP,
    FORWARD,
    RIGHT,
    TOP,
    FORWARD,

    RIGHT,
    BOTTOM,
    FORWARD,
    RIGHT,
    BOTTOM,
    BACKWARD, //RIGHT
    RIGHT,
    TOP,
    BACKWARD,
    RIGHT,
    TOP,
    FORWARD,

    RIGHT,
    BOTTOM,
    BACKWARD,
    LEFT,
    BOTTOM,
    BACKWARD, //BACK
    LEFT,
    TOP,
    BACKWARD,
    RIGHT,
    TOP,
    BACKWARD,

    LEFT,
    BOTTOM,
    FORWARD,
    LEFT,
    BOTTOM,
    BACKWARD, //LEFT
    LEFT,
    TOP,
    BACKWARD,
    LEFT,
    TOP,
    FORWARD
  ];

  const normals = [
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
    0.0
  ];

  const uvs = [
    0.0,
    0.0,
    x,
    0.0,
    x,
    1.0,
    0.0,
    1.0,

    0.0,
    0.0,
    z,
    0.0,
    z,
    1.0,
    0.0,
    1.0,

    0.0,
    0.0,
    x,
    0.0,
    x,
    1.0,
    0.0,
    1.0,

    0.0,
    0.0,
    z,
    0.0,
    z,
    1.0,
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
    12 + 3
  ];

  return {
    vertices,
    indices,
    uvs,
    normals
  };
}

export { Scene, constructCube };
