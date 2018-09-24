precision mediump float;

attribute vec2 a_position;
attribute vec2 a_uv;

mat2 rot2D(float ang)
{
	float rads = radians(ang);
    
  return mat2(cos(rads), sin(rads), -sin(rads), cos(rads));
}


void main() 
{
  vec2 vertex_position = a_position;

  gl_Position = vec4(vertex_position, 0., 1.);
}