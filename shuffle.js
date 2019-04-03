Array.prototype.shuffle = function(){
	var a = this.slice(0);
	var b = [];
	var rnd = Math.floor((Math.random()*a.length));
	
	for(let i = 0; i < this.length; i++){
		b.push(a[rnd]);
		a[rnd] = a[a.length-1];
		a.pop();
		rnd = Math.floor((Math.random()*a.length));
	}
	return b;
}

var myArray = [1,2,3,4,5,6,7,8];
myArray.shuffle();