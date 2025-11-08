// Credit to Mr. GPT on this one

import { useState, useRef, useEffect } from "react";

function EditableText({ value = "", onChange = () => { }, placeholder = "Double-click to edit" }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => setDraft(value), [value]);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    function startEdit() {
        setDraft(value);
        setEditing(true);
    }

    function save() {
        if (draft !== value) onChange(draft);
        setEditing(false);
    }

    function cancel() {
        setDraft(value);
        setEditing(false);
    }

    function onKeyDown(e) {
        if (e.key === "Enter") save();
        else if (e.key === "Escape") cancel();
    }

    return (
        <>
            {editing ? (
                <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={save}
                    onKeyDown={onKeyDown}
                    aria-label="Edit text"
                />
            ) : (
                <span
                    onDoubleClick={startEdit}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") startEdit();
                    }}
                    role="button"
                    aria-label="Editable text"
                    title="Double-click to edit (or press Enter/Space)"
                >
                    {value || <span style={{ opacity: 0.6 }}>{placeholder}</span>}
                </span>
            )}
        </>
    );
}

export default EditableText