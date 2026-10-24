/*
 * ResizableStreamPreview, a Vencord userplugin
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import { definePluginSettings } from "@api/Settings";
import definePlugin, { makeRange, OptionType } from "@utils/types";

const settings = definePluginSettings({
    maxWidthPercent: {
        type: OptionType.SLIDER,
        description: "Largest width the stream preview can be dragged to, as % of the Discord window width",
        markers: makeRange(30, 100, 10),
        stickToMarkers: false,
        default: 95
    },
    pipSelector: {
        type: OptionType.STRING,
        description: "CSS selector for Discord's floating stream window. Only change this if Discord renames it and the handle stops showing up.",
        default: '[class*="pictureInPictureWindow"]',
        restartNeeded: true
    },
    savedWidth: {
        type: OptionType.NUMBER,
        description: "Last width you dragged the preview to (0 = Discord's default)",
        default: 0,
        hidden: true
    }
});

const MIN_WIDTH = 160;
const HANDLED = "vcRspHandled";
const SIZE_PROPS = ["width", "height", "max-width", "max-height"];

// Discord's own inline sizes, so a reset can put them back exactly
const originalSizes = new WeakMap<HTMLElement, Record<string, string>>();

let observer: MutationObserver | null = null;

function maxWidth() {
    return window.innerWidth * (settings.store.maxWidthPercent / 100);
}

function applyWidth(pip: HTMLElement, width: number) {
    const clamped = Math.max(MIN_WIDTH, Math.min(width, maxWidth()));
    if (!originalSizes.has(pip))
        originalSizes.set(pip, Object.fromEntries(SIZE_PROPS.map(p => [p, pip.style.getPropertyValue(p)])));

    // Height follows the 16:9 stream via aspect-ratio in styles.css.
    pip.style.setProperty("width", `${clamped}px`, "important");
    pip.style.setProperty("max-width", "none", "important");
    pip.style.setProperty("max-height", "none", "important");
    pip.style.setProperty("height", "auto", "important");
    pip.classList.add("vc-rsp-resized");
}

function restoreSize(pip: HTMLElement) {
    const original = originalSizes.get(pip);
    if (!original) return;
    for (const prop of SIZE_PROPS) pip.style.setProperty(prop, original[prop]);
    originalSizes.delete(pip);
    pip.classList.remove("vc-rsp-resized");
}

function resetWidth(pip: HTMLElement) {
    restoreSize(pip);
    settings.store.savedWidth = 0;
}

function addHandle(pip: HTMLElement, corner: "left" | "right") {
    const handle = document.createElement("div");
    handle.className = `vc-rsp-handle vc-rsp-handle-${corner}`;
    handle.title = "Drag to resize, double-click to reset";

    handle.addEventListener("dblclick", e => {
        e.stopPropagation();
        resetWidth(pip);
    });

    handle.addEventListener("pointerdown", e => {
        // Stop Discord from treating this as a drag of the whole window
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startWidth = pip.getBoundingClientRect().width;
        // Dragging the left handle leftwards should grow the window
        const direction = corner === "left" ? -1 : 1;

        handle.setPointerCapture(e.pointerId);
        document.body.classList.add("vc-rsp-dragging");

        const onMove = (ev: PointerEvent) => {
            applyWidth(pip, startWidth + (ev.clientX - startX) * direction);
        };
        const onUp = (ev: PointerEvent) => {
            handle.releasePointerCapture(ev.pointerId);
            handle.removeEventListener("pointermove", onMove);
            handle.removeEventListener("pointerup", onUp);
            document.body.classList.remove("vc-rsp-dragging");
            settings.store.savedWidth = Math.round(pip.getBoundingClientRect().width);
        };

        handle.addEventListener("pointermove", onMove);
        handle.addEventListener("pointerup", onUp);
    }, { capture: true });

    pip.appendChild(handle);
}

function setup(pip: HTMLElement) {
    if (pip.dataset[HANDLED]) return;
    pip.dataset[HANDLED] = "true";

    // The handles are absolutely positioned inside the preview
    if (getComputedStyle(pip).position === "static") pip.style.position = "relative";

    addHandle(pip, "left");
    addHandle(pip, "right");

    if (settings.store.savedWidth > 0) applyWidth(pip, settings.store.savedWidth);
}

function scan() {
    document.querySelectorAll<HTMLElement>(settings.store.pipSelector).forEach(pip => {
        setup(pip);
        // If Discord re-renders and writes its own width over ours, put ours back
        if (settings.store.savedWidth > 0 && pip.style.getPropertyPriority("width") !== "important")
            applyWidth(pip, settings.store.savedWidth);
    });
}

export default definePlugin({
    name: "ResizableStreamPreview",
    description: "Lets you drag the floating stream preview (shown while you browse other channels in a call) much bigger than Discord normally allows",
    authors: [{ name: "Shmaybe", id: 0n }],
    settings,

    start() {
        scan();
        // The preview is created and destroyed as you move between channels,
        // so watch for it to appear.
        observer = new MutationObserver(scan);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
    },

    stop() {
        observer?.disconnect();
        observer = null;
        document.querySelectorAll(".vc-rsp-handle").forEach(h => h.remove());
        document.querySelectorAll<HTMLElement>(settings.store.pipSelector).forEach(pip => {
            delete pip.dataset[HANDLED];
            restoreSize(pip);
        });
    }
});
