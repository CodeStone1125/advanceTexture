#version 330 core
layout(location = 0) in vec3 position_in;

out vec3 textureCoordinate;

uniform mat4 view;
uniform mat4 projection;

void main() {
  textureCoordinate = position_in;
  
  // TODO1: Set gl_Position
  // Hint:
  //   1. We want the skybox infinitely far from us. So the z should be 1.0 after perspective division.
  //   2. We don't want the skybox moving when we move. So the translation in the view matrix should be removed.

  // Set the position in view space
  vec4 viewPosition = view * vec4(position_in, 1.0);
  
  // Remove translation from the view matrix
  viewPosition = mat4(mat3(view)) * viewPosition;

  // Set the final position in clip space
  gl_Position = projection * viewPosition;
}
