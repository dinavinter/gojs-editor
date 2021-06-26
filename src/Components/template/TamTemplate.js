import * as go from "gojs";
import {defaultPorts, linkTemplate, LinkTemplate, makePort, nodeTemplate} from "./linkTemplates";


function templateGeneralProps() {
    return [
        ...binding(),
        ...defaultPorts()
    ]
}
function binding() {
    return [new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding("angle").makeTwoWay(),
        new go.Binding("background", "isHighlighted", function (h) {
            return h ? "rgba(255,0,0,0.2)" : "transparent";
        }).ofObject()
    ]
}

function nodeStyle() {
    return [
        // The Node.location comes from the "loc" property of the node data,
        // converted by the Point.parse static method.
        // If the Node.location is changed, it updates the "loc" property of the node data,
        // converting back using the Point.stringify static method.
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        {
            // the Node.location is at the center of each node
            locationSpot: go.Spot.Center
        },

        ...
            templateGeneralProps(),
        ...
            defaultPorts()
    ];
}


function getNodeTemplate($, finishDrop) {
    return $(go.Node, go.Panel.Auto,
        { // dropping on a Node is the same as dropping on its containing Group, even if it's top-level
            mouseDrop: function (e, nod) {
                finishDrop(e, nod.containingGroup);
            },
            selectionChanged: node => this.nodeSelectionHandler(node.key, node.isSelected, node)
        },

        $(go.TextBlock,
            {
                margin: 5,
                editable: true,
                font: "bold 13px sans-serif",
                stroke: "#446700"
            },
            new go.Binding("text", "text").makeTwoWay(),
        ),
        ...templateGeneralProps(),
    )

}

function ofGroupsTemplate($, highlightGroup, finishDrop, baseTemplate) {
    return $(go.Group, go.Panel.Auto,
        {
            background: "transparent",
            // Groups containing Groups lay out their members horizontally
            layout: $(go.LayeredDigraphLayout,
                {direction: 0, columnSpacing: 10}), 
            ...baseTemplate
        },

        $(go.Shape, "RoundedRectangle", // surrounds everything
            {parameter1: 10, fill: "rgba(128,128,128,0.33)"}),

        $(go.Panel, go.Panel.Vertical,  // position header above the subgraph
            {defaultAlignment: go.Spot.Left},
            $(go.Panel, go.Panel.Horizontal,  // the header
                {defaultAlignment: go.Spot.Top},
                $("SubGraphExpanderButton"),  // this Panel acts as a Button
                $(go.TextBlock,
                    {
                        alignment: go.Spot.Left,
                        editable: true,
                        margin: 5,
                        font: "Bold 12pt Sans-Serif",
                        stroke: "#black"
                    },
                    new go.Binding("text", "text").makeTwoWay(),
            )),  // end Horizontal Panel
            $(go.Placeholder,
                {padding: 5, alignment: go.Spot.TopLeft})
        ),  // end Vertical Panel
        ...templateGeneralProps(),
    );
}

function ofNodesTemplate($, highlightGroup, finishDrop, baseTemplate) {
    return $(go.Group, go.Panel.Auto,
        {
            background: "transparent",
            // Groups containing Groups lay out their members horizontally
            layout: $(go.LayeredDigraphLayout,
                {direction: 0, columnSpacing: 10}),


            ...baseTemplate
        },

        $(go.Shape, "RoundedRectangle", // surrounds everything
            {parameter1: 10, fill: "#f8f8f8"}),

        $(go.Panel, go.Panel.Vertical,  // position header above the subgraph
            {defaultAlignment: go.Spot.Left},
            $(go.Panel, go.Panel.Horizontal,  // the header
                {defaultAlignment: go.Spot.Top},
                $("SubGraphExpanderButton"),  // this Panel acts as a Button
                $(go.TextBlock,
                    {
                        alignment: go.Spot.Left,
                        editable: true,
                        margin: 5,
                        font: "Bold 12pt Sans-Serif",
                        stroke: "#9A6600"
                    },
                    new go.Binding("text", "text").makeTwoWay(),
                )),  // end Horizontal Panel
            $(go.Placeholder,
                {padding: 5, alignment: go.Spot.TopLeft})
        ),  // end Vertical Panel
        ...templateGeneralProps()
    );
        
 
    ;

}

export function setTemplate(diagram, $, finishDrop, highlightGroup, baseTemplate) {

    // diagram.nodeTemplateMap.add("",  // the default category
    //     $(go.Node, "Table", nodeStyle(),
    //         // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
    //         $(go.Panel, "Auto",
    //             $(go.Shape, "Rectangle",
    //                 { fill: "#282c34", stroke: "#00A9C9", strokeWidth: 3.5 },
    //                 new go.Binding("figure", "figure")),
    //             $(go.TextBlock, {        font: "bold 11pt Lato, Helvetica, Arial, sans-serif",
    //                     stroke: "#F8F8F8"
    //                 },
    //                 {
    //                     margin: 8,
    //                     maxSize: new go.Size(160, NaN),
    //                     wrap: go.TextBlock.WrapFit,
    //                     editable: true
    //                 },
    //                 new go.Binding("text").makeTwoWay())
    //         ),
    //         // four named ports, one on each side:
    //         makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
    //         makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
    //         makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
    //         makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
    //     ));
    diagram.nodeTemplate =
        getNodeTemplate.call(this, $, finishDrop);

    diagram.layout = $(go.LayeredDigraphLayout,
        {direction: 90, layerSpacing: 10, isRealtime: false});
  
    diagram.groupTemplateMap.add("OfGroups",
        ofGroupsTemplate($, highlightGroup, finishDrop, {
            ...baseTemplate,

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
        }));  // end Group and call to add to template Map
    //
    diagram.groupTemplateMap.add("OfNodes",
        ofNodesTemplate($, highlightGroup, finishDrop, {
            ...baseTemplate,
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
        }));
  
    diagram.linkTemplate= linkTemplate();


}
