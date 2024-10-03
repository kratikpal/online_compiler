// src/App.jsx

import React from 'react';
import CodeEditor  from './components/code_editor';
import Navbar from './components/Navbar';
const App = () => {
    return (
        <>
        <div className='conatiner ' style={{backgroundColor:'black'}}>
        <div>
         <Navbar/>
         </div>
        <div>
            <CodeEditor/>
        
        </div>
        </div>
        </>
    );
};

export default App;
