import Device from './wglr/Device';
import Context from './wglr/Context';
import ShaderManager from './wglr/ShaderManager';
import TextureManager from './wglr/TextureManager';
import Mesh, { getDefaultQuad, resetDefaultQuad } from './wglr/Mesh';
import DrawState from './wglr/state/DrawState';
import RenderState from './wglr/state/RenderState';
import SceneState from './wglr/state/SceneState';
import TextureSampler from './wglr/TextureSampler';
import MeshManager from './wglr/MeshManager';
import Player from './Player';
import { Scene } from './Scene';
import * as glm from 'gl-matrix';

function radians(x) {
  return x * (Math.PI / 180);
}

export default class GameView {
  constructor() {
    this.initialized = false;
  }

  initialize(canvas) {
    this.initialized = false;
    if (canvas) {
      this.canvas = canvas;
      this.context = Device.createContext(this.canvas, {});

      this.shaderManager = new ShaderManager(Device.gl);
      this.meshManager = new MeshManager(Device.gl);

      this.shaderManager
        .downloadShaders({
          default: {
            vertex: '/shaders/default-2d-vs.glsl',
            fragment: '/shaders/default-2d-fs.glsl'
          },
          tron: {
            vertex: '/shaders/tron-vs.glsl',
            fragment: '/shaders/tron-fs.glsl'
          },
          flicker: {
            vertex: '/shaders/wallflicker-vs.glsl',
            fragment: '/shaders/wallflicker-fs.glsl'
          },
          three: {
            vertex: '/shaders/default-3d-vs.glsl',
            fragment: '/shaders/default-3d-fs.glsl'
          }
        })
        .then(() => {
          resetDefaultQuad();
          this.quad = getDefaultQuad();

          this.scene = new Scene();
          this.scene.initialize(this.gl, this.shaderManager);

          return this.meshManager.downloadMeshes({ ship: '/models/ship.obj' });
        })
        .then(() => {
          const program2d = this.shaderManager.shaderMap['default'];

          program2d.makeUniformAutomatic(
            'u_resolution',
            (context, drawState, sceneState) => {
              const { width, height } = context.canvas;
              return glm.vec2.fromValues(width, height);
            }
          );

          program2d.makeUniformAutomatic(
            'u_time',
            (context, drawState, sceneState) => performance.now() / 1000
          );

          const programTron = this.shaderManager.shaderMap['tron'];

          programTron.makeUniformAutomatic(
            'u_projection',
            (context, drawState, sceneState) => {
              return glm.mat4.perspective(
                glm.mat4.create(),
                0.7853981634,
                1280 / 720,
                0.01,
                10000
              );
            }
          );

          const programFlicker = this.shaderManager.shaderMap['flicker'];
          programFlicker.makeUniformAutomatic(
            'u_time',
            (context, drawState, sceneState) => performance.now() / 1000
          );

          programFlicker.makeUniformAutomatic(
            'u_projection',
            (context, drawState, sceneState) => {
              return glm.mat4.perspective(
                glm.mat4.create(),
                0.7853981634,
                1280 / 720,
                0.01,
                10000
              );
            }
          );

          const program3d = this.shaderManager.shaderMap['three'];

          program3d.makeUniformAutomatic(
            'u_projection',
            (context, drawState, sceneState) => {
              return glm.mat4.perspective(
                glm.mat4.create(),
                0.7853981634,
                1280 / 720,
                0.01,
                10000
              );
            }
          );

          this.initialized = true;
        });
    }
  }

  lockMouse = () => {
    if (this.initialized) {
      this.canvas.requestPointerLock();
    }
  };

  handleClick = () => {
    if (this.initialized) {
      this.scene.handleClick();
    }
  };

  updateCursor = (dx, dy) => {
    if (this.initialized) {
      this.scene.updateCursor(dx, dy);
    }
  };

  free = () => {
    this.shaderManager.free();
    this.textureManager.free();
    this.quad.free();
    Device.context.free();
  };

  update = dt => {
    if (this.initialized) {
      this.scene.update(dt);
    }
  };

  render = () => {
    if (this.initialized) {
      this.context.resize();
      this.context.clear({ color: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 } });

      this.scene.render(this.context);
    }
  };
}
