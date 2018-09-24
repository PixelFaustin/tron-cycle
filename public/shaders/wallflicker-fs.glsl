#version 100
precision mediump float;

uniform float u_time;

varying vec2 v_uv;
varying vec3 v_normal;

float wnoise(vec2 p)
{
	return fract(sin(p.x * 1853. + p.y * 8021.) * 3939.);
}

float vnoise(vec2 p)
{
  vec2 cv = fract(p);
  cv = cv*cv*(3. - 2. * cv);
  vec2 cellId = floor(p);

  float bl = wnoise(cellId + vec2(0., 0.));
  float br = wnoise(cellId + vec2(1., 0.));
  float ul = wnoise(cellId + vec2(0., 1.));
  float ur = wnoise(cellId + vec2(1., 1.));

  float b = mix(bl, br, cv.x);
  float u = mix(ul, ur, cv.x);
  float v = mix(b, u, cv.y);

  return v;
}

float turbulence(vec2 p)
{
  float val = vnoise(p*10.);
  val += vnoise(p*20.)*.5;
  val += vnoise(p*40.)*.25;
  val += vnoise(p*80.)*.125;

  val /= 2.;

  return val;
}

void main()
{
  vec2 uv = v_uv;
  float height = v_uv.y + (u_time*0.);
  vec3 LIGHT_BLUE = vec3(0.741, 0.956, 0.980);
  vec3 DARKER_BLUE = LIGHT_BLUE * 0.5 + vec3(0., 0., 0.05);

  float borderWidth = 0.2;
  float borderVal = smoothstep(1. - borderWidth, 1., height);
  borderVal = max(borderVal, smoothstep(borderWidth, 0., height));

  vec3 borderCol =  (LIGHT_BLUE*1.3) * borderVal;
  
  vec3 mainCol = DARKER_BLUE;
  vec3 col = borderCol + ((1. - borderVal) * mainCol);

//  col = (1.-borderVal) * mix(col, DARKER_BLUE, turbulence(v_uv));

  gl_FragColor = vec4(col, borderVal+0.9);
}