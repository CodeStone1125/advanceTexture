#version 330 core
layout(location = 0) in vec3 position_in;
layout(location = 1) in vec3 normal_in;
layout(location = 2) in vec2 textureCoordinate_in;
layout(location = 3) in vec3 tangent_in;
layout(location = 4) in vec3 bitangent_in;

out VS_OUT {
  vec3 position;
  vec3 lightDirection;
  vec2 textureCoordinate;
  flat vec3 viewPosition;
} vs_out;

uniform bool useDisplacementMapping;
// TODO (Bonus-Displacement): You may need these if you want to implement displacement mapping.
uniform sampler2D heightTexture;
float depthScale = 0.01;

layout (std140) uniform model {
  // Model matrix
  mat4 modelMatrix;
  // inverse(transpose(model)), precalculate using CPU for efficiency
  mat4 normalMatrix;
};

layout (std140) uniform camera {
  // Projection * View matrix
  mat4 viewProjectionMatrix;
  // Position of the camera
  vec4 viewPosition;
};

void main() {
  // Direction of light, hard coded here for convenience.
  const vec3 lightDirection = normalize(vec3(-11.1, -24.9, 14.8));
  // TODO4:
  // 1. Calculate the inverse of the tangent space transform matrix (TBN matrix)
  mat3 TBNMatrix = mat3(tangent_in, bitangent_in, normal_in);
  mat3 invTBNMatrix = inverse(transpose(TBNMatrix));
  
  // 2. Transform light direction, viewPosition, and position to the tangent space.
  vs_out.lightDirection = normalize(invTBNMatrix * lightDirection);
  vs_out.viewPosition = vec3(viewPosition);
  vs_out.position = vec3(modelMatrix * vec4(position_in, 1.0));
  
  vs_out.textureCoordinate = textureCoordinate_in;
  vec3 displacementVector = vec3(0);
  if (useDisplacementMapping) {
    // TODO (Bonus-Displacement): Set displacementVector, you should scale the height query from heightTexture by depthScale.
    float height = texture(heightTexture, textureCoordinate_in).r;
    displacementVector = normalize(normal_in) * height * depthScale;
  }
  
  gl_Position = viewProjectionMatrix * vec4(vs_out.position + displacementVector, 1.0);
}
