declare var window: Window;

function initializeGridLayout(): void {
	let grids = document.querySelectorAll('div[data-gridlayout]');	
	for (let i = 0; i < grids.length; i++) {
		let grid = grids[i];
		let columndefinitions = [];
		let rowdefinitions = [];

		// Set Columns
		getDefinitionList(
			grid,
			'data-columndefinitions',
			'data-columndefinition',
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
		for (var j = 0; j < grid.childNodes.length; j++) {
			let cell = <HTMLElement>grid.childNodes[j];
			if (cell.nodeType == 1 && !cell.hasAttribute('data-columndefinitions') &&
				!cell.hasAttribute('data-rowdefinitions')) {


				//       grid.childNodes(':not(div[data-columndefinitions],div[data-rowdefinitions])').each(function () {
				//var cell = $(this);
				var column = getDefault(cell.getAttribute('data-column'), 0);
				var row = getDefault(cell.getAttribute('data-row'), 0);
				var columnspan = getDefault(cell.getAttribute('data-columnspan'), 1);
				var rowspan = getDefault(cell.getAttribute('data-rowspan'), 1);

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

function getDefinitionList(container, parentAttr: string, childAttr: string, callback: (any, number) => void) {
	let definitions: any = [];
	let sumPercentages = 0;
	let k = 0;

	for (let i = 0; i < container.childNodes.length; i++) {
		let definitionContainer = container.childNodes[i];		
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

function setPercentageDefinitions(definitions, sumPercentages) {
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

function setAutoDefinitions(container, definitions, selector, sizeHandler) {
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

function setCellSize(definitions, index) {
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

function sumCellSize(definitions, startIndex, length) {
	var cellSizes = [];
	startIndex = parseFloat(startIndex);
	length = parseFloat(length);
	for (var i = startIndex; i < startIndex + length; i++) {
		cellSizes[i - startIndex] = setCellSize(definitions, i);
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

function getAbsoluteSum(definitions) {
	return definitions.filter(function (element, index) {
		return element.indexOf("%") == -1;
	}).join(" + ");
}

function getDefault(variable, defaultValue) {
	return typeof variable !== "undefined" && variable ? variable : defaultValue;
}

(<any>Node.prototype).queryChildren = function queryChildren(selector) {
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


if (window.addEventListener) { // IE9 Shim
	window.addEventListener('load', initializeGridLayout);
} else {
	(<any>window).attachEvent('onload', initializeGridLayout)
}	


/*

$("#second").css("width", "calc((100% - (200px + 150px)) * 0.75)");

width of one percentage column: (100% - (200px + 150px)) * 0.75)
+ 100%           --> constant
+ 200px + 150px  --> sum of all absolute values
+ 0.75           --> factor in percentage / 100 of current column

*/
