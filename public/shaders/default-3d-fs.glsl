#version 100
precision mediump float;

uniform vec3 u_color;

varying vec3 v_normal;
varying vec3 v_position;
varying vec2 v_uv;

float lambert(vec3 ld, vec3 n)
{
  return max(dot(ld, n), 0.0);
}

void main()
{
  vec3 normal = normalize(v_normal);
  //vec3 lightPosition = v_position + vec3(0., 100, -300);
  vec3 lightDirection = normalize(vec3(0.7, 1., 0.));

  float power = lambert(lightDirection, normal);

  vec3 color = u_color;
  vec3 col = color*power + color;

  float gamma = 1.3;
  col = pow(col, vec3(1.0 / gamma));

  gl_FragColor = vec4(col, 1.);
}