# NYCU CG2023 Homework 3

## Dependencies

- [glad](https://github.com/Dav1dde/glad)
- [glfw](https://github.com/glfw/glfw)
- [glm](https://github.com/g-truc/glm)
- [Dear ImGui](https://github.com/ocornut/imgui.git)
- [stb](https://github.com/nothings/stb)

The skybox texture download from https://hdri-haven.com/hdri/golf-field-pond, and converted from https://matheowis.github.io/HDRI-to-CubeMap/

The wood texture download from https://www.pngwing.com/en/search?q=wood+background

### Dependencies for Windows

Visual Studio

### Dependencies for macOS

Xcode

### Dependencies for Unix-like systems other than macOS with X11

On *Debian* and derivatives like *Ubuntu* and *Linux Mint*

`sudo apt install xorg-dev`

On *Fedora* and derivatives like *Red Hat*

`sudo dnf install libXcursor-devel libXi-devel libXinerama-devel libXrandr-devel`

On *FreeBSD*

`pkg install xorgproto`

## Build instruction

### CMake

Build in release mode
```bash=
cmake -S . -B build -D CMAKE_BUILD_TYPE=Release
cmake --build build --config Release --parallel 8
cd bin
./HW3
```

Build in debug mode
```bash=
cmake -S . -B build -D CMAKE_BUILD_TYPE=Debug
cmake --build build --config Debug --parallel 8
cd bin
./HW3
```

### Visual Studio 2019

- Open `vs2019/HW3.sln`
- Select config then build (CTRL+SHIFT+B)
- Use F5 to debug or CTRL+F5 to run.

# Reports
## Implementation(HOW & WHY)
### 1. SKYBOX
In `skybox.frag`, I completed the shader with the following function:
I retrieve the texture from the skybox and assign it to the fragment as follows:
```cpp
FragColor = texture(skybox, TexCoords);
```
and in `skybox.vert`, I completed the shader with the following function:
1. I remove the transaction matrix by convert view to mat3 format
then for further computation , I convert it to mat4 and set w axis to 1 to make
 it to Homogeneous Coordinates.

2. Use the modified mat4 view in the projection
3. set gl_Position's z-axis = 1, by set z-axis = w then Perspective Division
will compute
* gl_Position.x= pos.x/w
* gl_Position.y= pos.y/w
* gl_Position.z= w/w =1 (For infinite far skybox)
```cpp
TexCoords = aPos;

// Convert the view matrix to mat3
mat3 viewMat3 = mat3(view);
vec3 viewPos3 = viewMat3 * aPos;

// Convert the viewPos3 back to vec4
vec4 viewPos4 = vec4(viewPos3, 1.0);

// Use the modified viewPos4 in the projection
vec4 pos = projection * viewPos4;

// Set gl_Position with pos.xyww
gl_Position = pos.xyww;
```

### 2. REFRACT ＆ REFLECT
In `fresnel.frag` I implement the fountion with:
1. I calculate the View Direction and Cosine of the Angle, where `viewDir` is the normalized view direction,
and `cosTheta` is the cosine of the angle between the view direction and the surface normal.
2. I compute the Fresnel Equation using `fresnelPower`, `fresnelScale`, and `fresnelBias`, and then use `clamp` to
limit the value range to [0.0, 1.0].
3. I adjust fresnelTerm with `mix` to ensure that the adjustments to `fresnelPower`, `fresnelScale`, and `fresnelBias`
can be smoothly presented on the screen.
4. Calculate Reflection and Refraction Vectors (reflection, refraction)
5. Query Textures for Reflection and Refraction Colors
6. Interpolate Between Reflection and Refraction Colors 
7. Gamma Correction and Output 

```cpp
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
```

#### 3. NORMAL MAPPING
In `calculatenormal.frag` I implement the fountion with:
1. Defines a small value `delta` used for finite differences
2. Get the screen-space position of the fragment
3. Sample four points in screen space: original point, x-shift, y-shift, x & y coordinate-shift
4. calculate surface normals by four sample point
5. Average the surface normal and transform the normal from the range [-1, 1] to [0, 1]

```cpp
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
```
#### 4. BLINN-PHONG SHADING
In `normalmap.vert` I implement the fountion with:
1. Calculate the inverse of the tangent space transform matrix (TBN matrix)
2. Transform light direction, viewPosition, and position to the tangent space.
This part is easy just render a cube and make sure it will in right location
```cpp
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
```
and in `normalmap.frag`, I completed with the following function:
1. Query diffuse texture
2. Query normalTexture to find this fragment's normal
3. Normalize the normal vector
4. Use Blinn-Phong shading with parameters ks = kd = 0.75, shininess = 8.0
```cpp
vec3 viewDirection = normalize(fs_in.viewPosition - fs_in.position);
vec2 textureCoordinate = useParallaxMapping ? parallaxMapping(fs_in.textureCoordinate, viewDirection) : fs_in.textureCoordinate;
if (useParallaxMapping && (textureCoordinate.x > 1.0 || textureCoordinate.y > 1.0 || textureCoordinate.x < 0.0 || textureCoordinate.y < 0.0))
  discard;

// Query diffuse texture
vec3 diffuseColor = texture(diffuseTexture, textureCoordinate).rgb;
vec3 normal = texture(normalTexture, textureCoordinate).rgb * 2.0 - 1.0;

// 3. Normalize the normal vector
normal = normalize(normal);

// 4. Use Blinn-Phong shading with parameters ks = kd = 0.75, shininess = 8.0
float ambient = 0.1;
float diffuse = max(dot(normal, normalize(fs_in.lightDirection)), 0.0);
float specular = pow(max(dot(normalize(viewDirection + normalize(fs_in.lightDirection)), normal), 0.0), 8.0);

float lighting = ambient + 0.75 * diffuse + 0.75 * specular;
FragColor = vec4(lighting * diffuseColor, 1.0);
```

