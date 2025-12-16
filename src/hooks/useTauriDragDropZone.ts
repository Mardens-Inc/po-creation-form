import { useEffect, useState, useRef } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

export function useTauriDragDropZone(
    ref: React.RefObject<HTMLElement>,
    onFilesDropped: (paths: string[]) => void
) {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const isDragging = useRef(false);

    // Helper function to check if position is over element
    const isPositionOverElement = (x: number, y: number): boolean => {
        const element = ref.current;
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        return (
            x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom
        );
    };

    // Listen for Tauri drag-drop events
    useEffect(() => {
        const appWindow = getCurrentWebviewWindow();

        const unlisten = appWindow.onDragDropEvent((event) => {
            console.log("Tauri drag-drop event:", event.payload.type, event.payload);

            if (event.payload.type === "enter") {
                console.log("Tauri enter event - files entered window");
                isDragging.current = true;
            } else if (event.payload.type === "over") {
                // Check if dragging over our specific element
                if (event.payload.position && isDragging.current) {
                    const x = event.payload.position.x;
                    const y = event.payload.position.y;
                    const isOver = isPositionOverElement(x, y);

                    console.log("Over event - position:", { x, y }, "isOver:", isOver);

                    setIsDraggingOver(isOver);
                }
            } else if (event.payload.type === "drop") {
                isDragging.current = false;
                let isOverElement = false;

                // Check if drop position is over our element
                if (event.payload.position) {
                    const x = event.payload.position.x;
                    const y = event.payload.position.y;
                    isOverElement = isPositionOverElement(x, y);

                    console.log("Drop position:", { x, y });
                    console.log("Is over element:", isOverElement);
                }

                // Process files if dropped over our element
                if (isOverElement) {
                    console.log("Processing files:", event.payload.paths);
                    onFilesDropped(event.payload.paths);
                }

                // Reset state
                setIsDraggingOver(false);
            } else if (event.payload.type === "leave") {
                // User dragged out of window entirely
                console.log("Tauri leave event - files left window");
                isDragging.current = false;
                setIsDraggingOver(false);
            }
        });

        return () => {
            unlisten.then((fn) => fn());
        };
    }, [onFilesDropped, ref]);

    return { isDraggingOver };
}
