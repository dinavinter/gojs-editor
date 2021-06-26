import React from 'react';
import * as go from 'gojs';
import {ToolManager, Diagram} from 'gojs';
import {GojsDiagram, ModelChangeEventType} from 'react-gojs';
import DiagramButtons from './DiagramButtons';
import './MyDiagram.css';
import {getRandomColor} from '../Helpers/ColorHelper';
import SelectionDetails from './SelectionDetails';
import diagram from '../diagram.json'

export function initDiagram(diagramId) {
    const $ = go.GraphObject.make;
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
        allowVerticalScroll: true,
        allowZoom: true,
        allowSelect: true,
        autoScale: Diagram.Uniform,
        contentAlignment: go.Spot.LeftCenter,
        toolManager:{
             panningTool:{
                 isEnabled:true
             },
            mouseWheelBehavior: ToolManager.WheelScroll,
            UndoManager:{
                 isEnabled:true
            }
        },
        skipsUndoManager:false 
        
         

    });
    return myDiagram;
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
        this.diagramRef =React.createRef();
        this.state = {
            selectedNodeKeys: [],
            model: {
                nodeDataArray: [{key: 'Alpha', label: 'Alpha', color: 'lightblue'}],
                linkDataArray: []
            }
        };
    }

    render() {
        return [
            <DiagramButtons
                key="diagramButtons"
                onInit={this.initModelHandler}
                onUpdateColor={this.updateColorHandler}
                onAddNode={this.addNode}
                diagramRef={this.diagramRef}
            />,
            <SelectionDetails key="selectionDetails" selectedNodes={this.state.selectedNodeKeys}/>,
            <GojsDiagram
                ref={this.diagramRef}
                key="gojsDiagram"
                diagramId="myDiagramDiv"
                model={this.state.model}
                createDiagram={initDiagram}
                className="myDiagram" 
                onModelChange={this.modelChangeHandler}
            />,
            
            <textarea style={{width:'100%',height:'300px'}}>
              { this.diagramRef.current && JSON.stringify(this.diagramRef.current.model)}
            </textarea>
        ];
    }

    initModelHandler() {
        this.setState({
            ...this.state,
            model: diagram
        });
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

    

    createDiagram(diagramId ) {
        const $ = go.GraphObject.make;
        function finishDrop(e, grp) {
            var ok = (grp !== null
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
                    wrappingWidth: Infinity, alignment: go.GridLayout.Position,
                    cellSize: new go.Size(1, 1), spacing: new go.Size(4, 4)
                })
            ,
            isReadOnly: false,
            allowHorizontalScroll: true,
            allowVerticalScroll: true,
            allowZoom: false,
            allowSelect: true,
            autoScale: Diagram.Uniform,
            contentAlignment: go.Spot.LeftCenter,
            TextEdited: this.onTextEdited
        });

        myDiagram.toolManager.panningTool.isEnabled = false;
        myDiagram.toolManager.mouseWheelBehavior = ToolManager.WheelScroll;

        // myDiagram.nodeTemplate = $(
        //     go.Node,
        //     'Auto',
        //     {
        //         selectionChanged: node => this.nodeSelectionHandler(node.key, node.isSelected)
        //     },
        //     $(go.Shape, 'RoundedRectangle', { strokeWidth: 0 }, new go.Binding('fill', 'color')),
        //     $(go.TextBlock, { margin: 8, editable: true }, new go.Binding('text', 'label'))
        // );
        myDiagram.nodeTemplate =
            $(go.Node, go.Panel.Auto,
                { // dropping on a Node is the same as dropping on its containing Group, even if it's top-level
                    mouseDrop: function (e, nod) {
                        finishDrop(e, nod.containingGroup);
                    }
                },
                $(go.Shape, "Rectangle",
                    {fill: "#ACE600", stroke: "#558000", strokeWidth: 2},
                    new go.Binding("fill", "color")),
                $(go.TextBlock,
                    {
                        margin: 5,
                        editable: true,
                        font: "bold 13px sans-serif",
                        stroke: "#446700"
                    },
                    new go.Binding("text", "text").makeTwoWay())
            );


        myDiagram.groupTemplateMap.add("OfGroups",
            $(go.Group, go.Panel.Auto,
                {
                    background: "transparent",
                    // highlight when dragging into the Group
                    mouseDragEnter: function(e, grp, prev) { highlightGroup(e, grp, true); },
                    mouseDragLeave: function(e, grp, next) { highlightGroup(e, grp, false); },
                    computesBoundsAfterDrag: true,
                    // when the selection is dropped into a Group, add the selected Parts into that Group;
                    // if it fails, cancel the tool, rolling back any changes
                    mouseDrop: finishDrop,
                    handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
                    // Groups containing Groups lay out their members horizontally
                    layout:
                        $(go.GridLayout,
                            {
                                wrappingWidth: Infinity, alignment: go.GridLayout.Position,
                                cellSize: new go.Size(1, 1), spacing: new go.Size(4, 4)
                            })
                },
                new go.Binding("background", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : "transparent"; }).ofObject(),
                $(go.Shape, "Rectangle",
                    { fill: null, stroke: "#E69900", strokeWidth: 2 }),
                $(go.Panel, go.Panel.Vertical,  // title above Placeholder
                    $(go.Panel, go.Panel.Horizontal,  // button next to TextBlock
                        { stretch: go.GraphObject.Horizontal, background: "#FFDD33", margin: 1 },
                        $("SubGraphExpanderButton",
                            { alignment: go.Spot.Right, margin: 5 }),
                        $(go.TextBlock,
                            {
                                alignment: go.Spot.Left,
                                editable: true,
                                margin: 5,
                                font: "bold 18px sans-serif",
                                stroke: "#9A6600"
                            },
                            new go.Binding("text", "text").makeTwoWay())
                    ),  // end Horizontal Panel
                    $(go.Placeholder,
                        { padding: 5, alignment: go.Spot.TopLeft })
                )  // end Vertical Panel
            ));  // end Group and call to add to template Map

        
        myDiagram.groupTemplateMap.add("OfNodes",
            $(go.Group, go.Panel.Auto,
                {
                    background: "transparent",
                    ungroupable: true,
                    // highlight when dragging into the Group
                    mouseDragEnter: function(e, grp, prev) { highlightGroup(e, grp, true); },
                    mouseDragLeave: function(e, grp, next) { highlightGroup(e, grp, false); },
                    computesBoundsAfterDrag: true,
                    // when the selection is dropped into a Group, add the selected Parts into that Group;
                    // if it fails, cancel the tool, rolling back any changes
                    mouseDrop: finishDrop,
                    handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
                    // Groups containing Nodes lay out their members vertically
                    layout:
                        $(go.GridLayout,
                            {
                                wrappingColumn: 1, alignment: go.GridLayout.Position,
                                cellSize: new go.Size(1, 1), spacing: new go.Size(4, 4)
                            })
                },
                new go.Binding("background", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : "transparent"; }).ofObject(),
                $(go.Shape, "Rectangle",
                    { fill: null, stroke: "#0099CC", strokeWidth: 2 }),
                $(go.Panel, go.Panel.Vertical,  // title above Placeholder
                    $(go.Panel, go.Panel.Horizontal,  // button next to TextBlock
                        { stretch: go.GraphObject.Horizontal, background: "#33D3E5", margin: 1 },
                        $("SubGraphExpanderButton",
                            { alignment: go.Spot.Right, margin: 5 }),
                        $(go.TextBlock,
                            {
                                alignment: go.Spot.Left,
                                editable: true,
                                margin: 5,
                                font: "bold 16px sans-serif",
                                stroke: "#006080"
                            },
                            new go.Binding("text", "text").makeTwoWay())
                    ),  // end Horizontal Panel
                    $(go.Placeholder,
                        { padding: 5, alignment: go.Spot.TopLeft })
                )  // end Vertical Panel
            ));  // end Group and call to add to template Map

        return myDiagram;
    }

    modelChangeHandler(event) {
        switch (event.eventType) {
            case ModelChangeEventType.Remove:
                if (event.nodeData) {
                    this.removeNode(event.nodeData.key);
                }
                if (event.linkData) {
                    this.removeLink(event.linkData);
                }
                break;
            default:
                break;
        }
         
    }

    addNode() {
        const newNodeId = 'node' + this.nodeId;
        const linksToAdd = this.state.selectedNodeKeys.map(parent => {
            return {from: parent, to: newNodeId};
        });
        this.setState({
            ...this.state,
            model: {
                ...this.state.model,
                nodeDataArray: [
                    ...this.state.model.nodeDataArray,
                    {key: newNodeId, label: newNodeId, color: getRandomColor()}
                ],
                linkDataArray:
                    linksToAdd.length > 0
                        ? [...this.state.model.linkDataArray].concat(linksToAdd)
                        : [...this.state.model.linkDataArray]
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

    nodeSelectionHandler(nodeKey, isSelected) {
        if (isSelected) {
            this.setState({
                ...this.state,
                selectedNodeKeys: [...this.state.selectedNodeKeys, nodeKey]
            });
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
