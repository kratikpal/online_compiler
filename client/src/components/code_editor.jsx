import React, { useState } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';

const CodeEditor = () => {
    const [code, setCode] = useState('// Write your C++ code here... \n#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}');
    const [output, setOutput] = useState('');
    const [language, setLanguage] = useState('cpp');
    const [isRunning, setIsRunning] = useState(false);
    const [inputValue, setInputValue] = useState(''); // New state for input value

    const handleEditorChange = (value) => {
        setCode(value);
    };

    const loadCode = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setCode(e.target.result);
            reader.readAsText(file);
        }
    };

    const runCode = async () => {
        setIsRunning(true);
        try {
            const response = await fetch(`http://localhost:3000/run-code/${language}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, input: inputValue }), // Include input value in the request
            });

            if (response.status === 200) {
                const result = await response.json();
                setOutput(result.output);
            } else if (response.status === 400) {
                const result = await response.json();
                setOutput(result.error);
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleLanguageChange = (event) => {
        const selectedLanguage = event.target.value;
        setLanguage(selectedLanguage);

        const commentSymbol = selectedLanguage === 'python' ? '#' : '//';
        let instruction = `${commentSymbol} Write your ${selectedLanguage} code here...`;
        switch (selectedLanguage) {
            case 'python':
                instruction += '\nprint("Hello, World!")';
                break;
            case 'java':
                instruction = `// The class name must be "user_code"\n${instruction}\npublic class user_code {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`;
                break;
            case 'javascript':
                instruction += '\nconsole.log("Hello, World!")';
                break;
            case 'cpp':
                instruction += '\n#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}';
                break;
            default:
                break;
        }
        setCode(instruction);
        setInputValue(''); // Reset input value when changing language
    };

    return (
        <div className="container-fluid" style={{ height: '100vh', display: 'flex', flexDirection: 'row' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingRight: '10px' }}>
                <div className="d-flex align-items-center mb-2" style={{ justifyContent: 'flex-end' }}>
                    <input
                        className="form-control me-2"
                        type="file"
                        id="formFile"
                        onChange={loadCode}
                        style={{ display: 'none' }}
                    />
                    <label
                        htmlFor="formFile"
                        className="btn"
                        style={{
                            backgroundColor: '#1e1e1e',
                            color: 'white',
                            padding: '5px 20px',
                            cursor: 'pointer',
                            marginRight: '8px'
                        }}
                    >
                        Choose File
                    </label>
                    <select
                        className="form-select me-2"
                        style={{ width: '150px', backgroundColor: '#1e1e1e', color: 'white', borderStyle: 'none' }}
                        value={language}
                        onChange={handleLanguageChange}
                    >
                        <option value="cpp">C++</option>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="java">Java</option>
                    </select>
                    <button
                        className="btn btn-me-2"
                        type="button"
                        onClick={runCode}
                        style={{ backgroundColor: '#1e1e1e', color: 'white' }}
                        disabled={isRunning}
                    >
                        {isRunning ? 'Running...' : 'Run'}
                    </button>
                </div>

                <MonacoEditor
                    height="600px"
                    width="100%"
                    language={language}
                    value={code}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                />
            </div>

            <div style={{
                width: '35%',
                backgroundColor: '#1e1e1e',
                color: '#ffffff',
                padding: '10px',
                height: '600px',
                marginTop: '45px',
                borderLeft: '1px solid #555',
                overflowY: 'auto'
            }}>
                <h5 style={{ color: '#66ff99' }}>Output</h5>
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{output || 'No output yet'}</pre>

                <input
                    type="text"
                    className="form-control mt-3"
                    placeholder="Input for the code..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)} // Update input state on change
                />
            </div>
        </div>
    );
};

export default CodeEditor;
