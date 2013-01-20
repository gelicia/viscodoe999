/*global Miso,_,d3,document,$*/

/*
Kristina Durivage's second entry to 'Visualize the State of Public Education in Colorado'
https://www.kaggle.com/c/visualize-the-state-of-education-in-colorado

If something is done very wrong here, please let me know. I am (kind of) new at this! 
*/

/* todo
	note on submission that population numbers may be different as I am using different data files
*/


// add new information to the main info array, indexed by school number

Array.prototype.addNewInfo = function(newItem, newInfoCol, newColName) {
	for (var i = 0; i < this.length; i++) {
		if (this[i].schoolNum == newItem.schoolNum){
			this[i][newColName] = newItem[newInfoCol];
		}
	}
};

//Check if info exists, by school number
Array.prototype.exists = function(key, field){
	for (var i = 0; i < this.length; i++) {
		if (this[i].schoolNum == key){
			if (this[i][field] !== undefined){
				return true;
			}
			else {
				return false;
			}
		}
	}
	return false;
};

Array.prototype.avg = function() {
	var total = 0;
	if (this.length !== 0){
		for (var i = 0; i < this.length; i++) {
			total += this[i];
		}
		return total / this.length;
	}
	else {
		return 0;
	}
	
};

Number.prototype.toLetterGrade = function(){
	switch(this.valueOf()){
		case 13 : return "A+";
		case 12 : return "A";
		case 11 : return "A-";
		case 10 : return "B+";
		case 9 : return "B";
		case 8 : return "B-";
		case 7 : return "C+";
		case 6 : return "C";
		case 5 : return "C-";
		case 4 : return "D+";
		case 3 : return "D";
		case 2 : return "D-";
		case 1 : return "F";
		case 0 : return "";
	}
};

String.prototype.toNumberGrade = function(){
	switch(this.valueOf()){
		case "A+": return 13;
		case "A": return 12;
		case "A-": return 11;
		case "B+": return 10;
		case "B": return 9;
		case "B-" : return 8;
		case "C+" : return 7;
		case "C" : return 6;
		case "C-" : return 5;
		case "D+" : return 4;
		case "D" : return 3;
		case "D-" : return 2;
		case "F" : return 1;
	}
};

Number.prototype.gradeNumToPct = function(){
	switch(this.valueOf()){
		case 13 : return 98;
		case 12 : return 92;
		case 11 : return 90;

		case 10 : return 85;
		case 9 : return 70;
		case 8 : return 65;

		case 7 : return 55;
		case 6 : return 25;
		case 5 : return 15;

		case 4 : return 13;
		case 3 : return 7;
		case 2 : return 5;

		case 1 : return 0;
		case 0 : return "";
	}
};

Number.prototype.gradePctToLetter = function(){
	if(this.valueOf() <= 100 && this.valueOf() >=98){
		return "A+";
	}
	else if(this.valueOf() < 98 && this.valueOf() >=92){
		return "A";
	}
	else if(this.valueOf() < 92 && this.valueOf() >=90){
		return "A-";
	}
	else if(this.valueOf() < 90 && this.valueOf() >=85){
		return "B+";
	}
	else if(this.valueOf() < 85 && this.valueOf() >=70){
		return "B";
	}
	else if(this.valueOf() < 70 && this.valueOf() >=65){
		return "B-";
	}
	else if(this.valueOf() < 65 && this.valueOf() >=55){
		return "C+";
	}
	else if(this.valueOf() < 55 && this.valueOf() >=25){
		return "C";
	}
	else if(this.valueOf() < 25 && this.valueOf() >=15){
		return "C-";
	}
	else if(this.valueOf() < 15 && this.valueOf() >=13){
		return "D+";
	}
	else if(this.valueOf() < 13 && this.valueOf() >=7){
		return "D";
	}
	else if(this.valueOf() < 7 && this.valueOf() >=5){
		return "D-";
	}
	else if(this.valueOf() < 5 && this.valueOf() >=0){
		return "F";
	}
	else {
		return undefined;
	}
};

//thanks to mbostock and trinary in #d3.js :D 
d3.selection.prototype.moveToFront = function() { 
	return this.each(function() { 
		this.parentNode.appendChild(this); 
	}); 
}; 

var allSchInfo = [];
var lastClickedIdx;

function loadDataset () {
	var schList = new Miso.Dataset({
		url : "data/school_gps_coordinates.csv",
		delimiter : ","
	});

	//2010
	var eth2010 = new Miso.Dataset({
		url : "data/2010/2010_csv_eth.csv",
		delimiter : ","
	});

	var frl2010 = new Miso.Dataset({
		url : "data/2010/2010_csv_frl.csv",
		delimiter : ","
	});

	var grd2010 = new Miso.Dataset({
		url : "data/2010_kaggle/2010_final_grade.csv",
		delimiter : ","
	});


	//2011
	var eth2011 = new Miso.Dataset({
		url : "data/2011/2011_enrl_working.csv",
		delimiter : ","
	});

	var frl2011 = new Miso.Dataset({
		url : "data/2011/2011_k_12_FRL.csv",
		delimiter : ","
	});

	var grd2011 = new Miso.Dataset({
		url : "data/2011/2011_final_grade.csv",
		delimiter : ","
	});

	//2012
	var eth2012 = new Miso.Dataset({
		url : "data/2012/2012_enrl_working.csv",
		delimiter : ","
	}); 

	var frl2012 = new Miso.Dataset({
		url : "data/2012/2012_k_12_FRL.csv",
		delimiter : ","
	});

	var grd2012 = new Miso.Dataset({
		url : "data/2012/2012_final_grade.csv",
		delimiter : ","
	});

//first, push a list of all the schools with info
//this is all done within underscore's _.when so they will all fetch before proceeding
	_.when(
		schList.fetch({
			success : function() {
				this.each(
					function(row){
						var schInfo = {};
						schInfo.schoolNum = row['School Number'];
						schInfo.schoolName = row['School Name'];
						allSchInfo.push(schInfo);
					}
				);
			}
		}),
		
	//next, add in population/frl data by school
	//I use minority percentages here because that's the way the kaggle data was presented
		eth2010.fetch({
			success : function() {
				this.each(
					function(row){
						//they split it up by grade, then total, we only care about the total and I will trust that they did this right
						if (row['SCHOOL NAME'] !== 'DISTRICT TOTAL' && row.GRADE == 'SCHOOL TOTAL'){
							var schInfo = {};
							schInfo.districtNum = row['DISTRICT CODE'];
							schInfo.districtName = row['DISTRICT NAME'];

							schInfo.schoolNum = row['SCHOOL CODE'];
							schInfo.totalPop = row.TOTAL;
							schInfo.minorityPct = row['% Minority'];
							//it is stored as XX% in this file, so remove the last character
							schInfo.minorityPct = Number(schInfo.minorityPct.substring(0, schInfo.minorityPct.length - 1)) ;
							
							allSchInfo.addNewInfo(schInfo, 'districtNum', 'districtNum');
							allSchInfo.addNewInfo(schInfo, 'districtName', 'districtName');

							allSchInfo.addNewInfo(schInfo, 'totalPop', 'pop2010');
							allSchInfo.addNewInfo(schInfo, 'minorityPct', 'minority2010');
						}
					}
				);
			}
		}),

		frl2010.fetch({
			success : function() {
				this.each(
					function(row){
						if (row['SCHOOL NAME'] != 'STATE TOTAL' && row['% FREE AND REDUCED'] !== null){
							var schInfo = {};
							schInfo.schoolNum = row['SCHOOL CODE'];
							schInfo.frlPct = Math.round(parseFloat(row['% FREE AND REDUCED'].substring(0, row['% FREE AND REDUCED'].length - 1)));

							allSchInfo.addNewInfo(schInfo, 'frlPct', 'frlPct2010');
						}
					}
				);
			}
		}),

		grd2010.fetch({
			success : function() {
				this.each(
					function(row){
						if (row.School_Grade !== null){
							var schInfo = {};
							schInfo.schoolNum = row.SchoolNumber;
							schInfo.grade = row.School_Grade;

							allSchInfo.addNewInfo(schInfo, 'grade', 'grade' + row.EMH + '2010');
						}
					}
				);
			}
		}),

		eth2011.fetch({
			success : function() {
				this.each(
					function(row){
						var schInfo = {};
						schInfo.schoolNum = row['School Code'];
						schInfo.totalPop = row.TOTAL;
						schInfo.minorityPct = Math.round((row.PCT_AmInd + row.PCT_Asian + row.PCT_Black + row.PCT_hisp + row.PCT_PI + row.PCT_2ormore) * 100);

						allSchInfo.addNewInfo(schInfo, 'totalPop', 'pop2011');
						allSchInfo.addNewInfo(schInfo, 'minorityPct', 'minority2011');

						if (allSchInfo.exists(schInfo.schoolNum, "districtNum") === false){
							schInfo.districtNum = row['Org. Code'];
							schInfo.districtName = row['Organization Name'];

							allSchInfo.addNewInfo(schInfo, 'districtNum', 'districtNum');
							allSchInfo.addNewInfo(schInfo, 'districtName', 'districtName');
						}
					}
				);
			}
		}),

		frl2011.fetch({
			success : function() {
				this.each(
					function(row){
						var schInfo = {};
						schInfo.schoolNum = row['SCHOOL CODE'];
						schInfo.frlPct = Math.round(parseFloat(row['% FREE AND REDUCED'].substring(0, row['% FREE AND REDUCED'].length - 1)));

						allSchInfo.addNewInfo(schInfo, 'frlPct', 'frlPct2011');				
					}
				);
			}
		}),

		grd2011.fetch({
			success : function() {
				this.each(
					function(row){
						if (row.School_Grade !== null){
							var schInfo = {};
							schInfo.schoolNum = row.SCHOOLNUMBER;
							schInfo.grade = row.School_Grade;

							allSchInfo.addNewInfo(schInfo, 'grade', 'grade' + row.EMH + '2011');
						}
					}
				);
			}
		}),

		eth2012.fetch({
			success : function() {
				this.each(
					function(row){
						var schInfo = {};
						schInfo.schoolNum = row['School Code'];
						schInfo.totalPop = row.TOTAL;
						schInfo.minorityPct = Math.round((row.PCT_AmInd + row.PCT_Asian + row.PCT_Black + row.PCT_hisp + row.PCT_PI + row.PCT_2ormore) * 100);

						allSchInfo.addNewInfo(schInfo, 'totalPop', 'pop2012');
						allSchInfo.addNewInfo(schInfo, 'minorityPct', 'minority2012');

						if (allSchInfo.exists(schInfo.schoolNum, "districtNum") === false){
							schInfo.districtNum = row['Organization Code'];
							schInfo.districtName = row['Organization Name'];

							allSchInfo.addNewInfo(schInfo, 'districtNum', 'districtNum');
							allSchInfo.addNewInfo(schInfo, 'districtName', 'districtName');
						}
					}
				);
			}
		}),

		frl2012.fetch({
			success : function() {
				this.each(
					function(row){
						if (row['SCHOOL NAME'] != 'STATE TOTAL' && row['% FREE AND REDUCED'] !== null){
							var schInfo = {};
							schInfo.schoolNum = row['SCHOOL CODE'];

							schInfo.frlPct = Math.round(parseFloat(row['% FREE AND REDUCED'].substring(0, row['% FREE AND REDUCED'].length - 1)));

							allSchInfo.addNewInfo(schInfo, 'frlPct', 'frlPct2012');
						}
					}
				);
			}
		}),

		grd2012.fetch({
			success : function() {
				this.each(
					function(row){
						if (row.School_Grade !== null){
							var schInfo = {};
							schInfo.schoolNum = row["School Code"];
							schInfo.grade = row.School_Grade;

							allSchInfo.addNewInfo(schInfo, 'grade', 'grade' + row.EMH + '2012');
						}	
					}
				);
			}
		})
	).then( //after it's done importing, draw the page. Default to how it is read - organized by school number.
		function(){
			document.getElementById("loading").style.display = 'none';
			document.getElementById("instructions").style.display = 'block';
			prepDataset();
			drawPage($("#frlAmt").text(), $("#ethAmt").text(), $("#achAmtGrd").text());
		}
	);
}

function reDraw(){
	d3.select("svg").remove();
	d3.select("body").append("svg");
	drawPage($("#frlAmt").text(), $("#ethAmt").text(), $("#achAmtGrd").text());
}

function prepDataset() {
	//in the drawn part of the chart, we care about population/FRL averages
	for (var i = 0; i < allSchInfo.length; i++) {
		var populations = [];
		var minorityPcts = [];
		var frlTotals = [];
		var grades = [];

		for(var prop in allSchInfo[i]){
			var propPre = prop.substring(0,3);
			//popYYYYTotal
			if (propPre == 'pop'){
				populations.push(allSchInfo[i][prop]);
			}
			//minorityXXXXPct
			if (propPre == 'min'){
				minorityPcts.push(allSchInfo[i][prop]);
			}

			//frlPercentYYYY
			else if (propPre == 'frl'){
				frlTotals.push(allSchInfo[i][prop]);
			}
			//gradeXYYYY
			else if (propPre == 'gra'){
				grades.push(allSchInfo[i][prop]);
			}
		}

		allSchInfo[i].avgPopTotal = Math.round(populations.avg());
		allSchInfo[i].avgMinPct = Math.round(minorityPcts.avg());
		allSchInfo[i].avgFRLTotal = Math.round(frlTotals.avg());
		allSchInfo[i].avgGradeTotal = Math.round(grades.avg());
	}
}

function drawPage(frl, eth, grd){
	var subSelect = [];
	for (var schIdx = 0; schIdx < allSchInfo.length; schIdx++) {
		if (Number(allSchInfo[schIdx].avgFRLTotal) >= Number(frl) &&
			Number(allSchInfo[schIdx].avgMinPct) >= Number(eth) &&
			/*I do this conversion because I need the numeric percentages to fit the 90% thing
			but I am actually going off of letter grades, which can be a range. This makes sure two letter
			grades are the same by ignoring the actual percentage
			*/
			Number(allSchInfo[schIdx].avgGradeTotal).gradeNumToPct() >= Number(grd.toNumberGrade()).gradeNumToPct())
		{
			subSelect.push(allSchInfo[schIdx]);
		}
	}

	//sort by population
	subSelect = subSelect.sort(function (a,b) {
		if (a.avgPopTotal < b.avgPopTotal) return  1;
		if (a.avgPopTotal > b.avgPopTotal) return -1;
		return 0;
	});

	var mainDiv = d3.select("#schInfo");

	mainDiv.html("<p class=\"sliderLbl\">Number of schools meeting these standards: " + subSelect.length + "</p>");
	mainDiv.append("hr");

	
	//for every qualified school
	for (var i = 0; i < subSelect.length; i++) {
		var rowPop = [];
		var rowFRL = [];
		var rowMin = [];
		var rowGrade = [];

		for(var prop in subSelect[i]){
			if (prop != "schoolNum" && prop != "schoolName" && prop != "districtNum" && prop != "districtName"){
				var prefix = prop.substring(0, 3);
				if (prefix != 'avg'){
					var tblCol;
					switch(prop.substring(prop.length-4, prop.length)){
						case '2010' : tblCol = 'col1'; break;
						case '2011' : tblCol = 'col2'; break;
						case '2012' : tblCol = 'col3'; break;
					}
					switch(prefix){
						case 'pop' : rowPop[tblCol] = subSelect[i][prop]; break;
						case 'frl' : rowFRL[tblCol] = subSelect[i][prop]; break;
						case 'min' : rowMin[tblCol] = subSelect[i][prop]; break;
						case 'gra' : if (typeof(rowGrade[tblCol]) == 'undefined'){rowGrade[tblCol] = {};}
									var levelLabel = (prop.substring(5, 6) == 'E' ? "Elementary" : (prop.substring(5, 6) == 'M' ? "Middle" : "High"));
									rowGrade[tblCol][levelLabel] = Number(subSelect[i][prop]).toLetterGrade(); break;
					}
				}
				else if (prefix == 'avg') {
					switch(prop.substring(3, 6)){
						case 'Pop' : rowPop.col4 = subSelect[i][prop]; break;
						case 'FRL' : rowFRL.col4 = subSelect[i][prop]; break;
						case 'Min' : rowMin.col4 = subSelect[i][prop]; break;
						case 'Gra' : rowGrade.col4 = Number(subSelect[i][prop]).toLetterGrade(); break;
					}
				}
			}			
		}

		var div  = mainDiv.append("div")
			.attr({
				id: "inf" + i
			})
			.html("<h2>" + subSelect[i].schoolNum + " - " + subSelect[i].schoolName + "</h2> <p class=\"distInfo\"> " + subSelect[i].districtNum + " - " + subSelect[i].districtName + " </p>");

		var schSVG = mainDiv.append("svg");

		//the maximum number of grades influences the height of the svg
		var maxNumGrades = d3.max([(rowGrade.col1 === undefined ?  0 : Object.keys(rowGrade.col1).length),
			(rowGrade.col2 === undefined ?  0 : Object.keys(rowGrade.col2).length),
			(rowGrade.col3 === undefined ?  0 : Object.keys(rowGrade.col3).length)]);

		schSVG.attr({
			width : 500,
			height : 105 + (20 * maxNumGrades)
		}); 

		var yAxis = schSVG.append("text")
			.classed("axisLbl", true)
			.attr({
				x: 90,
				y: 30,
				id: "yAxis" 
			});

		//I want to stop programming, lazy way out
		var largestLbl = yAxis.append("tspan")
			.text("Free/Reduced Lunch")
			.attr({
				x : 149,
				"dominant-baseline": "middle",
				"text-anchor": "end"
			});

		largestLbl.attr("x", yAxis.node().getBBox().width);

		var xBase = Number(largestLbl.attr("x"));

		yAxis.append("tspan")
			.text("Ethnic Minority")
			.attr({
				//x : 90,
				"dominant-baseline": "middle",
				"text-anchor": "end",
				x: 149,
				y : Number(yAxis.attr("y")) + 30 
			});

		yAxis.append("tspan")
			.text("Grade")
			.attr({
				"dominant-baseline": "middle",
				"text-anchor": "end",
				x : 149,
				y : Number(yAxis.attr("y")) + 60
			});

		var xAxis = schSVG.append("text")
			.classed("axisLbl", true)
			.attr({
				x: xBase + 30,
				y: 8,
				id: "xAxis" 
			});

		xAxis.append("tspan")
			.text("2010")
			.attr({
				"dominant-baseline": "middle",
				"text-anchor": "middle",
				x : Number(xAxis.attr("x")) 
			});

		xAxis.append("tspan")
			.text("2011")
			.attr({
				"dominant-baseline": "middle",
				"text-anchor": "middle",
				x: Number(xAxis.attr("x")) + 60
			});

		xAxis.append("tspan")
			.text("2012")
			.attr({
				"dominant-baseline": "middle",
				"text-anchor": "middle",
				x: Number(xAxis.attr("x")) + 120
			});

		xAxis.append("tspan")
			.text("Avg")
			.attr({
				"dominant-baseline": "middle",
				"text-anchor": "middle",
				x: Number(xAxis.attr("x")) + 180
			});

		var rowBld = schSVG.append("text")
			.classed("pctTxt", true)
			.attr({
				x: xBase + 30,
				y: 30,
				id: "frlRow" + i
			});

		displayRow(schSVG, rowBld, rowFRL, "pct");

		rowBld = schSVG.append("text")
			.classed("pctTxt", true)
			.attr({
				x: xBase + 30,
				y: 60,
				id: "minRow" + i
			});

		displayRow(schSVG, rowBld, rowMin, "pct");

		rowBld = schSVG.append("text")
			.classed("pctTxt", true)
			.attr({
				x: xBase + 30,
				y: 90,
				id: "gradeRow" + i
			});

		displayRow(schSVG, rowBld, rowGrade, "grade");

		schSVG.append("line")
			.classed("avgLine", true)
			.attr({
				"x1": 330,
				"y1": 10,
				"x2": 330,
				"y2": 100
			});

		if (i != subSelect.length - 1) {
			mainDiv.append("hr");
		}
			
	}
}

function getGrdByYear(year, row){
	var gradeByYr = [];

	for (var prop in row){
		gradeByYr.push(row[prop].toNumberGrade());
	}

	if (gradeByYr.length === 0){
		return undefined;
	}
	else if (gradeByYr.length == 1){ //if only one, display that
		return gradeByYr[0];
	}
	else {
		return Number(Math.round(gradeByYr.avg())).toLetterGrade();
	}
}

//widths are fixed because they should always be in the same spot, despite size of text
//svg is passed because you cannot go up a heirarchy
function displayRow(svg, parent, row, type){
	if (type == "grade"){
		//rows 1-3 grades are objects to include grade type
		//rearrange a bit
		for (var i = 1; i <= 3; i++) {
			var loopRow = row["col" + i];
			if (loopRow !== undefined){
				var keys = Object.keys(loopRow);
				if (keys.length == 1){
					row["col" + i] =  loopRow[keys[0]];
					row["col" + i + "Sub"] = keys[0];
				}
				else {
					row["col" + i] =  getGrdByYear(2009 + i, loopRow);
					row["col" + i + "Sub"] = [];

					//always display in Elem, Midd, High
					keys = keys.sort(function(a,b){
						if (a == 'Elementary') { return 0;}
						if (a == 'Middle' && b == 'High') { return 0; }
						else { return 1; }
					});

					for (var key in keys){
						if (!isNaN(Number(key))){
							row["col" + i + "Sub"].push(loopRow[keys[key]] + "(" + keys[key].substring(0, 4) + ") ");
						}
					}
				}
			}
		}
	}

	var prior;
	//only for subheadings for now, taken to prevent it from keeping the bbox of the parent from growing past the first time
	var parentHeight = Number(parent.node().getBBox().height);
	for (var i = 0; i <= 4; i++) {
		if (row["col" + i] !== undefined){

			prior = parent.append("tspan")
				.attr({
					"dominant-baseline": "middle",
					"text-anchor": "middle",
					x : (60 * (i-1)) + Number(parent.attr("x")) ,
					y : parent.attr("y")
				})
				.text(row["col" + i] + (type == 'pct' ? "%" : ""))
				.classed("tblCell", true);

			var backHeight = d3.scale.linear()
				.domain([0, 100])
				.range([0, parent.node().getBBox().height]);

			if (type == 'pct'){
				svg.append("rect")
				.attr({
					x : prior.attr("x") - 15,
					y : prior.attr("y") - backHeight(row["col" + i]) + 6,
					width : 30,//prior.node().getBBox().width,
					height : backHeight(row["col" + i]),
					fill : function(){
						if (parent.attr("id").substring(0, 3)== "frl"){
							return "#F18911";
						}
						else {
							return  "#69D2E7";
						}
					},
					"fill-opacity" : 0.5
				});

				parent.moveToFront();
			}

			if (row["col" + i + "Sub"] !== undefined){
				//if string, print the whole thing
				if (typeof(row["col" + i + "Sub"]) == "string"){
					parent.append("tspan")
						.attr({
							"text-anchor": "middle",
							x: prior.attr("x"),
							y: Number(prior.attr("y")) + parentHeight + 20
						})
						.text(row["col" + i + "Sub"])
						.classed("tblSubhead", true);
				}
				else {
					for (var subIdx = 0; subIdx < row["col" + i + "Sub"].length; subIdx++) {

						parent.append("tspan")
							.attr({
								"text-anchor": "middle",
								x: prior.attr("x"),
								y: Number(prior.attr("y")) + parentHeight + (20 * (subIdx + 1))
							})
							.text(row["col" + i + "Sub"][subIdx])
							.classed("tblSubhead", true);
					}	
				}
				
			}
		}
	}
}
