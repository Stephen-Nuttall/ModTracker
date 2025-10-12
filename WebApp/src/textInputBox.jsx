const TextInputBox = ({ onTextChange, placeholderText = "", length = 50 }) => {
    return (
        <input
            type='text'
            placeholder={placeholderText}
            size={length}
            onChange={(event) => {
                onTextChange(event.target.value)
            }}
        />
    )
}

export default TextInputBox