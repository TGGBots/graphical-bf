const commands = "<>+-.,[]@";

//Get Brackets

const getBrackets = (code) => {
	let stack = [];
	let idxs = new Map();
	for (let i = 0; i < code.length; i++) {
		if (code[i] == '[') {
			stack.push(i); //I have been humbled
		}
		else if (code[i] == ']') {
			idxs.set(stack.pop(), i);
		}
	}
	return idxs;
};

const ArrayPad2D = (arr, width, height) => {
	arr = arr.map(row => Object.assign(new Uint8ClampedArray(width), row));
	arr = Object.assign(Array(height).fill(new Uint8ClampedArray(width)), arr);
	return arr;
}

let execute = (code) => {
	// remove non-bf chars
	code = Array.from(code).filter(x => 1 + commands.indexOf(x));
	let idx = 0;
	let bkts = getBrackets(code);
	let x = 0;
	let y = 0;
	let maxX = 0;
	let maxY = 0;
	let axis = 0; // 0 = x, 1  = y
	let cells = Array(1).fill(new Uint8ClampedArray(1)); //starting on Red
	let canvas = Array(1).fill(new Uint8ClampedArray(1)); //starting on Red
	let maxCX = 0;
	let maxCY = 0;

	console.log(cells);
	while (idx < code.length) {
		switch (code[idx]) {
			case '+':
				cells[y][x] += 1;
				break;
			case '-':
				cells[y][x] -= 1;
				break;
			case '>':
				if (axis) {
					y += 1;
				}
				else {
					x += 1;
				}
				break;
			case '<':
				if (axis) {
					y -= 1;
				}
				else {
					x -= 1;
				}
				break;
			case '@':
				axis = !axis;
				break;
			case ',':
				cells[y][x] = (prompt("Enter a character:")).codePointAt(0);
				break;
			case '.':
				if (x > maxCX || y > maxCY) {
					maxCX = Math.max(x, maxCX);
					maxCY = Math.max(y, maxCY);
					canvas = ArrayPad2D(canvas, 1 + maxCX, 1 + maxCY);
				}
				canvas[y][x] = cells[y][x];
				break;
			case '!':
				prompt("Enter a character to discard:");
				break;
			case '[':
				if (!cells[y][x]) {
					idx = bkts.get(idx) + 1;
				}
				break;
			case ']':
				if (cells[y][x]) {
					idx = bkts.keys[bkts.values.indexOf(idx)];
				}
				break;
		}
		if (x > maxX || y > maxY) {
			maxX = Math.max(x, maxX);
			maxY = Math.max(y, maxY);
			cells = ArrayPad2D(cells, 1 + maxX, 1 + maxY);
		}
		console.log(cells);
		idx++;
	}
	canvas = canvas.map(row => row.slice(0, (1 + maxCX) - (row.length % 3)));
	console.log(canvas);
	let buffer = new Uint8ClampedArray((1 + maxCX) * (1 + maxCY) * 4);
	let ctr = 0;
	for (let x = 0; x <= maxCX; x += 3) {
		for (let y = 0; y <= maxCY; y++) {
			buffer[ctr] = canvas[y][x];
			buffer[ctr + 1] = canvas[y][x + 1];
			buffer[ctr + 2] = canvas[y][x + 2];
			buffer[ctr + 3] = 255;
			ctr += 4;
		}
	}
	console.log(canvas, buffer);
	return [buffer, 1 + maxCX, 1 + maxCY];

};

window.addEventListener('DOMContentLoaded', (event) => {
	let button = document.getElementById("execute");

	button.addEventListener('click', (event) => {
		let code = document.getElementById("code").value;
		let output = execute(code);
		let buff = output[0];
		let width = output[1];
		let height = output[2];
		let canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d');
		canvas.width = width;
		canvas.height = height;
		let idata = ctx.createImageData(width, height);
		idata.data.set(buff);
		ctx.putImageData(idata, 0, 0);
		var dataURI = canvas.toDataURL();
		document.getElementById("output").src = dataURI;
	});


});
