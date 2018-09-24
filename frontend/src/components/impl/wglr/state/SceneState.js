const SceneState = {
  diffuseIntensity: 0,
  specularIntensity: 0,
  ambientIntensity: 0,
  shininess: 0,
  camera: null,
  cameraLightPosition: null,
  orthographicMatrix: null,
  perspectiveMatrix: null,
  viewMatrix: null,
  modelMatrix: null,
  modelViewPerspectiveMatrix: null,
  modelViewOrthographicMatrix: null,
  computeViewportTransformationMatrix: (viewport, nearDepth, farDepth) => {},
  computeViewportOrthographicMatrix: viewport => {}
};

export default SceneState;
