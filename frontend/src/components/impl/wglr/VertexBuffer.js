export default class VertexBuffer {
  constructor(gl, hint, size) {
    this.vbo = gl.createBuffer();
    this.hint = hint;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, size, gl[hint]);
    this.gl = gl;
  }

  bufferFromMemory = vertices => {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(vertices),
      this.gl[this.hint]
    );

    return this;
  };

  free = () => {
    this.gl.deleteBuffer(this.vbo);
  };
}
