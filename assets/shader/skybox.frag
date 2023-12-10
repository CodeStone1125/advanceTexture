#version 330 core
layout(location = 0) out vec4 FragColor;

in vec3 textureCoordinate;

uniform samplerCube skybox;

void main() {
  // TODO1:
  FragColor = vec4(0);
}
