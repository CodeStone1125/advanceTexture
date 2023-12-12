#version 330 core
layout(location = 0) out vec4 FragColor;

in VS_OUT {
  vec3 position;
  vec3 lightDirection;
  vec2 textureCoordinate;
  flat vec3 viewPosition;
} fs_in;

uniform bool useParallaxMapping;
// RGB contains the color
uniform sampler2D diffuseTexture;
// RGB contains the normal
uniform sampler2D normalTexture;
// R contains the height
// TODO (Bonus-Parallax): You may need these if you want to implement parallax mapping.
uniform sampler2D heightTexture;
float depthScale = 0.01;

vec2 parallaxMapping(vec2 textureCoordinate, vec3 viewDirection)
{
  // number of depth layers
  const float minLayers = 8;
  const float maxLayers = 32;
  // TODO (Bonus-Parallax): Implement parallax occlusion mapping.
  // Hint: You need to return a new texture coordinate.
  // Note: The texture is 'height' texture, you may need a 'depth' texture, which is 1 - height.
  // The return value should be modified.
  
  // Sample the height texture to get the depth value
  float depth = texture(heightTexture, textureCoordinate).r;
  
  // Calculate the new texture coordinate using parallax mapping
  vec2 p = viewDirection.xy / viewDirection.z * (depth * depthScale);
  return textureCoordinate - p;
}

void main() {
  vec3 viewDirection = normalize(fs_in.viewPosition - fs_in.position);
  vec2 textureCoordinate = useParallaxMapping ? parallaxMapping(fs_in.textureCoordinate, viewDirection) : fs_in.textureCoordinate;
  if (useParallaxMapping && (textureCoordinate.x > 1.0 || textureCoordinate.y > 1.0 || textureCoordinate.x < 0.0 || textureCoordinate.y < 0.0))
    discard;
  
  // Query diffuse texture
  vec3 diffuseColor = texture(diffuseTexture, textureCoordinate).rgb;
  
  // TODO4: Blinn-Phong shading
  // 1. Query normalTexture to find this fragment's normal
  // 2. Convert the value from RGB [0, 1] to normal [-1, 1]
  vec3 normal = texture(normalTexture, textureCoordinate).rgb * 2.0 - 1.0;
  
  // 3. Normalize the normal vector
  normal = normalize(normal);
  
  // 4. Use Blinn-Phong shading with parameters ks = kd = 0.75, shininess = 8.0
  float ambient = 0.1;
  float diffuse = max(dot(normal, normalize(fs_in.lightDirection)), 0.0);
  float specular = pow(max(dot(normalize(viewDirection + normalize(fs_in.lightDirection)), normal), 0.0), 8.0);
  
  float lighting = ambient + 0.75 * diffuse + 0.75 * specular;
  FragColor = vec4(lighting * diffuseColor, 1.0);
}
