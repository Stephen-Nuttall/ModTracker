import './styles/modTable.css';

const ModTable = ({ modList, priorityList, onPriorityChange, onDelete, selectedVersion }) => {
    const darkTextThreshold = 219

    let priorityNames = []
    for (let i = 0; i < priorityList.length; i++) {
        priorityNames.push(priorityList[i].name)
    }

    return (
        <table className="mod-table">
            <thead>
                <tr>
                    <th>Mod Name</th>
                    <th>Latest Version</th>
                    <th>Priority</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {modList.map((mod) => (
                    <tr key={mod.tablePos}>
                        <td>{mod.name}</td>
                        <td
                            style={{
                                backgroundColor: mod.versions.includes(selectedVersion)
                                    ? 'rgb(0, 125, 0)'
                                    : '',
                                // color: mod.versions.includes(selectedVersion)
                                //     ? 'rgb(0, 0, 0)'
                                //     : ''
                            }}
                        >
                            {mod.versions.at(-1)}
                            {mod.versions.includes(selectedVersion) && <span> ✔</span>}
                        </td>
                        <td
                            style={{
                                backgroundColor: `rgb(${mod.priority.r}, ${mod.priority.g}, ${mod.priority.b})`
                            }}
                        >
                            <select
                                key={mod.priority.name}
                                value={priorityNames.indexOf(mod.priority.name)}
                                onChange={(e) => onPriorityChange(mod.tablePos, e.target.value)}
                                className="priority-dropdown"
                                style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0)',
                                    // backgroundColor: `rgb(${mod.priority.r}, ${mod.priority.g}, ${mod.priority.b})`,
                                    color: mod.priority.r >= darkTextThreshold
                                        || mod.priority.g >= darkTextThreshold
                                        || mod.priority.b >= darkTextThreshold
                                        ? 'black'
                                        : 'white',
                                    borderColor: 'rgba(0, 0, 0, 0)'
                                }}
                            >
                                {priorityList.map((priority, index) => (
                                    <option
                                        key={priority.name}
                                        value={index}
                                        style={{
                                            backgroundColor: `rgb(${priority.r}, ${priority.g}, ${priority.b})`,
                                            color: priority.r >= darkTextThreshold
                                                || priority.g >= darkTextThreshold
                                                || priority.b >= darkTextThreshold
                                                ? 'black'
                                                : 'white'
                                        }}
                                    >
                                        {priority.name}
                                    </option>
                                ))}
                                <option key={"CREATE_NEW"} value={"CREATE_NEW"}>Create New Priority Level</option>
                            </select>
                            {/* {mod.versions.includes(selectedVersion) && <span style={{ color: 'black' }}> ✔</span>} */}
                        </td>
                        <td>
                            <button
                                onClick={() => onDelete(mod.tablePos)}
                                className="delete-button"
                            >
                                X
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table >
    );
};

export default ModTable;
