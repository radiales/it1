"use strict";
		/*
		var vf = new Vex.Flow.Factory({
				renderer: {elementId: 'scoreDiv', width: 80, height: 125}
			});
	
			var score = vf.EasyScore();
			var system = vf.System();
	
			system.addStave({
				voices: [score.voice(score.notes('C4/q, B4, A4, G#4'))]
			}).addClef('treble');
	
			vf.draw();
		
		
		var vf = new Vex.Flow.Factory({
			renderer: {elementId: 'scoreDiv', width: 80, height: 125}
		});
		
		var score = vf.EasyScore();
		var system = vf.System();
		var notegroup;
		*/
		
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
		
		//IGNORE
		function setupVFold(note){	
			if(document.querySelector("#scoreDiv").children.length > 0)
				document.querySelector("#scoreDiv").removeChild(document.querySelector("#scoreDiv svg"));
			
			var vf = new Vex.Flow.Factory({
				renderer: {elementId: 'scoreDiv', width: 80, height: 125}
			});
			
			var score = vf.EasyScore();
			var system = vf.System();
			var notegroup;
			
			notegroup = vf.context.openGroup();
		
			system.addStave({
				voices: [score.voice(score.notes(note+'/q, B4, A4, G#4'))]
			}).addClef('treble');

			vf.draw();
			
			vf.context.closeGroup();
		}
		
		var piechart = document.querySelector("#piechart");
		var pieChartContext = piechart.getContext("2d");
		
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
					answers[i] = possibleNotes[lastIndex];
					tempPossible.splice(lastIndex, 1);
				}
				setupVF(notes[questionCounter]);
			}
			
			
			drawPieChart();
			document.querySelector("#correctNo").innerHTML = correctNo;
			document.querySelector("#wrongNo").innerHTML = questionCounter - correctNo;
			document.querySelector("#progressBar").style.width = questionCounter/notes.length*100 + "%";
			console.log("Progress percentage: " + questionCounter/notes.length*100 + "%");
		}
		
		//Is called when the user clicks on one of the answer divs, invokes update after 1 second, to show correct answer
		function answer(note){
			console.log("User answered.");
			var answers = document.querySelectorAll(".answer");
			console.log("Correct answer would be:" + notes[questionCounter]);
			console.log("Answer was:" + note);
			if(note == notes[questionCounter]){
				correctNo++;
			}
			
			for(var i = 0; i < answers.length; i++){
			console.log("innerHTML: " + answers[i].innerHTML);
			console.log("answer: " + notes[questionCounter]);
				if(answers[i].innerHTML == notes[questionCounter])
					answers[i].style.background = "#a7e3bc";
				else
					answers[i].style.background = "#e19898";
				//console.log("Div No. " + i + " innerHTML: " + answers[i].innerHTML);
			}
			
			
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
		
		var clefOptions = document.querySelectorAll(".clefOption");
		for(var i = 0; i < clefOptions.length; i++){
			clefOptions[i].addEventListener("click", function(){
				if(this.hasAttribute("treble"))
					setClef("treble");
				else
					setClef("bass");
			});
		}
		
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