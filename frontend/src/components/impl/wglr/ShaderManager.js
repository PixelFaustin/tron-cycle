import ShaderProgram from './ShaderProgram';

export default class ShaderManager {
  constructor(gl) {
    this.gl = gl;
    this.shaderMap = {};
  }

  free = () => {
    Object.keys(this.shaderMap).forEach(name => {
      this.shaderMap[name].free();
    });
  };

  downloadShaders = shaderMap => {
    return new Promise((resolve, reject) => {
      const names = Object.keys(shaderMap);
      const paths = [];
      names.forEach(name => {
        paths.push(shaderMap[name].vertex);
        paths.push(shaderMap[name].fragment);
      });

      if (paths.length % 2 !== 0) {
        reject('Expected even number of shader paths!');
      }

      Promise.all(
        paths.map(path => {
          return fetch(path).then(stream => {
            return stream.text();
          });
        })
      ).then(files => {
        for (let i = 0; i < files.length; i += 2) {
          const vertexSrc = files[i];
          const fragmentSrc = files[i + 1];

          const program = new ShaderProgram(this.gl)
            .attachVertexSrc(vertexSrc)
            .attachFragmentSrc(fragmentSrc)
            .build();

          program.bind();

          const detectedUniformsCount = program.detectUniforms();
          const detectedAttributesCount = program.detectAttributes();

          this.shaderMap[names[i / 2]] = program;
        }

        resolve();
      });
    });
  };
}
