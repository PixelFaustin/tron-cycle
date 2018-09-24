precision mediump float;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_uv;

varying vec2 v_uv;
varying vec3 v_normal;

void main() 
{
  v_uv = a_uv;
  v_normal = a_normal;

  gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.);
}