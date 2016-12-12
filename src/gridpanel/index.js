function initializeGridLayout() {
	var grids = document.querySelectorAll('div[data-gridlayout]');
	for (var i = 0; i < grids.length; i++) {
		var grid = grids[i];
		var columndefinitions = [];
		var rowdefinitions = [];

		// Set Columns
		GetDefinitionList(
			grid,
			'data-columndefinitions',
			'data-columndefinition',
			function (columns, sumPercentageColumns) {
				columndefinitions =
					SetAutoDefinitions(
						grid,
						SetPercentageDefinitions(columns, sumPercentageColumns),
						"div[data-column='{0}']",
						function (element) {
							return element.offsetWidth;
						}
					);
				console.log(columndefinitions);
			}
		);
		// Set Rows
		GetDefinitionList(
			grid,
			'data-rowdefinitions',
			'data-rowdefinition',
			function (rows, sumPercentageRows) {
				rowdefinitions =
					SetAutoDefinitions(
						grid,
						SetPercentageDefinitions(rows, sumPercentageRows),
						'div[data-row="{0}"]',
						function (element) {
							return element.offsetHeight;
						}
					);
				console.log(rowdefinitions);
			}
		);

		// Set Children Measurements
		for (var j = 0; j < grid.childNodes.length; j++) {
			var cell = grid.childNodes[j];
			if (cell.nodeType == 1 && !cell.hasAttribute('data-columndefinitions') &&
				!cell.hasAttribute('data-rowdefinitions')) {


				//       grid.childNodes(':not(div[data-columndefinitions],div[data-rowdefinitions])').each(function () {
				//var cell = $(this);
				var column = GetDefault(cell.getAttribute('data-column'), 0);
				var row = GetDefault(cell.getAttribute('data-row'), 0);
				var columnspan = GetDefault(cell.getAttribute('data-columnspan'), 1);
				var rowspan = GetDefault(cell.getAttribute('data-rowspan'), 1);

				var width = SumCellSize(columndefinitions, column, columnspan);
				var height = SumCellSize(rowdefinitions, row, rowspan);
				var left = SumCellSize(columndefinitions, 0, column);
				var top = SumCellSize(rowdefinitions, 0, row);

				cell.style.width = width;
				cell.style.height = height;
				cell.style.left = left;
				cell.style.top = top;
				//cell.css({ width: width, height: height, left: left, top: top });
			}
		};

	};
}

function GetDefinitionList(container, parentAttr, childAttr, callback) {
	var definitions = [];
	var sumPercentages = 0;
	var k = 0;
	for (var i = 0; i < container.childNodes.length; i++) {
		var definitionContainer = container.childNodes[i];
		if (definitionContainer.nodeType == 1 && definitionContainer.hasAttribute(parentAttr)) {
			for (var j = 0; j < definitionContainer.childNodes.length; j++) {
				var definition = definitionContainer.childNodes[j];
				if (definition.nodeType == 1 && definition.hasAttribute(childAttr)) {
					var definition = definition.getAttribute(childAttr);
					definitions[k++] = definition;
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
			container.queryChildren(selector.replace(/\{0\}/, index)).forEach(function (children) {
				var size = sizeHandler(children);
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
	return definitions.filter(function (element, index) {
		return element.indexOf("%") == -1;
	}).join(" + ");
}
function GetDefault(variable, defaultValue) {
	return typeof variable !== "undefined" && variable ? variable : defaultValue;
}

Node.prototype.queryChildren = function queryChildren(selector) {
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


if (window.addEventListener) // IE9 Shim
	window.addEventListener('load', initializeGridLayout)
else
	window.attachEvent('onload', initializeGridLayout)


/*

$("#second").css("width", "calc((100% - (200px + 150px)) * 0.75)");

width of one percentage column: (100% - (200px + 150px)) * 0.75)
+ 100%           --> constant
+ 200px + 150px  --> sum of all absolute values
+ 0.75           --> factor in percentage / 100 of current column

*/
