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
                    <th className='name-column'>Mod Name</th>
                    <th className='version-column'>Latest Version</th>
                    <th className='priority-column'>Priority</th>
                    <th className='delete-column'></th>
                </tr>
            </thead>
            <tbody>
                {modList.map((mod) => (
                    <tr key={mod.tablePos}>
                        <td className='name-column'>{mod.name}</td>
                        <td
                            className='version-column'
                            style={{
                                backgroundColor: mod.versions.includes(selectedVersion)
                                    ? 'rgb(0, 125, 0)'
                                    : '',
                            }}
                        >
                            {mod.versions.at(-1)}
                            {mod.versions.includes(selectedVersion) && <span> ✔</span>}
                        </td>
                        <td
                            className='priority-column'
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
                                    color: mod.priority.r >= darkTextThreshold
                                        || mod.priority.g >= darkTextThreshold
                                        || mod.priority.b >= darkTextThreshold
                                        ? 'black'
                                        : 'white'
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
                        </td>
                        <td className='delete-column'>
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
