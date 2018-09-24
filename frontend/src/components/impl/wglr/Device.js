import Context from './Context';

import VertexBuffer from './VertexBuffer';
import IndexBuffer from './IndexBuffer';
import Texture2D from './Texture2D';

const Device = {
  createContext: (canvas, webglOptions) => {
    if (canvas) {
      Device.gl = canvas.getContext('webgl');

      if (!Device.gl) {
        throw new Error(
          'Could not initialize webgl context! Your browser or hardware does not support WebGL'
        );
      }

      Device.context = new Context();
      Device.context.initialize(Device.gl, canvas);
      return Device.context;
    }
  },
  createVertexBuffer: (hint, size) => {
    return new VertexBuffer(Device.gl, hint, size);
  },
  createIndexBuffer: (hint, size) => {
    return new IndexBuffer(Device.gl, hint, size);
  },
  createTexture2D: (width, height, description) => {
    return new Texture2D(Device.gl, width, height, description);
  },
  gl: undefined,
  context: undefined
};

export default Device;
