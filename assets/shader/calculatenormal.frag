#version 330 core
layout(location = 0) out vec4 normal;
layout(location = 1) out float height;

uniform float offset;

void main() {
  const float delta = 0.01;
  // TODO3: Generate the normal map.
  //   1. Get the position of the fragment. (screen space)
  //   2. Sample 4 points from combination of x +- delta, y +- delta
  //   3. Form at least 2 triangles from those points. Calculate their surface normal
  //   4. Average the surface normal, then tranform the normal [-1, 1] to RGB [0, 1]
  //   5. (Bonus) Output the H(x, y)
  // Note:
  //   1. Height at (x, y) = H(x, y) = sin(offset - 0.1 * y)
  //   2. A simple tranform from [-1, 1] to [0, 1] is f(x) = x * 0.5 + 0.5
  //   3. For sample points, z = H(x +- delta, y +- delta)

  normal = vec4(0);
  height = 0.5;
}
