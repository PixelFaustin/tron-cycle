import * as OBJ from 'webgl-obj-loader';

export default class MeshManager {
  constructor(gl) {
    this.gl = gl;
    this.meshes = {};
  }

  free = () => {
    Object.keys(this.meshes).forEach(name => {
      this.meshes[name].free();
    });
  };

  downloadMeshes = meshMap => {
    return new Promise((resolve, reject) => {
      OBJ.downloadMeshes(meshMap, meshes => {
        const loadedMeshes = Object.keys(meshes).map(name => {
          OBJ.initMeshBuffers(this.gl, meshes[name]);
          return { name, mesh: meshes[name] };
        });

        //this.meshes = Object.assign(this.meshes, ...loadedMeshes);

        for (let mesh of loadedMeshes) {
          this.meshes[mesh.name] = mesh.mesh;
        }

        resolve();
      });
    });
  };
}
