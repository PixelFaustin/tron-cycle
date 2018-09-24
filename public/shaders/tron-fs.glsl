#version 100
precision mediump float;

varying vec3 v_normal;
varying vec2 v_uv;

float smax(float a, float b, float k)
{
    return log(exp(k * a) + exp(k * b)) / k;
}

void main()
{
  vec2 uv = v_uv;
  float height = uv.y;
  uv *= 10.;

  float xx = fract(uv.x);
  float yy = fract(uv.y);
  /*float xval = min(smoothstep(0.9, 1., xx), smoothstep(0., 0.1, xx));
  float yval = min(smoothstep(0.9, 1., yy), smoothstep(0., 0.1, yy));
  
  float val = max(xval, yval);

  vec3 col = val * vec3(0.3, 0.5, 0.9);

  //vec3 fade = smoothstep(0.0, 0.3, height) * vec3(0.1, 0.5, 0.7);
*/

  float barWidth = 0.05;

  float xval = max(smoothstep(1.-barWidth*2., 1.-barWidth, xx), smoothstep(barWidth, 0., xx));
  float yval =  max(smoothstep(1.-barWidth*2., 1.-barWidth, yy), smoothstep(barWidth, 0., yy));

  float val = max(xval, yval);
  val = max(xval, yval);
  vec3 primaryBarColor = val * vec3(0.505, 0.870, 0.933);

  barWidth /= 2.;
  xx += barWidth/2.;
  xval = max(smoothstep(1.-barWidth*2., 1.-barWidth, xx), smoothstep(barWidth, 0., xx));
  yval = max(smoothstep(1.-barWidth*2., 1.-barWidth, yy), smoothstep(barWidth, 0., yy));

  val = max(xval, yval);
  
  vec3 secondaryBarColor = val * vec3(0.286, 0.384, 0.592);

  vec3 col = mix(primaryBarColor, secondaryBarColor, val);

  gl_FragColor = vec4(col, 1.);
}