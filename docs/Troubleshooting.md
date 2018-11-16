# Troubleshooting

## Loading

**The embedded notebook does not load.**

Please double-check that the embedded cloud notebook is *public*, e.g. by opening its URL in an incognito window of your browser (where you're not logged into the Wolfram Cloud). In the Wolfram Language, you can determine permissions of a cloud object using

    CloudObjectInformation[CloudObject["..."], "Permissions"]
    
and you can make a cloud object public by evaluating:

    SetPermissions[CloudObject["..."], All -> {"Read", "Interact"}]

## Styling

**As soon as I mount an embedded notebook, some styling on my page (outside the notebook) changes.**

This might be a bug in our (notebook) CSS. We try to isolate CSS selectors as much as possible, but there might still be cases where styling "leaks out" of the notebook. Please file an issue with reproducible steps.

**The styling of the notebook seems wrong.**

This could be because your CSS definitions "leak into" the notebook. Since the notebook is just another DOM node on your page, it inherits any global CSS. Try to make your CSS selectors more specific so they don't affect the notebook container node. If you still think this is an issue on the notebook side, please file an issue.
