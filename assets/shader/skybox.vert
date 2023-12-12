#version 330 core
layout (location = 0) in vec3 aPos;

out vec3 TexCoords;

uniform mat4 projection;
uniform mat4 view;

void main()
{
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
}  
