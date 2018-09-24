function uVec2(gl, loc, value) {
  gl.uniform2fv(loc, value);
}

function uVec3(gl, loc, value) {
  gl.uniform3fv(loc, value);
}

function uVec4(gl, loc, value) {
  gl.uniform4fv(loc, value);
}

function uMat2(gl, loc, value) {
  gl.uniformMatrix2fv(loc, false, value);
}

function uMat3(gl, loc, value) {
  gl.uniformMatrix3fv(loc, false, value);
}

function uMat4(gl, loc, value) {
  gl.uniformMatrix4fv(loc, false, value);
}

function uInt(gl, loc, value) {
  gl.uniform1i(loc, value);
}

function uFloat(gl, loc, value) {
  gl.uniform1f(loc, value);
}

function compileShader(gl, type, src) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(
      "Could not compile shader, here's what we know: " +
        gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function mapGLSLType(gl, type) {
  let internalType = undefined;

  switch (type) {
    case gl.FLOAT:
      internalType = uFloat;
      break;
    case gl.FLOAT_VEC2:
      internalType = uVec2;
      break;
    case gl.FLOAT_VEC3:
      internalType = uVec3;
      break;
    case gl.FLOAT_VEC4:
      internalType = uVec4;
      break;
    case gl.INT:
      internalType = uInt;
      break;
    case gl.FLOAT_MAT2:
      internalType = uMat2;
      break;
    case gl.FLOAT_MAT3:
      internalType = uMat3;
      break;
    case gl.FLOAT_MAT4:
      internalType = uMat4;
      break;
    case gl.SAMPLER_2D:
      internalType = uInt;
      break;
  }

  return internalType;
}

export default class ShaderProgram {
  constructor(gl) {
    this.gl = gl;
    this.attributeMap = {};
    this.uniformMap = {};
    this.automatics = {};
  }

  attachVertexSrc = vert => {
    this.vertexShader = compileShader(this.gl, this.gl.VERTEX_SHADER, vert);

    return this;
  };

  attachFragmentSrc = frag => {
    this.fragmentShader = compileShader(this.gl, this.gl.FRAGMENT_SHADER, frag);

    return this;
  };

  free = () => {
    this.gl.deleteShader(this.vertexShader);
    this.gl.deleteShader(this.fragmentShader);
    this.gl.deleteProgram(this.program);
  };

  build = () => {
    const { vertexShader, fragmentShader } = this;

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      throw new Error(
        'Unable to initialize the shader program: ' +
          this.gl.getProgramInfoLog(this.program)
      );
    }

    return this;
  };

  loadUniforms = uniformMap => {
    this.bind();

    let success = true;
    Object.keys(uniformMap).forEach(key => {
      const location = this.gl.getUniformLocation(this.program, key);

      if (location < 0) {
        throw new Error(`Could not load uniform ${key}`);
        success = false;
      } else {
        this.uniformMap[key] = { getter: uniformMap[key], location };
      }
    });

    return success;
  };

  loadAttributes = attributes => {
    this.bind();
    let success = true;
    attributes.forEach(attribute => {
      const location = this.gl.getAttribLocation(this.program, attribute);

      if (location < 0) {
        throw new Error(`Could not load attribute ${attribute}`);
        success = false;
      } else {
        this.attributeMap[attribute] = location;
      }
    });

    return success;
  };

  //Accessor example:
  /*
    accessor = (context, drawState, sceneState) => {
      return sceneState.modelViewProjection;
    }
  */
  makeUniformAutomatic = (uniformName, accessor) => {
    this.automatics[uniformName] = accessor;
  };

  setUniform = (name, value) => {
    const { getter, location } = this.uniformMap[name];

    getter(this.gl, location, value);
  };

  setAutomatics = (context, drawState, sceneState) => {
    Object.keys(this.automatics).forEach(key => {
      const value = this.automatics[key](context, drawState, sceneState);

      this.setUniform(key, value);
    });
  };

  detectAttributes = () => {
    const numberAttributes = this.gl.getProgramParameter(
      this.program,
      this.gl.ACTIVE_ATTRIBUTES
    );

    const attributes = [];
    for (let i = 0; i < numberAttributes; ++i) {
      const info = this.gl.getActiveAttrib(this.program, i);
      attributes.push(info.name);
    }

    this.loadAttributes(attributes);

    return numberAttributes;
  };

  detectUniforms = () => {
    const numberUniforms = this.gl.getProgramParameter(
      this.program,
      this.gl.ACTIVE_UNIFORMS
    );

    const uniformMap = {};
    for (let i = 0; i < numberUniforms; ++i) {
      const info = this.gl.getActiveUniform(this.program, i);
      const { name, size, type } = info;

      const internalType = mapGLSLType(this.gl, type);

      uniformMap[name] = internalType;
    }

    this.loadUniforms(uniformMap);
    return numberUniforms;
  };

  setAttribPointer = (attribute, size, type) => {
    this.gl.vertexAttribPointer(
      this.attributeMap[attribute],
      size,
      type,
      false,
      0,
      0
    );
  };

  enableAttribs = () => {
    Object.keys(this.attributeMap).forEach(attr => {
      this.gl.enableVertexAttribArray(this.attributeMap[attr]);
    });
  };

  bind = () => {
    this.gl.useProgram(this.program);
    this.enableAttribs();
  };
}
