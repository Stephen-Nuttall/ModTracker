import './styles/modTable.css';

const ModTable = ({ modList, priorityList, onPriorityChange, onDelete }) => {
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
                    <th>Ready/Priority</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {modList.map((mod) => (
                    <tr key={mod.tablePos}>
                        <td>{mod.name}</td>
                        <td>{mod.versions.at(-1)}</td>
                        <td>
                            <select
                                key={mod.priority.name}
                                value={priorityNames.indexOf(mod.priority.name)}
                                onChange={(e) => onPriorityChange(mod.tablePos, e.target.value)}
                                className="priority-dropdown"
                            >
                                {priorityList.map((priority, index) => (
                                    <option
                                        key={priority.name}
                                        value={index}
                                    >
                                        {priority.name}
                                    </option>
                                ))}
                                <option key={"CREATE_NEW"} value={"CREATE_NEW"}>Create New Priority Level</option>
                            </select>
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
        </table>
    );
};

export default ModTable;
