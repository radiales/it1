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

	console.log("Resized.");
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
var possibleNotes = ["b/3", "c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5", "d/5", "e/5"];
//var notes = ["D4", "C4", "E5", "F4", "H3"];
var notes = ["d/4", "c/4", "e/5", "f/4", "b/3"];
var questionCounter = 0;
var correctNo = 0;
var appResponse;

setupVF(notes[questionCounter]);

function setClef(clef){
	quizClef = clef;
	
	if(document.querySelector("#setSelect").selectedIndex != 0){
		console.log("Calling " + fetchQuestions);
		fetchQuestions();
	}
	
	setupVF(notes[questionCounter]);
	document.querySelector("#start").style.display = "none";
	document.querySelector("#app").style.display = "block";
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

function updateJSON(tasks){
	var correctIndex = Math.floor(Math.random()*3);
	var possibleAnswers = tasks[questionCounter].l.slice(0);
	possibleAnswers = possibleAnswers.shuffle().slice(0);
	console.log(possibleAnswers);
	
	//Re-set color after indicator color for answering
	for(var i = 0; i < answers.length; i++)
		answers[i].style.background = "#AFAFAF";
	
	if(questionCounter < tasks.length){
		//Fills answer-divs
		for(var i = 0; i < 3; i++){
			answerHandler[i].innerHTML = possibleAnswers[i];
		}
		setupVF(auf1[0].a.toLowerCase()[0] + "/" + auf1[0].a.toLowerCase()[1]);
		
		//Drawing indicators for correct and incorrect answers, progress bar, and pie chart
		drawPieChart();
		document.querySelector("#correctNo").innerHTML = correctNo;
		document.querySelector("#wrongNo").innerHTML = questionCounter - correctNo;
		document.querySelector("#progressBar").style.width = questionCounter/notes.length*100 + "%";
		console.log("Progress percentage: " + questionCounter/notes.length*100 + "%");
	}
}

//Updates question divs and VexFlow note display
function update(){
	//function is ensured to never use one answer twice and selects random div for correct answer, fills others with incorrects
	var answers = document.querySelectorAll(".answer");
	var correctIndex = Math.floor(Math.random()*3);
	var lastIndex;
	var tempPossible = possibleNotes;
	
	//Re-set color after indicator color for answering
	for(var i = 0; i < answers.length; i++)
		answers[i].style.background = "#AFAFAF";
	
	
	if(questionCounter < notes.length){
		//Fills answer-divs
		answers[correctIndex].innerHTML = notes[questionCounter];
		for(var i = 0; i < 3; i++){
			if(i == correctIndex) continue;
			lastIndex = Math.floor(Math.random()*tempPossible.length);
			answerHandler[i].innerHTML = possibleNotes[lastIndex];
			tempPossible.splice(lastIndex, 1);
		}
		setupVF(notes[questionCounter]);
	}
	
	
	//Drawing indicators for correct and incorrect answers, progress bar, and pie chart
	drawPieChart();
	document.querySelector("#correctNo").innerHTML = correctNo;
	document.querySelector("#wrongNo").innerHTML = questionCounter - correctNo;
	document.querySelector("#progressBar").style.width = questionCounter/notes.length*100 + "%";
	console.log("Progress percentage: " + questionCounter/notes.length*100 + "%");
}

//Is called when the user clicks on one of the answer divs, invokes update after 1 second, to show correct answer
function answer(note){
	//Debug
	console.log("User answered.");
	console.log("Correct answer would be:" + notes[questionCounter]);
	console.log("Answer was:" + note);
	
	if(note == notes[questionCounter]){
		correctNo++;
	}
	
	//Colors indicate the correct and incorrect answers
	for(var i = 0; i < answerHandler.length; i++){
	if(answerHandler[i].innerHTML == notes[questionCounter])
		answerHandler[i].style.background = "#a7e3bc"; //green
	else
		answerHandler[i].style.background = "#e19898"; //red
	}
	
	//Hold back function to let user see what answers were correct or incorrect
	setTimeout(update, 1000);
	questionCounter++;
}

//Setting up event-listeners for answering
var answers = document.querySelectorAll(".answer");
for(var i = 0; i < answers.length; i++){
	answers[i].addEventListener("click", function(){
		answer(this.innerHTML);
	});
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
	xh.responseType = "json";
	
	xh.onreadystatechange = function(){
		if(this.readystate == 4 && this.status == 200){
			appResponse = this.response;
			console.log(this.response);
		}
	};
	xh.open("GET", "questions.json");
	xh.send();
}

//Initialize pie chart
drawPieChart();
//Hiding app, showing start div
window.onload = function(){
	document.querySelector("#start").style.display = "block";
	document.querySelector("#app").style.display = "none";
}