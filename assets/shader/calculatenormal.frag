#version 330 core
layout(location = 0) out vec4 normal;
layout(location = 1) out float height;

uniform float offset;

void main() {
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
    const float delta = 0.01;
    
    // Get the position of the fragment in screen space
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 fragCoordX = vec2(fragCoord.x + delta, fragCoord.y);
    vec2 fragCoordY = vec2(fragCoord.x, fragCoord.y + delta);

    // Sample 4 points
    vec3 p0 = vec3(fragCoord, sin(offset - 0.1 * fragCoord.y));
    vec3 p1 = vec3(fragCoordX, sin(offset - 0.1 * fragCoordX.y));
    vec3 p2 = vec3(fragCoordY, sin(offset - 0.1 * fragCoordY.y));

    // Form triangles and calculate surface normals
    vec3 edge1 = p1 - p0;
    vec3 edge2 = p2 - p0;
    vec3 surfaceNormal = normalize(cross(edge1, edge2));

    // Average surface normal
    vec3 avgNormal = normalize(surfaceNormal);

    // Transform normal from [-1, 1] to RGB [0, 1]
    normal = vec4(avgNormal * 0.5 + 0.5, 1.0);

    // Output the height map
    height = p0.z * 0.5 + 0.5;
}
