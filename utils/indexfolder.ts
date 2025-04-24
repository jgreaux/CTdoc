import  {Book} from "./definition.ts"

export async function parse(root: string, theme: string = "", subtheme: string = ""){
    let indexList: Book[] = []
    let path = root
    if (theme != "") {
        path += `/${theme}`
        if (subtheme != "") {
            path += `/${subtheme}`
        }
    }
    for await (const dirEntry of Deno.readDir(path)) {
        if (dirEntry.isFile) {
          indexList.push(await createEntry(root, dirEntry.name, theme, subtheme))
        }else if(theme == ""){
            const subList = await parse(root, dirEntry.name)
            indexList = [...indexList, ...subList]
        }else if (subtheme == ""){
            const subList = await parse(root, theme, dirEntry.name)
            indexList = [...indexList, ...subList]
        }
    }
    return indexList
}

async function createEntry(root: string, title: string, theme: string = "", subtheme: string = "") {
    let path = "/doc"
    if(theme != "") path += `/${theme}`
    if(subtheme != "") path += `/${subtheme}`
    path += `/${title}`

    return {title, theme, subtheme, path}
}