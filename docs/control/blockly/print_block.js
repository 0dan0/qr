Blockly.defineBlocksWithJsonArray([
  {
	"type": "basic_print",
	"message0": "PRINT %1",
	"args0": [
	  {
		"type": "input_value",
		"name": "TEXT",
		"check": "String"
	  }
	],
	"previousStatement": null,
	"nextStatement": null,
	"colour": 160,
	"tooltip": "Print a text string",
	"helpUrl": ""
  }
]);
Blockly.JavaScript["basic_print"] = function (block) {
  var text = Blockly.JavaScript.valueToCode(block, "TEXT", Blockly.JavaScript.ORDER_NONE) || '""';
  var code = "PRINT " + text + "\n";
  return code;
};