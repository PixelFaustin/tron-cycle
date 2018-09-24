precision mediump float;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_normal;

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_uv;

varying vec3 v_normal;
varying vec3 v_position;
varying vec2 v_uv;

void main() 
{
  v_normal = (u_normal * vec4(a_normal, 0.)).xyz;
  v_uv = a_uv;
  
  v_position = vec3(u_model * vec4(a_position, 1.));

  gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.);
}