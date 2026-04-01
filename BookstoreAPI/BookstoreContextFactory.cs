using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace BookstoreAPI;

// Design-time only: lets `dotnet ef migrations add` target SQL Server (Azure SQL uses the same provider).
public class BookstoreContextFactory : IDesignTimeDbContextFactory<BookstoreContext>
{
    public BookstoreContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<BookstoreContext>();
        optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=BookstoreDesign;Trusted_Connection=True;MultipleActiveResultSets=true");
        return new BookstoreContext(optionsBuilder.Options);
    }
}
