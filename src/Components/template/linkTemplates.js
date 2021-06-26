import * as go from "gojs";
const $ = go.GraphObject.make;
export function makePort(name, align, spot, output, input) {
    var horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
    // the port is basically just a transparent rectangle that stretches along the side of the node,
    // and becomes colored when the mouse passes over it
    return $(go.Shape,
        {
            fill: "transparent",  // changed to a color in the mouseEnter event handler
            strokeWidth: 0,  // no stroke
            width: horizontal ? NaN : 8,  // if not stretching horizontally, just 8 wide
            height: !horizontal ? NaN : 8,  // if not stretching vertically, just 8 tall
            alignment: align,  // align the port on the main Shape
            stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
            portId: name,  // declare this object to be a "port"
            fromSpot: spot,  // declare where links may connect at this port
            fromLinkable: output,  // declare whether the user may draw links from here
            toSpot: spot,  // declare where links may connect at this port
            toLinkable: input,  // declare whether the user may draw links to here
            cursor: "pointer",  // show a different cursor to indicate potential link point
            mouseEnter: function(e, port) {  // the PORT argument will be this Shape
                if (!e.diagram.isReadOnly) port.fill = "rgba(255,0,255,0.5)";
            },
            mouseLeave: function(e, port) {
                port.fill = "transparent";
            }
        });
}

export function defaultPorts(){
    return [        makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
        makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
        makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
        makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
    ];
}

export function linkTemplate (baseTemplate){
    return  $(go.Link,  // the whole link panel
        {
             
             routing: go.Link.Orthogonal ,
            curve: go.Link.JumpOver,
            corner: 5, toShortLength: 4,
            relinkableFrom: true,
            relinkableTo: true,
            reshapable: true,
            resegmentable: true,
            // mouse-overs subtly highlight links:
            mouseEnter: function(e, link) { link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
            mouseLeave: function(e, link) { link.findObject("HIGHLIGHT").stroke = "transparent"; },
            selectionAdorned: true
        },
        new go.Binding("fromPort", "fromPort").makeTwoWay(),
        new go.Binding("toPort", "toPort").makeTwoWay(),

        new go.Binding("points").makeTwoWay(),
        $(go.Shape,  // the highlight shape, normally transparent
            { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
        $(go.Shape,  // the link path shape
            { isPanelMain: true, stroke: "gray", strokeWidth: 2 },
            new go.Binding("stroke", "isSelected", function(sel) { return sel ? "dodgerblue" : "gray"; }).ofObject()),
        $(go.Shape,  // the arrowhead
            { toArrow: "standard", strokeWidth: 0, fill: "gray" }),
        $(go.Panel, "Auto",  // the link label, normally not visible
            { visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5 },
            new go.Binding("visible", "visible").makeTwoWay(),
            $(go.Shape, "RoundedRectangle",  // the label shape
                { fill: "#F8F8F8", strokeWidth: 0 }),
            $(go.TextBlock,  // the label
                {
                    editable:true,
                    textAlign: "center",
                    font: "10pt helvetica, arial, sans-serif",
                    stroke: "#333333",
                 },
                new go.Binding("text", "text").makeTwoWay(),
         )
        )
    );
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
        }
    ];
}
function textStyle() {
    return {
        font: "bold 11pt Lato, Helvetica, Arial, sans-serif",
        stroke: "#F8F8F8"
    }
}


export function nodeTemplate () {
    return   $(go.Node, "Table", nodeStyle(),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $(go.Panel, "Auto",
            $(go.Shape, "Rectangle",
                { fill: "#282c34", stroke: "#00A9C9", strokeWidth: 3.5 },
                new go.Binding("figure", "figure")),
            $(go.TextBlock, textStyle(),
                {
                    margin: 8,
                    maxSize: new go.Size(160, NaN),
                    wrap: go.TextBlock.WrapFit,
                    editable: true
                },
                new go.Binding("text").makeTwoWay())
        ),
        // four named ports, one on each side:
        makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
        makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
        makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
        makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
    );
}
export class LinkTemplate {
    constructor( ) {
     }

    // Define a function for creating a "port" that is normally transparent.
// The "name" is used as the GraphObject.portId, the "spot" is used to control how links connect
// and where the port is positioned on the node, and the boolean "output" and "input" arguments
// control whether the user can draw links from or to the port.
    makeCirclePort(name, spot, output, input) {
        // the port is basically just a small transparent circle
        return $(go.Shape, "Circle",
            {
                fill: null,  // not seen, by default; set to a translucent gray by showSmallPorts, defined below
                stroke: null,
                desiredSize: new go.Size(7, 7),
                alignment: spot,  // align the port on the main Shape
                alignmentFocus: spot,  // just inside the Shape
                portId: name,  // declare this object to be a "port"
                fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
                fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
                cursor: "pointer"  // show a different cursor to indicate potential link point
            });
    }

  

    nodeSelectionAdornmentTemplate =
        $(go.Adornment, "Auto",
            $(go.Shape, {fill: null, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2]}),
            $(go.Placeholder)
        );

    nodeResizeAdornmentTemplate =
        $(go.Adornment, "Spot",
            {locationSpot: go.Spot.Right},
            $(go.Placeholder),
            $(go.Shape, {
                alignment: go.Spot.TopLeft,
                cursor: "nw-resize",
                desiredSize: new go.Size(6, 6),
                fill: "lightblue",
                stroke: "deepskyblue"
            }),
            $(go.Shape, {
                alignment: go.Spot.Top,
                cursor: "n-resize",
                desiredSize: new go.Size(6, 6),
                fill: "lightblue",
                stroke: "deepskyblue"
            }),
            $(go.Shape, {
                alignment: go.Spot.TopRight,
                cursor: "ne-resize",
                desiredSize: new go.Size(6, 6),
                fill: "lightblue",
                stroke: "deepskyblue"
            }),

            $(go.Shape, {
                alignment: go.Spot.Left,
                cursor: "w-resize",
                desiredSize: new go.Size(6, 6),
                fill: "lightblue",
                stroke: "deepskyblue"
            }),
            $(go.Shape, {
                alignment: go.Spot.Right,
                cursor: "e-resize",
                desiredSize: new go.Size(6, 6),
                fill: "lightblue",
                stroke: "deepskyblue"
            }),

            $(go.Shape, {
                alignment: go.Spot.BottomLeft,
                cursor: "se-resize",
                desiredSize: new go.Size(6, 6),
                fill: "lightblue",
                stroke: "deepskyblue"
            }),
            $(go.Shape, {
                alignment: go.Spot.Bottom,
                cursor: "s-resize",
                desiredSize: new go.Size(6, 6),
                fill: "lightblue",
                stroke: "deepskyblue"
            }),
            $(go.Shape, {
                alignment: go.Spot.BottomRight,
                cursor: "sw-resize",
                desiredSize: new go.Size(6, 6),
                fill: "lightblue",
                stroke: "deepskyblue"
            })
        );

    nodeRotateAdornmentTemplate =
        $(go.Adornment,
            {locationSpot: go.Spot.Center, locationObjectName: "ELLIPSE"},
            $(go.Shape, "Ellipse", {
                name: "ELLIPSE",
                cursor: "pointer",
                desiredSize: new go.Size(7, 7),
                fill: "lightblue",
                stroke: "deepskyblue"
            }),
            $(go.Shape, {
                geometryString: "M3.5 7 L3.5 30",
                isGeometryPositioned: true,
                stroke: "deepskyblue",
                strokeWidth: 1.5,
                strokeDashArray: [4, 2]
            })
        );

    linkableNodeProps() { 
        const _this = this;
        return [
            
            // {locationSpot: go.Spot.Center},
            //  {selectable: true, selectionAdornmentTemplate: _this.nodeSelectionAdornmentTemplate},
            // {resizable: true, resizeObjectName: "PANEL", resizeAdornmentTemplate: this.nodeResizeAdornmentTemplate},
            // {rotatable: true, rotateAdornmentTemplate: _this.nodeRotateAdornmentTemplate},
             // the main object is a Panel that surrounds a TextBlock with a Shape
            // $(go.Panel, "Auto",
            //     {name: "PANEL"},
            //     new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
            //     $(go.Shape, "Rectangle",  // default figure
            //         {
            //             portId: "", // the default port: if no spot on link data, use closest side
            //             fromLinkable: true, toLinkable: true, cursor: "pointer",
            //             fill: "white",  // default color
            //             strokeWidth: 2
            //         },
            //         new go.Binding("figure"),
            //         new go.Binding("fill")),
            //     $(go.TextBlock,
            //         {
            //             font: "bold 11pt Helvetica, Arial, sans-serif",
            //             margin: 8,
            //             maxSize: new go.Size(160, NaN),
            //             wrap: go.TextBlock.WrapFit,
            //             editable: true
            //         },
            //         new go.Binding("text").makeTwoWay())
            // ),
            // four small named ports, one on each side:
            _this.makePort("T", go.Spot.Top, go.Spot.TopSide, true, true),
            _this.makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
            _this.makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
            _this.makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, true),
            { // handle mouse enter/leave events to show/hide the ports
                mouseEnter: function (e, node) {
                    _this.showSmallPorts(node, true);
                },
                mouseLeave: function (e, node) {
                    _this.showSmallPorts(node, false);
                }
            }

        ]
    };



      

    showSmallPorts(node, show) {
        node.ports.each(function (port) {
            if (port.portId !== "") {  // don't change the default port, which is the big shape
                port.fill = show ? "rgba(0,0,0,.3)" : null;
            }
        });
    }

    linkSelectionAdornmentTemplate =
        $(go.Adornment, "Link",
            $(go.Shape,
                // isPanelMain declares that this Shape shares the Link.geometry
                {isPanelMain: true, fill: null, stroke: "deepskyblue", strokeWidth: 0})  // use selection object's strokeWidth
        );

    linkTemplate =
        $(go.Link,  // the whole link panel
            {selectable: true, selectionAdornmentTemplate: this.linkSelectionAdornmentTemplate},
            {relinkableFrom: true, relinkableTo: true, reshapable: true},
            {
                routing: go.Link.AvoidsNodes,
                curve: go.Link.JumpOver,
                corner: 5,
                toShortLength: 4
            },
            new go.Binding("points").makeTwoWay(),
            $(go.Shape,  // the link path shape
                {isPanelMain: true, strokeWidth: 2}),
            $(go.Shape,  // the arrowhead
                {toArrow: "Standard", stroke: null}),
            $(go.Panel, "Auto",
                new go.Binding("visible", "isSelected").ofObject(),
                $(go.Shape, "RoundedRectangle",  // the link shape
                    {fill: "#F8F8F8", stroke: null}),
                $(go.TextBlock,
                    {
                        textAlign: "center",
                        font: "10pt helvetica, arial, sans-serif",
                        stroke: "#919191",
                        margin: 2,
                        minSize: new go.Size(10, NaN),
                        editable: true
                    },
                    new go.Binding("text").makeTwoWay())
            )
        );

}

