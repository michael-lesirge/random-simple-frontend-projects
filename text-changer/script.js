"use strict";

String.prototype.toCapitalized = function () {
	return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

function randChar(startCharCode, stopCharCode) {
    return String.fromCharCode(Math.floor(Math.random() * (stopCharCode - startCharCode)) + startCharCode)
}

function curseText(text, amount) {
	return Array.from(text, (char) => char + (/[a-zA-Z0-9]/.test(char) ? Array.from({length: amount}, () => randChar(768, 879)).join("") : "")).join("")
}

const converters = {
	"Case": {
		"Lower Case": (text) => text.toLowerCase(),
		"Upper Case": (text) => text.toUpperCase(),
		"Title Case": (text) => text.split(" ").map((word) => word.toCapitalized()).join(" "),
		"Random Case": (text) => text.split("").map((char) => Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()).join(""),
	},
	"Code Style": {
		"Snake Case": (text) => text.replaceAll(" ", "_").toLowerCase(),
		"Screaming Snake Case": (text) => text.replaceAll(" ", "_").toUpperCase(),
		"Camel Case": (text) => text.split(" ").map((word, index) => (index === 0 ? word.toLocaleLowerCase() : word.toCapitalized())).join(""),
		"Pascal Case": (text) => text.split(" ").map((word) => word.toCapitalized()).join(""),
	},
	"Binary Encoding": {
		"ASCII": (text) => Array.from(text, (char) => char.charCodeAt().toString(2).padStart(8, "0")).join(" "),
		"Unicode UTF-8": (text) => Array.from(new TextEncoder().encode(text)).map((byte) => byte.toString(2)).join(" "),
	},
	"Unicode": {
		"Decimal": (text) => Array.from(text, (char) => char.charCodeAt().toString(10)).join(" "),
		"Code": (text) => Array.from(text, (char) => "U+" + char.charCodeAt().toString(16).toUpperCase().padStart(4, "0")).join(" ")
	},
	"Glitched": {
		"Slightly Cursed": (text) => curseText(text, 5),
		"Meduim Cursed": (text) => curseText(text, 25),
		"Very Cursed": (text) => curseText(text, 50),
	},
	"Direction": {
		"Reverse": (text) => text.split("").reverse().join(""),
	},
	"Meme": {
		"Leetspeak": (text) => {
			const leet_converter = {"e": "3", "t": "7", "i": "1", "o": "0", "a": "4", "s": "5", "g": "9", "l": "1", "z": "2", "b": "8"}
			return text.split("").map((char) => (char.toLowerCase() in leet_converter && Math.random()) > 0.001 ? leet_converter[char] : char).join("")
		},
		"Cow": (text) => text.split(" ").map((word) => Array.from(word, (char, i) => char === char.toLowerCase() ? (i ? "o" : "m") : (i ? "O" : "M")).join("")).join(" "),
	},
	"Fancy": {
		"Circle": (text) => Array.from(text, (char) => {
			let charCode = char.charCodeAt();
			if (/[1-9]/.test(char)) charCode += 9312 - ("1".charCodeAt());
			if (/[0]/.test(char)) charCode = 9450 ;
			if (/[a-z]/.test(char)) charCode += 9424 - ("a".charCodeAt());
			if (/[A-Z]/.test(char)) charCode += 9398 - ("A".charCodeAt());
			return String.fromCharCode(charCode);
		}).join(""),
		"Filled Circle": (text) => Array.from(text, (char) => {
			let charCode = char.charCodeAt();
			if (/[1-9]/.test(char)) charCode += 9312 - ("1".charCodeAt());
			if (/[0]/.test(char)) charCode = 9450 ;
			if (/[a-z]/.test(char)) charCode += 9424 - ("a".charCodeAt());
			if (/[A-Z]/.test(char)) charCode += 9398 - ("A".charCodeAt());
			return String.fromCharCode(charCode);
		}).join(""),
	}
};

const inputBox = document.querySelector("#input");
const outputBox = document.querySelector("#output");

const allControls = document.querySelector("form.all-controls");
const controlGroupsContainer = allControls.querySelector("#control-groups");
const conversionsSeriesElement = allControls.querySelector("#conversions");

let usedConversions = [];

for (const [sectionName, sectionItems] of Object.entries(converters)) {
	const sectionElement = document.createElement("div");
    sectionElement.classList.add("control-group");

    const sectionTitleElement = document.createElement("h3");
    sectionTitleElement.innerText = sectionName;
    sectionElement.appendChild(sectionTitleElement);

    for (const [itemName, converter] of [["Default", (text) => text], ...Object.entries(sectionItems)]) {
		
		const labelElement = document.createElement("label");
        labelElement.innerText = itemName;
		labelElement.title = converter(itemName);
        labelElement.setAttribute("for", sectionName +  " " + itemName);
		
        const inputElement = document.createElement("input");
        inputElement.id = sectionName +  " " + itemName;
		inputElement.name = sectionName;
        inputElement.type = "radio";
        labelElement.appendChild(inputElement);
		
		if (itemName === "Default") {
			inputElement.setAttribute("checked", true);
		}
		
        inputElement.addEventListener("input", (event) => {
			usedConversions = usedConversions.filter((f) => Object.values(sectionItems).indexOf(f) === -1);
			if (itemName !== "Default") usedConversions.push(converter);
		})

        sectionElement.appendChild(labelElement);
    }
	
    controlGroupsContainer.appendChild(sectionElement);
}

function applyFunctionPipeline(input, funcs) {
	return funcs.reduce((prev, func) => func(prev), input)
}

function displayFuntionPipline(funcs, separator = "→") {
	return ["Input", ...funcs.map((f) => f.name), "Output"].join(" " + separator + " ")
}

function updateDisplay() {
	outputBox.value = applyFunctionPipeline(inputBox.value, usedConversions);
	conversionsSeriesElement.innerText = displayFuntionPipline(usedConversions)
}

updateDisplay()
allControls.addEventListener("change", updateDisplay);

inputBox.addEventListener("input", (event) => outputBox.value = applyFunctionPipeline(inputBox.value, usedConversions));

function createControlButotn(id, func) {
	const btn = document.getElementById(id)
	btn.addEventListener("click", func)
	btn.addEventListener("click", updateDisplay)
}

createControlButotn("reset-button", (event) => usedConversions = []);
createControlButotn("clear-button", (event) => inputBox.value = "");
createControlButotn("swap-button", (event) => inputBox.value = outputBox.value);