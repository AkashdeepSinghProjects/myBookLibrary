# myBookLibrary
MY 2 table schema:

"table_name"	"column_name"	"data_type"

"bookreview"	"id"	"integer"(Primary Key)
"bookreview"	"book_id"	"integer"(Foreign Key)
"bookreview"	"review"	"integer"
"bookreview"	"date_read"	"date"
"books"	"id"	"integer"(Primary Key)
"books"	"title"	"character varying"
"books"	"author"	"character varying"
"books"	"book_cover_isbn"	"bigint"
"books"	"note"	"text"
