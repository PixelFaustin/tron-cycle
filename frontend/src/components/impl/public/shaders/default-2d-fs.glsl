#version 100
precision mediump float;

uniform vec2 u_resolution;

uniform sampler2D u_texture0;
uniform vec2 u_panningSpeed;
uniform float u_time;
uniform float u_angle;

varying vec2 v_uv;

mat2 rot2D(float ang)
{
	float rads = radians(ang);
    
  return mat2(cos(rads), sin(rads), -sin(rads), cos(rads));
}

void main()
{
  vec2 uv = v_uv;
  uv += u_time * u_panningSpeed;

  gl_FragColor = texture2D(u_texture0, uv);
}