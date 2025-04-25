import { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
import { Book } from "./definition.ts";

// Open an in-memory database
const db = new DB(":memory:");

export function init(index: Book[]){
	createBase()
	insertIndex(index)
}

export function reinit(index: Book[]){
	truncateBase()
	insertIndex(index)
}

function createBase(){
	db.execute(`
		CREATE TABLE IF NOT EXISTS books (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT,
			type TEXT,
			year TEXT,
			path TEXT
		)
	`);
}

function truncateBase(){
	db.execute(`DELETE FROM books`);
}

function insertIndex(index: Book[]){
	db.transaction(() => {
		for (const el of index) {
		db.query("INSERT INTO books (title, type, year, path) VALUES (?,?,?,?)", [el.title, el.type, el.year, el.path]);
	}
});
}

export function close() {
	db.close();
}

export function getIndex() : Book[] {
	const req = db.query("SELECT title, type, year, path FROM books;")
	return req.map(el => {
		return {title: el[0], type: el[1], year: el[2], path: el[3]}
	});
}