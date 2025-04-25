const search = document.getElementById("search")
const optionsColumn = document.getElementById("options")
const content = document.getElementById("content")
const count = document.getElementById("count")
const pdf = document.getElementById("pdf-container")
const fallback = document.getElementById("fallback-pdf")


let list = []

let optionTheme = ""
let optionYear = ""
let optionSearch = ""

let currentPDF = ""
let currentSelect = undefined

let lastOption = undefined

async function displayTree(){
	const chargingList = getTree()

	const buttonAll = createButton("TOUT", "theme selected", (ev)=>updateOptions(ev))
	const buttonFACTURE = createButton("FACTURE", "theme", (ev)=>updateOptions(ev, "FACTURE"))
	const buttonRTT = createButton("RT", "theme", (ev)=>updateOptions(ev, "RT"))
	const buttonRTTI = createButton("RTTI", "theme", (ev)=>updateOptions(ev, "RTTI"))
	const buttonYear = createButton("ANNEE", "theme", (ev)=>updateOptions(ev, "ANNEE"))
	optionsColumn.append(buttonAll, buttonFACTURE, buttonRTT, buttonRTTI, buttonYear)
	lastOption = buttonAll

	await chargingList

	const listYears = list.reduce((acc, curr) => (curr.year != "" && !acc.includes(curr.year)) ? [...acc, curr.year] : acc
	, []).sort()

	listYears.forEach(el => optionsColumn.appendChild(
		createButton(
			el, 
			"subtheme", 
			ev => updateOptions(ev, "ANNEE", el)
		)
	))

	displayContent()
}

function displayContent(){
	content.innerHTML = ""
	const list = getList(optionTheme, optionYear, optionSearch)
	list.forEach(el=> {
		content.appendChild(createPreview(el.title, el.path))
	})
	displayCount(list.length)
}

function displayCount(c) {
	count.innerHTML = `Nombre de fichiers : ${c}`
}

function research(ev){
	const t = ev.target.value
	if(t.length < 3){
		if(optionSearch == "") return
		optionSearch = ""
	}else{
		optionSearch = t
	}
	displayContent()
}

function displayPDF(path){
	currentPDF = path
	pdf.innerHTML = ""
	pdfPlay()

	if(currentPDF !== ""){
		fallback.classList.add("hide")
		pdf.classList.remove("hide")
	}else{
		pdf.classList.add("hide")
		fallback.classList.remove("hide")
	}
}

//----- utils ---- //

function createButton(label, classList = "", event){
	const b = document.createElement("button")
	b.innerText = label
	b.classList = classList
	b.addEventListener("click", event)
	return b
}

function createPreview(title, path){
	const main = document.createElement("li")
	main.innerText = title
	main.addEventListener("click", (ev)=>{
		if(path == currentPDF) return
		displayPDF(path)
		switchCurrent(ev.target)
	})
	if(currentPDF == path) {
		main.className = "current"
		currentSelect = main
	}
	
	return main
}

function switchCurrent(target) {
	currentSelect?.classList.remove("current")
	target.classList.add("current")
	currentSelect = target
}

function updateOptions(ev, t = "", y = ""){
	if(ev.target == lastOption) return
	lastOption.classList.remove("selected")
	lastOption = ev.target
	lastOption.classList.add("selected")
	optionTheme = t
	optionYear = y

	displayContent()
}

async function getTree(){
	try {
		const response = await fetch('./api/index');
		if (!response.ok) {
			list = [{title:"NotFound", theme:"Error", subtheme:"", path:"", preview: ""}];
		}
		const data = await response.json();
		list = data.sort((a, b) =>  a.path.localeCompare(b.path));
	  } catch (error) {
		list = [{title:"NotFound", type:"", year:"", path:""}];
	  }
}

function getList(t="", y="", s = ""){
	let dataSet = [...list]
	
	if(t == "ANNEE"){
		dataSet = dataSet.filter( el => el.year != "")
	}else if(t != ""){
		dataSet = dataSet.filter( el => el.type == t)
	}
	
	if(y != ""){
		dataSet = dataSet.filter( el => el.year == y)
	}
	
	if(s != ""){
		const search = s.toLowerCase()
		dataSet = dataSet.filter(el => el.title.toLowerCase().includes(search))
		.sort((a, b) => {
			const posA = a.title.toLowerCase().indexOf(search);
			const posB = b.title.toLowerCase().indexOf(search);

			return (posA === -1 ? Infinity : posA) - (posB === -1 ? Infinity : posB);
		})
	}
	
	return dataSet
}

function pdfPlay() {
	const url = currentPDF

	const container = document.getElementById('pdf-container');
	pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  
	pdfjsLib.getDocument(url).promise.then(pdf => {
	  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
		pdf.getPage(pageNum).then(page => {
		  const viewport = page.getViewport({ scale: 1.5 });
		  const canvas = document.createElement('canvas');
		  const context = canvas.getContext('2d');
		  canvas.height = viewport.height;
		  canvas.width = viewport.width;
  
		  page.render({ canvasContext: context, viewport });
		  container.appendChild(canvas);
		});
	  }
	}).catch(err => {
	  container.innerHTML = `<p style="color: red;">Error loading PDF: ${err.message}</p>`;
	});
}

//------------------ init -----------------//
displayTree()
search.addEventListener("keyup", research)