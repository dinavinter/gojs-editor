import React, {useEffect, useState} from 'react';
import './DiagramButtons.css';
import * as go from 'gojs';

const DiagramButton = ({onInit, onUpdateColor, onAddNode, diagramRef, model, loadModel, diagram}) => {
    const [href, setHref] = useState('');
    const [imgHref, setImgHref] = useState('');

    function handleFileSelect(evt) {
        const file = evt.target.files[0];
        // document.getElementById("mySavedModel").download = fileName;

        const reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                // Render thumbnail.
                console.log('load model');
                console.log(e.target.result);
                const model=go.Model.fromJson(e.target.result);
                model.undoManager.isEnabled = true;
                loadModel(model);
            };
        })(file);

        reader.readAsText(file);
    }

    useEffect(() => {
        function modelHref(model) {
            return window.URL.createObjectURL(new Blob([model], {type: "text/plain"}));
        }

        setHref(modelHref(model));
    }, [model])   ;
    
    // useEffect(() => {
    //     function imgHref(model) {
    //         diagram.makeImage().
    //         return window.URL.createObjectURL(new Blob([model], {type: "text/plain"}));
    //     }
    //
    //     setHref(modelHref(model));
    // }, [model])

   

    function downloadAsImage() {
        const blob = diagram().makeImageData({ background: "white", returnType: "blob", callback: myCallback });
        function myCallback(blob) {
            const url = window.URL.createObjectURL(blob);
            const filename = "diagram.png";

            const a = document.createElement("a");
            a.style = "display: none";
            a.href = url;
            a.download = filename;

            // IE 11
            if (window.navigator.msSaveBlob !== undefined) {
                window.navigator.msSaveBlob(blob, filename);
                return;
            }

            document.body.appendChild(a);
            requestAnimationFrame(function() {
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            });
        }
    }
    return (
        <nav id="navTop" className="w-full z-30 top-0 text-white bg-nwoods-primary">
            <div
                className="w-full container max-w-screen-lg mx-auto flex flex-wrap sm:flex-nowrap items-center justify-between mt-0 py-2">
                <div className="md:pl-4">
                    <a className="text-white hover:text-white no-underline hover:no-underline
        font-bold text-2xl lg:text-4xl rounded-lg hover:bg-nwoods-secondary " href="../">
                        <h1 className="mb-0 p-1 ">GoJS</h1>
                    </a>
                </div>
                <div id="topnavList" className="hidden sm:block items-center w-auto mt-0 text-white p-0 z-20">
                    <ul className="list-reset list-none font-semibold flex justify-end flex-wrap sm:flex-nowrap items-center px-0 pb-0">

                        <li className="p-1 sm:p-0">
                            <button type="button" onClick={onInit}>
                                Init diagram
                            </button>
                        </li>
                        <li className="p-1 sm:p-0">
                            <div className="inline-element" onClick={onAddNode}>
                                <button type="button">Add Node</button>
                            </div>
                        </li>

                        <li className="p-1 sm:p-0"><input id="upload" type="file" onChange={handleFileSelect}/></li>

                        <li className="p-1 sm:p-0"><a id="save" className="topnav-link" href={href}
                                                      target="_blank" rel="noopener noreferrer" 
                                                      download="data.json">Save</a></li>
                        
                        {/*<li className="p-1 sm:p-0"><a id="save-img" className="topnav-link" href={href}*/}
                        {/*                              target="_blank" rel="noopener noreferrer" */}
                        {/*                              download="data.json">Save As Image</a></li>*/}
                        <li className="p-1 sm:p-0"> <div className="inline-element" >
                            <button type="button" onClick={downloadAsImage}>Save As Image</button></div> </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default DiagramButton;
