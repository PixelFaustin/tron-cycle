import RenderState from './RenderState.js';

const DrawState = {
  renderState: Object.create(RenderState),
  shaderProgram: undefined,
  vertexArray: {
    position: undefined,
    normal: undefined,
    uv: undefined,
    index: undefined
  }
};

export default DrawState;
