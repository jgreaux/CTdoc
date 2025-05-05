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
			size INT,
			type TEXT,
			year TEXT,
			brand TEXT,
			vin TEXT,
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
		db.query("INSERT INTO books (size, type, year, brand, vin, path) VALUES (?,?,?,?,?,?)", [el.size, el.type, el.year, el.brand, el.vin, el.path]);
	}
});
}

export function close() {
	db.close();
}

export function getIndex() : Book[] {
	const req = db.query("SELECT size, type, year, brand, vin, path FROM books;")
	return req.map(el => {
		return {size: el[0], type: el[1], year: el[2], brand: el[3], vin: el[4], path: el[5]}
	});
}