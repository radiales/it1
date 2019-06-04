"use strict";

var VF = Vex.Flow;

//Setting up note rendering
function setupVF(note){
	
	if(document.querySelector("#scoreDiv").children.length > 0)
		document.querySelector("#scoreDiv").removeChild(document.querySelector("#scoreDiv svg"));

	var div = document.querySelector("#scoreDiv")
	var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
	renderer.resize(150, 120);
	var context = renderer.getContext();
	
	var stave = new VF.Stave(10, 0, 100);
	stave.addClef(quizClef);

	var notes = [
		new VF.StaveNote({clef: quizClef, keys: [note], duration: "q" }),

		//placeholders, not acutally visible, lib requires them for some reason, ignore
		new VF.StaveNote({clef: "treble", keys: ["d/4"], duration: "q" }),
		new VF.StaveNote({clef: "treble", keys: ["b/4"], duration: "qr" }),
		new VF.StaveNote({clef: "treble", keys: ["c/4", "e/4", "g/4"], duration: "q" })
	];

	var voice = new VF.Voice({num_beats: 4,  beat_value: 4});
	voice.addTickables(notes);

	var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 400);

	//console.log("Resized.");
	context.setViewBox(0, 25, 90, 90);
	stave.setContext(context).draw();
	voice.draw(context, stave);
	/*
	if(window.innerWidth > 1199){
		//Desktop
		context.setViewBox(0, 25, 90, 90); //size
		document.querySelector("svg").width = "150";
		document.querySelector("svg").height = "120";
	} else{
		//Mobile
		//context.setViewBox(0, 25, 60, 60); //size
		document.querySelector("svg").width = "200";
		document.querySelector("svg").height = "200";
	}*/
}

/******************************************************************************************************/
//													Globals
/******************************************************************************************************/

var piechart = document.querySelector("#piechart");
var pieChartContext = piechart.getContext("2d");

const answerHandler = document.querySelectorAll(".answer");
var quizClef = "treble";

/*
var possibleNotes = ["b/3", "c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5", "d/5", "e/5"];
//var notes = ["D4", "C4", "E5", "F4", "H3"];
var notes = ["d/4", "c/4", "e/5", "f/4", "b/3"];
*/
var questionCounter = 0;
var correctNo = 0;
var appResponse;

/*
var aufg1 = { 
	note: [
		{"a":"c/4", "l":["C","D","E","H"]},
		{"a":"d/4", "l":["D","C","G","F"]},
		{"a":"f/4", "l":["F","C","G","E"]},
		{"a":"b/4", "l":["H","F","D","E"]},
	]
};
*/

var aufg1 = {};

//setupVF(notes[questionCounter]);

function setClef(clef){
	quizClef = clef;
	
	if(document.querySelector("#setSelect").selectedIndex != 0){
		console.log("Calling fetchQuestions");
		fetchQuestions();
		var note = JSON.parse(appResponse)["noten" + document.querySelector("#setSelect").selectedIndex]; //TODO: Check if -1 really is correct
		
		console.log("note:");
		console.dir(note);

		for(var elm in note){
			if(elm != "shuffle"){
				if(clef == "treble")
					note[elm]["a"] = note[elm]["a"][0].toLowerCase() + "/" + note[elm]["a"][1];
				else
					note[elm]["a"] = note[elm]["a"][0].toLowerCase() + "/" + (parseInt(note[elm]["a"][1])-2);
			}
		}
		console.log("note neu:");
		console.dir(note);

		aufg1 = {note};
	} else {
		console.log("Did not call fetchQuestions");
		var notes = ["c", "d", "e", "f", "g", "a", "b"];

		aufg1 = { 
			note: [
				{"a":"c/4", "l":["C","D","E","H"]},
				{"a":"d/4", "l":["D","C","G","F"]},
				{"a":"f/4", "l":["F","C","G","E"]},
				{"a":"b/4", "l":["B","F","D","E"]},
			]
		};
		
		for(var i = 0; i < aufg1.note.length; i++){
			aufg1.note[i].a = notes[parseInt(Math.round(Math.random()*notes.length))%notes.length] + ((clef=="treble")?"/4":"/2");
			aufg1.note[i].l[0] = aufg1.note[i].a[0].toUpperCase();

			for(var j = 1; j < aufg1.note[i].l.length; j++){
				while(aufg1.note[i].l[j] == aufg1.note[i].a[0].toUpperCase()){
					aufg1.note[i].l[j] = notes[parseInt(Math.round(Math.random()*notes.length))%notes.length].toUpperCase();
				}
			}

			console.log("random note:" + notes[parseInt(Math.round(Math.random()*notes.length))]);
		}
		
	}

	console.log("Calling setupVF with " + aufg1.note[questionCounter]["a"]);
	setupVF(aufg1.note[questionCounter]["a"]);

	document.querySelector("#start").style.display = "none";
	document.querySelector("#app").style.display = "block";

	updateJSON(aufg1.note, true);
}

//Draws a pie chart showing the relation between correct and incorrect answers 
function drawPieChart(){

	var correctCount = correctNo;
	if(questionCounter == 0)
		correctCount = 1;
		
	var questionCounterAlt = questionCounter;
	if(questionCounter == 0)
		questionCounterAlt = 1;

	//green
	pieChartContext.moveTo(100, 100);
	pieChartContext.arc(100, 100, 90.5, 0, Math.PI*(correctCount/questionCounterAlt)*2);
	pieChartContext.fillStyle = "#a7e3bc";
	pieChartContext.fill();
	
	//red
	pieChartContext.beginPath();
	pieChartContext.moveTo(100, 100);
	pieChartContext.arc(100, 100, 90.5, Math.PI*(correctCount/questionCounterAlt)*2, Math.PI*2);
	pieChartContext.fillStyle = "#e19898";
	pieChartContext.fill();
}

//Updates question divs and VexFlow note display
function updateJSON(tasks, initialCall){
	//console.log("updateJSON was called with initialCall: " + initialCall);
	//console.log("Called updateJSON, questionCounter: " + questionCounter);
	//var correctIndex = Math.floor(Math.random()*3);
	
	//Re-set color after indicator color for answering
	for(var i = 0; i < answers.length; i++)
		answers[i].style.background = "#AFAFAF";
	
	if(questionCounter < tasks.length && !initialCall)
		questionCounter++;

	if(questionCounter < tasks.length){
		
		//Fills answer-divs
		var possibleAnswers = tasks[questionCounter].l.slice(0);
		possibleAnswers = possibleAnswers.shuffle().slice(0);
		console.log(possibleAnswers);
		for(var i = 0; i < 4; i++){
			answerHandler[i].innerHTML = possibleAnswers[i];
		}

		setupVF(tasks[questionCounter].a);
		console.log("Called setupVF with: " + tasks[questionCounter].a);
		/*
		if(questionCounter < aufg1["note"].length && !initialCall)
			questionCounter++;
		*/

		//Drawing indicators for correct and incorrect answers, progress bar, and pie chart
	}
	drawPieChart();
	document.querySelector("#correctNo").innerHTML = correctNo;
	document.querySelector("#wrongNo").innerHTML = questionCounter - correctNo;
	document.querySelector("#progressBar").style.width = questionCounter/tasks.length*100 + "%";
	console.log("Progress percentage: " + questionCounter/tasks.length*100 + "%");
}

function resetApp(){
	questionCounter = 0;
	correctNo = 0;

	window.onload();
	drawPieChart();
}

//Is called when the user clicks on one of the answer divs, invokes update after 1 second, to show correct answer
function answer(note){
	//Debug
	/*
	console.log("Correct answer would be:" + notes[questionCounter]);
	console.log("Answer was:" + note);
	*/

	//Check if answer was correct
	if(note == aufg1["note"][questionCounter].a[0]){
		correctNo++;
	}

	if(questionCounter == aufg1["note"].length - 1){
		setTimeout(()=>{
		document.querySelector("#end").style.display = "block";
		document.querySelector("#answers").style.display = "none";
		}, 1000);
	}
	
	//Colors indicate the correct and incorrect answers
	for(var i = 0; i < answerHandler.length; i++){
		//if(answerHandler[i].innerHTML == notes[questionCounter])
		try{
			//if(answerHandler[i].innerHTML.toLowerCase().indexOf(aufg1.note[questionCounter].a) != -1)
			if(answerHandler[i].innerHTML.toLowerCase()[0] == aufg1.note[questionCounter].a[0]){
				 answerHandler[i].style.background = "#a7e3bc";	//green
			} else {
			 	answerHandler[i].style.background = "#e19898";	//red
			}
		} catch(e){
			console.error(e);
			console.log("Question Counter: " + questionCounter);
		}
	}

	//Hold back function to let user see what answers were correct or incorrect
	setTimeout(()=>{updateJSON(aufg1.note, false)}, 1000);
}

//Function to let user choose preferred clef
var clefOptions = document.querySelectorAll(".clefOption");
for(var i = 0; i < clefOptions.length; i++){
	clefOptions[i].addEventListener("click", function(){
		if(this.hasAttribute("treble"))
			setClef("treble");
		else
			setClef("bass");
	});
}

//Fetch new questions from server as json
function fetchQuestions(){
	var xh = new XMLHttpRequest();
	//xh.responseType = "json";		//synchronous request can't set reponseType per definition

	xh.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			appResponse = this.response;
			//console.log(this.response);
		}
	};
	xh.open("GET", "aufgaben.json", false);		//CAUTION, request is set to synchronous because app can't continue without result
	xh.send();
}

//Setting up event-listeners for answering
var answers = document.querySelectorAll(".answer");
for(var i = 0; i < answers.length; i++){
	answers[i].addEventListener("click", function(){
		answer((this.innerHTML).toLowerCase());
	});
}

//Initialize pie chart
drawPieChart();
//Hiding app, showing start div
window.onload = function(){
	document.querySelector("#start").style.display = "block";
	document.querySelector("#app").style.display = "none";
	document.querySelector("#answers").style.display = "block";
	document.querySelector("#end").style.display = "none";
    //updateJSON(aufg1.note, true);
}