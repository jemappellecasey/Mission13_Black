-- Run against your Azure SQL database AFTER migrations created the Books table.
-- Identity insert allows preserving original BookIDs (optional).
SET IDENTITY_INSERT dbo.Books ON;

INSERT INTO dbo.Books (BookID, Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price) VALUES (1, N'Les Miserables', N'Victor Hugo', N'Signet', N'978-0451419439', N'Fiction', N'Classic', 1488, 9.95);
INSERT INTO dbo.Books (BookID, Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price) VALUES (2, N'Team of Rivals', N'Doris Kearns Goodwin', N'Simon & Schuster', N'978-0743270755', N'Non-Fiction', N'Biography', 944, 14.58);
INSERT INTO dbo.Books (BookID, Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price) VALUES (3, N'The Snowball', N'Alice Schroeder', N'Bantam', N'978-0553384611', N'Non-Fiction', N'Biography', 832, 21.54);
INSERT INTO dbo.Books (BookID, Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price) VALUES (4, N'American Ulysses', N'Ronald C. White', N'Random House', N'978-0812981254', N'Non-Fiction', N'Biography', 864, 11.61);
INSERT INTO dbo.Books (BookID, Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price) VALUES (5, N'Unbroken', N'Laura Hillenbrand', N'Random House', N'978-0812974492', N'Non-Fiction', N'Historical', 528, 13.33);
INSERT INTO dbo.Books (BookID, Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price) VALUES (6, N'The Great Train Robbery', N'Michael Crichton', N'Vintage', N'978-0804171281', N'Fiction', N'Historical', 288, 13.33);
INSERT INTO dbo.Books (BookID, Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price) VALUES (7, N'Deep Work', N'Cal Newport', N'Grand Central Publishing', N'978-1455586691', N'Non-Fiction', N'Self-Help', 304, 14.99);
INSERT INTO dbo.Books (BookID, Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price) VALUES (8, N'It''s Your Ship', N'Michael Abrashoff', N'Grand Central Publishing', N'978-1455523023', N'Non-Fiction', N'Self-Help', 240, 21.66);
INSERT INTO dbo.Books (BookID, Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price) VALUES (9, N'The Virgin Way', N'Richard Branson', N'Portfolio', N'978-1591847984', N'Non-Fiction', N'Business', 400, 29.16);
INSERT INTO dbo.Books (BookID, Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price) VALUES (10, N'Sycamore Row', N'John Grisham', N'Batnam', N'978-0553393613', N'Fiction', N'Thrillers', 642, 15.03);
INSERT INTO dbo.Books (BookID, Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price) VALUES (11, N'The Way I Heard It', N'Mike Rowe', N'Gallery Books', N'978-1982131470', N'Fiction', N'Historical', 272, 12.3);
INSERT INTO dbo.Books (BookID, Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price) VALUES (12, N'The Complete Personal Memoirs of Ulysses S. Grant', N'Ulysses S. Grant', N'CreateSpace Independent Publishing Platform', N'978-1481216043', N'Non-Fiction', N'Biography', 552, 19.99);
INSERT INTO dbo.Books (BookID, Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price) VALUES (13, N'The Screwtape Letters', N'C.S. Lewis', N'HarperOne', N'978-0060652937', N'Fiction', N'Christian Books', 209, 10.27);
INSERT INTO dbo.Books (BookID, Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price) VALUES (14, N'Sleep Smarter', N'Shawn Stevenson', N'Rodale Books', N'978-1623367398', N'Non-Fiction', N'Health', 288, 17.59);
INSERT INTO dbo.Books (BookID, Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price) VALUES (15, N'Titan', N'Ron Chernow', N'Vintage', N'978-1400077304', N'Non-Fiction', N'Biography', 832, 16.59);
INSERT INTO dbo.Books (BookID, Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price) VALUES (16, N'The Hunt for Red October', N'Tom Clancy', N'Berkley', N'978-0440001027', N'Fiction', N'Action', 656, 9.99);

SET IDENTITY_INSERT dbo.Books OFF;
