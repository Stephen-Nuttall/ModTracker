import React from "react"

function FilePickerButton({ onFileLoaded, acceptedFiles = ".json,application/json", className = '', buttonClassName = '' }) {
    const inputRef = React.useRef(null)
    const [error, setError] = React.useState(null)
    const [fileName, setFileName] = React.useState("")

    const handleButtonClick = () => {
        setError(null)
        inputRef.current?.click()
    }

    const handleFileChange = async (e) => {
        const file = e.target.files && e.target.files[0]
        if (!file) {
            console.log("No file selected.")
            return
        }
        setFileName(file.name)

        try {
            const text = await file.text()
            const parsed = JSON.parse(text)

            setError(null)
            if (typeof onFileLoaded === "function") {
                onFileLoaded(parsed)
            }
        } catch (err) {
            setError("Invalid JSON: " + (err.message || err))
            if (typeof onFileLoaded === "function") {
                onFileLoaded(null, err)
            }
        } finally {
            // reset input so same file can be selected again if needed
            e.target.value = ""
        }
    }

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column"
            }}
            className={className}
        >
            <button className={buttonClassName} onClick={handleButtonClick}>
                Select JSON file
            </button>

            <input
                ref={inputRef}
                type="file"
                accept={acceptedFiles}
                style={{ display: "none" }}
                onChange={handleFileChange}
                data-testid="file-input"
            />

            {fileName && <div style={{ textAlign: "center" }}>Selected: {fileName}</div>}
            {error && <div style={{ color: "red" }}>{error}</div>}
        </div>
    )
}

export default FilePickerButton