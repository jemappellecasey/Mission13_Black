export interface Book {
  bookID: number;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  classification: string;
  category: string;
  pageCount: number;
  price: number;
}

export interface BooksResponse {
  books: Book[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BrowsingContext {
  page: number;
  pageSize: number;
  category: string;
  sortAsc: boolean;
}
