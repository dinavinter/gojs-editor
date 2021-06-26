import * as React from "react";
import "./Inspector.css";

function formatLocation(loc) {
    const locArr = loc.split(" ");
    if (locArr.length === 2) {
        const x = parseFloat(locArr[0]);
        const y = parseFloat(locArr[1]);
        if (!isNaN(x) && !isNaN(y)) {
            return `${x.toFixed(0)} ${y.toFixed(0)}`;
        }
    }
    return loc;
}


export function SelectionInspector({selectedData, onInputChange, onData}) {
    const selObj = selectedData;

    function InspectorRow({id, value}) {
        let val = value;

        if (id === "loc") {
            val = formatLocation(value);
        }

        function handleInputChange(e) {
            console.log('handleInputChange');
            console.log(e.type);

            selObj[id] = e.target.value;

            // onInputChange(id, e.target.value, e.type === "blur");
        }

        return (
            <tr>
                <td>{id}</td>
                <td>
                    <input
                        disabled={id === "key"}
                        defaultValue={val}
                        name={id}
                        onChange={handleInputChange}
                        onBlur={handleInputChange}
                    />
                </td>
            </tr>);
    }

    function onSubmit(e) {
        // onData(e.target.value);
        // e.preventDefault();
        console.log('onsubmit');
        console.log(selObj);
        onData(selObj);
    }

    function getDets() {
        const dets = [];
        for (const k in selObj) {
            const val = selObj[k];
            const row = (
                <InspectorRow
                    key={k}
                    id={k}
                    value={val}
                    onInputChange={onInputChange}
                />
            );
            if (k === "key") {
                dets.unshift(row); // key always at start
            } else {
                dets.push(row);
            }
        }
        return dets;
    }


    return <> {selectedData && <div id="myInspectorDiv" className="inspector">
        {/*<form  >*/}
        <table>
            <tbody>{getDets()}</tbody>
            <button onClick={onSubmit}>submit</button>

        </table>
        {/*</form>*/}

    </div>} </>;


}
 
