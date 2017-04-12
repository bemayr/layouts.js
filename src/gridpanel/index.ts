export module gridpanel {
    const SELECTOR_GRID: string = 'div[data-gridlayout]';
    const SELECTOR_COLUMNDEFINITION: string = 'data-columndefinition';
    const SELECTOR_COLUMNDEFINITIONS: string = 'data-columndefinitions';

    export function initializeGridLayout(): void {
        let grids = document.querySelectorAll(SELECTOR_GRID);
        for (let i = 0; i < grids.length; i++) {
            var grid = grids[i];
            var columndefinitions: Array<string> = [];
            var rowdefinitions: Array<string> = [];

            // Set Columns
            getDefinitionList(
                grid,
                SELECTOR_COLUMNDEFINITIONS,
                SELECTOR_COLUMNDEFINITION,
                function (columns, sumPercentageColumns) {
                    columndefinitions =
                        setAutoDefinitions(
                            grid,
                            setPercentageDefinitions(columns, sumPercentageColumns),
                            "div[data-column='{0}']",
                            function (element) {
                                return element.offsetWidth;
                            }
                        );
                    console.log(columndefinitions);
                }
            );
            // Set Rows
            getDefinitionList(
                grid,
                'data-rowdefinitions',
                'data-rowdefinition',
                function (rows, sumPercentageRows) {
                    rowdefinitions =
                        setAutoDefinitions(
                            grid,
                            setPercentageDefinitions(rows, sumPercentageRows),
                            'div[data-row="{0}"]',
                            function (element) {
                                return element.offsetHeight;
                            }
                        );
                    console.log(rowdefinitions);
                }
            );

            // Set Children Measurements
            for (var j = 0; j < grid.children.length; j++) {
                var cell = grid.children[j] as HTMLElement;
                if (cell.nodeType === Node.ELEMENT_NODE && !cell.hasAttribute('data-columndefinitions') &&
                    !cell.hasAttribute('data-rowdefinitions')) {


                    //       grid.childNodes(':not(div[data-columndefinitions],div[data-rowdefinitions])').each(function () {
                    //var cell = $(this);
                    var column = parseFloat(cell.getAttribute('data-column') || '0');
                    var row = parseFloat(cell.getAttribute('data-row') || '0');
                    var columnspan = parseFloat(cell.getAttribute('data-columnspan') || '1');
                    var rowspan = parseFloat(cell.getAttribute('data-rowspan') || '1');

                    var width = sumCellSize(columndefinitions, column, columnspan);
                    var height = sumCellSize(rowdefinitions, row, rowspan);
                    var left = sumCellSize(columndefinitions, 0, column);
                    var top = sumCellSize(rowdefinitions, 0, row);

                    cell.style.width = width;
                    cell.style.height = height;
                    cell.style.left = left;
                    cell.style.top = top;
                    //cell.css({ width: width, height: height, left: left, top: top });
                }
            };

        };
    }

    function getDefinitionList(container: Element, parentAttr: string, childAttr: string, callback: (columns: string[], sumPercentageColumns: number) => void) {
        var definitions: string[] = [];
        var sumPercentages = 0;
        var k = 0;
        for (var i = 0; i < container.children.length; i++) {
            var definitionContainer = container.children[i];
            if (definitionContainer.nodeType === Node.ELEMENT_NODE && definitionContainer.hasAttribute(parentAttr)) {
                for (var j = 0; j < definitionContainer.children.length; j++) {
                    var definition = definitionContainer.children[j];
                    if (definition.nodeType === Node.ELEMENT_NODE && definition.hasAttribute(childAttr)) {
                        let definitionAttribute = definition.getAttribute(childAttr) || '';
                        definitions[k++] = definitionAttribute;
                        if (definitionAttribute.indexOf("*") != -1) {
                            var prefix = parseFloat(definitionAttribute);
                            if (isNaN(prefix)) {
                                prefix = 1;
                            }
                            sumPercentages += prefix;
                        }
                    }
                }
            }
        }
        if (definitions.length - length == 0) {
            definitions[0] = "*";
            sumPercentages = 1;
        }
        callback(definitions, sumPercentages);
    }
    
    function setPercentageDefinitions(definitions: string[], sumPercentages: number): string[] {
        definitions.forEach(function (element, index) {
            if (element.indexOf("*") != -1) {
                var prefix = parseFloat(element);
                if (isNaN(prefix)) {
                    prefix = 1;
                }
                definitions[index] = (prefix / sumPercentages * 100) + "%";
            }
        });
        return definitions;
    }

    function setAutoDefinitions(container: Element, definitions: string[], selector: string, sizeHandler: (something: HTMLElement) => number) {
        definitions.forEach(function (element, index) {
            if (element == "auto") {
                definitions[index] = "0px";
                container.queryChildren(selector.replace(/\{0\}/, index.toString())).forEach(function (children) {
                    let size: number = sizeHandler(<HTMLElement>children);
                    if (size > parseFloat(definitions[index])) {
                        definitions[index] = size + "px";
                    }
                });
            }
        });
        return definitions;
    }

    function getCellSize(definitions: string[], index: number) {
        var definition = definitions[index];
        if (definition.indexOf("%") == -1) {
            return definition;
        }
        else {
            var absoluteSum = getAbsoluteSum(definitions);
            if (absoluteSum == "") {
                absoluteSum = "0px";
            }
            return "((100% - (" + absoluteSum + ")) * " + parseFloat(definition) / 100 + ")";
        }
    }

    function sumCellSize(definitions: string[], startIndex: number, length: number) {
        var cellSizes = [];
        for (var i = startIndex; i < startIndex + length; i++) {
            cellSizes[i - startIndex] = getCellSize(definitions, i);
        }
        if (cellSizes.length == 0) {
            return "0px";
        }
        else if (cellSizes.length == 1 && cellSizes[0].indexOf("%") == -1) {
            return cellSizes[0];
        }
        else {
            return "calc(" + cellSizes.join(" + ") + ")";
        }
    }

    function getAbsoluteSum(definitions: string[]) {
        return definitions.filter((element) => element.indexOf("%") == -1).join(" + ");
    }
}

if (window.addEventListener)
    window.addEventListener('load', gridpanel.initializeGridLayout)
else // IE9 Shim
    (<any>window).attachEvent('onload', gridpanel.initializeGridLayout())




declare global {
    interface Element {
        queryChildren(selector: string): Element[];
    }
}

Element.prototype.queryChildren = function (selector: string): Element[] {
    var selected = document.querySelectorAll(selector);
    var matched = [];
    for (var i = 0; i < selected.length; i++) {
        var node = selected[i];
        if (node.nodeType == 1 && node.parentNode === this) {
            matched.push(node);
        }
    }
    return matched;
};

/*

$("#second").css("width", "calc((100% - (200px + 150px)) * 0.75)");

width of one percentage column: (100% - (200px + 150px)) * 0.75)
+ 100%           --> constant
+ 200px + 150px  --> sum of all absolute values
+ 0.75           --> factor in percentage / 100 of current column

*/
