#version 330 core
layout(location = 0) out vec4 FragColor;

in VS_OUT {
  vec3 position;
  vec3 normal;
  flat vec3 viewPosition;
} fs_in;

uniform samplerCube skybox;

uniform float fresnelBias;
uniform float fresnelScale;
uniform float fresnelPower;

void main() {
  // Refractive index of R, G, and B respectively
  vec3 Eta = vec3(1.39, 1.44, 1.47);

  // TODO2: fresnel reflection and refraction
  // Hint:
  //   1. You should query the texture for R, G, and B values respectively to create dispersion effect.
  //   2. You should use those uniform variables in the equation(1).
  // Note:
  //   1. The link 1 is not GLSL; you just check the concept.
  //   2. We use the empirical approach of fresnel equation below.
  //      clamp(fresnelBias + fresnelScale * pow(1 + dot(I, N), fresnelPower), 0.0, 1.0); (1)
  // Reference:
  //   1. Overview: https://developer.download.nvidia.com/CgTutorial/cg_tutorial_chapter07.html
  //   2. Refract : https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/refract.xhtml
  //   3. Reflect : https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/reflect.xhtml
  //   4. Clamp   : https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/clamp.xhtml
  //   5. Mix     : https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/mix.xhtml

  // Calculate the view direction and normalize it
  vec3 viewDirection = normalize(fs_in.viewPosition - fs_in.position);

  // Calculate the reflection vector
  vec3 reflection = reflect(viewDirection, normalize(fs_in.normal));

  // Simulate dispersion (chromatic aberration) by separately refracting each color channel
  vec3 refractionColor = vec3(
      refract(viewDirection, normalize(fs_in.normal), 1.0 / Eta.r).r,
      refract(viewDirection, normalize(fs_in.normal), 1.0 / Eta.g).g,
      refract(viewDirection, normalize(fs_in.normal), 1.0 / Eta.b).b
  );

  // Sample the skybox texture for reflection color
  vec3 reflectionColor = texture(skybox, reflection).rgb;

  // Calculate fresnel factor using the empirical approach
  float fresnelFactor = clamp(fresnelBias + fresnelScale * pow(1.0 + dot(viewDirection, normalize(fs_in.normal)), fresnelPower), 0.0, 1.0);

  // Mix reflection and refraction colors based on fresnel factor
  vec3 finalColor = mix(reflectionColor, refractionColor, fresnelFactor);

  // Output the final color
  FragColor = vec4(finalColor, 1.0);
}
