# Online Compiler

Welcome to the Online Compiler, This application allows users to compile and run code snippets in various programming languages, including C++, Java, Python, and JavaScript. The backend leverages Docker containers to provide a secure and isolated environment for code execution.

## Features

- **Multi-language Support**: Compile and run code in C++, Java, Python, and JavaScript.
- **Dockerized Execution**: Each code snippet runs in its own Docker container, ensuring security and isolation.
- **User-friendly Interface**: Simple and intuitive web interface for users to input and execute code.
- **Real-time Output**: View the output of your code in real-time.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, React.js
- **Backend**: Node.js
- **Containerization**: Docker
- **Supported Languages**: C++, Java, Python, JavaScript

## Getting Started

### Prerequisites

- Docker installed on your machine
- Node.js and npm (if applicable)

### Demo

https://github.com/user-attachments/assets/493fd599-5ae1-455a-8f99-9a7ee41ca601


## API Endpoints

The application provides the following API endpoints for executing code in different languages. All endpoints accept a `POST` request with a JSON body.

### 1. Compile and Run C++ Code

**Endpoint**: `run-code/cpp`

**Request Body**:
```json
{
  "code": "your_cpp_code_here",
  "input": "optional_input_here"
}
```

**Response**:
- On success: `{ "output": "output_here" }`
- On error: `{ "error": "error_message_here" }`

### 2. Compile and Run Python Code

**Endpoint**: `run-code/python`

**Request Body**:
```json
{
  "code": "your_python_code_here",
  "input": "optional_input_here"
}
```

**Response**:
- On success: `{ "output": "output_here" }`
- On error: `{ "error": "error_message_here" }`

### 3. Compile and Run Java Code

**Endpoint**: `run-code/java`

**Request Body**:
```json
{
  "code": "your_java_code_here",
  "input": "optional_input_here"
}
```

**Response**:
- On success: `{ "output": "output_here" }`
- On error: `{ "error": "error_message_here" }`

### 4. Compile and Run JavaScript Code

**Endpoint**: `run-codejavascript`

**Request Body**:
```json
{
  "code": "your_javascript_code_here",
  "input": "optional_input_here"
}
```

**Response**:
- On success: `{ "output": "output_here" }`
- On error: `{ "error": "error_message_here" }`
