Blockly.defineBlocksWithJsonArray([
  {
	"type": "basic_if_then",
	"message0": "IF %1 THEN",
	"args0": [
	  {
		"type": "input_value",
		"name": "CONDITION",
		"check": "Boolean"
	  }
	],
	"message1": "%1",
	"args1": [
	  {
		"type": "input_statement",
		"name": "STATEMENTS"
	  }
	],
	"previousStatement": null,
	"nextStatement": null,
	"colour": 210,
	"tooltip": "If-Then statement",
	"helpUrl": ""
  }
]);
Blockly.JavaScript["basic_if_then"] = function (block) {
  var condition = Blockly.JavaScript.valueToCode(block, "CONDITION", Blockly.JavaScript.ORDER_NONE) || "FALSE";
  var statements = Blockly.JavaScript.statementToCode(block, "STATEMENTS");
  var code = "IF " + condition + " THEN\n" + statements;
  return code;
};
