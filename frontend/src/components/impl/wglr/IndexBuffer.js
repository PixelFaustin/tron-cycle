export default class IndexBuffer {
  constructor(gl, hint, size) {
    this.gl = gl;
    this.vbo = gl.createBuffer();
    this.hint = hint;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, size, this.gl[this.hint]);
  }

  bufferFromMemory = indices => {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vbo);

    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      this.gl[this.hint]
    );

    return this;
  };

  free = () => {
    this.gl.deleteBuffer(this.vbo);
  };
}
