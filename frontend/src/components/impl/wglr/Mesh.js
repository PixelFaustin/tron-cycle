import Device from './Device';

export default class Mesh {
  constructor() {
    this.vertexAttributes = { position: null };
    this.indexBuffer = null;
    this.primitiveType = null;
    this.frontFaceWindingOrder = null;
    this.dimension = 0; //delete if useless
    this.indexCount = 0;
  }

  free = () => {
    Object.keys(this.vertexAttributes).forEach(name => {
      this.vertexAttributes[name].free();
    });

    this.indexBuffer.free();
  };

  copyFromImported = (imported, primitiveType, frontFaceWindingOrder) => {
    this.dimension = imported.vertexBuffer.itemSize;
    this.vertexAttributes.position = imported.vertexBuffer;
    this.vertexAttributes.normal = imported.normalBuffer;
    this.vertexAttributes.uv = imported.textureBuffer;
    this.indexBuffer = imported.indexBuffer;

    this.primitiveType = primitiveType;
    this.frontFaceWindingOrder = frontFaceWindingOrder; //default is gl.CCW

    return this;
  };

  copyFromRaw = (dimension, vertices, normals, uvs, indices) => {
    if (vertices.length * indices.length <= 0) {
      throw new Error('Vertices or indices cannot be left null');
    }

    this.dimension = dimension;
    this.vertexAttributes.position = Device.createVertexBuffer(
      'STATIC_DRAW',
      vertices.length
    ).bufferFromMemory(vertices);

    this.vertexAttributes.uv = Device.createVertexBuffer(
      'STATIC_DRAW',
      uvs.length
    ).bufferFromMemory(uvs);

    this.vertexAttributes.normal = Device.createVertexBuffer(
      'STATIC_DRAW',
      normals.length
    ).bufferFromMemory(normals);

    this.indexBuffer = Device.createIndexBuffer(
      'STATIC_DRAW',
      indices.length
    ).bufferFromMemory(indices);

    this.indexCount = indices.length;

    return this;
  };

  toVertexArray = () => {
    return {
      position:
        this.vertexAttributes.position && this.vertexAttributes.position.vbo,
      normal: this.vertexAttributes.normal && this.vertexAttributes.normal.vbo,
      uv: this.vertexAttributes.uv && this.vertexAttributes.uv.vbo,
      index: this.indexBuffer.vbo
    };
  };
}

var DefaultQuad = undefined;

const getDefaultQuad = () => {
  DefaultQuad =
    DefaultQuad ||
    new Mesh().copyFromRaw(
      2,
      [1, 1, -1, 1, -1, -1, -1, -1, 1, -1, 1, 1],
      [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0],
      [0, 1, 2, 3, 4, 5]
    );

  return DefaultQuad;
};

const resetDefaultQuad = () => {
  if (DefaultQuad) {
    DefaultQuad.free();
    DefaultQuad = undefined;
  }

  return DefaultQuad;
};

export { getDefaultQuad, resetDefaultQuad };
