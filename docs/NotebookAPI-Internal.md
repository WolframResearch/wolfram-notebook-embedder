This is the (unofficial) documentation of some *internal* Notebook API methods and events. **Do not rely on these in production code.** We still document these methods here to have a single authoritative place for the documentation of the Notebook API in its entirety.

See [the main notebook API documentation](./NotebookAPI.md) for all methods and events that do work in the context of this library.


## Methods

### Selection

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

    + `elements` (`Array.<{type: "cell"|"group", id: string}>`) ... List of elements (cells or cell groups) selected via their cell brackets. Empty array if no cell brackets are selected.
    + `separator` (`?{cellBefore: ?{cellId: string}, cellAfter: ?{cellId: string}}`) ... If the selection is between cells, this gives the cell before and the cell after the separator. Either of them or `separator` itself can be `null`.
    + `inCell` (`?{cellId: string}`) ... The cell the selection is inside (i.e. on the box level), if any. This is particularly the case when editing a cell. If the selection is on the cell (bracket) level, `inCell` is `null`.
    + `cursorPosition` (`?{left: number, top: number}`) ... Cursor position, if a cell is edited. The position is relative to the document offset. This takes into account the scroll position.

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

### Input Assistant

#### insertInputAssistant [INTERNAL]

Inserts an input assistant box of the given type in to a code cell at the current cursor position.

+ Parameters
    
    + `type` (`string`) ... Type of the assistant box to be inserted. Allowed values are `"Linguistic"`, `"InputForm"` and `"TeX"`.

+ Errors

    + `"UnsupportedInputAssistantType"` ... The supplied `type` is not one of the allowed values.
    + `"UnsupportedSelectionType"` ... The current cursor position is not suitable for the box insertion. The insertion only works when the current selection is at a cell separator, or inside an editable code cell.
    + `"CellInsertionFailure"` ... The newly-created cell insertion fails for unspeicified reasons. The new cell is needed when the cursor is at a cell separator.
    + `"NoEditorAvailable"` ... The target cell of the operation does not have an associated editor.
    + `"InsertionFailure"` ... A blanket error for unforseen insertion failures.

## Events

### Scrolling

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
