# Notebook API

This is the documentation of [methods](#methods) on the object returned by [`embed`](./LibraryInterface.md) to control a notebook from JS code. Each method takes a JS object with *parameters* and returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) resolving to a *response* object. Parameters with a default value (specified as "= `...`") are optional. In case of an error, the returned promise is rejected with a standard [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) object with a `message` property; the potential error messages are listed for each command.

The API also exposes some [events](#events) that can be subscribed to using the API method `addEventListener(eventName, callback)`. The `callback` will receive a JS object with the specified *fields* as its single argument. Event listeners can be removed with `removeEventListener(eventName, callback)`. Some events are marked as *singular*, which means that they will usually fire exactly once, and an event listener added after they have already fired will still be executed (right away).

Some methods and events marked with "[INTERNAL]" are **internal** and not part of the official API. **Do not rely on internal methods or events in production code.** They might be changed or disappear at any time.


## <a id="methods"></a> Methods

### Cell insertion

#### insertCellAtCursor

Creates a new cell at the cursor position. If the cursor is within a cell, the new cell is created after that cell. If one or more cells (cell brackets) are selected, the cell is created before the first selected cell.

The cursor is placed at the end of the new cell.

+ Parameters

    + `style` = `"Input"` (optional, `string`) ... Style of the new cell.
    + `content` = `""` (optional, `string`) ... Textual content to populate the new cell with.

+ Response

    + `cellId` (`string`) ... The ID of the created cell. That ID can be used in subsequent API calls.

+ Errors

    + `"InsufficientPermissions"`

Example request:

    {
        "api": "notebook",
        "version": 1,
        "rid": "1",
        "command": "createCell"
    }

Example response:

    {
        "rid": "1",
        "success": true,
        "cellId": "1"
    }

#### insertCellBefore

Creates a new cell before another given cell.

The cursor is placed at the end of the new cell.

+ Parameters

    + `style` = `"Input"` (optional, `string`) ... Style of the new cell.
    + `cellId` = `null` (optional, `?string`) ... ID of the successor of the new cell. If set to `null` (the default), the cell is inserted at the end of the notebook.
    + `content` = `""` (optional, `string`) ... Textual content to populate the new cell with.

+ Response

    + `cellId` (`string`) ... The ID of the created cell. That ID can be used in subsequent API calls.

+ Errors

    + `"CellNotFound"` ... The cell ID given by `cellId` was not found.
    + `"InsufficientPermissions"`

### Cell content

#### setCellContent

Sets the content of a cell.

+ Parameters

    + `cellId` (`string`) ... ID of the cell to modify.
    + `content` (`string`) ... New textual content of the cell.

#### getCellContent

Gets the content of a cell.

+ Parameters

    + `cellId` (`string`) ... ID of the cell to read.

+ Response

    + `content` (`string`) ... The textual content of the cell.

+ Errors

    + `"CellNotFound"` ... The cell ID given by `cellId` was not found.
    + `"NonTextualContent"` ... The cell contains non-textual data (e.g. images), hence it cannot be read using this API.

### Structure

#### getElements

Retrieves the elements in the notebook or a cell group.

+ Parameters

    + `groupId` (`?string`) ... ID of the cell group. If the parameter is omitted or falsy (e.g. `null` or `""`), the top-level elements in the notebook are returned.

+ Response

    + `elements` (`Array.<{type: "cell"|"group", id: string}>`) ... List of elements in the cell group, in the order they appear in the notebook.
    + `isClosed` (`boolean`) ... Whether the cell group is closed.
    + `visibleElementIndex` (`?number`) ... Index (0-based) of the visible element in case the cell group is closed. `null` if the group is not closed.

+ Errors

    + `"GroupNotFound"` ... The group specified by `groupId` was not found.

Example request:

    {
        "api": "notebook",
        "version": 1,
        "rid": "1",
        "command": "getElements"
        "groupId": "1"
    }

Example response:

    {
        "rid": "1",
        "success": true,
        "elements": [{"type": "cell", "id": "2"}],
        "isClosed": false,
        "visibleElementIndex": null
    }

#### getElementParent

Retrieves the parent cell group of a given cell or cell group.

+ Parameters

    + `id` (`string`) ... ID of the cell or cell group.

+ Response

    + `groupId` (`?string`) ... ID of the group the given element is contained in. `null` if the element is in no group (i.e. it is on the top level of a notebook).

+ Errors

    + `"ElementNotFound"` ... The element specified by `id` was not found.

#### openGroup

Opens a cell group. If a group is already open, this has no effect.

+ Parameters

    + `groupId` (`string`) ... ID of the cell group.

+ Errors

    + `"GroupNotFound"` ... The group specified by `groupId` was not found.

#### closeGroup

Closes a cell group, only displaying one of its elements.

+ Parameters

    + `groupId` (`string`) ... ID of the cell group.
    + `visibleElementIndex` (`?number`) ... Index (0-based) of the remaining visible element. If not specified, the first element is chosen ("forward-close"); unless if there is a whole-cell group opener cell in the group, in which case that cell is chosen. If less than 0, the first element is chosen. If greater than or equal to the total number of elements in the group, the last element is chosen ("reverse-close").

+ Errors

    + `"GroupNotFound"` ... The group specified by `groupId` was not found.

### Notebook options

#### setOptions

Sets outer options to be applied to the notebook. Currently, only the `"Magnification"` option is supported.

+ Parameters

    + `options` (`Object.<string, string|number>`) ... Dictionary of option names and their respective values.

Example request:

    {
        "api": "notebook",
        "version": 1,
        "rid": "1",
        "command": "setOptions",
        "options": {
            "Magnification": 2
        }
    }

Example response:

    {
        "rid": "1",
        "success": true
    }

#### getOption

Gets the value of an outer option. Currently, only the `"Magnification"` option (which resolves to a `number`) is supported.

+ Parameters

    + `option` (`string`) ... Option name.

+ Response

    + `option` (`string`) ... Option name.
    + `value` (`?string|number`) ... Option value. Might be `null` if no explicit value is set.

Example request:

    {
        "api": "notebook",
        "version": 1,
        "rid": "1",
        "command": "getOption",
        "option": "Magnification"
    }

Example response:

    {
        "rid": "1",
        "success": true,
        "option": "Magnification",
        "value": 2
    }

### Selection

#### getSelection

Gets information about the current selection.

+ Response

    + `elements` (`Array.<{type: "cell"|"group", id: string}>`) ... List of elements (cells or cell groups) selected via their cell bracket. Empty array if no cell brackets are selected.
    + `separator` (`?{cellBefore: ?{cellId: string}, cellAfter: ?{cellId: string}}`) ... If the selection is between cells, this gives the cell before and the cell after the separator. Either of them or `separator` itself can be `null`.
    + `inCell` (`?{cellId: string}`) ... The cell the selection is inside (i.e. on the box level), if any. This is particularly the case when editing a cell. If the selection is on the cell (bracket) level, `inCell` is `null`.
    + `cursorPosition` (`?{left: number, top: number}`) ... Cursor position, if a cell is edited. The position is relative to the document offset. This takes into account the scroll position.

Example request:

    {
        "api": "notebook",
        "version": 1,
        "rid": "1",
        "command": "getSelection"
    }

Example response:

    {
        "rid": "1",
        "success": true,
        "cells": [],
        "inCell": {"cellId": "1"},
        "cursorPosition": {"left": 80, "top": 300}
    }

#### selectElements

Selects elements (cell brackets).

+ Parameters

    + `elements` (`Array.<{id: string}>`) ... List of IDs of elements to select. Elements that cannot be found are ignored.

+ Response

    + `elements` (`Array.<{type: "cell"|"group", id: string}>`) ... List of elements that have been found and are selected now.


#### selectSeparatorBeforeElement

Moves the selection to the separator before a cell or cell group.

+ Parameters

    + `id` (`?string`) ... ID of the element before which the separator should be. If `null`, the selection is moved to the end of the notebook.

+ Errors

    + `"ElementNotFound"`

#### selectSeparatorAfterElement

Moves the selection to the separator after a cell or cell group.

+ Parameters

    + `id` (`?string`) ... ID of the element after which the separator should be. If `null`, the selection is moved to the beginning of the notebook.

+ Errors

    + `"ElementNotFound"`

#### moveSelection [INTERNAL]

Moves the selection in the given direction.

Depending on the current selection (cell bracket or separator), the selection will be moved differently.

| Direction  | Bracket selected | Separator selected | Corresponds to |
|------------|------------------|--------------------|----------------|
| `up`       | separator above  | cell bracket above | Up button in mobile app   |
| `down`     | separator below  | cell bracket below | Down button in mobile app |
| `previous` | cell bracket above | start of line above | Up key   |
| `next`     | cell bracket below | start of line below | Down key |
| `left`     | end of content of the selected cell (if editable)   | end of content of cell above   | Left key  |
| `right`    | start of content of the selected cell (if editable) | start of content of cell below | Right key |
| `in`       | first cell bracket contained in the selected cell group (if a cell group is selected) | (not possible) | Left button in mobile app  |
| `out`      | cell bracket of the parent group (if any)                                             | (not possible) | Right button in mobile app |

If the selection is within a cell, the behavior is undefined in terms of this API (for now).

+ Parameters

    + `direction` (`"up"|"down"|"left"|"right"|"previous"|"next"|"in"|"out"`) ... Direction to move the selection in.

+ Response

    + `directions` (`Array.<string>`) ... New list of possible directions after the move (cf. `canMoveSelection`).
    + `elements` (`Array.<{type: "cell"|"group", id: string}>`) ... New list of selected elements (cf. `getSelection`).
    + `separator` (`?{cellBefore: ?{cellId: string}, cellAfter: ?{cellId: string}}`) ... New separator selection, if any.

+ Errors

    + `"ImpossibleDirection"` ... The current selection could be moved in the given direction.
    + `"UnknownDirection"` ... The given direction was not `"up"|"down"|"left"|"right"|"previous"|"next"|"in"|"out"`.

#### moveSelectionDirections [INTERNAL]

Returns the set of possible directions the selection can be moved in.

This takes into account the current selection and the cell structure. For instance, if a cell (not group) bracket is selected, the selection cannot be moved to the left, so the result will not contain `"out"`.

+ Response

    + `directions` (`Array.<string>`) ... List of possible directions the selection.


#### clearSelectionUponKeyboardDismissal [INTERNAL]

Clears the selection when keyboard is dismissed on the iOS mobile app, when the keyboard is dismissed via the "Dismiss" button.

+ Response

    + `elements` (`Array.<{type: "cell"|"group", id: string}>`) ... List of elements (cells or cell groups) selected via their cell bracket. Empty array if no cell brackets are selected.
    + `separator` (`?{cellBefore: ?{cellId: string}, cellAfter: ?{cellId: string}}`) ... If the selection is between cells, this gives the cell before and the cell after the separator. Either of them or `separator` itself can be `null`.
    + `inCell` (`?{cellId: string}`) ... The cell the selection is inside (i.e. on the box level), if any. This is particularly the case when editing a cell. If the selection is on the cell (bracket) level, `inCell` is `null`.
    + `cursorPosition` (`?{left: number, top: number}`) ... Cursor position, if a cell is edited. The position is relative to the document offset. This takes into account the scroll position.

### Scrolling

#### getScrollPosition

Returns the current scroll position in the notebook.

+ Response

    + `left` (`number`) ... Number of pixels scrolled in horizontal direction (increases when scrolling to the right).
    + `top` (`number`) ... Number of pixels scrolled in vertical direction (increases when scrolling down).

#### setScrollPosition

Scrolls to the specified position in the notebook.

+ Parameters

    + `left` (`number`) ... Number of pixels to scroll to in horizontal direction (increases when scrolling to the right).
    + `top` (`number`) ... Number of pixels to scroll to in vertical direction (increases when scrolling down).

### Copy and Paste

#### copyData [INTERNAL]

Returns data representing the current selection.

This does not actually copy something to the clipboard, it just returns data that could be stored in the clipboard.

If nothing (or nothing copy-able) is currently selected, `null` is returned.

+ Response

    + `json` (`Object|Array|string`) ... Structural representation of the currently selected content, made for round-tripping into a notebook.
    + `text` (`string`) ... Plain-text representation of the currently selected content. This is particularly useful for pasting in other applications.

#### cutData [INTERNAL]

Like `copyData`, but also deletes the currently selected content.

#### pasteData [INTERNAL]

Pastes data at the current insertion point.

This does not read data from the clipboard, it just pastes the given data. Data can be given in an of the following form (from higher to lower precedence):

1. Structural (JSON) data
2. Textual data
3. Image data

The current selection is replaced by the pasted content.

+ Parameters

    + `json` (optional, `?Object|Array|string`) ... Structural content representation, as retrieved by the `copyData` command. This takes precedence over the `text` and `image` parameters.
    + `text` (optional, `?string`) ... Textual content representation.
    + `image` (optional, `?{uri: string, width: ?number, height: ?number}`) ... Image data, expected to be a base-64-encoded PNG data URI given in an object with a `uri` property. If known to the caller, the (optional) `width` and `height` properties should be set as well.

Example request:

    {
        "api": "notebook",
        "version": 1,
        "rid": "1",
        "command": "pasteData",
        "image": {
            "uri": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
            "width": 5,
            "height": 5
        }
    }

Example response:

    {
        "rid": "1",
        "success": true
    }

### Evaluation

#### evaluateCell

Evaluates a cell (the same way as pressing `Shift-Enter` would).

The API responds as soon as the evaluation is initiated.

+ Parameters

    + `cellId` (`string`) ... ID of the cell to read.

+ Errors

    + `"CellNotFound"` ... The cell ID given by `cellId` was not found.
    + `"InsufficientPermissions"`

#### evaluateSelection

Evaluates selected elements (the same way as pressing `Shift-Enter` would).

The API responds as soon as the evaluation is initiated.

+ Errors

    + `"InsufficientPermissions"`

#### evaluateExpression

Evaluates a WL expression.

The API responds with the resulting expression when the evaluation is finished.

+ Parameters

    + `expression` (`string`) ... WL expression to evaluate.
    + `originatingCellId` = `null` (optional, `?string`) ... ID of the cell the evaluation is supposed to be originating from (for the purpose of `EvaluationCell[]`).

+ Response

    + `result` ... The result of the evaluation in JSON expression representation (see below).

+ Errors

    + `"EvaluationError"` ... There was some error during the evaluation, e.g. the kernel was not reachable.
    + `"InsufficientPermissions"`

Example request:

    {
        "api": "notebook",
        "version": 1,
        "rid": "1",
        "command": "evaluateExpression"
        "expression": "f[x, 1 + 2]"
    }

Example response:

    {
        "rid": "1",
        "success": true,
        "result": {"head": "f", "args": ["x", 3]}
    }

#### abortEvaluation

Aborts any currently running kernel evaluation.

#### isEvaluatable

Checks if a cell is evaluatable.

+ Parameters

    + `cellId` (`string`) ... ID of the cell to check.

+ Response

    + `isEvaluatable` (`boolean`) ... Whether the cell is evaluatable.

### DynamicModule variables

#### getDynamicModuleVariable

Retrieves the value of a DynamicModule variable.

+ Parameters

    + `cellId` (`string`) ... ID of the cell that contains the DynamicModuleBox. If the cell contains multiple DynamicModuleBoxes, the first DynamicModuleBox in a breadth-first search is chosen.
    + `name` (`string`) ... Name of the DynamicModule variable to retrieve.

+ Response

    + `value` ... The value of the variable in JSON expression representation (see below).

+ Errors

    + `"CellNotFound"` ... The specified cell does not exist.
    + `"NoDynamicModule"` ... There is no DynamicModuleBox in the specified cell.
    + `"UnknownVariableName"`" ... The DynamicModuleBox does not contain the specified variable.

#### setDynamicModuleVariable

Sets the value of a DynamicModule variable.

+ Parameters

    + `cellId` (`string`) ... ID of the cell that contains the DynamicModuleBox. If the cell contains multiple DynamicModuleBoxes, the first DynamicModuleBox in a breadth-first search is chosen.
    + `name` (`string`) ... Name of the DynamicModule variable to change.
    + `value` ... The new value of the variable in JSON expression representation (see below).

+ Errors

    + `"CellNotFound"` ... The specified cell does not exist.
    + `"NoDynamicModule"` ... There is no DynamicModuleBox in the specified cell.
    + `"UnknownVariableName"`" ... The DynamicModuleBox does not contain the specified variable.

### Autocompletion

#### insertAutocompletion [INTERNAL]

Inserts a completion at current cursor position.

+ Parameters

    + `completion` (`string`) ... Completion to be inserted at current cursor position.

+ Errors

    + `"UnknownCompletion"` ... The completion is not in the list of completions sent previously.
    + `"NoCompletionAvailable"` ... No completion is available (i.e. the autocompletion menu should have been closed.)

#### getFunctionTemplates [INTERNAL]

Retrieves the function templates for the given symbol. The symbol should be from the list of completions that would have been previously sent by the `autocompletions` event.

+ Fields
    + `symbol` (`string`) ... Symbol for which to fetch the function templates.
    + `width` (`number`) ... Width at which to linewrap the function templates.

+ Response

    + `functionTemplates` (`Array.<string>`) ... Array containing URLs or data URIs, one for each function template image. URLs may use the `http:` or `https:` scheme, or whatever scheme the cloud page was opened with; any such URL will be publicly accessible. Data URIs are indicated (as usual) by the `data:` scheme; data URIs use Base64-encoded PNGs. The PNG images would be produced at 401 PPI at a larger size, and should be resized to fit the original width by the app.

+ Errors

    + `"NoFunctionTemplateAvailable"` ... No function template is available.
    + `"RasterizationError"` ... Kernel call for rasterization failed.

#### insertFunctionTemplate [INTERNAL]

Inserts a function template at current cursor position based on the symbol's list of function templates sent through `getFunctionTemplates`.

+ Parameters
    + `symbol` (`string`) ... Symbol for which the function template should be inserted.
    + `index` (`number`) ... The (0-based) array index of the chosen function template from the list for the given symbol (which can be retrieved via `getFunctionTemplates`).

+ Errors

    + `"IndexOutOfBounds"` ... The array index is not within the range of the function template list for the given symbol.

### Notebook Edit History

#### undo [INTERNAL]

Undoes the most recent action recorded in `UndoHistory`.

+ Errors

    + `"NoUndoHistory"`

#### redo [INTERNAL]

Redoes the most recent undone action recorded in `UndoHistory`.

+ Errors

    + `"NoRedoHistory"`

#### getUndoState [INTERNAL]

Returns a status object that indicates if undo and redo entries are available.

+ Response

    + `canUndo` (`boolean`) ... Whether undo history is available.
    + `canRedo` (`boolean`) ... Whether redo history is available.

#### getCellRenderingMethod [INTERNAL]

Returns the rendering method (mode) used by a given cell.

Currently there are four different rendering methods, as shown below.

| Method   | Meaning |
|----------|---------|
| `boxes`  | Live-rendered |
| `static` | Rendered as static html, from the HTML cache |
| `image`  | Rendered as rasterized image |
| `none`   | Rendered as a general placeholer |

+ Parameters

    + `cellId` (`string`) ... The ID of the cell.

+ Response

    + `method` (`string`) ... The method used to render the given cell.

+ Errors

    + `"CellNotFound"` ... The cell ID given by `cellId` was not found.

## <a id="events"></a> Events

### Initial render progress

See [notebook loading phases](./NotebookLoadingPhases.md) for more information.

#### first-paint-done (singular)

Fired when either static HTML is shown for the notebook (see [servers-side rendering](./ServerSideRendering.md)) or the notebook starts rendering individual cells.

+ Fields

    + `showingStaticHTML` (`boolean`) ... Whether the notebook is showing a piece of static HTML.

#### initial-render-progress

Fired when progress is made during the initial render phase.

+ Fields

    + `cellsRendered` (`number`) ... Number of cells that have already been "live-rendered".
    + `cellsTotal` (`number`) ... Total number of cells that are visible in the notebook.

#### initial-render-done (singular)

Fired when the initial render phase is done, i.e. all visible cells have been live-rendered.

### Selection

#### selection-change

Fired when the notebook selection changes.

+ Fields

    + `elements` (`Array.<{type: "cell"|"group", id: string}>`) ... List of elements (cells or cell groups) selected via their cell bracket.
    + `separator` (`?{cellBefore: ?{cellId: string}, cellAfter: ?{cellId: string}}`) ... If the selection is between cells, this gives the cell before and the cell after the separator.
    + `inCell` (`?{cellId: string}`) ... The cell the selection is inside (i.e. on the box level), if any. This is particularly the case when editing a cell.

### Evaluation

#### evaluation-start

Fired when an evaluation starts.

Currently, only one kernel evaluation can happen at any time. However, this might change in the future. Then this API might change as well.

+ Fields

    + `isCellEvaluation` (`boolean`) ... `true` if the evaluation is a whole-cell evaluation (e.g. from pressing Shift-Enter). `false` if the evaluation is triggered by a `Dynamic` or some other dynamic control (e.g. a `Button`).

#### evaluation-stop

Fired when an evaluation ends.

### Scrolling

#### scroll-position-change

Fired when scroll position changes.

+ Fields (same as `getScrollPosition`)

    + `left` (`number`) ... Number of pixels scrolled in horizontal direction (increases when scrolling to the right).
    + `top` (`number`) ... Number of pixels scrolled in vertical direction (increases when scrolling down).

#### activate-pull-to-refresh [INTERNAL]

Fired upon `touchmove` in a non-interactive notebook element in an unscrolled notebook (i.e. at the top of the page).

### Code Assist

#### autocompletions [INTERNAL]

Fired when autocompletions are available for the current input text. It is case-insensitive on mobile (as compared to case-sensitive on desktop browser). The `needle` and `completions` array will be empty if no completions are available, and the automcompletions menu in the mobile app should be closed, if it is open.

+ Fields
    + `type` (`string`) ... "symbols" (more options later).
    + `needle` (`string`) ... Text that the user typed.
    + `completions` (`Array.<string>`) ... List of completions for the needle.

### Notebook Edit History

#### undo-state-change [INTERNAL]

Fired when either undo or redo's availability status changes.

+ Fields

    + `canUndo` (`boolean`) ... Whether undo history is available.
    + `canRedo` (`boolean`) ... Whether redo history is available.
