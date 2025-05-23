const search = document.getElementById("search")
const optionsColumn = document.getElementById("options")
const content = document.getElementById("content")
const count = document.getElementById("count")
const pdf = document.getElementById("pdf")
const pdfContainer = document.getElementById("pdf-container")
const fallback = document.getElementById("fallback-pdf")
const leftPdf = document.getElementById("left")
const rightPdf = document.getElementById("right")
const countPage = document.getElementById("countPage")

pdf.addEventListener("dblclick", ()=>{
	pdf.classList.toggle("float")
})

leftPdf.addEventListener("dblclick", ev => {
	ev.stopPropagation()
})

rightPdf.addEventListener("dblclick", ev => {
	ev.stopPropagation()
})

leftPdf.addEventListener("click", ()=>{

	if(currentPage == 0) return
	currentPage --

	if(currentPage == 0){
		leftPdf.classList.add("hide")
	}else{
		leftPdf.classList.remove("hide")
	}

	rightPdf.classList.remove("hide")
	displayPagePDF()
})

rightPdf.addEventListener("click", ()=>{
	
	if(pdfPages.length < 2 || currentPage == pdfPages.length - 1) return
	currentPage ++

	if(currentPage == pdfPages.length - 1){
		rightPdf.classList.add("hide")
	}else{
		rightPdf.classList.remove("hide")
	}

	leftPdf.classList.remove("hide")
	displayPagePDF()
})

let list = []

let optionTheme = ""
let optionYear = ""
let optionSearch = ""

let currentPDF = ""
let currentPage = 0
let pdfPages = []
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
	, []).sort().reverse()

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
	const header = ["TYPE", "MODELE", "VIN", "ANNEE"]
	const body = list.map(el => [el.type, el.brand, el.vin, el.year, el.path])
	content.appendChild(createTable(header, body))
	displayFileCount(list.length, list.reduce((s, el) => el.size + s ,0))
}

function displayFileCount(c, s) {
	count.innerHTML = `Nombre de fichiers : ${c} - ${ s < 1000000 ? `${parseInt(s/1000)} Ko` : `${(s/1000000).toFixed(2)} Mo`}`
}

function displayPageCount() {
	countPage.innerHTML = pdfPages.length > 0 ? `Page:${currentPage + 1}/${pdfPages.length}` : "Page: 0/0"
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
	pdfContainer.innerHTML = ""
	pdfPlay()

	if(currentPDF !== ""){
		fallback.classList.add("hide")
		pdfContainer.classList.remove("hide")
	}else{
		pdfContainer.classList.add("hide")
		fallback.classList.remove("hide")
	}

	leftPdf.classList.add("hide")
}

function displayPagePDF() {
	if (pdfPages.length == 0) return
	pdfContainer.innerHTML = ""
	pdfContainer.appendChild(pdfPages[currentPage])
	displayPageCount()
}

//----- utils ---- //

function createButton(label, classList = "", event){
	const b = document.createElement("button")
	b.innerText = label
	b.classList = classList
	b.addEventListener("click", event)
	return b
}

function createTable(head, body) {
	const table = document.createElement("table")

	const h = document.createElement("thead")
	const trh = document.createElement("tr")
	h.appendChild(trh)
	head.forEach(el => {
		const th = document.createElement("th")
		th.innerHTML = el
		trh.appendChild(th)
	})

	const b = document.createElement("tbody")
	body.forEach(el => {
		const tr = document.createElement("tr")
		el.forEach((el2, i) => {
			if(i == el.length -1){
				const path = el2
				tr.addEventListener("click", ()=>{
					if(path == currentPDF) return
					displayPDF(path)
					switchCurrent(tr)
				})
				if(currentPDF == path) {
					tr.className = "current"
					currentSelect = tr
				}
			}else{
				const td = document.createElement("td")
				td.classList.add(`c${i}`)
				td.innerHTML = el2
				tr.appendChild(td)
			}
		})
		b.appendChild(tr)
	})

	table.append(h, b)
	return table
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
		dataSet = dataSet.filter(el => el.path.toLowerCase().includes(search))
		.sort((a, b) => {
			const posA = a.path.toLowerCase().indexOf(search);
			const posB = b.path.toLowerCase().indexOf(search);

			return (posA === -1 ? Infinity : posA) - (posB === -1 ? Infinity : posB);
		})
	}
	
	return dataSet
}

function pdfPlay() {
	const url = currentPDF
	currentPage = 0
	pdfPages = []

	pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  
	pdfjsLib.getDocument(url).promise.then( async p => {
	  for (let pageNum = 1; pageNum <= p.numPages; pageNum++) {
		const page = await p.getPage(pageNum)
		const viewport = page.getViewport({ scale: 1.5 });
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		canvas.height = viewport.height;
		canvas.width = viewport.width;
  
		page.render({ canvasContext: context, viewport });
		pdfPages.push(canvas);
		if (pdfPages.length < 2) {
			rightPdf.classList.add("hide")
		}else{
			rightPdf.classList.remove("hide")
		}
			displayPagePDF()
		}
	})
	.catch(err => {
	  pdfContainer.innerHTML = `<p style="color: red;">Error loading PDF: ${err.message}</p>`;
	});
}

//------------------ init -----------------//
displayTree()
search.addEventListener("keyup", research)