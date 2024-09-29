// src/components/CodeEditor.jsx
import React, { useState } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';

const CodeEditor = () => {
    const [code, setCode] = useState('// Write your C++ code here...');
    const [output, setOutput] = useState('');
    const [language, setLanguage] = useState('cpp');
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
        try {
            const response = await fetch('http://localhost:3000/run-code/cpp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            setOutput(result.output);
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        }
    };

    const handleLanguageChange = (event) => {
        setLanguage(event.target.value);
        setCode(`// Write your ${event.target.value} code here...`);
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
                    <button className="btn btn-me-2" type="button" onClick={runCode} style={{ backgroundColor: '#1e1e1e', color: 'white' }}>
                        Run
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
            </div>
        </div>


    );
};

export default CodeEditor;
