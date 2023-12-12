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

vec3 refract_custom(vec3 I, vec3 N, float eta) {
    float k = 1.0 - eta * eta * (1.0 - dot(N, I) * dot(N, I));
    vec3 R;

    if (k < 0.0) {
        R = vec3(0.0);
    } else {
        R = eta * I - (eta * dot(N, I) + sqrt(k)) * N;
    }

    return R;
}

void main() {
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
    // Refractive index of R, G, and B respectively
    vec3 Eta = vec3(1.39, 1.44, 1.47);

    // Calculate the view direction and the angle between view direction and normal
    vec3 viewDir = normalize(fs_in.viewPosition - fs_in.position);
    float cosTheta = dot(viewDir, normalize(fs_in.normal));

    // Fresnel equation
    float fresnelTerm = clamp(fresnelBias + fresnelScale * pow(1.0 - cosTheta, fresnelPower), 0.0, 1.0);


    // Use mix to interpolate between different values for each parameter
    float interpolatedFresnelBias = mix(1.0, fresnelBias, fresnelTerm);  // Adjusted to invert the bias effect
    float interpolatedFresnelScale = mix(1.0, fresnelScale, fresnelTerm);
    float interpolatedFresnelPower = mix(2.0, fresnelPower, fresnelTerm);

    // Calculate reflection vector using the reflect function
    vec3 reflection = reflect(-viewDir, normalize(fs_in.normal));

    // Query the texture for reflection color from the skybox
    vec3 reflectionColor = texture(skybox, reflection).rgb;

    // Calculate refraction vector using the custom refract function
    vec3 refraction = refract_custom(-viewDir, normalize(fs_in.normal), 1.0 / Eta.x);

    // Query the texture for refraction color from the skybox
    vec3 refractionColor = texture(skybox, refraction).rgb;

    // Use mix to interpolate between reflection and refraction based on Fresnel term and FresnelBias
    vec3 finalColor = mix(reflectionColor, refractionColor, 1.0 - fresnelTerm * fresnelBias);


    // Correcting for the inverted reflection
    finalColor = pow(finalColor, vec3(1.0/2.2));

    // Output the final color
    FragColor = vec4(finalColor, 1.0);

}
