import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditableText from "../widgets/EditableText";

describe("EditableText", () => {
    it("renders with default placeholder", () => {
        render(<EditableText />);
        expect(screen.getByText("Double-click to edit")).toBeInTheDocument();
    });

    it("renders with provided value", () => {
        render(<EditableText value="Test Text" />);
        expect(screen.getByText("Test Text")).toBeInTheDocument();
    });

    it("renders custom placeholder when value is empty", () => {
        render(<EditableText value="" placeholder="Custom placeholder" />);
        expect(screen.getByText("Custom placeholder")).toBeInTheDocument();
    });

    it("enters edit mode on double-click", async () => {
        render(<EditableText value="Test" />);
        const span = screen.getByRole("button");
        fireEvent.doubleClick(span);
        await waitFor(() => {
            expect(screen.getByDisplayValue("Test")).toBeInTheDocument();
        });
    });

    it("enters edit mode on Enter key", async () => {
        render(<EditableText value="Test" />);
        const span = screen.getByRole("button");
        fireEvent.keyDown(span, { key: "Enter" });
        await waitFor(() => {
            expect(screen.getByDisplayValue("Test")).toBeInTheDocument();
        });
    });

    it("enters edit mode on Space key", async () => {
        render(<EditableText value="Test" />);
        const span = screen.getByRole("button");
        fireEvent.keyDown(span, { key: " " });
        await waitFor(() => {
            expect(screen.getByDisplayValue("Test")).toBeInTheDocument();
        });
    });

    it("calls onChange when saving with modified value", async () => {
        const onChange = vi.fn();
        render(<EditableText value="Original" onChange={onChange} />);
        fireEvent.doubleClick(screen.getByRole("button"));
        const input = await screen.findByDisplayValue("Original");
        await userEvent.clear(input);
        await userEvent.type(input, "Modified");
        fireEvent.blur(input);
        expect(onChange).toHaveBeenCalledWith("Modified");
    });

    it("does not call onChange when saving unchanged value", async () => {
        const onChange = vi.fn();
        render(<EditableText value="Test" onChange={onChange} />);
        fireEvent.doubleClick(screen.getByRole("button"));
        const input = await screen.findByDisplayValue("Test");
        fireEvent.blur(input);
        expect(onChange).not.toHaveBeenCalled();
    });

    it("saves on Enter key", async () => {
        const onChange = vi.fn();
        render(<EditableText value="Original" onChange={onChange} />);
        fireEvent.doubleClick(screen.getByRole("button"));
        const input = await screen.findByDisplayValue("Original");
        await userEvent.clear(input);
        await userEvent.type(input, "Modified");
        fireEvent.keyDown(input, { key: "Enter" });
        expect(onChange).toHaveBeenCalledWith("Modified");
    });

    it("cancels on Escape key", async () => {
        const onChange = vi.fn();
        render(<EditableText value="Original" onChange={onChange} />);
        fireEvent.doubleClick(screen.getByRole("button"));
        const input = await screen.findByDisplayValue("Original");
        await userEvent.clear(input);
        await userEvent.type(input, "Modified");
        fireEvent.keyDown(input, { key: "Escape" });
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByText("Original")).toBeInTheDocument();
    });

    it("focuses and selects input on edit mode", async () => {
        render(<EditableText value="Test" />);
        fireEvent.doubleClick(screen.getByRole("button"));
        const input = await screen.findByDisplayValue("Test");
        await waitFor(() => {
            expect(input).toHaveFocus();
        });
    });

    it("updates draft on input change", async () => {
        render(<EditableText value="Original" onChange={vi.fn()} />);
        fireEvent.doubleClick(screen.getByRole("button"));
        const input = await screen.findByDisplayValue("Original");
        await userEvent.clear(input);
        await userEvent.type(input, "Updated");
        expect(input).toHaveValue("Updated");
    });

    it("syncs draft with value prop changes", async () => {
        const { rerender } = render(<EditableText value="Original" />);
        fireEvent.doubleClick(screen.getByRole("button"));
        const input = await screen.findByDisplayValue("Original");
        rerender(<EditableText value="Changed" />);
        await waitFor(() => {
            expect(input).toHaveValue("Changed");
        });
    });
});