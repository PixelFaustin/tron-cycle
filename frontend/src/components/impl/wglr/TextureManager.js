import Device from './Device';

export default class TextureManager {
  constructor(gl) {
    this.gl = gl;
    this.textureMap = {};
  }

  free = () => {
    Object.keys(this.textureMap).forEach(name => {
      this.textureMap[name].free();
    });
  };

  downloadTextures = textureMap => {
    return Promise.all(
      Object.keys(textureMap).map(name => {
        const url = textureMap[name];

        return new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            resolve({ name, image });
          };
          image.onerror = () => {
            reject(`Could not load image at url ${url}`);
          };
          image.src = url;
        });
      })
    ).then(downloadedItems => {
      downloadedItems.forEach(({ name, image }) => {
        const texture = Device.createTexture2D(
          image.width,
          image.height
        ).copyFromImage(image);
        texture.name = name;
        this.textureMap[name] = texture;
      });
    });
  };
}
