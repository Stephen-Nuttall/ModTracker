const TextInputBox = ({ onTextChange, onPressEnter = () => { }, placeholderText = "", length = 50, className }) => {
    function onKeyDown(e) {
        if (e.key === "Enter") { }
    }

    return (
        <input
            type='text'
            className={className}
            placeholder={placeholderText}
            size={length}
            onChange={(event) => {
                onTextChange(event.target.value)
            }}
            onKeyDown={onKeyDown}
        />
    )
}

export default TextInputBox