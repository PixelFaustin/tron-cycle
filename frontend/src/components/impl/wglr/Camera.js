import { math } from './math';
import * as glm from 'gl-matrix';

export default class Camera {
  constructor(pos = glm.vec3.fromValues(0, 0, 0), speed = 5.0) {
    this.worldUp = glm.vec3.fromValues(0, 1, 0);

    this.movementSpeed = speed;

    this.dirty = false;
    this.eye = glm.vec3.clone(pos);
    this.forward = glm.vec3.fromValues(0, 0, -1);
    this.target = this.forward;
    this.up = glm.vec3.clone(WorldUp);
    this.right = glm.vec3.cross(glm.vec3.create(), forward, up);
    this.yaw = -90.0;
    this.pitch = 0.0;
    this.viewMatrix = glm.mat4.create();

    this.updateViewMatrix();
  }

  updateViewMatrix = () => {
    let result = glm.mat4.create();

    this.forward = math.toDirectionVector(this.yaw, this.pitch);
    glm.vec3.cross(this.right, this.forward, this.WorldUp);
    glm.vec3.cross(this.up, this.right, this.forward);

    glm.vec3.normalize(this.right, this.right);
    glm.vec3.normalize(this.up, this.up);

    let center = glm.vec3.create();
    glm.vec3.add(this.center, this.position, this.forward);

    glm.mat4.lookAt(result, this.position, this.center, this.up);

    this.viewMatrix = result;
  };

  moveBack = dt => {
    let direction = glm.vec3.create();
    glm.vec3.scale(this.direction, this.forward, this.movementSpeed * dt);

    glm.vec3.sub(this.position, this.position, direction);

    this.dirty = true;
  };

  moveForward = dt => {
    let direction = glm.vec3.create();
    glm.vec3.scale(direction, this.forward, this.movementSpeed * dt);

    glm.vec3.add(this.position, this.position, direction);

    this.dirty = true;
  };
  moveLeft = dt => {
    let direction = glm.vec3.create();
    glm.vec3.scale(direction, this.right, this.movementSpeed * dt);

    glm.vec3.sub(this.position, this.position, direction);

    this.dirty = true;
  };

  moveRight = dt => {
    let direction = glm.vec3.create();
    glm.vec3.scale(direction, this.right, this.movementSpeed * dt);

    glm.vec3.add(this.position, this.position, direction);

    this.dirty = true;
  };

  rotateYaw = (dt, degrees) => {
    this.yaw += degrees * dt;

    this.updateViewMatrix();
  };

  rotatePitch = (dt, degrees) => {
    this.pitch += degrees * dt;

    this.pitch = Math.min(this.pitch, 89.0);
    this.pitch = Math.max(this.pitch, -89.0);

    this.updateViewMatrix();
  };

  update = () => {
    if (this.dirty) {
      this.updateViewMatrix();

      this.dirty = false;
    }
  };
}
