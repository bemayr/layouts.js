function initializeGridLayout() {
    for (var grid of document.querySelectorAll('div[data-gridlayout]')) {
        console.log(grid);

        var columndefinitions = [];
        var rowdefinitions = [];

        // Set Columns
        GetDefinitionList(
            grid,
            'div[data-columndefinitions]',
            'div[data-columndefinition]',
            'data-columndefinition',
            function (columns, sumPercentageColumns) {
                columndefinitions =
                    SetAutoDefinitions(
                        grid,
                        SetPercentageDefinitions(columns, sumPercentageColumns),
                        'div[data-column="{0}"]',
                        function (element) {
                            return element.width();
                        }
                    );
                console.log(columndefinitions);
            }
        );
        // Set Rows
        GetDefinitionList(
            grid,
            'div[data-rowdefinitions]',
            'div[data-rowdefinition]',
            'data-rowdefinition',
            function (rows, sumPercentageRows) {
                rowdefinitions =
                    SetAutoDefinitions(
                        grid,
                        SetPercentageDefinitions(rows, sumPercentageRows),
                        'div[data-row="{0}"]',
                        function (element) {
                            return element.height();
                        }
                    );
                console.log(rowdefinitions);
            }
        );

        // Set Children Measurements
        for(var cell in grid.childNodes) {
            if(cell.nodeType == 1 &&  !cell.hasAttribute('data-columndefinitions') &&
               !cell.hasAttribute('data-rowdefinitions')) {


//       grid.childNodes(':not(div[data-columndefinitions],div[data-rowdefinitions])').each(function () {
            //var cell = $(this);
            var column = ClearUndefined($(this).attr('data-column'), 0);
            var row = ClearUndefined($(this).attr('data-row'), 0);
            var columnspan = ClearUndefined($(this).attr('data-columnspan'), 1);
            var rowspan = ClearUndefined($(this).attr('data-rowspan'), 1);

            var width = SumCellSize(columndefinitions, column, columnspan);
            var height = SumCellSize(rowdefinitions, row, rowspan);
            var left = SumCellSize(columndefinitions, 0, column);
            var top = SumCellSize(rowdefinitions, 0, row);

            //console.log("w: " + width);
            //console.log("h: " + height);
            //console.log("l: " + left);
            //console.log("t: " + top);

            cell.css({ width: width, height: height, left: left, top: top });
        }
        };

    };
}

function GetDefinitionList(container, rootselector, subselector, attribute, callback) {
    var definitions = [];
    var sumPercentages = 0;
    for(var definitionContainer in container.childNodes) {
        if(definitionContainer.nodeType == 1 && definitionContainer.hasAttribute(rootselector)) {
            var i = 0;
            for(var definition in definitionContainer.childNodes) {
                if(definition.hasAttribute(subselector)) {
                    var definition = definition.getAttribute(attribute);
                    definitions[i++] = definition;
                    if (definition.indexOf("*") != -1) {
                        var prefix = parseFloat(definition);
                        if (isNaN(prefix)) {
                            prefix = 1;
                        }
                        sumPercentages += prefix;
                    }
                }
            }
        }
    }
    if (definitions - length == 0) {
        definitions[0] = "*";
        sumPercentages = 1;
    }
    callback(definitions, sumPercentages);
}
function SetPercentageDefinitions(definitions, sumPercentages) {
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
function SetAutoDefinitions(container, definitions, selector, sizeHandler) {
    definitions.forEach(function (element, index) {
        if (element == "auto") {
            definitions[index] = "0px";
            container.children(selector.replace(/\{0\}/, index)).each(function () {
                var size = sizeHandler($(this));
                if (parseFloat(size) > parseFloat(definitions[index])) {
                    definitions[index] = size + "px";
                }
            });
        }
    });
    return definitions;
}
function GetCellSize(definitions, index) {
    var definition = definitions[index];
    if (definition.indexOf("%") == -1) {
        return definition;
    }
    else {
        var absoluteSum = GetAbsoluteSum(definitions);
        if (absoluteSum == "") {
            absoluteSum = "0px";
        }
        return "((100% - (" + absoluteSum + ")) * " + parseFloat(definition) / 100 + ")";
    }
}
function SumCellSize(definitions, startIndex, length) {
    var cellSizes = [];
    startIndex = parseFloat(startIndex);
    length = parseFloat(length);
    for (var i = startIndex; i < startIndex + length; i++) {
        cellSizes[i - startIndex] = GetCellSize(definitions, i);
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
function GetAbsoluteSum(definitions) {
    return jQuery.grep(definitions, function (element, index) {
        return element.indexOf("%") == -1;
    }).join(" + ");
}
function ClearUndefined(variable, result) {
    if (typeof variable === "undefined") {
        variable = result;
    }
    return variable;
}


$(window).load(function () {
    var start = new Date().getTime();
    initializeGridLayout();
    console.log(new Date().getTime() - start);
});
$(window).resize(function () {
    initializeGridLayout();
});




/*

$("#second").css("width", "calc((100% - (200px + 150px)) * 0.75)");

width of one percentage column: (100% - (200px + 150px)) * 0.75)
+ 100%           --> constant
+ 200px + 150px  --> sum of all absolute values
+ 0.75           --> factor in percentage / 100 of current column

*/
