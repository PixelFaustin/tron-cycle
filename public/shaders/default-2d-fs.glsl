#version 100
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main()
{
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  gl_FragColor = vec4(uv + sin(u_time), 0., 1.);
}