// src/components/CodeEditor.jsx
import React, { useState } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react'; // Ensure this matches your installation

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

    return (
        <div>
            <input type="file" onChange={loadCode} />
            <MonacoEditor
                height="400px"
                defaultLanguage="cpp" // Set language to C++
                value={code}
                onChange={handleEditorChange}
                theme="vs-dark"
            />
        </div>
    );
};

export default CodeEditor;
