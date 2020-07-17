This is the (unofficial) documentation of Notebook API methods that require an editable document. Consequently, they won't work in notebooks embedded through this Wolfram Notebook Embedder library, since that always gives a read-only view (effectively restricting permissions to `Read` and `Interact`). We still document these methods here to have a single authoritative place for the documentation of the Notebook API in its entirety.

See [the main notebook API documentation](./NotebookAPI.md) for all methods and events that do work in the context of this library.


## Methods

### Cell insertion and deletion

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
    
#### removeCell

Removes a cell from the notebook.

+ Parameters

    + `cellId` (`string`) ... ID of the cell to remove.

+ Errors

    + `"CellNotFound"` ... The cell ID given by `cellId` was not found.
    + `"InsufficientPermissions"`

### Cell content

#### setCellContent

Sets the content of a cell.

+ Parameters

    + `cellId` (`string`) ... ID of the cell to modify.
    + `content` (`string`) ... New textual content of the cell.

### Formatting

#### setPrimaryCellStyle

Sets the primary style of a cell.

+ Parameters

    + `cellId` (`string`) — ID of the cell.
    + `style` (`string`) — Primary style name of the cell.

+ Errors

    + `"CellNotFound"` — The specified cell does not exist.

#### setElementOptions

Sets options of a cell, group or the notebook.

+ Parameters

    + `id` (`?string`) — ID of the cell or group. If the parameter is omitted, the notebook is taken.
    + `options` (`Object.<string, exprjson>`) — Dictionary of option names and their respective (expression) values.

+ Errors

    + `"ElementNotFound"` — The specified element does not exist.

#### setSelectionOptions

Sets options of the current selection.

+ Parameters

    + `options` (`Object.<string, exprjson>`) — Dictionary of option names and their respective (expression) values.

Example request:

```json
{
    "api": "notebook",
    "version": 1,
    "rid": "1",
    "command": "setSelectionOptions",
    "options": {
        "FontWeight": "Bold",
        "FontSize": 20,
        "FontFamily": "\"Arial\"",
        "FontColor": ["RGBColor", 1, 1, 0]
    }
}
```

### Evaluation

#### evaluateCell

Evaluates a cell (the same way as pressing `Shift-Enter` would).

The API responds as soon as the evaluation is initiated.

+ Parameters

    + `cellId` (`string`) ... ID of the cell to read.

+ Errors

    + `"CellNotFound"` ... The cell ID given by `cellId` was not found.
    + `"InsufficientPermissions"`
    
#### evaluateElements

Evaluates a list of elements (cells or groups) in the order they appear in the notebook (the same way as pressing `Shift-Enter` would).

The API responds as soon as the evaluation is initiated.

+ Parameters

    + `elements` (`Array.<{id: string}>`) ... List of IDs of elements to evaluate. Elements that cannot be found are ignored.
    
+ Errors

    + `"InsufficientPermissions"`

#### evaluateSelection

Evaluates selected elements (the same way as pressing `Shift-Enter` would).

The API responds as soon as the evaluation is initiated.

+ Errors

    + `"InsufficientPermissions"`

#### abortEvaluation

Aborts any currently running kernel evaluation.

#### isEvaluatable

Checks if a cell is evaluatable.

+ Parameters

    + `cellId` (`string`) ... ID of the cell to check.

+ Response

    + `isEvaluatable` (`boolean`) ... Whether the cell is evaluatable.
