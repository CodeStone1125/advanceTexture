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
amd in `skybox.vert`, I completed the shader with the following function:
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
5. 
```cpp
FragColor = texture(skybox, TexCoords);
```
### 2. Render airplane
In this section, there 4 parts:
* Body
* tail
* wing
* Airplane

#### I. Body
* Step1. First, I set length and radius to fit the specification in the "Rules"
* Step2. Render a cylinder by draw bottom circle, top circle and side of the cylinder perspective
* Step3. rotate it to make it look like airplane body and move it to location set in the "Rules"

```cpp
void renderAirplaneBody() {
  const float radius = 0.5f;
  const float height = 4.0f;
  const int segments = 64;
  const float slice = 360.0f / segments;
  glColor3f(BLUE);
  glTranslatef(0.0f, 0.0f, -2.0f);      // 根據需要進行平移
  glRotatef(90.0f, 1.0f, 0.0f, 0.0f); 
  glBegin(GL_QUAD_STRIP);

  for (int i = 0; i <= segments; i++) {
    float angle = slice * i;
    float x = radius * std::cos(ANGLE_TO_RADIAN(angle));
    float z = radius * std::sin(ANGLE_TO_RADIAN(angle));

    // Vertices on the side of the cylinder
    glVertex3f(x, 0.0f, z);
    glVertex3f(x, height, z);
  }

  glEnd();

  // Top and bottom faces
  glBegin(GL_TRIANGLE_FAN);
  glVertex3f(0.0f, 0.0f, 0.0f);  // Center of the bottom face

  for (int i = 0; i <= segments; i++) {
    float angle = slice * i;
    float x = radius * std::cos(ANGLE_TO_RADIAN(angle));
    float z = radius * std::sin(ANGLE_TO_RADIAN(angle));
    glVertex3f(x, 0.0f, z);
  }
  glEnd();

// Reverse the rendering order for the bottom face
  glBegin(GL_TRIANGLE_FAN);
  glVertex3f(0.0f, 4.0f, 0.0f);  // Center of the bottom face

  for (int i = segments; i >= 0 ; i--) {  // 改為遞增
    float angle = slice * i;
    float x = radius * std::cos(ANGLE_TO_RADIAN(angle));
    float z = radius * std::sin(ANGLE_TO_RADIAN(angle));  // 使用 std::sin
    glVertex3f(x, 4.0f, z);
  }
  glEnd();
}
```

#### II. tail
* Step1. I render tail by draw four triange, which is up, down behind, down LEFT, down right perspective
* Step2. Move it to the right place and make sure it always be.
  
  Note: In Step2, I met some troubles and they will be explained in "Tail's location goes wrong"

```cpp
void renderAirplaneTail() {
  const float bottomEdge = 2.0f;
  const float height1 = 1.0f;
  const float height2 = 0.5f;
  glColor3f(GREEN);

  glPushMatrix();  // 保存當前繪圖矩陣
  // 平移到四面體的中心
  //glTranslatef(0.0f, -2.0f, 3.0f);

    glBegin(GL_TRIANGLES);
    // up
    glVertex3f(-1.0f, 0.0f, 0.0f);
    glVertex3f(1.0f, 0.0f, 0.0f);
    glVertex3f(0.0f, 0.5f, 0.0f);

    // down behind
    glVertex3f(1.0f, 0.0f, 0.0f);
    glVertex3f(-1.0f, 0.0f, 0.0f);
    glVertex3f(0.0f, 0.0f, -1.0f);

    // down LEFT
    glVertex3f(0.0f, 0.0f, -1.0f);
    glVertex3f(0.0f, 0.5f, 0.0f);
    glVertex3f(1.0f, 0.0f, 0.0f);



    // down right
    glVertex3f(0.0f, 0.0f, -1.0f);

    glVertex3f(-1.0f, 0.0f, 0.0f);
    glVertex3f(0.0f, 0.5f, 0.0f);



    glEnd();

  glPopMatrix();  // 恢復之前保存的繪圖矩陣
}
```
#### III. wing
This part is easy just render a cube and make sure it will in right location
```cpp
void renderAirplaneWings() {
  // 設置機翼的顏色和變換
  glColor3f(RED);  // 設定顏色，例如紅色

  glPushMatrix();
  glScalef(4.0f, 0.5f, 1.0f);          // 根據需要進行縮放
  drawUnitCube();                      // 渲染長方體
  glPopMatrix();
}
```
#### IV. Airplane
In this fountion I render airplane with `renderAirplaneWings()`,  `renderAirplaneTail() ` 
and `renderAirplaneBody() `, then move the components to the right place.
```cpp
void renderAirplane() {
    // 渲染飛機的函數，包括機身、機翼和機尾
    // 渲染機身
    glPushMatrix();
    // Note: Airplane is rotated so the up direction is Y-axis not Z-axis
    glTranslatef(airplaneX, airplaneHeight, airplaneY);  // 平移至飛機底部中心，增加高度
    glRotatef(-airplaneRotationY, 0.0f, 1.0f, 0.0f);   // 根據旋轉角度旋轉飛機
    renderAirplaneBody();                             // 渲染飛機機身
    glPopMatrix();

    // 渲染左机翼
    glPushMatrix();
    glTranslatef(airplaneX, airplaneHeight, airplaneY);
    glRotatef(-airplaneRotationY, 0.0f, 1.0f, 0.0f);  // 根據旋轉角度旋轉飛機
    glRotatef(180.0f - wingSwingAngle, 0.0f, 0.0f, 1.0f); 
    renderAirplaneWings();                                
    glPopMatrix();

    // 渲染右机翼
    glPushMatrix();
    glTranslatef(airplaneX, airplaneHeight, airplaneY);
    glRotatef(-airplaneRotationY, 0.0f, 1.0f, 0.0f);  // 根據旋轉角度旋轉飛機
    glRotatef(0.0f + wingSwingAngle, 0.0f, 0.0f, 1.0f); 
    renderAirplaneWings();                                
    glPopMatrix();

  // 計算前進方向的角度
    // 渲染機尾
    glPushMatrix();
    glTranslatef((airplaneX) - (3 * cos(ANGLE_TO_RADIAN(forwardAngle))), airplaneHeight,
                 ((-3) * sin(ANGLE_TO_RADIAN(forwardAngle)) + airplaneY + 0.5));
    glRotatef(-airplaneRotationY, 0.0f, 1.0f, 0.0f);


    glRotatef(180.0f, 0.0f, 0.0f, 1.0f);
    renderAirplaneTail();
    glPopMatrix();
}
```
### 3. airplane control
In this section, there 4 parts:
* Wings swing
* fly an forward
* Airplane body rotation
* Trace location and angle
#### I.Wings swing, 
* Step1. Everytime `SPACE` be pressed, it will increase the total angle that wings need to swing.
* Step2. The direction of wing swing will change whenever it meet `20` or `-20` degree.
  Note:`flag` for decide the direction of wing Swing and it;s default to 1
```cpp
   //Everytime `SPACE` be pressed, it will increase the total angle that wings need to swing.
   case GLFW_KEY_SPACE:
      airplaneWingRotation += 80;
      flag = 1;
    break;

    //The direction of wing swing will change whenever it meet `20` or `-20` degree.
    if (wingSwingAngle == 20 || wingSwingAngle == -20) {
      flag = 1 - flag;
    }

    //slowly swing wings
    if (airplaneWingRotation > 0) {
      if (flag == 1) {
        wingSwingAngle += swingSpeed;
        airplaneWingRotation -= swingSpeed;
      } else if (flag == 0) {
        wingSwingAngle -= swingSpeed;
        airplaneWingRotation -= swingSpeed;
      }
    }
```

#### II. fly, forward and decent
* Step1. Everytime `SPACE` be pressed, it will increase the total fly height and front distance that
  airplane need to fly.
* Step2. Caculate the target location with cos(forwardAngle), sin(forwardAngle)
* Step3. slowly increase the height of airplane if needed
  Note: Airplane is rotated so the up direction is Y-axis not Z-axis
* Step4. slowly decrease the height of airplane if not rising and grounded
```cpp
    // Everytime `SPACE` be pressed, it will increase the total fly height and front distance that
      airplane need to fly.
    case GLFW_KEY_SPACE:
       // 按住空格鍵時執行飛行操作
       // 增加飛機的高度
       targetHeight += 3;
       front += 1.5;
      break;

    //Step2. Caculate the target location with cos(forwardAngle), sin(forwardAngle)
    if (front > 0) {
      forwardAngle = airplaneRotationY - 90;  // 計算前進方向的角度
      airplaneX += flySpeed * cos(ANGLE_TO_RADIAN(forwardAngle));
      airplaneY += flySpeed * sin(ANGLE_TO_RADIAN(forwardAngle));
      front -= flySpeed;
    }
    //* Step3. slowly increase the height of airplane if needed
    if (targetHeight > 0) {
      airplaneHeight += ascentSpeed;
      targetHeight -= ascentSpeed;
    }
    //* Step4. slowly decrease the height of airplane if not rising and grounded
    else if (airplaneHeight > 2) {
      airplaneHeight -= decentSpeed;
    }
```

#### III.Airplane body rotation
* Step1. Everytime `LEFT` or `RIGHT` be pressed, it will increase the total angle need to rotate.
* Step2. slowly rotate the angle of airplane if `rotationY` still remain and it will decide turn left or right
  by value of `rotationY`
```cpp
    //Everytime `LEFT` or `RIGHT` be pressed, it will increase the total angle need to rotate.
    case GLFW_KEY_LEFT:
        // 按下左箭頭鍵時執行向左轉的操作
        rotationY -= 5.0f;

        break;
    case GLFW_KEY_RIGHT:
        // 按下右箭頭鍵時執行向右轉的操作
        rotationY += 5.0f;

        break;
    //slowly rotate the angle of airplane if `rotationY` still remain 
    if (rotationY > 0) { //decide turn left or rightby value of `rotationY` 
      airplaneRotationY += rotationSpeed;
      rotationY -= rotationSpeed;
      forwardAngle = airplaneRotationY - 90;
    } else if (rotationY < 0) {
      airplaneRotationY -= rotationSpeed;
      rotationY += rotationSpeed;
      forwardAngle = airplaneRotationY - 90;
    }
```
## Problems you encountered
### 1. GFX Glitch
The first trouble I met is "GFX Glitch" which mean my render object can't present correctly
 
|GFX Glitch|
| --- |
|![279951678-f29986fe-789a-409e-9ab9-3ddec62a761f](https://github.com/CodeStone1125/renderAirplane/assets/72511296/893f40be-0923-4813-89f0-847d11850a03)| 


sol: TA suggests me to check the draw order of vertex and it work. shout out to TA.

### 2. Tail's location goes wrong
The second one is that my airplane tail will go to wrong location whenever I try to fly

|Tail is lost|
| --- | 
|![279953867-f9b63745-01e7-47e8-a434-0e0000863baf](https://github.com/CodeStone1125/renderAirplane/assets/72511296/c7b409a2-24b8-4e3d-8d99-1ef4aa3fcf1a)| 


sol: The root of problem is the order of  `glTranslatef() `, `glRotatef()`
if I rotate airplane in advance the axis of airplane would be different,
there I should `glTranslatef() ` first then `glRotatef()`.

### 3. Can't slowly raise airplane height
Originally I set airplane height increase 5 as long as `SPACE` be pressed, but I airplane will
teleport to the  "height+5" immediately instean of slow rise.

sol: The solution is in the `II. fly, forward and decent`

## Bonus
### Bullet shooting
I additionally implement a fountion to shot a bullet.

| Bullet shot |
| --- | 
| ![279957952-6a8af357-edc4-47cc-bdfd-b8e785021e4e (1)](https://github.com/CodeStone1125/renderAirplane/assets/72511296/243ab1e4-bcc8-4096-9728-e2901a585ef9)| 

* Step1. Everytime `G`  be pressed, it will record the right now location for airplane.
* Step2. base on location recorded in `Step1`, render a bullet and let it slow move forward until reach the limit distance 
```cpp
//Render bullet
void renderBullet() {
  const float radius = 0.1f;
  const float height = 0.6f;
  const int segments = 64;
  const float slice = 360.0f / segments;
  glColor3f(RED);
  glRotatef(90.0f, 1.0f, 0.0f, 0.0f);
  glBegin(GL_QUAD_STRIP);

  for (int i = 0; i <= segments; i++) {
    float angle = slice * i;
    float x = radius * std::cos(ANGLE_TO_RADIAN(angle));
    float z = radius * std::sin(ANGLE_TO_RADIAN(angle));

    // Vertices on the side of the cylinder
    glVertex3f(x, 0.0f, z);
    glVertex3f(x, height, z);
  }

  glEnd();

  // Top and bottom faces
  glBegin(GL_TRIANGLE_FAN);
  glVertex3f(0.0f, 0.0f, 0.0f);  // Center of the bottom face

  for (int i = 0; i <= segments; i++) {
    float angle = slice * i;
    float x = radius * std::cos(ANGLE_TO_RADIAN(angle));
    float z = radius * std::sin(ANGLE_TO_RADIAN(angle));
    glVertex3f(x, 0.6f, z);
  }
  glEnd();

  // Reverse the rendering order for the bottom face
  glBegin(GL_TRIANGLE_FAN);
  glVertex3f(0.0f, -0.9f, 0.0f);  // Center of the bottom face

  for (int i = segments; i >= 0; i--) {  // 改為遞增
    float angle = slice * i;
    float x = radius * std::cos(ANGLE_TO_RADIAN(angle));
    float z = radius * std::sin(ANGLE_TO_RADIAN(angle));  // 使用 std::sin
    glVertex3f(x, 0.6f, z);
  }
  glEnd();
}
// 繪製子彈的函數
void drawBullet() {
  glPushMatrix();
  glTranslatef(bulletX, bulletHeight, bulletY);
  glRotatef(-airplaneRotationY, 0.0f, 1.0f, 0.0f);
  renderBullet();
  glEnd();
  glPopMatrix();
}
// Step1. Everytime `G`  be pressed, it will record the right now location for airplane.
    case GLFW_KEY_G:
      temp += 3;
      if (bulletDist == 0) {
        bulletDist += 30;
      }
      break;
     //record the right now location for airplane. 
    if (bulletDist == 30) {
      bulletAngle = forwardAngle-180;
      bulletX = (airplaneX) - (3 * cos(ANGLE_TO_RADIAN(bulletAngle)));
      bulletY = ((-3) * sin(ANGLE_TO_RADIAN(bulletAngle)) + airplaneY + 0.5);
      bulletHeight = airplaneHeight;
      if (bulletDist == 0 && temp>0) {
        bulletDist = 30;
      }
    }
//Step2. base on location recorded in `Step1`, render a bullet and let it slow move forward until reach the limit distance 
    if (temp > 0) {
      if (bulletDist >= 0) {
        bulletX += flySpeed * cos(ANGLE_TO_RADIAN(bulletAngle));
        bulletY += flySpeed * sin(ANGLE_TO_RADIAN(bulletAngle));
        bulletDist -= 1;
      }
      drawBullet();
      if (bulletDist <= 0) {
        temp -= 1;
        bulletDist = 0;
      }
    }
```
