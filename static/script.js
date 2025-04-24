const search = document.getElementById("search")
const optionsColumn = document.getElementById("options")
const content = document.getElementById("content")
const count = document.getElementById("count")
const pdf = document.getElementById("display")
const fallback = document.getElementById("fallback-pdf")

let tree = undefined
let list = []

let optionTheme = ""
let optionGroup = ""
let optionSearch = ""

let currentPDF = ""
let currentSelect = undefined

let lastOption = undefined

async function displayTree(){
	if (tree == undefined) {
		tree = await getTree()
	}
	const buttonAll = createButton("Tout Afficher", "selected", updateOptions)
	lastOption = buttonAll
	optionsColumn.appendChild(buttonAll)
	
	tree.forEach(el => {
		const themeButton = createButton(el.theme, "theme", (ev)=> updateOptions(ev, el.theme))
		optionsColumn.appendChild(themeButton)
		
		el.subtheme.forEach((el2)=> {
			const b = createButton(el2, "subtheme", (ev)=> updateOptions(ev, el.theme, el2))
			optionsColumn.appendChild(b)
		})
	})

	displayContent()
}

function displayContent(){
	content.innerHTML = ""
	const list = getList(optionTheme, optionGroup, optionSearch)
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
	const current = pdf.src ? new URL(pdf.src) : undefined
	if(path == decodeURIComponent(current?.pathname)) return
	pdf.src = path
	currentPDF = path

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
		displayPDF(path)
		switchCurrent(ev.target)
	})
	main.addEventListener("dblclick", ()=>{
		window.open(path, '_blank');
	})
	if(currentPDF == path) main.className = "current"
	
	return main
}

function switchCurrent(target) {
	currentSelect?.classList.remove("current")
	target.classList.add("current")
	currentSelect = target
}

function updateOptions(ev, t = "", g = ""){
	if(ev.target == lastOption) return
	lastOption.classList.remove("selected")
	lastOption = ev.target
	lastOption.classList.add("selected")
	optionTheme = t
	optionGroup = g
	displayContent()
}

//----------------- Mok up --------------//
async function getTree(){
	try {
		const response = await fetch('./api/index');
		if (!response.ok) {
			list = [{title:"NotFound", theme:"Error", subtheme:"", path:"", preview: ""}];
		}
		const data = await response.json();
		list = data.sort((a, b) =>  a.path.localeCompare(b.path));
	  } catch (error) {
		list = [{title:"NotFound", theme:"", subtheme:"", path:"", preview: ""}];
	  }

	  const themes = []
	  const t = []
	  list.forEach(el => {
		if(el.theme != "" && !themes.includes(el.theme)){
			themes.push(el.theme)
			t.push({theme:el.theme, subtheme:[]})
		}
		if(el.subtheme != ""){
			const current = t.find(el2 => el2.theme == el.theme)
			if (!current.subtheme.includes(el.subtheme)) {
				current.subtheme.push(el.subtheme)
			}
		}
	  })
	  return t
}
function getList(t="", g="", s = ""){
	let dataSet = [...list]
	
	if(t != ""){
		dataSet = dataSet.filter( el => el.theme == t)
	}
	
	if(g != ""){
		dataSet = dataSet.filter( el => el.subtheme == g)
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

//------------------ init -----------------//
displayTree()
search.addEventListener("keyup", research)