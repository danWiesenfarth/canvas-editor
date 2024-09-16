import { writable } from "svelte/store";

// Default widgets array
const initialWidgets = [{ id: 1, x: 100, y: 100, width: 100, height: 100 }];

// Store for all widgets
export const widgetsStore = writable(initialWidgets);

// Store for the selected widget index
export const selectedWidgetIndex = writable(null);

// Function to add a new widget
export function addWidget() {
  widgetsStore.update((widgets) => [
    ...widgets,
    { id: widgets.length + 1, x: 50, y: 50, width: 100, height: 100 }, // Adding a new widget
  ]);
}

// Function to update a widget's properties
export function updateWidgetProperty(index, property, value) {
  widgetsStore.update((widgets) => {
    return widgets.map((widget, i) => {
      if (i === index) {
        return { ...widget, [property]: value };
      }
      return widget;
    });
  });
}
