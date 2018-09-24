import * as glm from 'gl-matrix';

export var math = {
  PI: 3.1415926,
  radians: function(degrees) {
    return degrees * (this.PI / 180.0);
  },
  degrees: function(radians) {
    return radians * (180.0 / this.PI);
  },
  toDirectionVector: function(yaw, pitch) {
    let rYaw = this.radians(yaw);
    let rPitch = this.radians(pitch);

    let x = Math.cos(rYaw) * Math.cos(rPitch);
    let y = Math.sin(rPitch);
    let z = Math.sin(rYaw) * Math.cos(rPitch);

    let result = glm.vec3.fromValues(x, y, z);
    glm.vec3.normalize(result, result);

    return result;
  }
};
