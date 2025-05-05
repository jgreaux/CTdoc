import  {Book} from "./definition.ts"

export async function parse(root: string, path: string = ""){
    let indexList: Book[] = []
    for await (const dirEntry of Deno.readDir(root+path)) {
        if (dirEntry.isFile) {
            if(!(dirEntry.name as string).endsWith(".pdf")) continue
            const size = (await Deno.stat(`${root+path}/${dirEntry.name}`)).size
            const entry = await createEntry(path, dirEntry.name, size)
            if(!entry) continue
            indexList.push(entry)
        }else{
            const subList = await parse(root, `${path}/${dirEntry.name}`)
            indexList = [...indexList, ...subList]
        }
    }
    return indexList
}

async function createEntry(root: string, title: string, size: number) {
    const path = `/doc${root}/${title}`
    const parse = parseTitle(title)
    if (!parse) return null

    return {size, ...parse , path}
}

function ignoreParenthese(s:string) {
    const acc = {c:0, s:""}
    let res = ""
    s.split("").forEach(el => {
        if (el == "(") {
            acc.c++
            return
        }else if (el == ")") {
            acc.c--
            return
        }
        if(acc.c == 0) res += el
    })

    return res
}

function getYear(s:string) {
    const regx = / [12]\d{3} /
    return s.match(regx)?.[0].trim()
}

function parseTitle(t:string) {
    const splitTitle =  ignoreParenthese(t).split(" - ")
    if (splitTitle.length < 4) return null
    const type: string = splitTitle[0]
    if(!["FACTURE","RT","RTTI"].includes(type)) return null
    const brand: string = splitTitle[1]??""
    const year: string = getYear(splitTitle[2])??""
    const vin: string = splitTitle[3]??""

    return{type, brand, year, vin}
}