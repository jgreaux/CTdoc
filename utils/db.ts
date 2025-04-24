import { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
import { Book } from "./definition.ts";

// Open an in-memory database
const db = new DB(":memory:");

export function init(index: Book[]){
	createBase()
	insertIndex(index)
}

function createBase(){
	db.execute(`
		CREATE TABLE IF NOT EXISTS books (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT,
			theme TEXT,
			subtheme TEXT,
			path TEXT
		)
	`);
}

function insertIndex(index: Book[]){
	db.transaction(() => {
		for (const el of index) {
		db.query("INSERT INTO books (title, theme, subtheme, path) VALUES (?,?,?,?)", [el.title, el.theme, el.subtheme, el.path]);
	}
});
}

export function close() {
	db.close();
}

export function getIndex() {
	const req = db.query("SELECT title, theme, subtheme, path FROM books;")
	return req.map(el => {
		return {title: el[0], theme: el[1], subtheme: el[2], path: el[3]}
	});
}