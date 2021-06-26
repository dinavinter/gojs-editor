import React, {createRef, forwardRef, useCallback, useEffect, useRef, useState} from 'react';
import * as go from 'gojs';
import {ToolManager, Diagram} from 'gojs';
import {GojsDiagram, ModelChangeEventType} from 'react-gojs';
import DiagramButtons from './DiagramButtons';
import './MyDiagram.css';
import {getRandomColor} from '../Helpers/ColorHelper';
import SelectionDetails from './SelectionDetails';
import diagram from '../diagram.json'
import {SelectionInspector} from "./Inspector";
import {setTemplate} from "./template/TamTemplate";


const OfGroups = {isGroup: true, category: 'OfGroups', next: OfNodes};
const OfNodes = {isGroup: true, category: 'OfNodes', next: Node};
const Node = {category: 'Node'};

const nodesTemplate = {
    OfGroups, OfNodes, Node
}

function createPalette(myDiagram) {
    const $ = go.GraphObject.make;

    const myPalette =
        $(go.Palette, "myPaletteDiv",
            {
                nodeTemplate: myDiagram.nodeTemplate,
                groupTemplateMap: myDiagram.groupTemplateMap,
                contentAlignment: go.Spot.LeftSide,
                layout:
                    $(go.GridLayout,
                        {wrappingColumn: Infinity, cellSize: new go.Size(2, 2), alignment: go.GridLayout.Reverse}),


            });

    // now add the initial contents of the Palette
    myPalette.model.nodeDataArray = [{isGroup: true, category: 'OfGroups', text: 'top-group'}, {
        isGroup: true,
        category: 'OfNodes',
        text: 'node-group'
    }, {category: 'Node', text: 'node'}];
}


export function GoDiagram() {
    const [model, setModel] = useState({toJson: () => 'use init diagram'});
    const [selected, setSelected] = useState();
    const diagramRef = createRef();
    // const setDivRef = useRefWithCallback(
    //     node => console.log(node),
    //     node => console.log(node)
    // );

    useEffect(() => {
        document.getElementById('model-json').value = model;

    }, [model]);

    function loadModelFromJson(modelText) {
        const model = go.GraphLinksModel.fromJson(modelText);
        model.linkFromPortIdProperty = "fromPort";  // necessary to remember portIds
        model.linkToPortIdProperty = "toPort";

        diagramRef.current.onLoadModel(model);

    }

    return <div className={'wrapper'}>
        <header className="header">
            <DiagramButtons
                key="diagramButtons"
                onInit={() => diagramRef.current.initModelHandler()}
                onAddNode={(n) => diagramRef.current.addNode(n)}
                diagram={() => diagramRef.current.getDiagram()}
                loadModel={loadModelFromJson}
                model={model}

            />

            <div id="myPaletteDiv"
                 style={{'background-color': 'whitesmoke', border: 'solid 1px black', height: '5rem'}}/>

        </header>


        <article className={"main"}>
            <MyDiagram onModelChanged={setModel} onSelected={setSelected} ref={diagramRef}/>

        </article>
        <aside className="aside aside-2">
            <SelectionInspector
                // style={{display: 'inline-block', 'horizontal-align': 'left', padding: '2px', width:'500px',   'z-index': 2}}
                selectedData={selected} onData={d => diagramRef.current.updateNode(d)}
                onInputChange={(id, value, isBlur) => diagramRef.current.updateNode(id, value, isBlur)}/>
            < div id={'myInspector'}></div>
        </aside>
        <footer className="footer">
            <button onClick={e => loadModelFromJson(document.getElementById('model-json').value)}>
                Apply
            </button>
            <textarea id={'model-json'} style={{width: '100%', height: '100px'}} defaultValue={model}/>
            {/*style={{width: '100%', height: '300px'}}*/}
        </footer>

    </div>

}

const defaultModel = {
    "class": "go.GraphLinksModel",
    linkFromPortIdProperty: 'fromPort',
    linkToPortIdProperty: 'toPort',

    nodeDataArray: [],
    linkDataArray: [],

}

function createInspector(myDiagram) {
    const $ = go.GraphObject.make;


}

class MyDiagram extends React.Component {
    nodeId = 0;

    constructor(props) {
        super(props);
        this.createDiagram = this.createDiagram.bind(this);
        this.modelChangeHandler = this.modelChangeHandler.bind(this);
        this.initModelHandler = this.initModelHandler.bind(this);
        this.updateColorHandler = this.updateColorHandler.bind(this);
        this.nodeSelectionHandler = this.nodeSelectionHandler.bind(this);
        this.removeNode = this.removeNode.bind(this);
        this.removeLink = this.removeLink.bind(this);
        this.addNode = this.addNode.bind(this);
        this.updateNodeText = this.updateNodeText.bind(this);
        this.onTextEdited = this.onTextEdited.bind(this);
        this.diagram = this.diagram.bind(this);
        this.updateNode = this.updateNode.bind(this);
        this.onLoadModel = this.onLoadModel.bind(this);
        this.getDiagram = this.getDiagram.bind(this);
        this.diagramRef = React.createRef();
        this.state = {
            diagram: {},
            selectedNodeKeys: [],
            selected: {},
            model: go.GraphLinksModel.fromJson({
                ...defaultModel,
                nodeDataArray: [{key: 'Alpha', text: 'Alpha', category: 'ofNodes'}, {
                    key: 'Beta',
                    text: 'Beta',
                    category: 'ofNodes'
                }],
                linkDataArray: [{from: 'Alpha', to: 'Beta', fromPort: 'T', toPort: 'R'}],

            }),
            jsModel: {}
        };
    }


    render() {
        return [
            // <SelectionDetails key="selectionDetails" selectedNodes={this.state.selectedNodeKeys}/>,

            <>{this.diagram()}</>

        ];
    }

    diagram() {
        return <GojsDiagram

            ref={this.diagramRef}
            key="gojsDiagram"
            diagramId="myDiagramDiv"
            model={this.state.model}

            createDiagram={this.createDiagram}
            className="myDiagram"
            onModelChange={this.modelChangeHandler}
        />
    }

    updateNode(data) { 
        
        this.setState(state => {
            const newState = {
                ...state,
                model: {
                    ...defaultModel,
                    linkDataArray:state.model.linkDataArray,
                    nodeDataArray: state.model.nodeDataArray
                        .filter(node => node.key !== data.key)
                        .concat(data)
                }
            };
            console.log('newState');
            console.log(newState);
            return newState;
        });
    }

    getDiagram() {
        return this.state.diagram;
    }

    onGetModel() {
        return this.state.model;
    }

    onLoadModel(data) {
        this.setState(state => {
            return {
                ...state,
                model: {
                    ...defaultModel,
                    ...state.model,
                    nodeDataArray: data.nodeDataArray || [],
                    linkDataArray: data.linkDataArray || []
                }
            }
        });

    }

    initModelHandler() {
        return this.onLoadModel(go.Model.fromJson({
            "class": "GraphLinksModel",
            "linkFromPortIdProperty": "fromPort",
            "linkToPortIdProperty": "toPort",
            "nodeDataArray": [
                {"key": -1, "category": "Start", "loc": "175 0", "text": "Start"},
                {"key": 5, "loc": "190 114", "text": "Finely chop 1/2 cup of your choice of nuts"},
                {"text": "Step", "key": -2, "loc": "-39.5 157"}
            ],
            "linkDataArray": [
                {
                    "from": -1,
                    "to": 5,
                    "fromPort": "B",
                    "toPort": "T",
                    "points": [175, 36.75, 175, 46.75, 175, 62.05, 190, 62.05, 190, 77.35, 190, 87.35]
                },
                {
                    "from": 5,
                    "to": -2,
                    "fromPort": "L",
                    "toPort": "T",
                    "points": [103.75, 114, 93.75, 114, -39.5, 114, -39.5, 121.4, -39.5, 128.8, -39.5, 138.8]
                }
            ]
        }));

    }

    updateColorHandler() {
        const updatedNodes = this.state.model.nodeDataArray.map(node => {
            return {
                ...node,
                color: getRandomColor()
            };
        });

        this.setState({
            ...this.state,
            model: {
                ...this.state.model,
                nodeDataArray: updatedNodes
            }
        });
    }


    createDiagram(diagramId) {
        const baseTemplate = {
            selectionChanged: node => this.nodeSelectionHandler(node.key, node.isSelected, node)

        }
        const $ = go.GraphObject.make;

        function finishDrop(e, grp) {
            console.log(e.targetObject);
            console.log(e.targetElement);
            var ok = (grp !== null && grp
                ? grp.addMembers(grp.diagram.selection, true)
                : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
            if (!ok) e.diagram.currentTool.doCancel();

        }

        function highlightGroup(e, grp, show) {
            if (!grp) return;
            e.handled = true;
            if (show) {
                // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
                // instead depend on the DraggingTool.draggedParts or .copiedParts
                var tool = grp.diagram.toolManager.draggingTool;
                var map = tool.draggedParts || tool.copiedParts;  // this is a Map
                // now we can check to see if the Group will accept membership of the dragged Parts
                if (grp.canAddMembers(map.toKeySet())) {
                    grp.isHighlighted = true;
                    return;
                }
            }
            grp.isHighlighted = false;
        }

        const myDiagram = $(go.Diagram, diagramId, {
            initialContentAlignment: go.Spot.LeftCenter,
            layout: $(go.GridLayout,
                {
                    alignment: go.GridLayout.Position,
                    cellSize: new go.Size(1, 1), spacing: new go.Size(4, 4)
                })
            ,
            isReadOnly: false,
            allowHorizontalScroll: true,
            allowVerticalScroll: false,
            allowZoom: true,
            allowSelect: true,
            autoScale: Diagram.Uniform,
            contentAlignment: go.Spot.LeftCenter,

            mouseDrop: finishDrop,
            "LinkDrawn": showLinkLabel,  // this DiagramEvent listener is defined below
            "LinkRelinked": showLinkLabel,

            "draggingTool.dragsLink": true,
            "draggingTool.isGridSnapEnabled": true,
            "linkingTool.isUnconnectedLinkValid": true,
            "linkingTool.portGravity": 20,
            "relinkingTool.isUnconnectedLinkValid": true,
            "relinkingTool.portGravity": 20,
            "relinkingTool.fromHandleArchetype":
                $(go.Shape, "Diamond", {
                    segmentIndex: 0,
                    cursor: "pointer",
                    desiredSize: new go.Size(8, 8),
                    fill: "tomato",
                    stroke: "darkred"
                }),
            "relinkingTool.toHandleArchetype":
                $(go.Shape, "Diamond", {
                    segmentIndex: -1,
                    cursor: "pointer",
                    desiredSize: new go.Size(8, 8),
                    fill: "darkred",
                    stroke: "tomato"
                }),
            "linkReshapingTool.handleArchetype":
                $(go.Shape, "Diamond", {desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue"}),
            // TextEdited: this.onTextEdited
        });
        myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
        myDiagram.toolManager.linkingTool.archetypeLinkData = {}
        myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;
        myDiagram.toolManager.panningTool.isEnabled = true;
        myDiagram.undoManager.isEnabled = true;
        myDiagram.toolManager.mouseWheelBehavior = ToolManager.WheelZoom;
        myDiagram.addModelChangedListener(e => {
            // console.log(myDiagram.model.toJson());
            this.props.onModelChanged(myDiagram.model.toJson())
        });


        setTemplate.call(this, myDiagram, $, finishDrop, highlightGroup, baseTemplate);
        createPalette(myDiagram);
        createInspector(myDiagram);
        // myDiagram.addDiagramListener('ChangedSelection',(e) => {
        //     const inspectedObject = this.state.diagram.selection.first();
        //     if(inspectedObject)
        //     this.nodeSelectionHandler(inspectedObject.key, true, inspectedObject);
        // });
        this.setState({
            ...this.state,
            diagram: myDiagram
        });


        return myDiagram;

        function showLinkLabel(e) {
            var label = e.subject.findObject("LABEL");
            if (label !== null && label.text) label.visible = true;
        }
    }


    modelChangeHandler(event) {

        // switch (event.eventType) {
        //     case ModelChangeEventType.Remove:
        //         if (event.nodeData) {
        //             this.removeNode(event.nodeData.key);
        //         }
        //         if (event.linkData) {
        //             this.removeLink(event.linkData);
        //         }
        //         break;
        //     default:
        //         break;
        // }
        console.log(event);

    }

    addNode() {
        const newNodeId = 'node' + this.nodeId;
        const groupAssociation = (this.state.selected && {group: this.state.selected.key, ...nodesTemplate[this.state.selected.category || 'Node'].next}) || {}
        this.setState({
            ...this.state,
            model: {
                ...this.state.model,
                nodeDataArray: [
                    ...this.state.model.nodeDataArray,
                    {key: newNodeId, text: newNodeId, group: this.state.selected?.key, ...groupAssociation}
                ]
            }
        });
        this.nodeId += 1;
    }

    removeNode(nodeKey) {
        const nodeToRemoveIndex = this.state.model.nodeDataArray.findIndex(node => node.key === nodeKey);
        if (nodeToRemoveIndex === -1) {
            return;
        }
        this.setState({
            ...this.state,
            model: {
                ...this.state.model,
                nodeDataArray: [
                    ...this.state.model.nodeDataArray.slice(0, nodeToRemoveIndex),
                    ...this.state.model.nodeDataArray.slice(nodeToRemoveIndex + 1)
                ]
            }
        });
    }

    removeLink(linKToRemove) {
        const linkToRemoveIndex = this.state.model.linkDataArray.findIndex(
            link => link.from === linKToRemove.from && link.to === linKToRemove.to
        );
        if (linkToRemoveIndex === -1) {
            return;
        }
        return {
            ...this.state,
            model: {
                ...this.state.model,
                linkDataArray: [
                    ...this.state.model.linkDataArray.slice(0, linkToRemoveIndex),
                    ...this.state.model.linkDataArray.slice(linkToRemoveIndex + 1)
                ]
            }
        };
    }

    updateNodeText(nodeKey, text) {
        const nodeToUpdateIndex = this.state.model.nodeDataArray.findIndex(node => node.key === nodeKey);
        if (nodeToUpdateIndex === -1) {
            return;
        }
        this.setState({
            ...this.state,
            model: {
                ...this.state.model,
                nodeDataArray: [
                    ...this.state.model.nodeDataArray.slice(0, nodeToUpdateIndex),
                    {
                        ...this.state.model.nodeDataArray[nodeToUpdateIndex],
                        label: text
                    },
                    ...this.state.model.nodeDataArray.slice(nodeToUpdateIndex + 1)
                ]
            }
        });
    }

    nodeSelectionHandler(nodeKey, isSelected, node) {
        console.log('selected')
        console.log(node)
        this.props.onSelected(node.data);

        if (isSelected) {
            this.setState({
                ...this.state,
                selectedNodeKeys: [...this.state.selectedNodeKeys, nodeKey],
                selected: node.data,
                selectedType:node.type
            });

            // const nodeToUpdateIndex = this.state.model.nodeDataArray.findIndex(node => node.key === nodeKey);
            // const selectedNode= this.state.model.nodeDataArray[nodeToUpdateIndex];

        } else {
            const nodeIndexToRemove = this.state.selectedNodeKeys.findIndex(key => key === nodeKey);
            if (nodeIndexToRemove === -1) {
                return;
            }
            this.setState({
                ...this.state,
                selectedNodeKeys: [
                    ...this.state.selectedNodeKeys.slice(0, nodeIndexToRemove),
                    ...this.state.selectedNodeKeys.slice(nodeIndexToRemove + 1)
                ]
            });
        }


    }

    onTextEdited(e) {
        const tb = e.subject;
        if (tb === null) {
            return;
        }
        const node = tb.part;
        if (node instanceof go.Node) {
            this.updateNodeText(node.key, tb.text);
        }
    }
}

export default MyDiagram;
