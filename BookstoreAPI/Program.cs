// Bookstore REST API: categories, paginated books, and admin CRUD (POST/PUT/DELETE).
// SQLite path: connection string "Bookstore", else file next to the published DLL, else ../Bookstore.sqlite.
using Microsoft.EntityFrameworkCore;
using BookstoreAPI;
using BookstoreAPI.Models;

var builder = WebApplication.CreateBuilder(args);

var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"]?
    .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Where(s => s.Length > 0)
    .ToArray() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
        else
        {
            policy.SetIsOriginAllowed(_ => true)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

var connectionString = ResolveSqliteConnectionString(builder);
builder.Services.AddDbContext<BookstoreContext>(options =>
    options.UseSqlite(connectionString));

var app = builder.Build();

app.UseCors();

// GET /api/categories — distinct book categories for filtering
app.MapGet("/api/categories", async (BookstoreContext db) =>
{
    var categories = await db.Books
        .AsNoTracking()
        .Where(b => b.Category != null && b.Category != string.Empty)
        .Select(b => b.Category)
        .Distinct()
        .OrderBy(c => c)
        .ToListAsync();

    return Results.Ok(categories);
})
.WithName("GetCategories");

// GET /api/books?page=1&pageSize=5&sortBy=title&category=Biography
app.MapGet("/api/books", async (
    BookstoreContext db,
    int page = 1,
    int pageSize = 5,
    string sortBy = "title",
    string? category = null) =>
{
    var query = db.Books.AsNoTracking().AsQueryable();

    if (!string.IsNullOrWhiteSpace(category))
        query = query.Where(b => b.Category == category);

    query = sortBy.ToLowerInvariant() switch
    {
        "title" or "title_asc" => query.OrderBy(b => b.Title),
        "title_desc" => query.OrderByDescending(b => b.Title),
        _ => query.OrderBy(b => b.Title)
    };

    var totalCount = await query.CountAsync();
    var books = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    return Results.Ok(new
    {
        books,
        totalCount,
        page,
        pageSize,
        totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
    });
})
.WithName("GetBooks");

// GET /api/books/{id}
app.MapGet("/api/books/{id:int}", async (int id, BookstoreContext db) =>
{
    var book = await db.Books.AsNoTracking().FirstOrDefaultAsync(b => b.BookID == id);
    return book is null ? Results.NotFound() : Results.Ok(book);
})
.WithName("GetBookById");

// POST /api/books
app.MapPost("/api/books", async (Book input, BookstoreContext db) =>
{
    var err = ValidateBookInput(input);
    if (err is not null) return Results.BadRequest(err);

    var book = new Book
    {
        Title = input.Title.Trim(),
        Author = input.Author.Trim(),
        Publisher = input.Publisher.Trim(),
        ISBN = input.ISBN.Trim(),
        Classification = input.Classification.Trim(),
        Category = input.Category.Trim(),
        PageCount = input.PageCount,
        Price = input.Price
    };

    db.Books.Add(book);
    await db.SaveChangesAsync();

    return Results.Created($"/api/books/{book.BookID}", book);
})
.WithName("CreateBook");

// PUT /api/books/{id}
app.MapPut("/api/books/{id:int}", async (int id, Book input, BookstoreContext db) =>
{
    var err = ValidateBookInput(input);
    if (err is not null) return Results.BadRequest(err);

    var existing = await db.Books.FindAsync(id);
    if (existing is null) return Results.NotFound();

    existing.Title = input.Title.Trim();
    existing.Author = input.Author.Trim();
    existing.Publisher = input.Publisher.Trim();
    existing.ISBN = input.ISBN.Trim();
    existing.Classification = input.Classification.Trim();
    existing.Category = input.Category.Trim();
    existing.PageCount = input.PageCount;
    existing.Price = input.Price;

    await db.SaveChangesAsync();

    return Results.Ok(existing);
})
.WithName("UpdateBook");

// DELETE /api/books/{id}
app.MapDelete("/api/books/{id:int}", async (int id, BookstoreContext db) =>
{
    var existing = await db.Books.FindAsync(id);
    if (existing is null) return Results.NotFound();

    db.Books.Remove(existing);
    await db.SaveChangesAsync();

    return Results.NoContent();
})
.WithName("DeleteBook");

app.Run();

// Shared validation for POST/PUT; returns an error message or null if valid.
static string? ValidateBookInput(Book input)
{
    if (string.IsNullOrWhiteSpace(input.Title)) return "Title is required.";
    if (string.IsNullOrWhiteSpace(input.Author)) return "Author is required.";
    if (string.IsNullOrWhiteSpace(input.Publisher)) return "Publisher is required.";
    if (string.IsNullOrWhiteSpace(input.ISBN)) return "ISBN is required.";
    if (string.IsNullOrWhiteSpace(input.Classification)) return "Classification is required.";
    if (string.IsNullOrWhiteSpace(input.Category)) return "Category is required.";
    if (input.PageCount < 0) return "Page count cannot be negative.";
    if (input.Price < 0) return "Price cannot be negative.";
    return null;
}

// SQLite path: configured connection string, else file next to the DLL, else ../Bookstore.sqlite.
static string ResolveSqliteConnectionString(WebApplicationBuilder builder)
{
    var configured = builder.Configuration.GetConnectionString("Bookstore");
    if (!string.IsNullOrWhiteSpace(configured))
        return configured;

    var inOutput = Path.Combine(AppContext.BaseDirectory, "Bookstore.sqlite");
    var path = File.Exists(inOutput)
        ? inOutput
        : Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "Bookstore.sqlite"));

    return $"Data Source={path}";
}
