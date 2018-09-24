import ClearState from './state/ClearState';
import DrawState from './state/DrawState';
import RenderState from './state/RenderState';

export default class Context {
  constructor() {
    this.viewport = { x: 0, y: 0, w: 0, h: 0 };
    this.framebuffer = undefined;
    this.textureUnits = [];
    this.texturesDirty = false;
  }

  initialize = (gl, canvas) => {
    this.gl = gl;
    this.canvas = canvas;
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LESS);
    this.gl.frontFace(this.gl.CCW);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  };

  resize = () => {
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;

    if (
      this.canvas.width != displayWidth ||
      this.canvas.height != displayHeight
    ) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
    }
  };

  free = () => {
    this.textureUnits = [];
    this.texturesDirty = true;
  };

  draw = (primitiveType, offset, count, drawState, sceneState) => {
    //delete this
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    const { renderState, shaderProgram, vertexArray } = drawState;
    const { position, normal, uv, index } = vertexArray;

    shaderProgram.bind();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, position);
    shaderProgram.setAttribPointer('a_position', 3, this.gl.FLOAT);

    if (normal) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normal);
      shaderProgram.setAttribPointer('a_normal', 3, this.gl.FLOAT);
    }
    if (uv) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uv);
      shaderProgram.setAttribPointer('a_uv', 2, this.gl.FLOAT);
    }

    /*if (this.texturesDirty) {
      let index = 0;
      this.textureUnits.forEach(textureUnit => {
        this.gl.activeTexture(this.gl[`TEXTURE${index}`]);
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_WRAP_S,
          textureUnit.sampler.wrapS
        );
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_WRAP_T,
          textureUnit.sampler.wrapT
        );
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_MIN_FILTER,
          textureUnit.sampler.minificationFilter
        );
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_MAG_FILTER,
          textureUnit.sampler.magnificationFilter
        );
        console.log(this.textureUnits);
        this.gl.bindTexture(this.gl.TEXTURE_2D, textureUnit.texture.texture);
      });

      this.texturesDirty = false;
    }*/

    shaderProgram.setAutomatics(this, drawState, sceneState);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, index);
    this.gl.drawElements(primitiveType, count, this.gl.UNSIGNED_SHORT, offset);
  };

  clear = clearState => {
    this.gl.clearColor(
      clearState.color.r,
      clearState.color.g,
      clearState.color.b,
      clearState.color.a
    );

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  };
}
