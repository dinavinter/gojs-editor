import * as go from "gojs";
import {LinkTemplate} from "./linkTemplates";

function getNodeTemplate($, finishDrop) {
    return $(go.Node, go.Panel.Auto,
        { // dropping on a Node is the same as dropping on its containing Group, even if it's top-level
            mouseDrop: function (e, nod) {
                finishDrop(e, nod.containingGroup);
            },
            selectionChanged: node => this.nodeSelectionHandler(node.key, node.isSelected, node)
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
}

function ofGroupsTemplate($, highlightGroup, finishDrop, baseTemplate) {
    return $(go.Group, go.Panel.Auto,
        {
            background: "transparent",
            // highlight when dragging into the Group
            mouseDragEnter: function (e, grp, prev) {
                highlightGroup(e, grp, true);
            },
            mouseDragLeave: function (e, grp, next) {
                highlightGroup(e, grp, false);
            },
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
                    }),
            ...baseTemplate
        },
        new go.Binding("background", "isHighlighted", function (h) {
            return h ? "rgba(255,0,0,0.2)" : "transparent";
        }).ofObject(),
        $(go.Shape, "Rectangle",
            {fill: null, stroke: "#E69900", strokeWidth: 2}),
        $(go.Panel, go.Panel.Vertical,  // title above Placeholder
            $(go.Panel, go.Panel.Horizontal,  // button next to TextBlock
                {stretch: go.GraphObject.Horizontal, background: "#FFDD33", margin: 1},
                $("SubGraphExpanderButton",
                    {alignment: go.Spot.Right, margin: 5}),
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
                {padding: 5, alignment: go.Spot.TopLeft})
        )  // end Vertical Panel
    );
}

function ofNodesTemplate($, highlightGroup, finishDrop, baseTemplate) {
    const linkT= new LinkTemplate($)

    return $(go.Group, go.Panel.Spot,
        {
            background: "transparent",
            ungroupable: true,
            // highlight when dragging into the Group
            mouseDragEnter: function (e, grp, prev) {
                highlightGroup(e, grp, true);
            },
            mouseDragLeave: function (e, grp, next) {
                highlightGroup(e, grp, false);
            },
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
                    }),
            ...baseTemplate
        },
        new go.Binding("background", "isHighlighted", function (h) {
            return h ? "rgba(255,0,0,0.2)" : "transparent";
        }).ofObject(),
        $(go.Shape, "Rectangle",
            {fill: null, stroke: "#0099CC", strokeWidth: 2}),
        $(go.Panel, go.Panel.Vertical,  // title above Placeholder
            $(go.Panel, go.Panel.Horizontal,  // button next to TextBlock
                {stretch: go.GraphObject.Horizontal, background: "#33D3E5", margin: 1},
                $("SubGraphExpanderButton",
                    {alignment: go.Spot.Right, margin: 5}),
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
                {padding: 5, alignment: go.Spot.TopLeft})
        )   // end Vertical Panel
          
    );
}

export function setTemplate(myDiagram, $, finishDrop, highlightGroup, baseTemplate) {
    myDiagram.nodeTemplate =
        getNodeTemplate.call(this, $, finishDrop);
    
    myDiagram.groupTemplateMap.add("OfGroups",
        ofGroupsTemplate($, highlightGroup, finishDrop, baseTemplate));  // end Group and call to add to template Map

    myDiagram.groupTemplateMap.add("OfNodes",
        ofNodesTemplate($, highlightGroup, finishDrop, baseTemplate));

}
