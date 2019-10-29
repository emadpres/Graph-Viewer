# Guide
If your data is not following the structure below or misses some keys (like "title"), Update "res/standardizer.js" to standardize your json to match the template below.

## Standard Input Json
```{
	"nodes": [
		{
			"id": 1,
			"type": "Type2",
			"size": 5,
			"title": "This node number 1"
		},
		{
			"id": 2,
			"type": "Type3",
			"size": 7,
			"title": "This node number 2"
		},
		{
			"id": 3,
			"type": "Type1",
			"size": 10,
			"title": "This node number 3"
		},
		{
			"id": 4,
			"type": "Type2",
			"size": 10,
			"title": "This node number 4"
		}
	],
	"links": [
		{
			"source": 1,
			"target": 2,
			"type": "LinkT1",
			"weight": 5,
			"title": "Conncetion between 1 and 2"
		},
		{
			"source": 2,
			"target": 3,
			"type": "LinkT2",
			"weight": 10,
			"title": "Conncetion between 2 and 3"
		}
	]
}```
