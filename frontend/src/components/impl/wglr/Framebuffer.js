import Texture2D from './Texture2D';

export default class Framebuffer {
  constructor() {
    this.colorAttachments = [new Texture2D()];
    this.depthAttachment = null;
    this.depthStencilAttachment = null;
  }
}
