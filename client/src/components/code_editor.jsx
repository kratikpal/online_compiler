// src/components/CodeEditor.jsx
import React, { useState } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';

const CodeEditor = () => {
    const [code, setCode] = useState('// Write your C++ code here...');

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
            const response = await fetch('http://localhost:3000/run-code', {
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
            console.log('Result:', result);
            // Handle the result here (e.g., display it in the UI)
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <center>
                <button onClick={runCode}>Run</button>
            </center>
            <input type="file" onChange={loadCode} />
            <MonacoEditor
                height="calc(100vh - 20px)"
                width="calc(100vw - 20px)"
                defaultLanguage="cpp"
                value={code}
                onChange={handleEditorChange}
                theme="vs-dark"
            />
        </div>
    );
};

export default CodeEditor;
